import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Shield, Clock, Wallet, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { sybilProtectionService } from "@/lib/sybil-protection";
import { useToast } from "@/hooks/use-toast";

interface SecurityMetrics {
  reputationScore: number;
  accountAge: number;
  balance: number;
  txCount: number;
  lastVoteTime: number | null;
  canVote: boolean;
  restrictions: string[];
}

export function SecurityDashboard() {
  const { address, isConnected } = useWallet();
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isConnected && address) {
      loadSecurityMetrics();
    }
  }, [isConnected, address]);

  const loadSecurityMetrics = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const reputationScore = await sybilProtectionService.calculateReputationScore(address);
      const sybilCheck = await sybilProtectionService.canVote(address, 0); // Test with dummy campaign ID
      
      // Get wallet metrics (simplified for demo)
      const accountAge = Math.floor(Math.random() * 365); // In real app, calculate from first transaction
      const balance = Math.random() * 10; // In real app, get from blockchain
      const txCount = Math.floor(Math.random() * 1000);
      const lastVoteTime = Math.random() > 0.5 ? Date.now() - Math.random() * 86400000 : null;

      setMetrics({
        reputationScore,
        accountAge,
        balance,
        txCount,
        lastVoteTime,
        canVote: sybilCheck.canVote,
        restrictions: sybilCheck.reasons,
      });
    } catch (error) {
      console.error("Failed to load security metrics:", error);
      toast({
        title: "Error",
        description: "Failed to load security metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSecurityLevel = (score: number): { level: string; color: string; icon: any } => {
    if (score >= 80) return { level: "High", color: "text-green-600", icon: CheckCircle };
    if (score >= 60) return { level: "Medium", color: "text-yellow-600", icon: AlertTriangle };
    return { level: "Low", color: "text-red-600", icon: XCircle };
  };

  const formatTimeAgo = (timestamp: number): string => {
    const hours = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Security Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Connect your wallet to view security metrics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading || !metrics) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Security Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Loading security metrics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const securityLevel = getSecurityLevel(metrics.reputationScore);
  const SecurityIcon = securityLevel.icon;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Security Dashboard</span>
          </div>
          <Badge variant="outline" className={securityLevel.color}>
            <SecurityIcon className="w-4 h-4 mr-1" />
            {securityLevel.level} Security
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reputation Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Reputation Score</span>
            <span className="text-sm text-gray-500">{metrics.reputationScore}/100</span>
          </div>
          <Progress value={metrics.reputationScore} className="h-2" />
          <p className="text-xs text-gray-500">
            Based on account age, transaction history, and voting behavior
          </p>
        </div>

        {/* Account Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Account Age</span>
            </div>
            <p className="text-lg font-semibold">{metrics.accountAge} days</p>
            <p className="text-xs text-gray-500">
              {metrics.accountAge >= 30 ? "✓ Meets minimum requirement" : "⚠ Need 30+ days"}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Wallet className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Balance</span>
            </div>
            <p className="text-lg font-semibold">{metrics.balance.toFixed(2)} MATIC</p>
            <p className="text-xs text-gray-500">
              {metrics.balance >= 1 ? "✓ Sufficient for voting" : "⚠ Need 1+ MATIC"}
            </p>
          </div>
        </div>

        {/* Voting Status */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Voting Status</span>
            <Badge variant={metrics.canVote ? "default" : "destructive"}>
              {metrics.canVote ? "Eligible" : "Restricted"}
            </Badge>
          </div>
          
          {metrics.lastVoteTime && (
            <p className="text-sm text-gray-600 mb-2">
              Last vote: {formatTimeAgo(metrics.lastVoteTime)}
            </p>
          )}

          {!metrics.canVote && metrics.restrictions.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-600">Restrictions:</p>
              {metrics.restrictions.map((restriction, index) => (
                <p key={index} className="text-xs text-red-600">• {restriction}</p>
              ))}
            </div>
          )}
        </div>

        {/* Sybil Protection Features */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Active Sybil Protections</h4>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Account age verification</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Balance requirement checks</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Voting cooldown enforcement</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Suspicious activity detection</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <XCircle className="w-4 h-4 text-gray-400" />
              <span>Biometric verification (Coming soon)</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <XCircle className="w-4 h-4 text-gray-400" />
              <span>Government ID verification (Coming soon)</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadSecurityMetrics} disabled={loading}>
            Refresh Metrics
          </Button>
          <Button variant="outline" disabled>
            Verify Identity (Coming Soon)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}