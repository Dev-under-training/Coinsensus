import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { Wallet, Smartphone, Shield, ChevronRight } from "lucide-react";

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnectionModal({ isOpen, onClose }: WalletConnectionModalProps) {
  const { connectWallet, isConnecting } = useWallet();

  const handleConnect = async () => {
    try {
      await connectWallet();
      onClose();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="text-primary w-8 h-8" />
          </div>
          <DialogTitle className="text-center text-xl font-semibold">Connect Your Wallet</DialogTitle>
          <p className="text-center text-gray-600">Choose your preferred wallet to connect to Coinsensus</p>
        </DialogHeader>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full flex items-center justify-between p-4 h-auto"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Wallet className="text-white w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-medium">MetaMask</div>
                <div className="text-sm text-gray-500">Connect using browser extension</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Button>

          <Button
            variant="outline"
            className="w-full flex items-center justify-between p-4 h-auto"
            disabled
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Smartphone className="text-white w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-medium">WalletConnect</div>
                <div className="text-sm text-gray-500">Connect using mobile wallet</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Button>

          <Button
            variant="outline"
            className="w-full flex items-center justify-between p-4 h-auto"
            disabled
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="text-white w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-medium">Coinbase Wallet</div>
                <div className="text-sm text-gray-500">Connect using Coinbase</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Button>
        </div>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
