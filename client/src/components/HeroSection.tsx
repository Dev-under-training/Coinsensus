import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Rocket, Search } from "lucide-react";

export function HeroSection() {
  const [, setLocation] = useLocation();

  return (
    <section className="bg-gradient-to-br from-primary/5 to-purple-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Secure, Transparent
            <span className="text-primary block">Decentralized Voting</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create and participate in transparent, blockchain-based voting campaigns. 
            Every vote is recorded on the Polygon blockchain for complete transparency and security.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setLocation("/create")}
              className="flex items-center space-x-2"
              size="lg"
            >
              <Rocket className="w-5 h-5" />
              <span>Launch Campaign</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation("/campaigns")}
              className="flex items-center space-x-2"
              size="lg"
            >
              <Search className="w-5 h-5" />
              <span>Browse Campaigns</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
