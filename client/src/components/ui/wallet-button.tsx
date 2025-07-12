import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { LoadingSpinner } from "./loading-spinner";
import { Wallet } from "lucide-react";

export function WalletButton() {
  const { isConnected, address, isConnecting, connectWallet, disconnectWallet } = useWallet();

  if (isConnected && address) {
    return (
      <Button
        variant="outline"
        onClick={disconnectWallet}
        className="flex items-center space-x-2"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
      </Button>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      className="flex items-center space-x-2"
    >
      {isConnecting ? (
        <LoadingSpinner className="w-4 h-4" />
      ) : (
        <Wallet className="w-4 h-4" />
      )}
      <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
    </Button>
  );
}
