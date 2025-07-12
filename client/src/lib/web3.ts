import { ethers } from "ethers";

export const POLYGON_TESTNET_CONFIG = {
  chainId: "0x13881", // 80001 in hex
  chainName: "Polygon Mumbai Testnet",
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
  rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
  blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
};

export const VOTING_CONTRACT_ABI = [
  "function createCampaign(string memory title, string memory description, string[] memory options, uint256 endTime) external payable returns (uint256)",
  "function vote(uint256 campaignId, uint256 optionIndex) external",
  "function getCampaign(uint256 campaignId) external view returns (string memory title, string memory description, string[] memory options, uint256 endTime, uint256 totalVotes, bool isActive)",
  "function getVoteCount(uint256 campaignId, uint256 optionIndex) external view returns (uint256)",
  "function hasVoted(uint256 campaignId, address voter) external view returns (bool)",
  "event CampaignCreated(uint256 indexed campaignId, address indexed creator, string title)",
  "event VoteCast(uint256 indexed campaignId, address indexed voter, uint256 optionIndex)",
];

export const CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890"; // Replace with actual deployed contract

export class Web3Service {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      // Initialize provider and signer
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();

      // Check if we're on the correct network
      const network = await this.provider.getNetwork();
      if (network.chainId !== 80001) {
        await this.switchToPolygonTestnet();
      }

      // Initialize contract
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        VOTING_CONTRACT_ABI,
        this.signer
      );

      return accounts[0];
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  }

  async switchToPolygonTestnet(): Promise<void> {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: POLYGON_TESTNET_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [POLYGON_TESTNET_CONFIG],
          });
        } catch (addError) {
          throw new Error("Failed to add Polygon testnet to MetaMask");
        }
      } else {
        throw new Error("Failed to switch to Polygon testnet");
      }
    }
  }

  async createCampaign(
    title: string,
    description: string,
    options: string[],
    endTime: number
  ): Promise<string> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const tx = await this.contract.createCampaign(
        title,
        description,
        options,
        endTime,
        { value: ethers.utils.parseEther("0.01") } // Campaign fee
      );

      return tx.hash;
    } catch (error) {
      console.error("Failed to create campaign:", error);
      throw error;
    }
  }

  async vote(campaignId: number, optionIndex: number): Promise<string> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const tx = await this.contract.vote(campaignId, optionIndex);
      return tx.hash;
    } catch (error) {
      console.error("Failed to vote:", error);
      throw error;
    }
  }

  async getCampaign(campaignId: number) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const campaign = await this.contract.getCampaign(campaignId);
      return {
        title: campaign.title,
        description: campaign.description,
        options: campaign.options,
        endTime: campaign.endTime.toNumber(),
        totalVotes: campaign.totalVotes.toNumber(),
        isActive: campaign.isActive,
      };
    } catch (error) {
      console.error("Failed to get campaign:", error);
      throw error;
    }
  }

  async getVoteCount(campaignId: number, optionIndex: number): Promise<number> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const count = await this.contract.getVoteCount(campaignId, optionIndex);
      return count.toNumber();
    } catch (error) {
      console.error("Failed to get vote count:", error);
      throw error;
    }
  }

  async hasVoted(campaignId: number, voterAddress: string): Promise<boolean> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      return await this.contract.hasVoted(campaignId, voterAddress);
    } catch (error) {
      console.error("Failed to check if voted:", error);
      throw error;
    }
  }

  getProvider(): ethers.providers.Web3Provider | null {
    return this.provider;
  }

  getSigner(): ethers.Signer | null {
    return this.signer;
  }

  isConnected(): boolean {
    return this.provider !== null && this.signer !== null;
  }
}

export const web3Service = new Web3Service();

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
