import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw } from "lucide-react";

export default function BreathPacer() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      const cycle = async () => {
        // Inhale: 4s
        setPhase("inhale");
        await new Promise(r => setTimeout(r, 4000));
        if (!isActive) return;
        
        // Hold: 4s
        setPhase("hold");
        await new Promise(r => setTimeout(r, 4000));
        if (!isActive) return;
        
        // Exhale: 4s
        setPhase("exhale");
        await new Promise(r => setTimeout(r, 4000));
        if (!isActive) return;

        setCycleCount(c => c + 1);
        cycle();
      };
      cycle();
    } else {
      setPhase("inhale");
    }
    return () => clearTimeout(interval);
  }, [isActive]);

  const variants = {
    inhale: { scale: 1.5, opacity: 0.8 },
    hold: { scale: 1.5, opacity: 1 },
    exhale: { scale: 1, opacity: 0.6 },
  };

  const textVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-64 h-64 flex items-center justify-center mb-12">
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-primary/20"
          animate={isActive ? {
            scale: [1, 1.6, 1],
            opacity: [0.3, 0.1, 0.3],
          } : { scale: 1, opacity: 0.3 }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Main breathing circle */}
        <motion.div
          className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 backdrop-blur-xl flex items-center justify-center z-10"
          animate={isActive ? phase : "exhale"}
          variants={variants}
          transition={{ duration: 4, ease: "easeInOut" }}
        >
          <div className="w-full h-full rounded-full bg-white/20 blur-md absolute inset-0" />
        </motion.div>

        {/* Text overlay */}
        <div className="absolute z-20 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              variants={textVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-2xl font-serif font-medium text-foreground tracking-widest uppercase"
            >
              {isActive ? phase : "Ready"}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <Button
          size="lg"
          variant="outline"
          className="rounded-full w-16 h-16 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all duration-300"
          onClick={() => setIsActive(!isActive)}
        >
          {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </Button>
        
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full text-muted-foreground hover:text-foreground"
          onClick={() => {
            setIsActive(false);
            setCycleCount(0);
            setPhase("inhale");
          }}
        >
          <RefreshCw className="w-5 h-5" />
        </Button>
      </div>
      
      <p className="mt-8 text-sm text-muted-foreground font-medium tracking-wide">
        {cycleCount > 0 ? `${cycleCount} Cycles Completed` : "4-4-4 Box Breathing"}
      </p>
    </div>
  );
}
