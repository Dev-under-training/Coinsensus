import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Zap, 
  Users, 
  Coins, 
  Lock, 
  Eye, 
  UserCheck, 
  Settings, 
  TrendingUp,
  Award,
  Clock,
  AlertTriangle
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { tokenomicsService } from "@/lib/tokenomics";
import { zkpVotingService, biometricAuthService, didService } from "@/lib/zkp-voting";
import { socialRecoveryService } from "@/lib/tokenomics";
import { useToast } from "@/hooks/use-toast";

interface DashboardMetrics {
  tokenBalance: string;
  votingPower: string;
  stakingTier: string;
  reputationScore: number;
  biometricEnabled: boolean;
  didVerified: boolean;
  recoverySetup: boolean;
  zkpVotesCount: number;
}

export function AdvancedDashboard() {
  const { address, isConnected } = useWallet();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    if (isConnected && address) {
      loadDashboardMetrics();
    }
  }, [isConnected, address]);

  const loadDashboardMetrics = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const [
        tokenBalance,
        votingPower,
        stakingInfo,
        biometricSupported,
        recoveryInfo
      ] = await Promise.all([
        tokenomicsService.getTokenBalance(address),
        tokenomicsService.calculateVotingPower(address),
        tokenomicsService.getStakingInfo(address),
        biometricAuthService.isBiometricSupported(),
        socialRecoveryService.getRecoveryInfo(address).catch(() => null)
      ]);

      setMetrics({
        tokenBalance,
        votingPower: votingPower.totalVotingPower,
        stakingTier: stakingInfo.tier,
        reputationScore: Math.floor(Math.random() * 100), // Mock data
        biometricEnabled: biometricSupported,
        didVerified: false, // Mock data
        recoverySetup: recoveryInfo ? recoveryInfo.guardians.length > 0 : false,
        zkpVotesCount: Math.floor(Math.random() * 50), // Mock data
      });
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetupBiometric = async () => {
    try {
      const result = await biometricAuthService.registerBiometric(address!);
      toast({
        title: "Success",
        description: "Biometric authentication enabled",
        variant: "default",
      });
      loadDashboardMetrics();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to setup biometric authentication",
        variant: "destructive",
      });
    }
  };

  const handleSetupDID = async () => {
    try {
      const did = await didService.createDID('key');
      toast({
        title: "Success",
        description: "Decentralized Identity created",
        variant: "default",
      });
      loadDashboardMetrics();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create DID",
        variant: "destructive",
      });
    }
  };

  const handleSetupRecovery = async () => {
    try {
      // Mock guardian setup
      const guardians = [
        '0x1234567890123456789012345678901234567890',
        '0x2345678901234567890123456789012345678901',
        '0x3456789012345678901234567890123456789012',
      ];
      const identities = [
        { name: 'Guardian 1', contact: 'guardian1@example.com' },
        { name: 'Guardian 2', contact: 'guardian2@example.com' },
        { name: 'Guardian 3', contact: 'guardian3@example.com' },
      ];
      
      await socialRecoveryService.setupSocialRecovery(guardians, identities);
      toast({
        title: "Success",
        description: "Social recovery setup completed",
        variant: "default",
      });
      loadDashboardMetrics();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to setup social recovery",
        variant: "destructive",
      });
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Advanced Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Connect your wallet to access advanced features</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading || !metrics) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Advanced Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading dashboard...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Coins className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Token Balance</p>
                <p className="text-2xl font-bold">{parseFloat(metrics.tokenBalance).toFixed(2)}</p>
                <p className="text-xs text-gray-500">CONS</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Voting Power</p>
                <p className="text-2xl font-bold">{parseFloat(metrics.votingPower).toFixed(1)}</p>
                <p className="text-xs text-gray-500">Weighted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Staking Tier</p>
                <p className="text-lg font-bold">{metrics.stakingTier}</p>
                <p className="text-xs text-gray-500">Current Level</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Reputation</p>
                <p className="text-2xl font-bold">{metrics.reputationScore}</p>
                <p className="text-xs text-gray-500">Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Advanced Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="tokenomics">Tokenomics</TabsTrigger>
              <TabsTrigger value="identity">Identity</TabsTrigger>
              <TabsTrigger value="recovery">Recovery</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Security Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Biometric Auth</span>
                      <Badge variant={metrics.biometricEnabled ? "default" : "destructive"}>
                        {metrics.biometricEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">DID Verified</span>
                      <Badge variant={metrics.didVerified ? "default" : "destructive"}>
                        {metrics.didVerified ? "Verified" : "Not Verified"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Social Recovery</span>
                      <Badge variant={metrics.recoverySetup ? "default" : "destructive"}>
                        {metrics.recoverySetup ? "Setup" : "Not Setup"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Privacy Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Zero-Knowledge Votes</span>
                      <span className="text-sm font-semibold">{metrics.zkpVotesCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Anonymous Sessions</span>
                      <span className="text-sm font-semibold">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Privacy Score</span>
                      <span className="text-sm font-semibold">95%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="w-5 h-5" />
                    <span>Zero-Knowledge Proofs</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Anonymous Voting</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Vote anonymously using zero-knowledge proofs. Your identity remains hidden while proving your eligibility.
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium">Privacy Level</div>
                        <Progress value={95} className="h-2 mt-1" />
                      </div>
                      <span className="text-sm text-gray-500">95%</span>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Selective Disclosure</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Share only necessary information when proving credentials or voting eligibility.
                    </p>
                    <Button variant="outline" size="sm">
                      Configure Disclosure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Biometric Authentication</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Hardware-Based Security</h4>
                      <p className="text-sm text-gray-600">
                        Secure biometric authentication using device hardware security modules
                      </p>
                    </div>
                    <Button 
                      onClick={handleSetupBiometric}
                      disabled={metrics.biometricEnabled}
                    >
                      {metrics.biometricEnabled ? "Enabled" : "Enable"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800">Supported Features</h4>
                      <ul className="text-sm text-green-700 mt-2 space-y-1">
                        <li>• Fingerprint Recognition</li>
                        <li>• Face ID Authentication</li>
                        <li>• Voice Recognition</li>
                        <li>• Behavioral Biometrics</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800">Security Benefits</h4>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• Hardware-level encryption</li>
                        <li>• Anti-spoofing protection</li>
                        <li>• Liveness detection</li>
                        <li>• Quantum-resistant security</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tokenomics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Coins className="w-5 h-5" />
                      <span>Staking Rewards</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Current Tier</span>
                      <Badge variant="outline">{metrics.stakingTier}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">APY</span>
                      <span className="text-sm font-semibold">
                        {metrics.stakingTier === 'PLATINUM' ? '15%' : 
                         metrics.stakingTier === 'GOLD' ? '12%' : 
                         metrics.stakingTier === 'SILVER' ? '8%' : '5%'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Voting Multiplier</span>
                      <span className="text-sm font-semibold">
                        {metrics.stakingTier === 'PLATINUM' ? '2.0x' : 
                         metrics.stakingTier === 'GOLD' ? '1.5x' : 
                         metrics.stakingTier === 'SILVER' ? '1.2x' : '1.0x'}
                      </span>
                    </div>
                    <Button className="w-full" variant="outline">
                      Manage Staking
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>Governance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Proposals Created</span>
                      <span className="text-sm font-semibold">3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Votes Cast</span>
                      <span className="text-sm font-semibold">47</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Governance Score</span>
                      <span className="text-sm font-semibold">8.5/10</span>
                    </div>
                    <Button className="w-full" variant="outline">
                      View Governance
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="identity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserCheck className="w-5 h-5" />
                    <span>Decentralized Identity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">DID Creation</h4>
                      <p className="text-sm text-gray-600">
                        Create a decentralized identity for verifiable credentials
                      </p>
                    </div>
                    <Button 
                      onClick={handleSetupDID}
                      disabled={metrics.didVerified}
                    >
                      {metrics.didVerified ? "Verified" : "Create DID"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-indigo-800">Credentials</h4>
                      <ul className="text-sm text-indigo-700 mt-2 space-y-1">
                        <li>• Voting Eligibility</li>
                        <li>• Identity Verification</li>
                        <li>• Age Verification</li>
                        <li>• Reputation Score</li>
                      </ul>
                    </div>
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-teal-800">Benefits</h4>
                      <ul className="text-sm text-teal-700 mt-2 space-y-1">
                        <li>• Self-sovereign identity</li>
                        <li>• Portable credentials</li>
                        <li>• Privacy-preserving</li>
                        <li>• Interoperable</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recovery" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Social Recovery</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Guardian Setup</h4>
                      <p className="text-sm text-gray-600">
                        Configure trusted guardians for account recovery
                      </p>
                    </div>
                    <Button 
                      onClick={handleSetupRecovery}
                      disabled={metrics.recoverySetup}
                    >
                      {metrics.recoverySetup ? "Configured" : "Setup"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-800">Recovery Options</h4>
                      <ul className="text-sm text-orange-700 mt-2 space-y-1">
                        <li>• Social guardians (3-10)</li>
                        <li>• Biometric recovery</li>
                        <li>• Hardware security keys</li>
                        <li>• Time-delayed recovery</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-800">Security Features</h4>
                      <ul className="text-sm text-red-700 mt-2 space-y-1">
                        <li>• Multi-signature approval</li>
                        <li>• Recovery delays</li>
                        <li>• Guardian notifications</li>
                        <li>• Fraud protection</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}