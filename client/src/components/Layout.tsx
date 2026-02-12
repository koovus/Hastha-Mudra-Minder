import { Link, useLocation } from "wouter";
import { Home, Hand, Mic, Wind, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/library", icon: Hand, label: "Library" },
    { href: "/studio", icon: PlusCircle, label: "Studio" },
    { href: "/breathe", icon: Wind, label: "Breathe" },
    { href: "/journal", icon: Mic, label: "Journal" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-center relative">
          <h1 className="text-2xl font-serif font-medium text-primary tracking-wide">Prana</h1>
        </div>
      </header>

      <main className="flex-1 pt-20 pb-24 px-4 max-w-md mx-auto w-full">
        {children}
      </main>

      <nav className="fixed bottom-0 w-full bg-background/90 backdrop-blur-xl border-t border-border z-50 pb-safe">
        <div className="max-w-md mx-auto flex justify-between items-center px-6 h-16">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-colors duration-300 w-12",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}>
                  <item.icon className={cn("w-6 h-6", isActive && "fill-current/20")} strokeWidth={isActive ? 2 : 1.5} />
                  <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
