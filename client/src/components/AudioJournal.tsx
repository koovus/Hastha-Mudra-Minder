import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Play, Pause, RotateCcw, Trash2, Loader2, Flame, Clock, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import BurnRitual from "@/components/BurnRitual";
import type { JournalEntryType } from "@/lib/mudras";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function BurnCountdown({ burnAt }: { burnAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const target = new Date(burnAt).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("Burning...");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [burnAt]);

  return (
    <span className="text-xs text-orange-500/80 flex items-center gap-1">
      <Flame className="w-3 h-3" /> {timeLeft}
    </span>
  );
}

function EntryPlayer({ entry }: { entry: JournalEntryType }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  const hasAudio = !!entry.audioUrl;

  useEffect(() => {
    if (!hasAudio) return;
    const audio = new Audio(entry.audioUrl!);
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      setAudioDuration(audio.duration);
    });
    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [entry.audioUrl, hasAudio]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const restart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current || audioDuration === 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newTime = ratio * audioDuration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  if (!hasAudio) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground shrink-0">
          <Mic className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs text-muted-foreground italic">No audio</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <Button
        variant="ghost"
        size="icon"
        className="w-8 h-8 shrink-0 text-primary hover:text-primary/80"
        onClick={togglePlay}
        data-testid={`button-play-${entry.id}`}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="w-8 h-8 shrink-0 text-muted-foreground hover:text-foreground"
        onClick={restart}
        data-testid={`button-restart-${entry.id}`}
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </Button>
      <div
        ref={progressRef}
        className="flex-1 h-1.5 bg-border/60 rounded-full cursor-pointer relative overflow-hidden"
        onClick={handleProgressClick}
        data-testid={`progress-bar-${entry.id}`}
      >
        <div
          className="absolute inset-y-0 left-0 bg-primary/70 rounded-full transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground tabular-nums shrink-0 w-10 text-right">
        {isPlaying || currentTime > 0 ? formatDuration(currentTime) : formatDuration(audioDuration || 0)}
      </span>
    </div>
  );
}

export default function AudioJournal() {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [burningEntry, setBurningEntry] = useState<JournalEntryType | null>(null);
  const [showBurnRitual, setShowBurnRitual] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: entries, isLoading } = useQuery<JournalEntryType[]>({
    queryKey: ["/api/journal"],
  });

  const activeEntries = entries?.filter(e => !e.burnedAt) ?? [];

  const saveEntry = useMutation({
    mutationFn: async () => {
      let audioDataUrl: string | null = null;
      if (audioBlob) {
        audioDataUrl = await blobToBase64(audioBlob);
      }
      const res = await apiRequest("POST", "/api/journal", {
        title: title || "Untitled Entry",
        duration: formatDuration(duration),
        mood: null,
        audioUrl: audioDataUrl,
        burnAt: null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      toast({ title: "Recorded", description: "Your reflection has been saved." });
      setTitle("");
      setDuration(0);
      setAudioBlob(null);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    },
  });

  const burnNow = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/journal/${id}/burn`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
    },
  });

  const setBurnTimer = useMutation({
    mutationFn: async ({ id, burnAt }: { id: string; burnAt: string }) => {
      await apiRequest("POST", `/api/journal/${id}/burn-timer`, { burnAt });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      toast({ title: "Timer Set", description: "This entry will be released when the moment arrives." });
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

  const handleBurnNow = (entry: JournalEntryType) => {
    setBurningEntry(entry);
    setShowBurnRitual(true);
  };

  const handleBurnComplete = useCallback(() => {
    if (burningEntry) {
      burnNow.mutate(burningEntry.id);
      setBurningEntry(null);
      setShowBurnRitual(false);
      toast({
        title: "Released",
        description: "Your words have returned to emptiness.",
      });
    }
  }, [burningEntry, burnNow, toast]);

  const handleSetBurnTimer = (id: string, hours: number) => {
    const burnAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    setBurnTimer.mutate({ id, burnAt });
  };

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
      <BurnRitual
        isVisible={showBurnRitual}
        entryTitle={burningEntry?.title || ""}
        onComplete={handleBurnComplete}
      />

      <Card className="p-8 flex flex-col items-center justify-center bg-card border-border/40 shadow-none">
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
                <div className="absolute inset-0 bg-destructive/20 rounded-full animate-ping pointer-events-none" />
              )}
              <Button
                size="lg"
                className={`relative z-10 w-20 h-20 rounded-full shadow-lg transition-all duration-500 ${
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
        <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Recent Entries</h3>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : activeEntries.length > 0 ? (
          activeEntries.map((entry) => (
            <div 
              key={entry.id} 
              className="p-3.5 bg-card rounded-lg border border-border/40 hover:border-primary/20 transition-colors group"
              data-testid={`journal-entry-${entry.id}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium text-foreground truncate">{entry.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="text-xs text-muted-foreground">{entry.duration}</span>
                    {entry.burnAt && !entry.burnedAt && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <BurnCountdown burnAt={entry.burnAt} />
                      </>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-orange-500/70 hover:text-orange-500 hover:bg-orange-500/10 shrink-0"
                      data-testid={`button-burn-menu-${entry.id}`}
                    >
                      <Flame className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground uppercase tracking-wider">
                      Release this entry
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-orange-600 focus:text-orange-700 focus:bg-orange-50 cursor-pointer"
                      onClick={() => handleBurnNow(entry)}
                      data-testid={`button-burn-now-${entry.id}`}
                    >
                      <Flame className="w-4 h-4 mr-2" />
                      Burn Now
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground uppercase tracking-wider">
                      Set a burn timer
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => handleSetBurnTimer(entry.id, 1)}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      In 1 hour
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => handleSetBurnTimer(entry.id, 24)}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      In 1 day
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => handleSetBurnTimer(entry.id, 24 * 7)}
                    >
                      <Wind className="w-4 h-4 mr-2" />
                      In 1 week
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive cursor-pointer"
                      onClick={() => deleteEntry.mutate(entry.id)}
                      data-testid={`button-delete-journal-${entry.id}`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete permanently
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <EntryPlayer entry={entry} />
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
