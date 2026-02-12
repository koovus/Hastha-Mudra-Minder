import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus, X } from "lucide-react";
import { useState } from "react";

export default function Studio() {
  const { toast } = useToast();
  const [benefits, setBenefits] = useState<string[]>([""]);

  const addBenefit = () => setBenefits([...benefits, ""]);
  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setBenefits(newBenefits);
  };
  const removeBenefit = (index: number) => {
    const newBenefits = benefits.filter((_, i) => i !== index);
    setBenefits(newBenefits);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Mudra Created",
      description: "Your new mudra has been saved to your personal library.",
    });
    // In a real app, this would submit to backend
  };

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-serif mb-2">Studio</h2>
          <p className="text-muted-foreground">Create and document new mudras.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload Placeholder */}
          <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center gap-4 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group">
            <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Upload Illustration</p>
              <p className="text-xs text-muted-foreground mt-1">SVG, PNG or JPG</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="e.g. Lotus Mudra" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sanskrit">Sanskrit Name</Label>
              <Input id="sanskrit" placeholder="e.g. Padma Mudra" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger>
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
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe the significance..." 
                className="min-h-[100px]"
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
                  />
                  {benefits.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeBenefit(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addBenefit} className="text-xs">
                <Plus className="w-3 h-3 mr-1" /> Add Benefit
              </Button>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Create Mudra
          </Button>
        </form>
      </div>
    </Layout>
  );
}
