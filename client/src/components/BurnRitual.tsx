import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BurnRitualProps {
  isVisible: boolean;
  entryTitle: string;
  onComplete: () => void;
}

function Ember({ delay, x }: { delay: number; x: number }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full"
      style={{ 
        background: `hsl(${20 + Math.random() * 20}, 90%, ${50 + Math.random() * 20}%)`,
        left: `${x}%`,
        bottom: "40%",
      }}
      initial={{ opacity: 0, y: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [0, -80 - Math.random() * 120, -160 - Math.random() * 80],
        x: [0, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 100],
        scale: [0, 1.5, 0],
      }}
      transition={{
        duration: 2 + Math.random() * 1.5,
        delay: delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 0.5,
        ease: "easeOut",
      }}
    />
  );
}

function AshParticle({ delay }: { delay: number }) {
  return (
    <motion.div
      className="absolute w-1.5 h-0.5 bg-gray-400/60 rounded-full"
      style={{
        left: `${30 + Math.random() * 40}%`,
        bottom: "20%",
      }}
      initial={{ opacity: 0, y: 0 }}
      animate={{
        opacity: [0, 0.6, 0.4, 0],
        y: [-20, -60 - Math.random() * 100],
        x: [0, (Math.random() - 0.5) * 120],
        rotate: [0, Math.random() * 360],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay: delay + 2,
        ease: "easeOut",
      }}
    />
  );
}

export default function BurnRitual({ isVisible, entryTitle, onComplete }: BurnRitualProps) {
  const [phase, setPhase] = useState<"igniting" | "burning" | "ashes" | "wind">("igniting");

  useEffect(() => {
    if (!isVisible) {
      setPhase("igniting");
      return;
    }

    const timers = [
      setTimeout(() => setPhase("burning"), 800),
      setTimeout(() => setPhase("ashes"), 3500),
      setTimeout(() => setPhase("wind"), 5500),
      setTimeout(() => onComplete(), 7000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="relative w-72 h-80 flex flex-col items-center justify-center">
          {/* Embers */}
          {phase !== "wind" && [...Array(20)].map((_, i) => (
            <Ember key={`ember-${i}`} delay={i * 0.15} x={30 + Math.random() * 40} />
          ))}

          {/* Ash particles in wind phase */}
          {(phase === "ashes" || phase === "wind") && [...Array(15)].map((_, i) => (
            <AshParticle key={`ash-${i}`} delay={i * 0.2} />
          ))}

          {/* The "paper" being burned */}
          <motion.div
            className="relative bg-card/90 backdrop-blur rounded-xl p-6 w-56 border border-border/30 overflow-hidden"
            animate={
              phase === "igniting" ? { scale: 1, opacity: 1 } :
              phase === "burning" ? { 
                scale: [1, 0.98, 1.01, 0.95],
                opacity: 1,
              } :
              phase === "ashes" ? { 
                scale: 0.6,
                opacity: 0.3,
                filter: "brightness(0.3) sepia(1)",
              } :
              { scale: 0, opacity: 0, y: -100, rotate: 15 }
            }
            transition={{ 
              duration: phase === "wind" ? 1.5 : 1,
              ease: "easeInOut",
            }}
          >
            {/* Fire glow overlay */}
            {(phase === "burning" || phase === "igniting") && (
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: "radial-gradient(ellipse at bottom, rgba(255,100,20,0.4) 0%, rgba(255,50,0,0.2) 40%, transparent 70%)",
                }}
                animate={{
                  opacity: phase === "burning" ? [0.3, 0.8, 0.5, 0.9] : [0, 0.3],
                }}
                transition={{
                  duration: phase === "burning" ? 0.6 : 0.8,
                  repeat: phase === "burning" ? Infinity : 0,
                  ease: "easeInOut",
                }}
              />
            )}

            {/* Burn edge effect */}
            {phase === "burning" && (
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: "linear-gradient(to top, rgba(30,10,0,0.9) 0%, rgba(80,30,0,0.6) 30%, transparent 60%)",
                }}
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 2.5, ease: "easeIn" }}
              />
            )}

            <div className="text-center relative z-10">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Releasing</p>
              <p className="font-serif text-lg text-foreground/80">{entryTitle}</p>
            </div>
          </motion.div>
        </div>

        {/* Phase text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            className="mt-8 text-sm font-serif tracking-widest uppercase"
            style={{ color: phase === "wind" ? "hsl(40, 20%, 70%)" : "hsl(25, 80%, 60%)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            {phase === "igniting" && "Igniting..."}
            {phase === "burning" && "Releasing to flame..."}
            {phase === "ashes" && "Returning to ash..."}
            {phase === "wind" && "Carried by the wind..."}
          </motion.p>
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
