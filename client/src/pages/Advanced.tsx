import { AppHeader } from "@/components/AppHeader";
import { AdvancedDashboard } from "@/components/AdvancedDashboard";
import { Footer } from "@/components/Footer";

export default function Advanced() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Advanced Features Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Manage your privacy, security, and advanced voting features. Access zero-knowledge proofs, biometric authentication, and decentralized identity management.
            </p>
          </div>

          <AdvancedDashboard />
        </div>
      </main>

      <Footer />
    </div>
  );
}