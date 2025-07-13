Coinsensus: A decentralized consensus and voting application

Introduction

Coinsensus is a mobile dApp designed for secure social consensus and voting. It provides users with a single, biometric-derived account and private key for decentralized 
identity management. Users maintain anonymity through pseudonymous Master DIDs, which generate temporary DIDs for off-chain verification with "issuers" (e.g., governments, schools) to 
obtain Verified Credentials (VCs). These VCs enable participation in voting campaigns while keeping real-world identities private. Entities can launch campaigns using their 
own exclusive VCs, acquired through off-chain legitimacy verification. All votes are recorded on a blockchain via smart contracts, ensuring transparency and immutability, 
with features like social recovery for lost access and VC revocation.

Further details

The full realization of this dApp will allow individuals, governments, companies, organizations, and institutions to launch various types of voting campaigns, such as national elections
voting among board members, surveys, polls, opinions, content, research studies and many more.
It intends to solve, or perhaps significantly lessen the major challenges in a democratic voting setup, whether manual or conventional automated elections such as 
fraud, tampering, manipulation, slow and inefficient counting of votes et cetera while giving importance to an individual's privacy and anonimity away from the eyes of entities 
such as governments. It intends to provide a "trustless" system for both voter (a user as a private indiviual) and entity (e.g., governments, companies, and organizations).
Coinsensus dApp will make it possible by allowing a user to go through different types of biometric process. After that, a private key will be derived from their biometrics data to
ensure a one account-one private key per user. It implies that when a user intends to create a different account using their biometrics data, it will still generate the same private key,
and open the same account with the same Public key/DID. 

A decentralized Sybil-resistant solution

There are a few ways to make it realistically possible. One way that I'm aware of is to use biometrics as an 'unlock mechanism' 
instead of using a noisy biometric data to generate a private key. This allows a biometric data to authorize the use of a private key that is securely generated and stored within the 
device's hardware security module (e.g., Apple's Secure Enclave, Android's TrustZone/StrongBox). The biometric data itself never leaves this secure hardware. When a 
user "registers" with biometrics, the device's secure element generates a unique private key. This key is then encrypted and stored within the secure element. 
Subsequent biometric scans (fingerprint, face ID, etc.) merely unlock access to that same encrypted private key within the secure element. If the biometric matches, 
the secure element decrypts the key, allowing it to sign transactions. Another yet experimental or theoritical approach is to use 'fuzzy extractors' to generate the same 
biometric seed/private key even if there are minor differences in a user's fingerprint, iris scan, or other biometric data each time it's measured. Once Coinsensus is ready to be deployed over a true blockchain network, account registration, identity management, voting logic et cetera will be much more secure, tamper-proof, and verifiable. Of course, a user's raw
biometric data will never be stored centrally nor in the blockchain, but will only be used to unlock or generate a private key. With biometrics as unlock mechanism for a
blockchain network's private key, The private key itself is pre-generated (or generated during the initial setup) directly on your device, within a Secure Enclave or 
Trusted Execution Environment (TEE). This generation process within the secure hardware explicitly creates a private key that conforms to the cryptographic standards of the 
Coinsensus blockchain network. A user's biometric scan then serves as the authentication factor that allows the Secure Enclave/TEE to release (decrypt and make available for signing) 
that pre-generated, blockchain-compatible private key. For the theoritical approach of directly deriving a biometric seed/key using 'fuzzy extractors', the biometric seed would still go 
through a Key Derivation Function (KDF) designed to transform it into a full private key that matches the exact cryptographic specifications of the target blockchain. The output of the KDF would be a blockchain-compatible private key. So if partnered with a secure hardware and software components, a user's biometrics data would be higly reverse engineer-resistant and secure.

How do 'Entities' create an account?

Those who are able to launch a multiple position ballot and weighted voting campaigns are called 'Entities'. An Entity doesn't need to create an account using biometrics. Instead, 
Entities will register using an "exclusive VC" (Verified Credential) instead of biometrics. An Entity will be represented by users with an existing and relevant VC badge 
(e.g., Head-of-State VC badge, Election commissioner VC badge, member of the board VC badge) as Coinsensus identifies and links a user with an Entity and voting campaign 
based on their existing VC badge. For an Entity, the private key would likely be stored and managed in a highly secure, controlled environment, which could be a dedicated 
Hardware Security Module (HSM), A secure multi-signature wallet system managed by multiple authorized representatives, or secure server or computing environment that strictly enforces 
access controls for the Entity's private key. This secure environment would be under the physical and logical control of the Entity's authorized representatives. A VC badge can 
expire or revoked depending on its type. For instance, a citizen voter VC badge can be revoked in case of changes in their citizenship.

What should be the initial focus?

Early developments of Coinsensus dApp should focus on the desired account registration processes. So it would be better if the initial version would only include Public/General voting
campaigns for basic voters (voters which doesn't have any type of VC badge).

Problems solved

Lack of Trust and Verifiability in Digital Voting Systems

Solution: It records all votes immutably on a blockchain via smart contracts. This ensures transparency and verifiability, allowing users to trust the integrity of election outcomes as results are displayed directly from the blockchain.

Privacy Concerns with Identity Verification

Solution: Users interact with the system using pseudonymous Master DIDs and temporary DIDs. They obtain Verified Credentials (VCs) from "issuers" (e.g., governments, schools) through off-chain verification. These VCs prove eligibility without exposing the user's real-world identity on the blockchain; only the anonymous Master DID appears in transactions.

Ensuring Voter Anonymity and Preventing Vote Revelation

Solution: It utilizes Zero-Knowledge Proofs (ZKPs). Users can prove their eligibility and the validity of their vote without revealing their specific choice or linking it directly to their real identity on the blockchain, thereby maintaining true anonymity.

Enforcing "One Person, One Vote" (or "One Entity, One Vote")

Solution: The system mandates only one account per user, tied to a private key derived from unique biometric data. Any attempt to create another account with the same biometrics will lead back to the existing one. VCs further ensure that only uniquely eligible participants can vote in specific campaigns.

Centralized Control and Vulnerability of Identity Data

Solution: User identity is managed via Decentralized Identifiers (DIDs), promoting self-sovereignty. Critically, biometric data is never stored centrally or on the blockchain, remaining securely on the user's device within a Secure Enclave, giving users full control over their sensitive information.

Complexity and Security Risks of Private Key Management

Solution: The private key is conveniently derived from biometric data, offering an intuitive and secure access method. It is securely stored and managed within Secure Enclaves or Trusted Execution Environments (TEEs) on the user's device. A social recovery mechanism is also integrated for secure access restoration in cases of lost devices or biometric data.

Efficient and Transparent Revocation of Credentials and Access

Solution: Coinsensus implements a Decentralized Revocation Registry on the blockchain. Issuers can publish VC revocations, and voting smart contracts automatically check this registry to ensure only currently valid VCs are recognized for participation.

Verifying the Legitimacy of Campaign-Launching Entities

Solution: Entities (e.g., governments, companies) acquire an exclusive VC through a rigorous off-chain verification process to prove their real-world legitimacy. This exclusive VC grants them the authorized ability to launch specific categories of voting campaigns on the dApp.

Key contributors needed

Blockchain Developers - build and maintain the smart contracts for voting, identity management (DIDs), social recovery, and the decentralized revocation registry, 
ensuring secure and efficient on-chain operations.

Mobile App Developers - Specializing in iOS and Android to develop the user-facing application, integrate device-level biometrics, and handle the interaction with the 
blockchain and off-chain services.

Cryptographers/Security Engineers - Essential for designing and implementing the privacy-preserving mechanisms like Zero-Knowledge Proofs (ZKPs), secure key management within 
device enclaves, and overall system security.

Identity and Decentralized ID (DID) Specialists - ensure proper implementation of DID methods, Verified Credentials (VCs), and the off-chain verification processes with issuers.

UX/UI Designers - create an intuitive and user-friendly interface for the mobile application, simplifying complex blockchain and identity concepts for everyday users.

Quality Assurance (QA) Testers - rigorously test the dApp's functionality, security, and usability across various devices and scenarios.

Technical Writers and Documentarians - create clear and comprehensive documentation for the codebase, APIs, and user guides, aiding both developers and end-users.

LICENSE

The Coinsensus dApp, being open-sourced under Apache License 2.0, means users generally have broad permissions for its use, modification, and distribution, 
with certain conditions.



