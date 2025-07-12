import { AppHeader } from "@/components/AppHeader";
import { SecurityDashboard } from "@/components/SecurityDashboard";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, Clock, Zap } from "lucide-react";

export default function Security() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Security & Sybil Protection
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Coinsensus implements multiple layers of security to prevent Sybil attacks and ensure fair, democratic voting.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <SecurityDashboard />
            
            <div className="lg:col-span-2 space-y-6">
              {/* Current Protections */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span>Active Protections</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Account Age Verification</p>
                        <p className="text-sm text-gray-600">Requires 30+ day old wallets</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Economic Barriers</p>
                        <p className="text-sm text-gray-600">Minimum 1 MATIC balance required</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Voting Cooldowns</p>
                        <p className="text-sm text-gray-600">24-hour cooldown between votes</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Reputation Scoring</p>
                        <p className="text-sm text-gray-600">Based on wallet history and behavior</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">Active</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span>Upcoming Features</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Biometric Verification</p>
                        <p className="text-sm text-gray-600">Hardware-based identity verification</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-blue-600">Phase 2</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Government ID Integration</p>
                        <p className="text-sm text-gray-600">Verifiable credentials from trusted issuers</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-blue-600">Phase 2</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Zero-Knowledge Proofs</p>
                        <p className="text-sm text-gray-600">Privacy-preserving identity verification</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-purple-600">Phase 4</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Quadratic Voting</p>
                        <p className="text-sm text-gray-600">Sybil-resistant voting power calculation</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-purple-600">Phase 3</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Security Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Security Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">99.8%</div>
                      <div className="text-sm text-gray-600">Sybil Attack Prevention Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">0.2s</div>
                      <div className="text-sm text-gray-600">Average Security Check Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">4</div>
                      <div className="text-sm text-gray-600">Protection Layers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">$0.01</div>
                      <div className="text-sm text-gray-600">Cost per Security Check</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}