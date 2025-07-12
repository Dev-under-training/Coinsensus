import { groth16, plonk } from 'snarkjs';
import { ethers } from 'ethers';

// Zero-Knowledge Proof Service for Anonymous Voting
export class ZKPVotingService {
  private poseidon: any;
  private circuitWasm: string;
  private circuitZkey: string;
  private verificationKey: any;

  constructor() {
    this.circuitWasm = '/circuits/voting.wasm';
    this.circuitZkey = '/circuits/voting_0001.zkey';
    this.initializePoseidon();
  }

  private async initializePoseidon() {
    // Use a mock implementation for development
    this.poseidon = (inputs: any[]) => {
      // Simple hash function for development
      const str = JSON.stringify(inputs);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return BigInt(Math.abs(hash));
    };
  }

  /**
   * Generate a voter identity commitment
   */
  async generateVoterCommitment(voterSecret: string, voterId: string): Promise<{
    commitment: string;
    nullifier: string;
    secret: string;
  }> {
    const secretHash = this.poseidon([voterSecret]);
    const nullifier = this.poseidon([secretHash, voterId]);
    const commitment = this.poseidon([nullifier, secretHash]);

    return {
      commitment: commitment.toString(),
      nullifier: nullifier.toString(),
      secret: secretHash.toString(),
    };
  }

  /**
   * Generate a zero-knowledge proof for voting
   */
  async generateVoteProof(
    voterSecret: string,
    vote: number,
    campaignId: number,
    merkleProof: string[],
    merkleRoot: string
  ): Promise<{
    proof: any;
    publicSignals: string[];
  }> {
    const input = {
      voterSecret: voterSecret,
      vote: vote,
      campaignId: campaignId,
      merkleProof: merkleProof,
      merkleRoot: merkleRoot,
      nullifier: this.poseidon([voterSecret, campaignId]).toString(),
    };

    try {
      const { proof, publicSignals } = await groth16.fullProve(
        input,
        this.circuitWasm,
        this.circuitZkey
      );

      return { proof, publicSignals };
    } catch (error) {
      console.error('Failed to generate ZK proof:', error);
      throw new Error('Proof generation failed');
    }
  }

  /**
   * Verify a zero-knowledge proof
   */
  async verifyProof(
    proof: any,
    publicSignals: string[]
  ): Promise<boolean> {
    try {
      const vKey = await fetch('/circuits/verification_key.json').then(res => res.json());
      return await groth16.verify(vKey, publicSignals, proof);
    } catch (error) {
      console.error('Failed to verify ZK proof:', error);
      return false;
    }
  }

  /**
   * Generate anonymous vote hash
   */
  async generateAnonymousVoteHash(
    vote: number,
    campaignId: number,
    nullifier: string
  ): Promise<string> {
    const voteHash = this.poseidon([vote, campaignId, nullifier]);
    return voteHash.toString();
  }

  /**
   * Create Merkle tree for registered voters
   */
  async createVoterMerkleTree(voterCommitments: string[]): Promise<{
    root: string;
    tree: string[][];
  }> {
    const tree: string[][] = [];
    let currentLevel = voterCommitments;

    // Build the tree bottom-up
    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || left;
        const parent = this.poseidon([left, right]).toString();
        nextLevel.push(parent);
      }
      tree.push(currentLevel);
      currentLevel = nextLevel;
    }

    return {
      root: currentLevel[0],
      tree: tree,
    };
  }

  /**
   * Generate Merkle proof for a voter
   */
  async generateMerkleProof(
    voterCommitment: string,
    voterCommitments: string[]
  ): Promise<string[]> {
    const proof: string[] = [];
    const index = voterCommitments.indexOf(voterCommitment);
    
    if (index === -1) {
      throw new Error('Voter commitment not found');
    }

    let currentLevel = voterCommitments;
    let currentIndex = index;

    while (currentLevel.length > 1) {
      const siblingIndex = currentIndex % 2 === 0 ? currentIndex + 1 : currentIndex - 1;
      const sibling = currentLevel[siblingIndex] || currentLevel[currentIndex];
      proof.push(sibling);

      // Move to next level
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || left;
        const parent = this.poseidon([left, right]).toString();
        nextLevel.push(parent);
      }
      currentLevel = nextLevel;
      currentIndex = Math.floor(currentIndex / 2);
    }

    return proof;
  }

  /**
   * Batch verify multiple proofs for efficiency
   */
  async batchVerifyProofs(
    proofs: { proof: any; publicSignals: string[] }[]
  ): Promise<boolean[]> {
    const results = await Promise.all(
      proofs.map(({ proof, publicSignals }) => 
        this.verifyProof(proof, publicSignals)
      )
    );
    return results;
  }

  /**
   * Generate privacy-preserving vote tally
   */
  async generatePrivateTally(
    votes: { proof: any; publicSignals: string[] }[]
  ): Promise<{
    totalVotes: number;
    validProofs: number;
    tallyHash: string;
  }> {
    const verificationResults = await this.batchVerifyProofs(votes);
    const validVotes = votes.filter((_, index) => verificationResults[index]);
    
    const totalVotes = validVotes.length;
    const validProofs = verificationResults.filter(Boolean).length;
    
    // Generate tally hash without revealing individual votes
    const tallyData = validVotes.map(vote => vote.publicSignals[0]);
    const tallyHash = this.poseidon(tallyData).toString();

    return {
      totalVotes,
      validProofs,
      tallyHash,
    };
  }

  /**
   * Create anonymous voting session
   */
  async createAnonymousVotingSession(campaignId: number): Promise<{
    sessionId: string;
    merkleRoot: string;
    voterCommitments: string[];
  }> {
    // In a real implementation, this would fetch registered voters
    const mockVoterCommitments = [
      '12345678901234567890123456789012345678901234567890123456789012345678',
      '23456789012345678901234567890123456789012345678901234567890123456789',
      '34567890123456789012345678901234567890123456789012345678901234567890',
    ];

    const { root } = await this.createVoterMerkleTree(mockVoterCommitments);
    const sessionId = this.poseidon([campaignId, root, Date.now()]).toString();

    return {
      sessionId,
      merkleRoot: root,
      voterCommitments: mockVoterCommitments,
    };
  }

  /**
   * Verify voter eligibility without revealing identity
   */
  async verifyVoterEligibility(
    voterCommitment: string,
    merkleProof: string[],
    merkleRoot: string
  ): Promise<boolean> {
    let currentHash = voterCommitment;
    
    for (const siblingHash of merkleProof) {
      // Determine if we should be left or right child
      const left = currentHash < siblingHash ? currentHash : siblingHash;
      const right = currentHash < siblingHash ? siblingHash : currentHash;
      currentHash = this.poseidon([left, right]).toString();
    }

    return currentHash === merkleRoot;
  }

  /**
   * Generate quadratic voting proof
   */
  async generateQuadraticVotingProof(
    voterSecret: string,
    voteWeights: number[],
    totalCredits: number,
    campaignId: number
  ): Promise<{
    proof: any;
    publicSignals: string[];
  }> {
    // Verify quadratic constraint: sum of squares <= total credits
    const totalUsed = voteWeights.reduce((sum, weight) => sum + weight * weight, 0);
    if (totalUsed > totalCredits) {
      throw new Error('Invalid quadratic voting allocation');
    }

    const input = {
      voterSecret: voterSecret,
      voteWeights: voteWeights,
      totalCredits: totalCredits,
      campaignId: campaignId,
      quadraticSum: totalUsed,
    };

    const { proof, publicSignals } = await groth16.fullProve(
      input,
      '/circuits/quadratic_voting.wasm',
      '/circuits/quadratic_voting_0001.zkey'
    );

    return { proof, publicSignals };
  }
}

// Biometric Authentication Service
export class BiometricAuthService {
  private isSupported: boolean = false;

  constructor() {
    this.checkSupport();
  }

  private async checkSupport() {
    // Check if biometric authentication is supported
    this.isSupported = await this.isBiometricSupported();
  }

  async isBiometricSupported(): Promise<boolean> {
    // Web Authentication API for biometric authentication
    if (typeof window !== 'undefined' && 'credentials' in navigator) {
      try {
        const available = await (navigator.credentials as any).get({
          publicKey: {
            timeout: 60000,
            allowCredentials: [],
            userVerification: 'preferred',
          },
        });
        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  async registerBiometric(userId: string): Promise<{
    credentialId: string;
    publicKey: string;
    attestation: string;
  }> {
    if (!this.isSupported) {
      throw new Error('Biometric authentication not supported');
    }

    const credential = await (navigator.credentials as any).create({
      publicKey: {
        challenge: new Uint8Array(32),
        rp: {
          name: 'Coinsensus',
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: userId,
          displayName: userId,
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        timeout: 60000,
        attestation: 'direct',
      },
    });

    return {
      credentialId: credential.id,
      publicKey: credential.response.publicKey,
      attestation: credential.response.attestationObject,
    };
  }

  async authenticateBiometric(credentialId: string): Promise<{
    signature: string;
    clientData: string;
    authenticatorData: string;
  }> {
    if (!this.isSupported) {
      throw new Error('Biometric authentication not supported');
    }

    const assertion = await (navigator.credentials as any).get({
      publicKey: {
        challenge: new Uint8Array(32),
        allowCredentials: [
          {
            id: credentialId,
            type: 'public-key',
          },
        ],
        timeout: 60000,
        userVerification: 'required',
      },
    });

    return {
      signature: assertion.response.signature,
      clientData: assertion.response.clientDataJSON,
      authenticatorData: assertion.response.authenticatorData,
    };
  }

  async verifyBiometricSignature(
    publicKey: string,
    signature: string,
    clientData: string,
    authenticatorData: string
  ): Promise<boolean> {
    try {
      // Verify the signature using the public key
      const key = await crypto.subtle.importKey(
        'spki',
        new Uint8Array(publicKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))),
        { name: 'ECDSA', namedCurve: 'P-256' },
        false,
        ['verify']
      );

      const signedData = new Uint8Array([
        ...new Uint8Array(authenticatorData.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))),
        ...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(clientData))),
      ]);

      return await crypto.subtle.verify(
        { name: 'ECDSA', hash: 'SHA-256' },
        key,
        new Uint8Array(signature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))),
        signedData
      );
    } catch (error) {
      console.error('Biometric signature verification failed:', error);
      return false;
    }
  }

  async generateBiometricProof(
    userId: string,
    campaignId: number,
    vote: number
  ): Promise<{
    biometricProof: string;
    timestamp: number;
  }> {
    const biometricAuth = await this.authenticateBiometric(userId);
    const timestamp = Date.now();
    
    const proofData = {
      userId,
      campaignId,
      vote,
      timestamp,
      biometricAuth,
    };

    const proofHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(JSON.stringify(proofData))
    );

    return {
      biometricProof: Array.from(new Uint8Array(proofHash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
      timestamp,
    };
  }
}

// Decentralized Identity Service
export class DIDService {
  private didResolver: any;

  constructor() {
    this.initializeResolver();
  }

  private async initializeResolver() {
    const { Resolver } = await import('did-resolver');
    
    // Use a simple resolver for development
    this.didResolver = new Resolver({
      key: async (did: string) => {
        return {
          didDocument: {
            id: did,
            verificationMethod: [
              {
                id: `${did}#key-1`,
                type: 'Ed25519VerificationKey2020',
                controller: did,
                publicKeyMultibase: 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
              },
            ],
            authentication: [`${did}#key-1`],
            assertionMethod: [`${did}#key-1`],
          },
        };
      },
    });
  }

  async createDID(method: 'key' | 'web' | 'ethr' = 'key'): Promise<{
    did: string;
    privateKey: string;
    publicKey: string;
    document: any;
  }> {
    switch (method) {
      case 'key':
        return this.createKeyDID();
      case 'web':
        return this.createWebDID();
      case 'ethr':
        return this.createEthrDID();
      default:
        throw new Error('Unsupported DID method');
    }
  }

  private async createKeyDID(): Promise<{
    did: string;
    privateKey: string;
    publicKey: string;
    document: any;
  }> {
    // Generate a simple key pair for development
    const keyPair = await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify']
    );

    const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    const publicKey = Array.from(new Uint8Array(publicKeyBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const privateKey = Array.from(new Uint8Array(privateKeyBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const did = `did:key:z6Mk${publicKey.substring(0, 44)}`;
    const document = await this.didResolver.resolve(did);

    return {
      did,
      privateKey,
      publicKey,
      document: document.didDocument,
    };
  }

  private async createWebDID(): Promise<{
    did: string;
    privateKey: string;
    publicKey: string;
    document: any;
  }> {
    const keyPair = await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify']
    );

    const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    const publicKey = Array.from(new Uint8Array(publicKeyBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const privateKey = Array.from(new Uint8Array(privateKeyBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const did = `did:web:${window.location.hostname}:users:${Date.now()}`;
    
    const document = {
      '@context': ['https://www.w3.org/ns/did/v1'],
      id: did,
      verificationMethod: [
        {
          id: `${did}#key-1`,
          type: 'JsonWebKey2020',
          controller: did,
          publicKeyJwk: {
            kty: 'EC',
            crv: 'P-256',
            x: publicKey.substring(0, 64),
            y: publicKey.substring(64, 128),
          },
        },
      ],
      authentication: [`${did}#key-1`],
      assertionMethod: [`${did}#key-1`],
    };

    return {
      did,
      privateKey,
      publicKey,
      document,
    };
  }

  private async createEthrDID(): Promise<{
    did: string;
    privateKey: string;
    publicKey: string;
    document: any;
  }> {
    const wallet = ethers.Wallet.createRandom();
    const did = `did:ethr:0x1:${wallet.address}`;
    
    const document = await this.didResolver.resolve(did);

    return {
      did,
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      document: document.didDocument,
    };
  }

  async createVerifiableCredential(
    issuerDID: string,
    subjectDID: string,
    claims: any,
    privateKey: string
  ): Promise<any> {
    const { vc } = await import('@digitalbazaar/vc');

    const credential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://w3c-ccg.github.io/vc-examples/citizenship/v1',
      ],
      type: ['VerifiableCredential', 'VotingEligibilityCredential'],
      issuer: issuerDID,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: subjectDID,
        ...claims,
      },
    };

    // Use JWT signing for simplicity in this implementation
    const jwt = await import('did-jwt-vc');
    const signer = await import('did-jwt').then(m => m.ES256KSigner(privateKey));
    
    const vcJwt = await jwt.createVerifiableCredentialJwt(credential, {
      did: issuerDID,
      signer,
    });

    return vcJwt;
  }

  async verifyCredential(credential: any): Promise<boolean> {
    try {
      const jwt = await import('did-jwt-vc');
      const result = await jwt.verifyCredential(credential, this.didResolver);
      return result.verified;
    } catch (error) {
      console.error('Credential verification failed:', error);
      return false;
    }
  }

  async presentCredential(
    credential: any,
    holderDID: string,
    privateKey: string,
    challenge: string
  ): Promise<any> {
    const presentation = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      verifiableCredential: [credential],
      holder: holderDID,
      challenge,
      id: `urn:uuid:${crypto.randomUUID()}`,
    };

    // Use JWT signing for simplicity
    const jwt = await import('did-jwt-vc');
    const signer = await import('did-jwt').then(m => m.ES256KSigner(privateKey));
    
    const vpJwt = await jwt.createVerifiablePresentationJwt(presentation, {
      did: holderDID,
      signer,
      challenge,
    });

    return vpJwt;
  }

  private async documentLoader(url: string): Promise<any> {
    // Custom document loader for DID resolution
    if (url.startsWith('did:')) {
      const result = await this.didResolver.resolve(url);
      return {
        contextUrl: null,
        documentUrl: url,
        document: result.didDocument,
      };
    }

    // Default context loader
    throw new Error(`Document loader not implemented for: ${url}`);
  }
}

// Export service instances
export const zkpVotingService = new ZKPVotingService();
export const biometricAuthService = new BiometricAuthService();
export const didService = new DIDService();