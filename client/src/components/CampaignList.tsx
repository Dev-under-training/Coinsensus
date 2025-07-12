import { useCampaigns } from "@/hooks/useCampaigns";
import { CampaignCard } from "./CampaignCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CampaignList() {
  const { data: campaigns, isLoading, error } = useCampaigns();
  const [filter, setFilter] = useState<string>("all");

  if (isLoading) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <LoadingSpinner className="w-8 h-8" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">Failed to load campaigns</p>
          </div>
        </div>
      </section>
    );
  }

  const filteredCampaigns = campaigns?.filter(campaign => {
    if (filter === "all") return true;
    return campaign.type === filter;
  }) || [];

  return (
    <section id="campaigns" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Active Campaigns</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Participate in ongoing voting campaigns or create your own. All votes are securely recorded on the blockchain.
          </p>
        </div>

        {/* Campaign Filters */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "public" ? "default" : "outline"}
            onClick={() => setFilter("public")}
          >
            Public
          </Button>
          <Button
            variant={filter === "multiple" ? "default" : "outline"}
            onClick={() => setFilter("multiple")}
          >
            Multiple Choice
          </Button>
          <Button
            variant={filter === "weighted" ? "default" : "outline"}
            onClick={() => setFilter("weighted")}
          >
            Weighted
          </Button>
        </div>

        {/* Campaign Grid */}
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No campaigns found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
