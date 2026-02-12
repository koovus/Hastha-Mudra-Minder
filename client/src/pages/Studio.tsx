import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function Studio() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [sanskritName, setSanskritName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [benefits, setBenefits] = useState<string[]>([""]);
  const [instructions, setInstructions] = useState<string[]>([""]);

  const addBenefit = () => setBenefits([...benefits, ""]);
  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setBenefits(newBenefits);
  };
  const removeBenefit = (index: number) => setBenefits(benefits.filter((_, i) => i !== index));

  const addInstruction = () => setInstructions([...instructions, ""]);
  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };
  const removeInstruction = (index: number) => setInstructions(instructions.filter((_, i) => i !== index));

  const createMudra = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/mudras", {
        name,
        sanskritName,
        category,
        description,
        benefits: benefits.filter(b => b.trim()),
        instructions: instructions.filter(i => i.trim()),
        image: null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mudras"] });
      toast({
        title: "Mudra Created",
        description: "Your new mudra has been saved to your library.",
      });
      navigate("/library");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sanskritName || !category || !description) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    createMudra.mutate();
  };

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-serif mb-2">Studio</h2>
          <p className="text-muted-foreground">Create and document new mudras.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center gap-4 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group">
            <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Upload Illustration</p>
              <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" placeholder="e.g. Lotus Mudra" value={name} onChange={(e) => setName(e.target.value)} data-testid="input-name" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sanskrit">Sanskrit Name *</Label>
              <Input id="sanskrit" placeholder="e.g. Padma Mudra" value={sanskritName} onChange={(e) => setSanskritName(e.target.value)} data-testid="input-sanskrit" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="calming">Calming</SelectItem>
                  <SelectItem value="energizing">Energizing</SelectItem>
                  <SelectItem value="healing">Healing</SelectItem>
                  <SelectItem value="spiritual">Spiritual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea 
                id="description" 
                placeholder="Describe the significance..." 
                className="min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                data-testid="input-description"
              />
            </div>

            <div className="space-y-3">
              <Label>Benefits</Label>
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    value={benefit} 
                    onChange={(e) => updateBenefit(index, e.target.value)}
                    placeholder="e.g. Opens the heart chakra"
                    data-testid={`input-benefit-${index}`}
                  />
                  {benefits.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeBenefit(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addBenefit} className="text-xs" data-testid="button-add-benefit">
                <Plus className="w-3 h-3 mr-1" /> Add Benefit
              </Button>
            </div>

            <div className="space-y-3">
              <Label>Instructions</Label>
              {instructions.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    value={step} 
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                    data-testid={`input-instruction-${index}`}
                  />
                  {instructions.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeInstruction(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addInstruction} className="text-xs" data-testid="button-add-instruction">
                <Plus className="w-3 h-3 mr-1" /> Add Step
              </Button>
            </div>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={createMudra.isPending}
            data-testid="button-create-mudra"
          >
            {createMudra.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Create Mudra
          </Button>
        </form>
      </div>
    </Layout>
  );
}
