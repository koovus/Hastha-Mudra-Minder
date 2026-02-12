import Layout from "@/components/Layout";
import MudraCard from "@/components/MudraCard";
import { mudras } from "@/lib/mudras";

export default function Library() {
  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-serif mb-2">Library</h2>
          <p className="text-muted-foreground">Explore the ancient gestures.</p>
        </div>

        <div className="grid gap-6">
          {mudras.map((mudra) => (
            <MudraCard key={mudra.id} mudra={mudra} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
