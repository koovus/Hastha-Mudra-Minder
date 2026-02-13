import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw } from "lucide-react";

export interface BreathPattern {
  id: string;
  name: string;
  description: string;
  phases: { label: string; duration: number }[];
}

export const BREATH_PATTERNS: BreathPattern[] = [
  {
    id: "box",
    name: "Box Breathing",
    description: "Equal rhythm. Grounding & focus.",
    phases: [
      { label: "Inhale", duration: 4 },
      { label: "Hold", duration: 4 },
      { label: "Exhale", duration: 4 },
      { label: "Hold", duration: 4 },
    ],
  },
  {
    id: "relaxing",
    name: "4-7-8 Breath",
    description: "Deep calm. Eases into sleep.",
    phases: [
      { label: "Inhale", duration: 4 },
      { label: "Hold", duration: 7 },
      { label: "Exhale", duration: 8 },
    ],
  },
  {
    id: "coherent",
    name: "Coherent Breathing",
    description: "Slow, steady. Heart-brain harmony.",
    phases: [
      { label: "Inhale", duration: 6 },
      { label: "Exhale", duration: 6 },
    ],
  },
  {
    id: "pranayama",
    name: "Pranayama",
    description: "Ancient yogic ratio. Deep meditation.",
    phases: [
      { label: "Inhale", duration: 4 },
      { label: "Hold", duration: 16 },
      { label: "Exhale", duration: 8 },
    ],
  },
  {
    id: "extended",
    name: "Extended Exhale",
    description: "Long exhale activates rest response.",
    phases: [
      { label: "Inhale", duration: 4 },
      { label: "Hold", duration: 2 },
      { label: "Exhale", duration: 8 },
    ],
  },
  {
    id: "deep-calm",
    name: "Deep Calm",
    description: "Very slow breath. Advanced practice.",
    phases: [
      { label: "Inhale", duration: 8 },
      { label: "Hold", duration: 4 },
      { label: "Exhale", duration: 8 },
      { label: "Hold", duration: 4 },
    ],
  },
];

interface BreathPacerProps {
  pattern: BreathPattern;
}

export default function BreathPacer({ pattern }: BreathPacerProps) {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(pattern.phases[0].duration);
  const cancelledRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  const currentPhase = pattern.phases[phaseIndex];
  const totalCycleDuration = pattern.phases.reduce((s, p) => s + p.duration, 0);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
  }, []);

  useEffect(() => {
    cancelledRef.current = false;

    if (!isActive) {
      clearTimers();
      return;
    }

    const runPhase = (idx: number) => {
      if (cancelledRef.current) return;

      const phase = pattern.phases[idx];
      setPhaseIndex(idx);
      setSecondsLeft(phase.duration);

      let remaining = phase.duration;
      tickRef.current = setInterval(() => {
        remaining--;
        if (remaining >= 0) {
          setSecondsLeft(remaining);
        }
      }, 1000);

      timeoutRef.current = setTimeout(() => {
        if (cancelledRef.current) return;
        clearInterval(tickRef.current!);

        const nextIdx = idx + 1;
        if (nextIdx >= pattern.phases.length) {
          setCycleCount((c) => c + 1);
          runPhase(0);
        } else {
          runPhase(nextIdx);
        }
      }, phase.duration * 1000);
    };

    runPhase(0);

    return () => {
      cancelledRef.current = true;
      clearTimers();
    };
  }, [isActive, pattern, clearTimers]);

  useEffect(() => {
    setIsActive(false);
    setPhaseIndex(0);
    setCycleCount(0);
    setSecondsLeft(pattern.phases[0].duration);
    cancelledRef.current = true;
    clearTimers();
  }, [pattern, clearTimers]);

  const isInhale = currentPhase.label === "Inhale";
  const isHold = currentPhase.label === "Hold";
  const isExhale = currentPhase.label === "Exhale";

  const getScale = () => {
    if (!isActive) return 1;
    if (isInhale) return 1.5;
    if (isHold && phaseIndex <= 1) return 1.5;
    if (isExhale) return 1;
    if (isHold && phaseIndex > 1) return 1;
    return 1;
  };

  const getOpacity = () => {
    if (!isActive) return 0.6;
    if (isInhale) return 0.8;
    if (isHold) return 1;
    if (isExhale) return 0.6;
    return 0.6;
  };

  const patternLabel = pattern.phases.map((p) => `${p.duration}s`).join("-");

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative w-64 h-64 flex items-center justify-center mb-10">
        <motion.div
          className="absolute inset-0 rounded-full border border-primary/20"
          animate={
            isActive
              ? {
                  scale: [1, 1.6, 1],
                  opacity: [0.3, 0.1, 0.3],
                }
              : { scale: 1, opacity: 0.3 }
          }
          transition={{
            duration: totalCycleDuration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 backdrop-blur-xl flex items-center justify-center z-10"
          animate={{
            scale: getScale(),
            opacity: getOpacity(),
          }}
          transition={{ duration: currentPhase.duration, ease: "easeInOut" }}
        >
          <div className="w-full h-full rounded-full bg-white/20 blur-md absolute inset-0" />
        </motion.div>

        <div className="absolute z-20 pointer-events-none flex flex-col items-center gap-1">
          <AnimatePresence mode="wait">
            <motion.span
              key={isActive ? currentPhase.label + phaseIndex : "ready"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xl font-serif font-medium text-foreground tracking-widest uppercase"
            >
              {isActive ? currentPhase.label : "Ready"}
            </motion.span>
          </AnimatePresence>
          {isActive && (
            <motion.span
              key={secondsLeft}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              className="text-sm font-mono text-foreground/60"
            >
              {secondsLeft}
            </motion.span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <Button
          size="lg"
          variant="outline"
          className="rounded-full w-16 h-16 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all duration-300"
          onClick={() => setIsActive(!isActive)}
          data-testid="button-breath-toggle"
        >
          {isActive ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </Button>

        <Button
          size="icon"
          variant="ghost"
          className="rounded-full text-muted-foreground hover:text-foreground"
          onClick={() => {
            setIsActive(false);
            setCycleCount(0);
            setPhaseIndex(0);
            setSecondsLeft(pattern.phases[0].duration);
            cancelledRef.current = true;
            clearTimers();
          }}
          data-testid="button-breath-reset"
        >
          <RefreshCw className="w-5 h-5" />
        </Button>
      </div>

      <p className="mt-6 text-sm text-muted-foreground font-medium tracking-wide">
        {cycleCount > 0
          ? `${cycleCount} Cycle${cycleCount > 1 ? "s" : ""} Completed`
          : patternLabel}
      </p>
    </div>
  );
}
