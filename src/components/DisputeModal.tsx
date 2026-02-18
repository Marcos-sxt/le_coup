import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle, XCircle, Loader2, Lock, Fingerprint } from "lucide-react";

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimedCard?: string;
  isDefender?: boolean;
}

const DisputeModal = ({
  isOpen,
  onClose,
  claimedCard = "Captain",
  isDefender = true,
}: DisputeModalProps) => {
  const [stage, setStage] = useState<"checking" | "verifying" | "success" | "fail">("checking");
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState<{ x: number; y: number; delay: number }[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setStage("checking");
      setProgress(0);
      return;
    }

    // Animated dots background
    setDots(
      Array.from({ length: 30 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: i * 0.1,
      }))
    );

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(progressInterval); return 100; }
        return p + Math.random() * 7;
      });
    }, 120);

    const t1 = setTimeout(() => setStage("verifying"), 2200);
    const t2 = setTimeout(() => setStage("success"), 3800);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen]);

  const steps = [
    { label: "Verifying player identity", done: progress > 20 },
    { label: "Checking hand integrity", done: progress > 45 },
    { label: "Confirming card ownership", done: progress > 70 },
    { label: "Recording outcome", done: stage === "success" || stage === "fail" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel-strong w-[460px] max-w-[90vw] p-6 neon-glow-cyan relative overflow-hidden"
          >
            {/* Animated dots */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {dots.map((dot, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-primary"
                  style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
                  animate={{ opacity: [0, 0.4, 0], scale: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, delay: dot.delay, repeat: Infinity }}
                />
              ))}
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full glass-panel-strong flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-mono text-base font-bold text-foreground">
                    Dispute Resolution
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isDefender ? "Verifying your" : "Checking opponent's"} claim:{" "}
                    <span className="text-neon-gold font-semibold">{claimedCard}</span>
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neon-green/20 bg-neon-green/5">
                  <Lock className="w-3 h-3 text-neon-green" />
                  <span className="font-mono text-[10px] text-neon-green">Secured</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground">
                      {stage === "checking" && "Checking records..."}
                      {stage === "verifying" && "Cross-referencing game state..."}
                      {stage === "success" && "Verification complete ✓"}
                      {stage === "fail" && "Verification failed ✗"}
                    </span>
                    <span className="text-primary">{Math.min(100, Math.round(progress))}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background:
                          stage === "fail"
                            ? "hsl(0, 100%, 55%)"
                            : "linear-gradient(90deg, hsl(185, 100%, 50%), hsl(300, 100%, 50%))",
                      }}
                      animate={{ width: `${Math.min(100, progress)}%` }}
                      transition={{ ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-3">
                  {steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs font-mono">
                      {step.done ? (
                        <CheckCircle className="w-4 h-4 text-neon-green shrink-0" />
                      ) : progress > i * 25 ? (
                        <Loader2 className="w-4 h-4 text-primary shrink-0 animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-muted-foreground/30 shrink-0" />
                      )}
                      <span className={step.done ? "text-foreground" : "text-muted-foreground"}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Passkey confirmation prompt */}
                {stage === "verifying" && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Fingerprint className="w-5 h-5 text-primary" />
                    </motion.div>
                    <p className="text-xs font-mono text-muted-foreground">
                      Confirming via your device passkey…
                    </p>
                  </motion.div>
                )}

                {/* Result */}
                <AnimatePresence>
                  {stage === "success" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg border border-neon-green/30 bg-neon-green/5"
                    >
                      <div className="flex items-center gap-2 text-neon-green font-mono text-sm font-bold">
                        <CheckCircle className="w-5 h-5" />
                        Verified — Action Succeeds!
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        Challenger loses 1 influence as penalty.
                      </p>
                    </motion.div>
                  )}
                  {stage === "fail" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg border border-destructive/30 bg-destructive/5"
                    >
                      <div className="flex items-center gap-2 text-destructive font-mono text-sm font-bold">
                        <XCircle className="w-5 h-5" />
                        Bluff Called — Action Blocked!
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        Defender loses 1 influence as penalty.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {(stage === "success" || stage === "fail") && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={onClose}
                    className="w-full mt-2 glass-panel py-2.5 font-mono text-sm text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                  >
                    Continue
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DisputeModal;
