import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, CheckCircle2, Loader2, Hand } from "lucide-react";
import type { MudraType } from "@/lib/mudras";

export default function MudraDetail() {
  const [, params] = useRoute("/mudra/:id");

  const { data: mudra, isLoading } = useQuery<MudraType>({
    queryKey: [`/api/mudras/${params?.id}`],
    enabled: !!params?.id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!mudra) {
    return (
      <Layout>
        <div className="p-8 text-center text-muted-foreground">Mudra not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-8">
        <Link href="/library" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors tracking-wide uppercase">
            <ArrowLeft className="w-3 h-3 mr-1.5" /> Library
        </Link>

        <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-muted/20 mb-6 border border-border/30">
          {mudra.image ? (
            <img 
              src={mudra.image} 
              alt={mudra.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Hand className="w-24 h-24 text-muted-foreground/15" />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-medium">
              {mudra.category}
            </span>
            <h1 className="text-3xl font-serif text-foreground tracking-tight">{mudra.name}</h1>
            {mudra.sanskritName && (
              <p className="text-sm text-muted-foreground tracking-wide">{mudra.sanskritName}</p>
            )}
          </div>

          <div className="flex items-center gap-6 py-3 border-y border-border/30">
            <div className="text-center">
              <span className="block text-lg font-serif text-foreground">5-15</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-[0.15em]">Minutes</span>
            </div>
            <div className="w-px h-6 bg-border/30" />
            <div className="text-center">
              <span className="block text-lg font-serif text-foreground">Easy</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-[0.15em]">Level</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">About</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {mudra.description}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Practice</h3>
            <div className="space-y-3">
              {mudra.instructions.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Benefits</h3>
            <div className="grid gap-2">
              {mudra.benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-card border border-border/30">
                  <CheckCircle2 className="w-4 h-4 text-primary/50 shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
