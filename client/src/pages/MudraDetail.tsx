import Layout from "@/components/Layout";
import { mudras } from "@/lib/mudras";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function MudraDetail() {
  const [, params] = useRoute("/mudra/:id");
  const mudra = mudras.find(m => m.id === params?.id);

  if (!mudra) return <div className="p-8">Mudra not found</div>;

  return (
    <Layout>
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-8">
        <Link href="/library">
          <a className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Library
          </a>
        </Link>

        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-muted mb-8 shadow-sm">
          <img 
            src={mudra.image} 
            alt={mudra.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20 border-none uppercase tracking-widest text-[10px]">
              {mudra.category}
            </Badge>
            <h1 className="text-4xl font-serif text-foreground">{mudra.name}</h1>
            <p className="text-lg text-muted-foreground italic font-medium">{mudra.sanskritName}</p>
          </div>

          <div className="flex items-center justify-center gap-6 py-4 border-y border-border/50">
            <div className="text-center">
              <span className="block text-2xl font-serif">5-15</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Minutes</span>
            </div>
            <div className="w-px h-8 bg-border/50" />
            <div className="text-center">
              <span className="block text-2xl font-serif">Easy</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Level</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-serif">Significance</h3>
            <p className="text-muted-foreground leading-relaxed">
              {mudra.description}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-serif">How to Practice</h3>
            <div className="space-y-4">
              {mudra.instructions.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-foreground/80 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-serif">Benefits</h3>
            <div className="grid gap-3">
              {mudra.benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <CheckCircle2 className="w-5 h-5 text-primary/60" />
                  <span className="text-sm font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <Button size="lg" className="w-full mt-8 rounded-xl h-14 text-lg font-serif">
            Start Practice Timer <Clock className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
