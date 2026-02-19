import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dices } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

function D30Shape({ rolling }: { rolling: boolean }) {
  return (
    <motion.div
      className="relative w-40 h-40 mx-auto"
      animate={
        rolling
          ? {
              rotateX: [0, 360, 720, 1080],
              rotateY: [0, -180, -360, -540],
              rotateZ: [0, 90, 180, 270],
              scale: [1, 0.85, 1.1, 0.9, 1],
            }
          : {}
      }
      transition={{ duration: 1.6, ease: "easeInOut" }}
      style={{ perspective: 800 }}
    >
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg">
        <defs>
          <linearGradient id="diceFace" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="diceSide" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.12" />
          </linearGradient>
        </defs>
        <polygon
          points="100,15 175,55 175,145 100,185 25,145 25,55"
          fill="url(#diceFace)"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />
        <line x1="100" y1="15" x2="100" y2="185" stroke="hsl(var(--primary))" strokeWidth="0.5" strokeOpacity="0.15" />
        <line x1="25" y1="55" x2="175" y2="145" stroke="hsl(var(--primary))" strokeWidth="0.5" strokeOpacity="0.15" />
        <line x1="175" y1="55" x2="25" y2="145" stroke="hsl(var(--primary))" strokeWidth="0.5" strokeOpacity="0.15" />
        <polygon
          points="100,15 175,55 100,100 25,55"
          fill="url(#diceSide)"
          stroke="hsl(var(--primary))"
          strokeWidth="0.5"
          strokeOpacity="0.2"
        />
        <text
          x="100"
          y="108"
          textAnchor="middle"
          className="fill-primary/30 font-serif"
          fontSize="14"
          letterSpacing="2"
        >
          D30
        </text>
      </svg>
    </motion.div>
  );
}

function NumberSpread({ result, rollKey }: { result: number; rollKey: number }) {
  const numbers = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="relative h-16 overflow-hidden mx-auto w-full max-w-[360px]">
      <div className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: "linear-gradient(to right, hsl(var(--background)) 0%, transparent 15%, transparent 85%, hsl(var(--background)) 100%)"
        }}
      />
      <motion.div
        className="flex items-center justify-center h-full gap-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {numbers.map((n) => {
          const distance = Math.abs(n - result);
          const maxDistance = 8;
          const normalizedDistance = Math.min(distance, maxDistance) / maxDistance;
          const opacity = Math.max(0.04, 1 - normalizedDistance * 1.1);
          const scale = Math.max(0.5, 1 - normalizedDistance * 0.5);
          const offsetX = (n - result) * 28;
          const isResult = n === result;

          return (
            <motion.span
              key={`${rollKey}-${n}`}
              className={`absolute font-serif tabular-nums select-none ${
                isResult ? "text-foreground font-bold" : "text-foreground/80"
              }`}
              style={{
                fontSize: isResult ? "36px" : `${Math.max(12, 24 - distance * 3)}px`,
              }}
              initial={{
                opacity: 0,
                x: offsetX + (n < result ? -40 : n > result ? 40 : 0),
                scale: 0.3,
              }}
              animate={{
                opacity,
                x: offsetX,
                scale,
              }}
              transition={{
                duration: 0.7,
                delay: isResult ? 0 : 0.05 + distance * 0.04,
                ease: "easeOut",
              }}
            >
              {n}
            </motion.span>
          );
        })}
      </motion.div>
    </div>
  );
}

export default function DicePage() {
  const [result, setResult] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [rollKey, setRollKey] = useState(0);
  const [history, setHistory] = useState<number[]>([]);

  const handleRoll = useCallback(() => {
    if (rolling) return;
    setRolling(true);
    setResult(null);

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 30) + 1;
      setResult(roll);
      setRollKey((k) => k + 1);
      setHistory((h) => [roll, ...h.slice(0, 9)]);
      setRolling(false);
    }, 1600);
  }, [rolling]);

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="pt-4 pb-2 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-[0.25em] font-medium mb-3">
            Sacred Chance
          </p>
          <h2 className="text-2xl font-serif text-foreground leading-tight tracking-tight">
            D30
          </h2>
          <p className="text-xs text-muted-foreground mt-2 max-w-[260px] mx-auto leading-relaxed">
            Let go of intention. Roll the die and receive your number.
          </p>
        </div>

        <div className="min-h-[80px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {result && !rolling && (
              <NumberSpread result={result} rollKey={rollKey} />
            )}
          </AnimatePresence>
          {!result && !rolling && (
            <p className="text-xs text-muted-foreground italic">
              Roll the die to receive your number.
            </p>
          )}
          {rolling && (
            <motion.div
              className="flex items-center gap-2 text-muted-foreground"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <span className="text-xs uppercase tracking-[0.2em]">Rolling...</span>
            </motion.div>
          )}
        </div>

        <D30Shape rolling={rolling} />

        <div className="flex justify-center">
          <Button
            onClick={handleRoll}
            disabled={rolling}
            className="gap-2 px-8"
            data-testid="button-roll-dice"
          >
            <Dices className="w-4 h-4" />
            {rolling ? "Rolling..." : result ? "Roll Again" : "Roll the Die"}
          </Button>
        </div>

        {history.length > 1 && (
          <div className="text-center space-y-2">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
              Recent Rolls
            </h3>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {history.slice(1).map((n, i) => (
                <motion.span
                  key={`h-${i}-${n}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: Math.max(0.2, 1 - i * 0.1), scale: 1 }}
                  className="text-sm font-serif text-muted-foreground tabular-nums"
                >
                  {n}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
