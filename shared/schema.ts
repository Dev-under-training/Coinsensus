import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'public', 'multiple', 'weighted'
  category: text("category").notNull(),
  options: jsonb("options").notNull(), // Array of voting options
  creatorAddress: text("creator_address").notNull(),
  contractAddress: text("contract_address"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  totalVotes: integer("total_votes").default(0),
  results: jsonb("results").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  voterAddress: text("voter_address").notNull(),
  choice: text("choice").notNull(),
  weight: integer("weight").default(1),
  transactionHash: text("transaction_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  displayName: text("display_name"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCampaignSchema = createInsertSchema(campaigns).pick({
  title: true,
  description: true,
  type: true,
  category: true,
  options: true,
  creatorAddress: true,
  startDate: true,
  endDate: true,
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  campaignId: true,
  voterAddress: true,
  choice: true,
  weight: true,
  transactionHash: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  address: true,
  displayName: true,
});

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
