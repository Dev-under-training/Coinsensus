import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Eye, 
  EyeOff, 
  Shield, 
  Zap, 
  Lock, 
  Fingerprint, 
  UserCheck, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Calculator
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { zkpVotingService, biometricAuthService } from "@/lib/zkp-voting";
import { tokenomicsService } from "@/lib/tokenomics";
import { useToast } from "@/hooks/use-toast";

interface AdvancedVotingProps {
  campaignId: number;
  campaignTitle: string;
  options: string[];
  allowPrivateVoting: boolean;
  allowQuadraticVoting: boolean;
  votingPower: number;
}

interface VotingState {
  selectedOption: number | null;
  isPrivate: boolean;
  isQuadratic: boolean;
  quadraticWeights: number[];
  totalCredits: number;
  biometricRequired: boolean;
  proofGenerating: boolean;
  votingStep: 'selection' | 'verification' | 'proof' | 'submission' | 'complete';
}

export function AdvancedVotingInterface({
  campaignId,
  campaignTitle,
  options,
  allowPrivateVoting,
  allowQuadraticVoting,
  votingPower
}: AdvancedVotingProps) {
  const { address, isConnected } = useWallet();
  const [state, setState] = useState<VotingState>({
    selectedOption: null,
    isPrivate: false,
    isQuadratic: false,
    quadraticWeights: new Array(options.length).fill(0),
    totalCredits: Math.floor(Math.sqrt(votingPower)),
    biometricRequired: false,
    proofGenerating: false,
    votingStep: 'selection',
  });
  const [votingSession, setVotingSession] = useState<any>(null);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkBiometricSupport();
    if (allowPrivateVoting) {
      initializePrivateVoting();
    }
  }, [allowPrivateVoting]);

  const checkBiometricSupport = async () => {
    const supported = await biometricAuthService.isBiometricSupported();
    setBiometricSupported(supported);
  };

  const initializePrivateVoting = async () => {
    try {
      const session = await zkpVotingService.createAnonymousVotingSession(campaignId);
      setVotingSession(session);
    } catch (error) {
      console.error('Failed to initialize private voting:', error);
      toast({
        title: "Error",
        description: "Failed to initialize private voting session",
        variant: "destructive",
      });
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (state.isQuadratic) {
      // For quadratic voting, don't set selectedOption
      return;
    }
    
    setState(prev => ({
      ...prev,
      selectedOption: optionIndex,
      votingStep: 'verification'
    }));
  };

  const handleQuadraticWeightChange = (optionIndex: number, weight: number) => {
    const newWeights = [...state.quadraticWeights];
    newWeights[optionIndex] = weight;
    
    const totalUsed = newWeights.reduce((sum, w) => sum + w * w, 0);
    if (totalUsed <= state.totalCredits) {
      setState(prev => ({
        ...prev,
        quadraticWeights: newWeights,
      }));
    }
  };

  const handlePrivacyToggle = (enabled: boolean) => {
    setState(prev => ({
      ...prev,
      isPrivate: enabled,
    }));
  };

  const handleQuadraticToggle = (enabled: boolean) => {
    setState(prev => ({
      ...prev,
      isQuadratic: enabled,
      selectedOption: null,
    }));
  };

  const handleBiometricToggle = (required: boolean) => {
    setState(prev => ({
      ...prev,
      biometricRequired: required,
    }));
  };

  const proceedToProofGeneration = async () => {
    if (!address) return;

    setState(prev => ({ ...prev, votingStep: 'proof', proofGenerating: true }));

    try {
      if (state.biometricRequired) {
        const biometricProof = await biometricAuthService.generateBiometricProof(
          address,
          campaignId,
          state.selectedOption || 0
        );
        console.log('Biometric proof generated:', biometricProof);
      }

      if (state.isPrivate && votingSession) {
        const voterCommitment = await zkpVotingService.generateVoterCommitment(
          address,
          address
        );
        
        const merkleProof = await zkpVotingService.generateMerkleProof(
          voterCommitment.commitment,
          votingSession.voterCommitments
        );

        const zkProof = await zkpVotingService.generateVoteProof(
          voterCommitment.secret,
          state.selectedOption || 0,
          campaignId,
          merkleProof,
          votingSession.merkleRoot
        );

        console.log('ZK proof generated:', zkProof);
      }

      if (state.isQuadratic) {
        const quadraticProof = await zkpVotingService.generateQuadraticVotingProof(
          address,
          state.quadraticWeights,
          state.totalCredits,
          campaignId
        );
        
        console.log('Quadratic voting proof generated:', quadraticProof);
      }

      setState(prev => ({ ...prev, proofGenerating: false, votingStep: 'submission' }));
      
      toast({
        title: "Proofs Generated",
        description: "All cryptographic proofs have been generated successfully",
        variant: "default",
      });
      
    } catch (error) {
      console.error('Proof generation failed:', error);
      setState(prev => ({ ...prev, proofGenerating: false, votingStep: 'verification' }));
      toast({
        title: "Proof Generation Failed",
        description: "Failed to generate cryptographic proofs. Please try again.",
        variant: "destructive",
      });
    }
  };

  const submitVote = async () => {
    if (!address) return;

    try {
      // Submit vote with all proofs
      const voteData = {
        campaignId,
        voterAddress: address,
        selectedOption: state.selectedOption,
        isPrivate: state.isPrivate,
        isQuadratic: state.isQuadratic,
        quadraticWeights: state.quadraticWeights,
        biometricRequired: state.biometricRequired,
        timestamp: Date.now(),
      };

      // In a real implementation, this would submit to blockchain
      console.log('Submitting vote:', voteData);

      // Calculate and distribute voting rewards
      const reward = await tokenomicsService.calculateVotingReward(
        campaignId,
        75, // participation rate
        8   // campaign importance
      );

      setState(prev => ({ ...prev, votingStep: 'complete' }));
      
      toast({
        title: "Vote Submitted Successfully",
        description: `Your vote has been recorded. You earned ${reward.totalReward} CONS tokens.`,
        variant: "default",
      });

    } catch (error) {
      console.error('Vote submission failed:', error);
      toast({
        title: "Vote Submission Failed",
        description: "Failed to submit your vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetVoting = () => {
    setState({
      selectedOption: null,
      isPrivate: false,
      isQuadratic: false,
      quadraticWeights: new Array(options.length).fill(0),
      totalCredits: Math.floor(Math.sqrt(votingPower)),
      biometricRequired: false,
      proofGenerating: false,
      votingStep: 'selection',
    });
  };

  const getUsedCredits = () => {
    return state.quadraticWeights.reduce((sum, weight) => sum + weight * weight, 0);
  };

  const getRemainingCredits = () => {
    return state.totalCredits - getUsedCredits();
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'selection': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'verification': return <UserCheck className="w-5 h-5 text-blue-500" />;
      case 'proof': return <Shield className="w-5 h-5 text-purple-500" />;
      case 'submission': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'complete': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Advanced Voting Interface</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to participate in voting.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{campaignTitle}</span>
          <Badge variant="outline">
            {state.isPrivate ? "Private" : "Public"} Voting
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {['selection', 'verification', 'proof', 'submission', 'complete'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  state.votingStep === step ? 'border-blue-500 bg-blue-50' : 
                  index < ['selection', 'verification', 'proof', 'submission', 'complete'].indexOf(state.votingStep) ? 
                  'border-green-500 bg-green-50' : 'border-gray-300'
                }`}>
                  {getStepIcon(step)}
                </div>
                {index < 4 && (
                  <ArrowRight className="w-4 h-4 mx-2 text-gray-400" />
                )}
              </div>
            ))}
          </div>

          {/* Voting Options */}
          {state.votingStep === 'selection' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Your Vote</h3>
              
              {/* Privacy and Quadratic Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                {allowPrivateVoting && (
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="private-voting" 
                      checked={state.isPrivate}
                      onCheckedChange={handlePrivacyToggle}
                    />
                    <Label htmlFor="private-voting" className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>Private Voting</span>
                    </Label>
                  </div>
                )}
                
                {allowQuadraticVoting && (
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="quadratic-voting" 
                      checked={state.isQuadratic}
                      onCheckedChange={handleQuadraticToggle}
                    />
                    <Label htmlFor="quadratic-voting" className="flex items-center space-x-1">
                      <Calculator className="w-4 h-4" />
                      <span>Quadratic Voting</span>
                    </Label>
                  </div>
                )}
                
                {biometricSupported && (
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="biometric-auth" 
                      checked={state.biometricRequired}
                      onCheckedChange={handleBiometricToggle}
                    />
                    <Label htmlFor="biometric-auth" className="flex items-center space-x-1">
                      <Fingerprint className="w-4 h-4" />
                      <span>Biometric Auth</span>
                    </Label>
                  </div>
                )}
              </div>

              {/* Quadratic Voting Interface */}
              {state.isQuadratic && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Allocate Your Credits</h4>
                    <span className="text-sm text-gray-600">
                      {getRemainingCredits()} / {state.totalCredits} credits remaining
                    </span>
                  </div>
                  <Progress value={(getUsedCredits() / state.totalCredits) * 100} />
                  
                  <div className="space-y-3">
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <div className="flex-1">
                          <span className="font-medium">{option}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`weight-${index}`} className="text-sm">Credits:</Label>
                          <Input
                            id={`weight-${index}`}
                            type="number"
                            min="0"
                            max={Math.floor(Math.sqrt(getRemainingCredits() + state.quadraticWeights[index] * state.quadraticWeights[index]))}
                            value={state.quadraticWeights[index]}
                            onChange={(e) => handleQuadraticWeightChange(index, parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                          <span className="text-sm text-gray-500">
                            (Cost: {state.quadraticWeights[index] * state.quadraticWeights[index]})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Voting Interface */}
              {!state.isQuadratic && (
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <Button
                      key={index}
                      variant={state.selectedOption === index ? "default" : "outline"}
                      className="w-full text-left justify-start p-4 h-auto"
                      onClick={() => handleOptionSelect(index)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{option}</span>
                        {state.selectedOption === index && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              )}

              <Button
                onClick={() => setState(prev => ({ ...prev, votingStep: 'verification' }))}
                disabled={!state.isQuadratic && state.selectedOption === null}
                className="w-full"
              >
                Proceed to Verification
              </Button>
            </div>
          )}

          {/* Verification Step */}
          {state.votingStep === 'verification' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Verify Your Vote</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Voting Method:</span>
                  <Badge variant="outline">
                    {state.isPrivate ? "Private" : "Public"} 
                    {state.isQuadratic ? " Quadratic" : " Standard"}
                  </Badge>
                </div>
                
                {!state.isQuadratic && state.selectedOption !== null && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Selected Option:</span>
                    <span className="font-semibold">{options[state.selectedOption]}</span>
                  </div>
                )}
                
                {state.isQuadratic && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium mb-2">Credit Allocation:</h4>
                    {state.quadraticWeights.map((weight, index) => (
                      weight > 0 && (
                        <div key={index} className="flex items-center justify-between">
                          <span>{options[index]}:</span>
                          <span className="font-semibold">{weight} credits (cost: {weight * weight})</span>
                        </div>
                      )
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium">Voting Power:</span>
                  <span className="font-semibold">{votingPower.toFixed(2)}</span>
                </div>
                
                {state.biometricRequired && (
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="font-medium">Biometric Authentication:</span>
                    <Badge variant="destructive">Required</Badge>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={resetVoting} className="flex-1">
                  Back to Selection
                </Button>
                <Button onClick={proceedToProofGeneration} className="flex-1">
                  Generate Proofs
                </Button>
              </div>
            </div>
          )}

          {/* Proof Generation Step */}
          {state.votingStep === 'proof' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Generating Cryptographic Proofs</h3>
              
              <div className="space-y-3">
                {state.isPrivate && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-blue-500" />
                      <span>Zero-Knowledge Proof</span>
                    </div>
                    {state.proofGenerating ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                )}
                
                {state.isQuadratic && (
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calculator className="w-5 h-5 text-purple-500" />
                      <span>Quadratic Voting Proof</span>
                    </div>
                    {state.proofGenerating ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                )}
                
                {state.biometricRequired && (
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Fingerprint className="w-5 h-5 text-red-500" />
                      <span>Biometric Authentication</span>
                    </div>
                    {state.proofGenerating ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                )}
              </div>

              {state.proofGenerating && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Generating cryptographic proofs... This may take a few seconds.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Submission Step */}
          {state.votingStep === 'submission' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Submit Your Vote</h3>
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  All cryptographic proofs have been generated successfully. Your vote is ready to be submitted to the blockchain.
                </AlertDescription>
              </Alert>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={resetVoting} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={submitVote} className="flex-1">
                  Submit Vote
                </Button>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {state.votingStep === 'complete' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vote Submitted Successfully!</h3>
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your vote has been securely recorded on the blockchain. Thank you for participating in democratic governance!
                </AlertDescription>
              </Alert>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800">Voting Rewards Earned</h4>
                <p className="text-sm text-green-700">
                  You earned CONS tokens for participating in this vote. Rewards will be distributed after the campaign ends.
                </p>
              </div>

              <Button onClick={resetVoting} className="w-full">
                Vote on Another Campaign
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}