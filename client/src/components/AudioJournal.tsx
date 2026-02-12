import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { JournalEntryType } from "@/lib/mudras";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioJournal() {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: entries, isLoading } = useQuery<JournalEntryType[]>({
    queryKey: ["/api/journal"],
  });

  const saveEntry = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/journal", {
        title: title || "Untitled Entry",
        duration: formatDuration(duration),
        mood: null,
        audioUrl: null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      toast({ title: "Entry Saved", description: "Your journal entry has been recorded." });
      setTitle("");
      setDuration(0);
      setAudioBlob(null);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/journal/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
    },
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.current = recorder;
      recorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } catch {
      toast({ title: "Microphone Access", description: "Please allow microphone access to record.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, []);

  return (
    <div className="space-y-8">
      <Card className="p-8 flex flex-col items-center justify-center bg-gradient-to-b from-card to-background border-border/50">
        {audioBlob ? (
          <div className="w-full space-y-4">
            <audio src={audioUrl!} controls className="w-full" />
            <Input
              placeholder="Name this entry..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="input-journal-title"
            />
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={() => saveEntry.mutate()}
                disabled={saveEntry.isPending}
                data-testid="button-save-journal"
              >
                {saveEntry.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Entry
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setAudioBlob(null);
                  if (audioUrl) URL.revokeObjectURL(audioUrl);
                  setAudioUrl(null);
                  setDuration(0);
                }}
              >
                Discard
              </Button>
            </div>
          </div>
        ) : (
          <>
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
                onClick={isRecording ? stopRecording : startRecording}
                data-testid="button-record"
              >
                {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
              </Button>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm font-medium tracking-wider uppercase text-muted-foreground">
                {isRecording ? "Recording..." : "Tap to Record"}
              </p>
              {isRecording && (
                <p className="text-2xl font-mono text-foreground font-light">{formatDuration(duration)}</p>
              )}
            </div>
          </>
        )}
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-serif text-foreground">Recent Entries</h3>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : entries && entries.length > 0 ? (
          entries.map((entry) => (
            <div 
              key={entry.id} 
              className="flex items-center p-4 bg-card rounded-xl border border-border/50 hover:border-primary/20 transition-colors group"
              data-testid={`journal-entry-${entry.id}`}
            >
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <Play className="w-4 h-4 ml-0.5" />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-sm font-medium text-foreground">{entry.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="text-xs text-muted-foreground">{entry.duration}</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteEntry.mutate(entry.id)}
                data-testid={`button-delete-journal-${entry.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No entries yet. Record your first reflection.
          </div>
        )}
      </div>
    </div>
  );
}
