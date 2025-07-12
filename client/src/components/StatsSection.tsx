import { useCampaignStats } from "@/hooks/useCampaigns";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function StatsSection() {
  const { data: stats, isLoading } = useCampaignStats();

  if (isLoading) {
    return (
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <LoadingSpinner className="w-8 h-8" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {stats?.totalCampaigns || 0}
            </div>
            <div className="text-gray-600">Total Campaigns</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">
              {stats?.totalVotes || 0}
            </div>
            <div className="text-gray-600">Votes Cast</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning mb-2">
              {stats?.activeUsers || 0}
            </div>
            <div className="text-gray-600">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats?.gasFeeSaved || "$0"}
            </div>
            <div className="text-gray-600">Gas Fees Saved</div>
          </div>
        </div>
      </div>
    </section>
  );
}
