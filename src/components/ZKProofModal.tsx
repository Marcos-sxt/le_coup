import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface ZKProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimedCard?: string;
  isDefender?: boolean;
}

const ZKProofModal = ({ isOpen, onClose, claimedCard = "Captain", isDefender = true }: ZKProofModalProps) => {
  const [stage, setStage] = useState<"generating" | "verifying" | "success" | "fail">("generating");
  const [progress, setProgress] = useState(0);
  const [matrixChars, setMatrixChars] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setStage("generating");
      setProgress(0);
      return;
    }

    // Matrix characters
    const chars = "01アイウエオカキクケコ∅∆Ω≈";
    const interval = setInterval(() => {
      setMatrixChars(
        Array.from({ length: 60 }, () => chars[Math.floor(Math.random() * chars.length)])
      );
    }, 80);

    // Simulate proof generation
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return p + Math.random() * 8;
      });
    }, 150);

    const timer1 = setTimeout(() => setStage("verifying"), 2500);
    const timer2 = setTimeout(() => setStage("success"), 4000);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isOpen]);

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
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel-strong w-[480px] max-w-[90vw] p-6 neon-glow-cyan relative overflow-hidden"
          >
            {/* Matrix rain background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
              <div className="grid grid-cols-12 gap-1 text-[8px] font-mono text-primary leading-none">
                {matrixChars.map((char, i) => (
                  <span key={i} style={{ opacity: Math.random() * 0.8 + 0.2 }}>
                    {char}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="font-mono text-lg font-bold text-foreground">
                    ZK Dispute Resolution
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isDefender ? "Proving" : "Verifying"} claim: <span className="text-neon-gold">{claimedCard}</span>
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground">
                      {stage === "generating" && "Generating Groth16 proof..."}
                      {stage === "verifying" && "Submitting to Soroban..."}
                      {stage === "success" && "Proof verified on-chain ✓"}
                      {stage === "fail" && "Proof rejected ✗"}
                    </span>
                    <span className="text-primary">{Math.min(100, Math.round(progress))}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: stage === "fail"
                          ? "hsl(0, 100%, 55%)"
                          : "linear-gradient(90deg, hsl(185, 100%, 50%), hsl(300, 100%, 50%))",
                      }}
                      animate={{ width: `${Math.min(100, progress)}%` }}
                      transition={{ ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Status steps */}
                <div className="space-y-3">
                  {[
                    { label: "Load witness (cards, salt)", done: progress > 20 },
                    { label: "Compute R1CS constraints", done: progress > 45 },
                    { label: "Generate Groth16 proof", done: progress > 70 },
                    { label: "On-chain verification", done: stage === "success" || stage === "fail" },
                  ].map((step, i) => (
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

                {/* Result */}
                <AnimatePresence>
                  {stage === "success" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 rounded-lg border border-neon-green/30 bg-neon-green/5"
                    >
                      <div className="flex items-center gap-2 text-neon-green font-mono text-sm font-bold">
                        <CheckCircle className="w-5 h-5" />
                        Proof Valid — Action Succeeds!
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
                      className="mt-4 p-4 rounded-lg border border-neon-red/30 bg-neon-red/5"
                    >
                      <div className="flex items-center gap-2 text-neon-red font-mono text-sm font-bold">
                        <XCircle className="w-5 h-5" />
                        Liar Detected — Action Blocked!
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

export default ZKProofModal;
