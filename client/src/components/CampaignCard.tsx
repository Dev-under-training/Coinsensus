import { Campaign } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Building, GraduationCap, Leaf } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useVote } from "@/hooks/useCampaigns";
import { web3Service } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const { isConnected, address } = useWallet();
  const { mutate: vote, isPending: isVoting } = useVote();
  const { toast } = useToast();

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "government":
        return <Building className="w-5 h-5 text-primary" />;
      case "education":
        return <GraduationCap className="w-5 h-5 text-purple-600" />;
      case "environment":
        return <Leaf className="w-5 h-5 text-green-600" />;
      default:
        return <Building className="w-5 h-5 text-primary" />;
    }
  };

  const getStatusColor = (endDate: Date) => {
    const now = new Date();
    const end = new Date(endDate);
    return end > now ? "bg-accent/10 text-accent" : "bg-gray-100 text-gray-500";
  };

  const getDaysLeft = (endDate: Date) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days left` : "Ended";
  };

  const handleVote = async (optionIndex: number) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to vote.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Cast vote on blockchain
      const txHash = await web3Service.vote(campaign.id, optionIndex);
      
      // Record vote in database
      vote({
        campaignId: campaign.id,
        choice: (campaign.options as string[])[optionIndex],
        transactionHash: txHash,
      });

      toast({
        title: "Vote cast successfully!",
        description: "Your vote has been recorded on the blockchain.",
      });
    } catch (error: any) {
      console.error("Failed to vote:", error);
      toast({
        title: "Vote failed",
        description: error.message || "Failed to cast vote",
        variant: "destructive",
      });
    }
  };

  const options = campaign.options as string[];
  const results = campaign.results as Record<string, number> || {};
  const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              {getCategoryIcon(campaign.category)}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{campaign.title}</h4>
              <p className="text-sm text-gray-500">{campaign.type} Campaign</p>
            </div>
          </div>
          <Badge className={getStatusColor(campaign.endDate)}>
            {campaign.isActive ? "Active" : "Ended"}
          </Badge>
        </div>

        <p className="text-gray-600 mb-4 text-sm line-clamp-3">
          {campaign.description}
        </p>

        <div className="space-y-3 mb-4">
          {options.map((option, index) => {
            const voteCount = results[option] || 0;
            const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
            
            return (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">{option}</span>
                  <span className="font-medium">{percentage.toFixed(1)}%</span>
                </div>
                <ProgressBar value={voteCount} max={totalVotes} />
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <span className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {totalVotes} votes
          </span>
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {getDaysLeft(campaign.endDate)}
          </span>
        </div>

        <Button
          className="w-full"
          onClick={() => handleVote(0)} // For now, vote for first option
          disabled={!isConnected || isVoting || !campaign.isActive}
        >
          {!isConnected
            ? "Connect Wallet to Vote"
            : isVoting
            ? "Voting..."
            : !campaign.isActive
            ? "Campaign Ended"
            : "Vote Now"}
        </Button>
      </CardContent>
    </Card>
  );
}
