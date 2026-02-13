import Layout from "@/components/Layout";
import AudioJournal from "@/components/AudioJournal";

export default function Journal() {
  return (
    <Layout>
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div>
          <h2 className="text-3xl font-serif mb-1 tracking-tight">Journal</h2>
          <p className="text-xs text-muted-foreground tracking-[0.15em] uppercase">Speak, then release</p>
        </div>
        
        <AudioJournal />
      </div>
    </Layout>
  );
}
