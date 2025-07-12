import { Link, useLocation } from "wouter";
import { WalletButton } from "@/components/ui/wallet-button";
import { Vote } from "lucide-react";

export function AppHeader() {
  const [location] = useLocation();

  return (
    <header className="bg-surface shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Vote className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Coinsensus</h1>
              <p className="text-xs text-gray-500">Decentralized Voting</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`transition-colors ${location === '/' ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
              Home
            </Link>
            <Link href="/campaigns" className={`transition-colors ${location === '/campaigns' ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
              Campaigns
            </Link>
            <Link href="/create" className={`transition-colors ${location === '/create' ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
              Create
            </Link>
            <Link href="/security" className={`transition-colors ${location === '/security' ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
              Security
            </Link>
            <Link href="/advanced" className={`transition-colors ${location === '/advanced' ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
              Advanced
            </Link>
          </nav>

          {/* Network Status and Wallet */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-purple-700">Polygon Testnet</span>
            </div>
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
}
