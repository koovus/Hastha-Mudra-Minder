import Layout from "@/components/Layout";
import MudraCard from "@/components/MudraCard";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { MudraType } from "@/lib/mudras";

export default function Library() {
  const { data: mudras, isLoading } = useQuery<MudraType[]>({
    queryKey: ["/api/mudras"],
  });

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-serif mb-1 tracking-tight">Library</h2>
          <p className="text-xs text-muted-foreground tracking-[0.15em] uppercase">The forms of the hand</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-6">
            {mudras?.map((mudra) => (
              <MudraCard key={mudra.id} mudra={mudra} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
