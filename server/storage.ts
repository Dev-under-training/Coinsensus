import { campaigns, votes, users, type Campaign, type Vote, type User, type InsertCampaign, type InsertVote, type InsertUser } from "@shared/schema";

export interface IStorage {
  // Campaign operations
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, updates: Partial<Campaign>): Promise<Campaign>;
  
  // Vote operations
  createVote(vote: InsertVote): Promise<Vote>;
  getVotesByCampaign(campaignId: number): Promise<Vote[]>;
  hasVoted(campaignId: number, voterAddress: string): Promise<boolean>;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByAddress(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Statistics
  getCampaignStats(): Promise<{
    totalCampaigns: number;
    totalVotes: number;
    activeUsers: number;
    gasFeeSaved: string;
  }>;
}

export class MemStorage implements IStorage {
  private campaigns: Map<number, Campaign> = new Map();
  private votes: Map<number, Vote> = new Map();
  private users: Map<number, User> = new Map();
  private currentCampaignId = 1;
  private currentVoteId = 1;
  private currentUserId = 1;

  constructor() {
    // Add some sample data
    this.seedData();
  }

  private seedData() {
    // Sample campaigns
    const sampleCampaigns: Campaign[] = [
      {
        id: 1,
        title: "City Budget Allocation",
        description: "Vote on how the city should allocate its $2.5M budget across infrastructure, education, and public services.",
        type: "public",
        category: "government",
        options: ["Infrastructure", "Education", "Public Services"],
        creatorAddress: "0x1234567890123456789012345678901234567890",
        contractAddress: "0x1111111111111111111111111111111111111111",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-31"),
        isActive: true,
        totalVotes: 1247,
        results: { "Infrastructure": 561, "Education": 436, "Public Services": 250 },
        createdAt: new Date(),
      },
      {
        id: 2,
        title: "University President Election",
        description: "Choose the next president of State University from three qualified candidates.",
        type: "public",
        category: "education",
        options: ["Dr. Sarah Johnson", "Prof. Michael Chen", "Dr. Emily Rodriguez"],
        creatorAddress: "0x2234567890123456789012345678901234567890",
        contractAddress: "0x2222222222222222222222222222222222222222",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-02-15"),
        isActive: true,
        totalVotes: 892,
        results: { "Dr. Sarah Johnson": 464, "Prof. Michael Chen": 277, "Dr. Emily Rodriguez": 151 },
        createdAt: new Date(),
      },
      {
        id: 3,
        title: "Environmental Policy",
        description: "Rate the importance of different environmental initiatives for the upcoming policy framework.",
        type: "weighted",
        category: "environment",
        options: ["Renewable Energy", "Waste Management", "Carbon Reduction"],
        creatorAddress: "0x3234567890123456789012345678901234567890",
        contractAddress: "0x3333333333333333333333333333333333333333",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-02-28"),
        isActive: true,
        totalVotes: 543,
        results: { "Renewable Energy": 228, "Waste Management": 167, "Carbon Reduction": 272 },
        createdAt: new Date(),
      },
    ];

    sampleCampaigns.forEach(campaign => {
      this.campaigns.set(campaign.id, campaign);
    });
    this.currentCampaignId = sampleCampaigns.length + 1;
  }

  async getCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(campaignData: InsertCampaign): Promise<Campaign> {
    const campaign: Campaign = {
      id: this.currentCampaignId++,
      ...campaignData,
      contractAddress: null,
      isActive: true,
      totalVotes: 0,
      results: {},
      createdAt: new Date(),
    };
    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  async updateCampaign(id: number, updates: Partial<Campaign>): Promise<Campaign> {
    const campaign = this.campaigns.get(id);
    if (!campaign) {
      throw new Error("Campaign not found");
    }
    const updatedCampaign = { ...campaign, ...updates };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async createVote(voteData: InsertVote): Promise<Vote> {
    const vote: Vote = {
      id: this.currentVoteId++,
      ...voteData,
      createdAt: new Date(),
    };
    this.votes.set(vote.id, vote);

    // Update campaign results
    const campaign = this.campaigns.get(voteData.campaignId);
    if (campaign) {
      const results = campaign.results as Record<string, number> || {};
      results[voteData.choice] = (results[voteData.choice] || 0) + (voteData.weight || 1);
      campaign.results = results;
      campaign.totalVotes = (campaign.totalVotes || 0) + 1;
      this.campaigns.set(campaign.id, campaign);
    }

    return vote;
  }

  async getVotesByCampaign(campaignId: number): Promise<Vote[]> {
    return Array.from(this.votes.values()).filter(vote => vote.campaignId === campaignId);
  }

  async hasVoted(campaignId: number, voterAddress: string): Promise<boolean> {
    return Array.from(this.votes.values()).some(
      vote => vote.campaignId === campaignId && vote.voterAddress === voterAddress
    );
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByAddress(address: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.address === address);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      ...userData,
      isVerified: false,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getCampaignStats(): Promise<{
    totalCampaigns: number;
    totalVotes: number;
    activeUsers: number;
    gasFeeSaved: string;
  }> {
    const totalCampaigns = this.campaigns.size;
    const totalVotes = Array.from(this.campaigns.values()).reduce((sum, campaign) => sum + (campaign.totalVotes || 0), 0);
    const activeUsers = this.users.size;
    const gasFeeSaved = `$${(totalVotes * 0.01).toFixed(2)}`;

    return {
      totalCampaigns,
      totalVotes,
      activeUsers,
      gasFeeSaved,
    };
  }
}

export const storage = new MemStorage();
