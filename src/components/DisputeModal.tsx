import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Swords } from "lucide-react";

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimedCard?: string;
  challengerName?: string;
  defenderName?: string;
  challengerInitials?: string;
  defenderInitials?: string;
}

const DisputeModal = ({
  isOpen,
  onClose,
  claimedCard = "Captain",
  challengerName = "neon_rook",
  defenderName = "cipher_fox",
  challengerInitials = "NR",
  defenderInitials = "CF",
}: DisputeModalProps) => {
  const [stage, setStage] = useState<"idle" | "challenger" | "defender" | "clash" | "verifying" | "success" | "fail">("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => { setStage("idle"); setProgress(0); }, 400);
      return;
    }
    setStage("challenger");
    const t1 = setTimeout(() => setStage("defender"), 700);
    const t2 = setTimeout(() => setStage("clash"), 1400);
    const t3 = setTimeout(() => setStage("verifying"), 2000);
    const t4 = setTimeout(() => setStage("success"), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [isOpen]);

  useEffect(() => {
    if (stage !== "verifying") return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => { if (p >= 100) { clearInterval(interval); return 100; } return p + 1.5; });
    }, 30);
    return () => clearInterval(interval);
  }, [stage]);

  const circumference = 2 * Math.PI * 44;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const isResolved = stage === "success" || stage === "fail";
  const isVerifying = stage === "verifying";
  const showPlayers = stage !== "idle";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md"
          onClick={isResolved ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel-strong w-[480px] max-w-[92vw] p-8 relative overflow-hidden"
            style={{ boxShadow: "0 0 50px -10px hsl(var(--primary) / 0.25), 0 0 100px -20px hsl(var(--secondary) / 0.15)" }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/4 rounded-full blur-[60px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6">
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center">
                <p className="font-display text-[9px] text-muted-foreground tracking-[0.25em] uppercase mb-1">
                  Challenge Initiated
                </p>
                <h2 className="font-display text-lg font-bold text-foreground tracking-wider">
                  Did they hold the{" "}
                  <span className="text-accent">{claimedCard}</span>?
                </h2>
              </motion.div>

              {/* 1v1 Arena */}
              <div className="flex items-center justify-center gap-4 w-full">
                <AnimatePresence>
                  {showPlayers && (
                    <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", damping: 18, stiffness: 200 }} className="flex flex-col items-center gap-2">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full glass-panel-strong flex items-center justify-center border border-secondary/30" style={{ boxShadow: "0 0 15px hsl(var(--secondary) / 0.2)" }}>
                          <span className="font-display text-sm font-bold text-secondary">{challengerInitials}</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center">
                          <span className="text-[8px]">⚔</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-display text-xs font-semibold text-foreground tracking-wider">{challengerName}</p>
                        <p className="font-display text-[8px] text-secondary tracking-[0.2em]">CHALLENGER</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col items-center gap-1 w-24 shrink-0">
                  <AnimatePresence mode="wait">
                    {(stage === "challenger" || stage === "defender") && (
                      <motion.div key="vs" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.3 }} className="font-display text-xl font-black text-muted-foreground/30">VS</motion.div>
                    )}
                    {stage === "clash" && (
                      <motion.div key="clash" initial={{ scale: 0.3, opacity: 0, rotate: -30 }} animate={{ scale: 1.2, opacity: 1, rotate: 0 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ type: "spring", damping: 10, stiffness: 300 }}>
                        <Swords className="w-10 h-10 text-accent" />
                      </motion.div>
                    )}
                    {isVerifying && !isResolved && (
                      <motion.div key="ring" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} className="relative flex items-center justify-center">
                        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
                          <circle cx="48" cy="48" r="44" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
                          <motion.circle cx="48" cy="48" r="44" fill="none" stroke="url(#ring-gradient-gothic)" strokeWidth="4" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: "stroke-dashoffset 0.03s linear" }} />
                          <defs>
                            <linearGradient id="ring-gradient-gothic" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="hsl(var(--primary))" />
                              <stop offset="100%" stopColor="hsl(var(--secondary))" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-display text-sm font-bold text-foreground">{Math.round(progress)}%</span>
                        </div>
                      </motion.div>
                    )}
                    {stage === "success" && (
                      <motion.div key="success" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 12, stiffness: 250 }}>
                        <CheckCircle className="w-12 h-12 text-primary" />
                      </motion.div>
                    )}
                    {stage === "fail" && (
                      <motion.div key="fail" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 12, stiffness: 250 }}>
                        <XCircle className="w-12 h-12 text-destructive" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {(stage === "defender" || stage === "clash" || stage === "verifying" || isResolved) && (
                    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", damping: 18, stiffness: 200 }} className="flex flex-col items-center gap-2">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full gradient-emerald flex items-center justify-center border border-primary/30" style={{ boxShadow: "0 0 15px hsl(var(--primary) / 0.25)" }}>
                          <span className="font-display text-sm font-bold text-primary-foreground">{defenderInitials}</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                          <span className="text-[8px]">🛡</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-display text-xs font-semibold text-foreground tracking-wider">{defenderName}</p>
                        <p className="font-display text-[8px] text-primary tracking-[0.2em]">DEFENDER</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence mode="wait">
                {isVerifying && !isResolved && (
                  <motion.p key="checking" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="font-body text-xs text-muted-foreground text-center italic">
                    Consulting the wards…
                  </motion.p>
                )}
                {stage === "success" && (
                  <motion.div key="result-success" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full p-4 rounded border border-primary/30 bg-primary/5 text-center">
                    <p className="font-display text-sm font-bold text-primary tracking-wider">Hand Verified — Action Succeeds!</p>
                    <p className="font-body text-[11px] text-muted-foreground mt-1 italic">{challengerName} loses 1 influence as penalty.</p>
                  </motion.div>
                )}
                {stage === "fail" && (
                  <motion.div key="result-fail" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full p-4 rounded border border-destructive/30 bg-destructive/5 text-center">
                    <p className="font-display text-sm font-bold text-destructive tracking-wider">Bluff Exposed — Action Blocked!</p>
                    <p className="font-body text-[11px] text-muted-foreground mt-1 italic">{defenderName} loses 1 influence as penalty.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isResolved && (
                  <motion.button initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} onClick={onClose} className="w-full glass-panel py-2.5 font-display text-sm text-primary hover:bg-primary/10 transition-colors cursor-pointer rounded tracking-wider">
                    Continue
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DisputeModal;
