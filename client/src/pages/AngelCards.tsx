import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AngelCardDrawType } from "@/lib/mudras";

function daysRemaining(drawnAt: string): number {
  const drawn = new Date(drawnAt).getTime();
  const now = Date.now();
  const diff = 7 * 24 * 60 * 60 * 1000 - (now - drawn);
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function CardBack({ index, total, shuffling }: { index: number; total: number; shuffling: boolean }) {
  const offset = (total - 1 - index) * 2;
  return (
    <motion.div
      className="absolute rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-primary/5 shadow-sm"
      style={{
        width: "180px",
        height: "260px",
        top: -offset,
        left: -offset,
      }}
      animate={
        shuffling
          ? {
              x: [0, (index % 2 === 0 ? 1 : -1) * (20 + index * 8), 0],
              y: [0, -10 - index * 3, 0],
              rotate: [0, (index % 2 === 0 ? 1 : -1) * (5 + index * 2), 0],
            }
          : {}
      }
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: "easeInOut",
      }}
    >
      <div className="w-full h-full rounded-xl flex items-center justify-center p-4">
        <div className="w-full h-full rounded-lg border border-primary/20 flex items-center justify-center bg-primary/5">
          <div className="text-center">
            <Sparkles className="w-6 h-6 text-primary/40 mx-auto mb-2" />
            <div className="w-8 h-[1px] bg-primary/20 mx-auto" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DrawnCard({ draw }: { draw: AngelCardDrawType }) {
  const days = daysRemaining(draw.drawnAt);
  return (
    <motion.div
      initial={{ y: -40, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-[280px] mx-auto"
    >
      <div className="rounded-xl border-2 border-secondary/40 bg-gradient-to-b from-card via-card to-secondary/5 shadow-lg overflow-hidden">
        <div className="p-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-[1px] bg-secondary/30" />
            <Sparkles className="w-4 h-4 text-secondary/60" />
            <div className="w-6 h-[1px] bg-secondary/30" />
          </div>

          <h3 className="text-2xl font-serif text-foreground tracking-wide" data-testid="text-angel-card-name">
            {draw.card.name}
          </h3>

          <div className="w-12 h-[1px] bg-border/60 mx-auto" />

          <p className="font-serif text-sm text-foreground/80 leading-relaxed italic" data-testid="text-angel-card-message">
            "{draw.card.message}"
          </p>

          <div className="w-8 h-[1px] bg-border/40 mx-auto" />

          <p className="text-xs text-muted-foreground leading-relaxed" data-testid="text-angel-card-meaning">
            {draw.card.meaning}
          </p>

          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="w-6 h-[1px] bg-secondary/30" />
            <Sparkles className="w-3 h-3 text-secondary/40" />
            <div className="w-6 h-[1px] bg-secondary/30" />
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-muted-foreground mt-3 uppercase tracking-[0.2em]">
        Drawn {new Date(draw.drawnAt).toLocaleDateString()} · {days} {days === 1 ? "day" : "days"} remaining
      </p>
    </motion.div>
  );
}

export default function AngelCards() {
  const [shuffling, setShuffling] = useState(false);
  const [showDrawn, setShowDrawn] = useState(false);
  const [justDrawn, setJustDrawn] = useState(false);

  const { data: currentDraw, isLoading } = useQuery<AngelCardDrawType | null>({
    queryKey: ["/api/angel-cards/current"],
  });

  useEffect(() => {
    if (currentDraw) {
      setShowDrawn(true);
    }
  }, [currentDraw]);

  const drawCard = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/angel-cards/draw");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/angel-cards/current"] });
      setJustDrawn(true);
    },
  });

  const handleShuffle = () => {
    setShuffling(true);
    setTimeout(() => {
      setShuffling(false);
      setShowDrawn(false);
      drawCard.mutate();
    }, 1800);
  };

  const deckCards = 5;

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="pt-4 pb-2 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-[0.25em] font-medium mb-3">
            Divine Guidance
          </p>
          <h2 className="text-2xl font-serif text-foreground leading-tight tracking-tight">
            Angel Cards
          </h2>
          <p className="text-xs text-muted-foreground mt-2 max-w-[260px] mx-auto leading-relaxed">
            Quiet your mind, shuffle the deck, and draw a card. Let the message find you.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {showDrawn && currentDraw && (
            <motion.div
              key={currentDraw.id}
              initial={justDrawn ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: justDrawn ? 0.3 : 0 }}
              onAnimationComplete={() => setJustDrawn(false)}
            >
              <DrawnCard draw={currentDraw} />
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && !currentDraw && !shuffling && !drawCard.isPending && (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground italic">
              No card drawn yet. Shuffle the deck to receive your guidance.
            </p>
          </div>
        )}

        <div className="flex flex-col items-center gap-8">
          <div className="relative" style={{ width: "180px", height: "260px" }}>
            {Array.from({ length: deckCards }).map((_, i) => (
              <CardBack key={i} index={i} total={deckCards} shuffling={shuffling} />
            ))}
          </div>

          <Button
            onClick={handleShuffle}
            disabled={shuffling || drawCard.isPending}
            className="gap-2 px-6"
            variant={showDrawn && currentDraw ? "outline" : "default"}
            data-testid="button-shuffle-draw"
          >
            {shuffling ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                Shuffling...
              </>
            ) : showDrawn && currentDraw ? (
              <>
                <RotateCcw className="w-4 h-4" />
                Draw Again
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Shuffle & Draw
              </>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
