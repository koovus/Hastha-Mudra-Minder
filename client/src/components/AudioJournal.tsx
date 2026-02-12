import { useState } from "react";
import { Mic, Square, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { journals } from "@/lib/mudras";

export default function AudioJournal() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [entries, setEntries] = useState(journals);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, this would handle MediaRecorder API
  };

  return (
    <div className="space-y-8">
      {/* Recorder Interface */}
      <Card className="p-8 flex flex-col items-center justify-center bg-gradient-to-b from-card to-background border-border/50">
        <div className="relative mb-8">
          {isRecording && (
            <div className="absolute inset-0 bg-destructive/20 rounded-full animate-ping" />
          )}
          <Button
            size="lg"
            className={`w-20 h-20 rounded-full shadow-lg transition-all duration-500 ${
              isRecording 
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" 
                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
            }`}
            onClick={toggleRecording}
          >
            {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
          </Button>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-sm font-medium tracking-wider uppercase text-muted-foreground">
            {isRecording ? "Recording..." : "Tap to Record"}
          </p>
          {isRecording && (
            <p className="text-2xl font-mono text-foreground font-light">00:04</p>
          )}
        </div>
        
        {/* Mock Audio Visualizer */}
        <div className="h-12 flex items-center justify-center gap-1 mt-6 w-full max-w-xs">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-primary/30 rounded-full transition-all duration-100 ease-in-out"
              style={{
                height: isRecording ? `${Math.random() * 100}%` : "10%",
                opacity: isRecording ? 1 : 0.3
              }}
            />
          ))}
        </div>
      </Card>

      {/* Entries List */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif text-foreground">Recent Entries</h3>
        {entries.map((entry) => (
          <div 
            key={entry.id} 
            className="flex items-center p-4 bg-card rounded-xl border border-border/50 hover:border-primary/20 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
              <Play className="w-4 h-4 ml-0.5" />
            </div>
            <div className="ml-4 flex-1">
              <h4 className="text-sm font-medium text-foreground">{entry.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{entry.date}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="text-xs text-muted-foreground">{entry.duration}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
