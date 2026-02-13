import Layout from "@/components/Layout";
import BreathPacer, { BREATH_PATTERNS, type BreathPattern } from "@/components/BreathPacer";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Breathe() {
  const [selectedPattern, setSelectedPattern] = useState<BreathPattern>(BREATH_PATTERNS[0]);

  return (
    <Layout>
      <div className="flex flex-col animate-in fade-in zoom-in duration-700 pb-8">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-serif mb-2">Breathe</h2>
          <p className="text-muted-foreground text-sm">Align your energy with the universe.</p>
        </div>

        <BreathPacer pattern={selectedPattern} />

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          {selectedPattern.phases.map((phase, i) => (
            <div key={i} className="p-3 rounded-xl bg-card border border-border/50">
              <span className="block text-2xl font-serif text-primary">{phase.duration}s</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{phase.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-2">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-medium px-1">Techniques</h3>
          <div className="space-y-2">
            {BREATH_PATTERNS.map((pattern) => {
              const isSelected = pattern.id === selectedPattern.id;
              const label = pattern.phases.map((p) => p.duration).join("-");
              return (
                <button
                  key={pattern.id}
                  onClick={() => setSelectedPattern(pattern)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all duration-300",
                    isSelected
                      ? "bg-primary/5 border-primary/30 shadow-sm"
                      : "bg-card border-border/50 hover:border-primary/20 hover:bg-primary/[0.02]"
                  )}
                  data-testid={`button-pattern-${pattern.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-medium text-sm",
                          isSelected ? "text-primary" : "text-foreground"
                        )}>
                          {pattern.name}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                          {label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{pattern.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 ml-3" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
