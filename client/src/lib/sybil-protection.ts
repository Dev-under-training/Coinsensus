import { ethers } from "ethers";
import { web3Service } from "./web3";

export interface SybilProtectionConfig {
  minAccountAge: number; // Days
  votingCooldown: number; // Hours
  minStakeRequired: number; // MATIC
  maxCampaignsPerWallet: number;
  gasThreshold: number; // Minimum gas fee
}

export const DEFAULT_SYBIL_CONFIG: SybilProtectionConfig = {
  minAccountAge: 30, // 30 days
  votingCooldown: 24, // 24 hours
  minStakeRequired: 1, // 1 MATIC
  maxCampaignsPerWallet: 5,
  gasThreshold: 0.01, // 0.01 MATIC
};

export class SybilProtectionService {
  private config: SybilProtectionConfig;
  private lastVoteTime: Map<string, number> = new Map();
  private campaignCount: Map<string, number> = new Map();

  constructor(config: SybilProtectionConfig = DEFAULT_SYBIL_CONFIG) {
    this.config = config;
  }

  /**
   * Check if a wallet address can vote based on Sybil protection rules
   */
  async canVote(walletAddress: string, campaignId: number): Promise<{
    canVote: boolean;
    reasons: string[];
  }> {
    const reasons: string[] = [];
    let canVote = true;

    // Check account age
    const accountAge = await this.getAccountAge(walletAddress);
    if (accountAge < this.config.minAccountAge) {
      canVote = false;
      reasons.push(`Account must be at least ${this.config.minAccountAge} days old`);
    }

    // Check voting cooldown
    const lastVoteTime = this.lastVoteTime.get(walletAddress);
    if (lastVoteTime) {
      const hoursElapsed = (Date.now() - lastVoteTime) / (1000 * 60 * 60);
      if (hoursElapsed < this.config.votingCooldown) {
        canVote = false;
        reasons.push(`Must wait ${Math.ceil(this.config.votingCooldown - hoursElapsed)} more hours before voting`);
      }
    }

    // Check stake requirement
    const balance = await this.getWalletBalance(walletAddress);
    if (balance < this.config.minStakeRequired) {
      canVote = false;
      reasons.push(`Must have at least ${this.config.minStakeRequired} MATIC to vote`);
    }

    // Check campaign participation limit
    const campaignParticipation = this.campaignCount.get(walletAddress) || 0;
    if (campaignParticipation >= this.config.maxCampaignsPerWallet) {
      canVote = false;
      reasons.push(`Maximum ${this.config.maxCampaignsPerWallet} campaigns per wallet per month`);
    }

    return { canVote, reasons };
  }

  /**
   * Record a vote and update tracking
   */
  async recordVote(walletAddress: string, campaignId: number): Promise<void> {
    this.lastVoteTime.set(walletAddress, Date.now());
    const currentCount = this.campaignCount.get(walletAddress) || 0;
    this.campaignCount.set(walletAddress, currentCount + 1);
  }

  /**
   * Get the age of a wallet address in days
   */
  private async getAccountAge(walletAddress: string): Promise<number> {
    try {
      const provider = web3Service.getProvider();
      if (!provider) {
        throw new Error("Provider not available");
      }

      // Get the first transaction of the wallet
      const txCount = await provider.getTransactionCount(walletAddress);
      if (txCount === 0) {
        return 0; // New account with no transactions
      }

      // For simplicity, we'll use a heuristic based on transaction count
      // In a real implementation, you'd scan the blockchain for the first transaction
      const estimatedAge = Math.min(txCount * 0.1, 365); // Rough estimate
      return estimatedAge;
    } catch (error) {
      console.error("Error getting account age:", error);
      return 0;
    }
  }

  /**
   * Get wallet balance in MATIC
   */
  private async getWalletBalance(walletAddress: string): Promise<number> {
    try {
      const provider = web3Service.getProvider();
      if (!provider) {
        throw new Error("Provider not available");
      }

      const balance = await provider.getBalance(walletAddress);
      return parseFloat(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error("Error getting wallet balance:", error);
      return 0;
    }
  }

  /**
   * Calculate reputation score based on various factors
   */
  async calculateReputationScore(walletAddress: string): Promise<number> {
    const accountAge = await this.getAccountAge(walletAddress);
    const balance = await this.getWalletBalance(walletAddress);
    const txCount = await this.getTransactionCount(walletAddress);

    // Simple reputation scoring algorithm
    let score = 0;
    
    // Age factor (0-40 points)
    score += Math.min(accountAge * 0.5, 40);
    
    // Balance factor (0-30 points)
    score += Math.min(balance * 10, 30);
    
    // Transaction history factor (0-30 points)
    score += Math.min(txCount * 0.1, 30);

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Get transaction count for a wallet
   */
  private async getTransactionCount(walletAddress: string): Promise<number> {
    try {
      const provider = web3Service.getProvider();
      if (!provider) {
        throw new Error("Provider not available");
      }

      return await provider.getTransactionCount(walletAddress);
    } catch (error) {
      console.error("Error getting transaction count:", error);
      return 0;
    }
  }

  /**
   * Detect suspicious voting patterns
   */
  detectSuspiciousActivity(walletAddress: string): {
    isSuspicious: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let isSuspicious = false;

    // Check for rapid voting
    const lastVoteTime = this.lastVoteTime.get(walletAddress);
    if (lastVoteTime && Date.now() - lastVoteTime < 60000) { // Less than 1 minute
      isSuspicious = true;
      reasons.push("Voting too quickly");
    }

    // Check for excessive campaign participation
    const campaignCount = this.campaignCount.get(walletAddress) || 0;
    if (campaignCount > this.config.maxCampaignsPerWallet * 2) {
      isSuspicious = true;
      reasons.push("Excessive campaign participation");
    }

    return { isSuspicious, reasons };
  }
}

export const sybilProtectionService = new SybilProtectionService();