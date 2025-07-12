import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCreateCampaign } from "@/hooks/useCampaigns";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { web3Service } from "@/lib/web3";
import { Globe, List, Scale, Plus, Trash2, Coins } from "lucide-react";

const campaignSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["public", "multiple", "weighted"]),
  category: z.string().min(1, "Category is required"),
  options: z.array(z.string()).min(2, "At least 2 options are required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

export function CreateCampaignForm() {
  const [options, setOptions] = useState<string[]>(["", ""]);
  const { isConnected, address } = useWallet();
  const { mutate: createCampaign, isPending } = useCreateCampaign();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      type: "public",
      category: "government",
      options: [],
    },
  });

  const campaignType = watch("type");

  const addOption = () => {
    const newOptions = [...options, ""];
    setOptions(newOptions);
    setValue("options", newOptions);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      setValue("options", newOptions);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    setValue("options", newOptions);
  };

  const onSubmit = async (data: CampaignFormData) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a campaign.",
        variant: "destructive",
      });
      return;
    }

    try {
      const endTime = Math.floor(new Date(data.endDate).getTime() / 1000);
      
      // Deploy campaign on blockchain
      const txHash = await web3Service.createCampaign(
        data.title,
        data.description,
        data.options.filter(opt => opt.trim() !== ""),
        endTime
      );

      // Create campaign in database
      createCampaign({
        title: data.title,
        description: data.description,
        type: data.type,
        category: data.category,
        options: data.options.filter(opt => opt.trim() !== ""),
        creatorAddress: address,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      });

      toast({
        title: "Campaign created successfully!",
        description: "Your campaign has been deployed to the blockchain.",
      });
    } catch (error: any) {
      console.error("Failed to create campaign:", error);
      toast({
        title: "Campaign creation failed",
        description: error.message || "Failed to create campaign",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Create Your Campaign</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Launch a new voting campaign with customizable options. All campaigns are deployed as smart contracts on the Polygon blockchain.
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Campaign Type */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Campaign Type</Label>
                <RadioGroup
                  value={campaignType}
                  onValueChange={(value) => setValue("type", value as any)}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public" className="flex items-center space-x-2 cursor-pointer">
                      <Globe className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Public</div>
                        <div className="text-sm text-gray-500">Open to everyone</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="multiple" id="multiple" />
                    <Label htmlFor="multiple" className="flex items-center space-x-2 cursor-pointer">
                      <List className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Multiple Choice</div>
                        <div className="text-sm text-gray-500">Select multiple options</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weighted" id="weighted" />
                    <Label htmlFor="weighted" className="flex items-center space-x-2 cursor-pointer">
                      <Scale className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Weighted</div>
                        <div className="text-sm text-gray-500">Rate by importance</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Campaign Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Campaign Title</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="Enter campaign title"
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => setValue("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="environment">Environment</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="community">Community</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  rows={4}
                  placeholder="Describe your campaign and what voters will be deciding on..."
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              {/* Voting Options */}
              <div className="space-y-3">
                <Label>Voting Options</Label>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeOption(index)}
                        disabled={options.length <= 2}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOption}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              </div>

              {/* Campaign Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    {...register("startDate")}
                    className={errors.startDate ? "border-red-500" : ""}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-red-500">{errors.startDate.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    {...register("endDate")}
                    className={errors.endDate ? "border-red-500" : ""}
                  />
                  {errors.endDate && (
                    <p className="text-sm text-red-500">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              {/* Campaign Fee */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Coins className="w-5 h-5 text-amber-600" />
                  <div>
                    <div className="font-medium text-amber-800">Campaign Launch Fee</div>
                    <div className="text-sm text-amber-600">
                      <span className="font-semibold">0.01 MATIC</span> (~$0.01) for gas fees
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  Save Draft
                </Button>
                <Button
                  type="submit"
                  disabled={!isConnected || isPending}
                >
                  {isPending ? "Deploying..." : "Deploy Campaign"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
