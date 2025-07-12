import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ExternalLink, CheckCircle, XCircle } from "lucide-react";

interface TransactionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  txHash?: string;
  status: "pending" | "success" | "failed";
  gasUsed?: string;
}

export function TransactionStatusModal({
  isOpen,
  onClose,
  txHash,
  status,
  gasUsed,
}: TransactionStatusModalProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "pending":
        return <Clock className="text-primary w-8 h-8 animate-pulse" />;
      case "success":
        return <CheckCircle className="text-green-500 w-8 h-8" />;
      case "failed":
        return <XCircle className="text-red-500 w-8 h-8" />;
      default:
        return <Clock className="text-primary w-8 h-8" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "pending":
        return "Transaction Pending";
      case "success":
        return "Transaction Successful";
      case "failed":
        return "Transaction Failed";
      default:
        return "Transaction Status";
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case "pending":
        return "Your transaction is being processed on the blockchain.";
      case "success":
        return "Your transaction has been confirmed on the blockchain.";
      case "failed":
        return "Your transaction failed to process. Please try again.";
      default:
        return "Processing your transaction...";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            {getStatusIcon()}
          </div>
          <DialogTitle className="text-center text-xl font-semibold">{getStatusText()}</DialogTitle>
          <p className="text-center text-gray-600">{getStatusDescription()}</p>
        </DialogHeader>

        {txHash && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-500">Transaction Hash:</span>
              <span className="font-mono text-primary text-xs">
                {txHash.slice(0, 6)}...{txHash.slice(-4)}
              </span>
            </div>
            {gasUsed && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Gas Used:</span>
                <span className="font-medium">{gasUsed}</span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {txHash && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(`https://mumbai.polygonscan.com/tx/${txHash}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on PolygonScan
            </Button>
          )}

          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
