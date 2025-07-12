import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Campaign, InsertCampaign } from "@shared/schema";

export function useCampaigns() {
  return useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });
}

export function useCampaign(id: number) {
  return useQuery<Campaign>({
    queryKey: ["/api/campaigns", id],
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaign: InsertCampaign) => {
      const response = await apiRequest("POST", "/api/campaigns", campaign);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
    },
  });
}

export function useVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (voteData: { campaignId: number; choice: string; transactionHash: string }) => {
      const response = await apiRequest("POST", "/api/votes", voteData);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", variables.campaignId] });
    },
  });
}

export function useCampaignStats() {
  return useQuery<{
    totalCampaigns: number;
    totalVotes: number;
    activeUsers: number;
    gasFeeSaved: string;
  }>({
    queryKey: ["/api/campaigns/stats"],
  });
}
