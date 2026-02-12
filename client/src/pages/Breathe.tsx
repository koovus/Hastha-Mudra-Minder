import Layout from "@/components/Layout";
import BreathPacer from "@/components/BreathPacer";

export default function Breathe() {
  return (
    <Layout>
      <div className="h-full flex flex-col animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif mb-2">Breathe</h2>
          <p className="text-muted-foreground">Align your energy with the universe.</p>
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <BreathPacer />
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-card border border-border/50">
            <span className="block text-2xl font-serif text-primary">4s</span>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Inhale</span>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border/50">
            <span className="block text-2xl font-serif text-secondary">4s</span>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Hold</span>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border/50">
            <span className="block text-2xl font-serif text-primary">4s</span>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Exhale</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
