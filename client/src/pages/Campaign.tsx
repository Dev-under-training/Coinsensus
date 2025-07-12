import { AppHeader } from "@/components/AppHeader";
import { CreateCampaignForm } from "@/components/CreateCampaignForm";
import { Footer } from "@/components/Footer";

export default function Campaign() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <CreateCampaignForm />
      <Footer />
    </div>
  );
}
