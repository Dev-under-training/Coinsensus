import { AppHeader } from "@/components/AppHeader";
import { HeroSection } from "@/components/HeroSection";
import { StatsSection } from "@/components/StatsSection";
import { CampaignList } from "@/components/CampaignList";
import { FeaturesSection } from "@/components/FeaturesSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <HeroSection />
      <StatsSection />
      <CampaignList />
      <FeaturesSection />
      <Footer />
    </div>
  );
}
