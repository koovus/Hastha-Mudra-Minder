import { Link, useLocation } from "wouter";
import { Home, Hand, Mic, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/library", icon: Hand, label: "Library" },
    { href: "/breathe", icon: Wind, label: "Kokyu" },
    { href: "/journal", icon: Mic, label: "Journal" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      <header className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-md mx-auto px-6 h-14 flex items-center justify-center relative">
          <h1 className="text-xl font-serif font-medium text-primary tracking-[0.15em] uppercase">Hastha</h1>
        </div>
      </header>

      <main className="flex-1 pt-18 pb-24 px-4 max-w-md mx-auto w-full">
        {children}
      </main>

      <nav className="fixed bottom-0 w-full bg-background/95 backdrop-blur-xl border-t border-border/40 z-50 pb-safe">
        <div className="max-w-md mx-auto flex justify-between items-center px-8 h-14">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn(
                  "flex flex-col items-center justify-center gap-0.5 transition-colors duration-300 w-12",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}>
                  <item.icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                  <span className="text-[9px] font-medium tracking-wider uppercase">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
