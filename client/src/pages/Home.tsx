import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import MudraCard from "@/components/MudraCard";
import { Loader2 } from "lucide-react";
import type { MudraType } from "@/lib/mudras";

export default function Home() {
  const { data: mudra, isLoading } = useQuery<MudraType>({
    queryKey: ["/api/mudras/random"],
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="pt-4 pb-2 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-[0.25em] font-medium mb-3">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h2 className="text-3xl font-serif text-foreground leading-tight tracking-tight">
            The way is in<br/>
            <span className="text-primary">harmony with breath.</span>
          </h2>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-serif uppercase tracking-[0.15em] text-muted-foreground">Today's Practice</h3>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : mudra ? (
            <MudraCard mudra={mudra} />
          ) : null}
        </section>

        <section className="grid grid-cols-2 gap-3">
          <Link href="/angel-cards" className="group bg-card hover:bg-primary/5 transition-all duration-300 p-5 rounded-lg flex flex-col items-center text-center gap-3 border border-border/50 hover:border-primary/20" data-testid="link-angel-cards">
              <div className="w-10 h-10 rounded-full bg-primary/8 text-primary flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                </svg>
              </div>
              <div>
                <span className="block text-sm font-medium text-foreground">Cards</span>
                <span className="text-[10px] text-muted-foreground tracking-wide">Guidance</span>
              </div>
          </Link>

          <Link href="/dice" className="group bg-card hover:bg-primary/5 transition-all duration-300 p-5 rounded-lg flex flex-col items-center text-center gap-3 border border-border/50 hover:border-primary/20" data-testid="link-dice">
              <div className="w-10 h-10 rounded-full bg-primary/8 text-primary flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="3" />
                  <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                  <circle cx="16" cy="8" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="8" cy="16" r="1.5" fill="currentColor" />
                  <circle cx="16" cy="16" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <div>
                <span className="block text-sm font-medium text-foreground">D30</span>
                <span className="text-[10px] text-muted-foreground tracking-wide">Sacred Chance</span>
              </div>
          </Link>

          <Link href="/breathe" className="group bg-card hover:bg-primary/5 transition-all duration-300 p-5 rounded-lg flex flex-col items-center text-center gap-3 border border-border/50 hover:border-primary/20" data-testid="link-breathe">
              <div className="w-10 h-10 rounded-full bg-primary/8 text-primary flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
              </div>
              <div>
                <span className="block text-sm font-medium text-foreground">Kokyu</span>
                <span className="text-[10px] text-muted-foreground tracking-wide">Breath Work</span>
              </div>
          </Link>
          
          <Link href="/journal" className="group bg-card hover:bg-secondary/5 transition-all duration-300 p-5 rounded-lg flex flex-col items-center text-center gap-3 border border-border/50 hover:border-secondary/20" data-testid="link-journal">
              <div className="w-10 h-10 rounded-full bg-secondary/8 text-secondary flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <div>
                <span className="block text-sm font-medium text-foreground">Journal</span>
                <span className="text-[10px] text-muted-foreground tracking-wide">Reflect</span>
              </div>
          </Link>
        </section>

        <div className="bg-card/60 p-6 rounded-lg border border-border/30 text-center">
          <p className="font-serif text-base text-foreground/80 leading-relaxed tracking-wide">
            "True victory is victory over oneself."
          </p>
          <p className="text-[10px] text-muted-foreground mt-3 uppercase tracking-[0.2em] font-medium">— Morihei Ueshiba, Founder of Aikido</p>
        </div>
      </div>
    </Layout>
  );
}
