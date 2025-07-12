import { Shield, Network, Zap } from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Coinsensus?</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Built on blockchain technology to ensure transparency, security, and decentralization in every vote.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="text-primary w-8 h-8" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">Secure & Transparent</h4>
            <p className="text-gray-600">All votes are recorded on the blockchain, ensuring complete transparency and immutability.</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Network className="text-accent w-8 h-8" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">Decentralized</h4>
            <p className="text-gray-600">No central authority controls the voting process. Smart contracts ensure fair and automated execution.</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-warning/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="text-warning w-8 h-8" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">Low Cost</h4>
            <p className="text-gray-600">Built on Polygon for minimal gas fees, making voting accessible to everyone.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
