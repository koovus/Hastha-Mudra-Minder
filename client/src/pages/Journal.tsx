import Layout from "@/components/Layout";
import AudioJournal from "@/components/AudioJournal";

export default function Journal() {
  return (
    <Layout>
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div>
          <h2 className="text-3xl font-serif mb-2">Journal</h2>
          <p className="text-muted-foreground">Document your inner journey.</p>
        </div>
        
        <AudioJournal />
      </div>
    </Layout>
  );
}
