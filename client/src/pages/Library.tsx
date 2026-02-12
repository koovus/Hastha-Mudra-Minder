import Layout from "@/components/Layout";
import MudraCard from "@/components/MudraCard";
import { mudras } from "@/lib/mudras";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export default function Library() {
  const [search, setSearch] = useState("");

  const filteredMudras = mudras.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.sanskritName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-serif mb-2">Library</h2>
          <p className="text-muted-foreground">Explore the ancient gestures.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search mudras..." 
            className="pl-10 bg-white border-border/50 focus-visible:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid gap-6">
          {filteredMudras.map((mudra) => (
            <MudraCard key={mudra.id} mudra={mudra} />
          ))}
          
          {filteredMudras.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No mudras found matching "{search}"</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
