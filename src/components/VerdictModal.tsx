import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Swords, Target } from "lucide-react";

interface VerdictModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "CHALLENGE" | "COUP_DE_GRACE";
    claimedCards: string[]; // Supports one or two cards
    challengerName?: string;
    defenderName?: string;
    challengerInitials?: string;
    defenderInitials?: string;
    isSuccess: boolean; // Managed by the game engine/store
}

const VerdictModal = ({
    isOpen,
    onClose,
    type = "CHALLENGE",
    claimedCards = ["CROW"],
    challengerName = "cipher_fox",
    defenderName = "neon_rook",
    challengerInitials = "CF",
    defenderInitials = "NR",
    isSuccess,
}: VerdictModalProps) => {
    const [stage, setStage] = useState<"idle" | "challenger" | "defender" | "clash" | "verifying" | "resolved">("idle");
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => { setStage("idle"); setProgress(0); }, 400);
            return;
        }

        // Animation Sequence
        setStage("challenger");
        const t1 = setTimeout(() => setStage("defender"), 600);
        const t2 = setTimeout(() => setStage("clash"), 1200);
        const t3 = setTimeout(() => setStage("verifying"), 1800);
        const t4 = setTimeout(() => setStage("resolved"), 4000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
        };
    }, [isOpen]);

    useEffect(() => {
        if (stage !== "verifying") return;
        setProgress(0);
        const interval = setInterval(() => {
            setProgress((p) => {
                if (p >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return p + 2;
            });
        }, 30);
        return () => clearInterval(interval);
    }, [stage]);

    const circumference = 2 * Math.PI * 44;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    const showPlayers = stage !== "idle";

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 z-[110] flex items-center justify-center bg-background/95 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 20, stiffness: 260 }}
                        className={`glass-panel-strong w-[520px] max-w-[95vw] p-8 relative overflow-hidden ${stage === "resolved"
                                ? (isSuccess ? "border-primary/50 shadow-[0_0_50px_rgba(16,185,129,0.2)]" : "border-destructive/50 shadow-[0_0_50px_rgba(239,68,68,0.2)]")
                                : ""
                            }`}
                    >
                        <div className="absolute inset-0 pointer-events-none">
                            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] transition-colors duration-1000 ${stage === "resolved"
                                    ? (isSuccess ? "bg-primary/10" : "bg-destructive/10")
                                    : "bg-primary/4"
                                }`} />
                        </div>

                        <div className="relative z-10 flex flex-col items-center gap-6">
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    {type === "CHALLENGE" ? <Swords className="w-3 h-3 text-secondary" /> : <Target className="w-3 h-3 text-purple-400" />}
                                    <p className="font-display text-[9px] text-muted-foreground tracking-[0.3em] uppercase">
                                        {type === "CHALLENGE" ? "Challenge Verification" : "Coup De Grace Verdict"}
                                    </p>
                                </div>
                                <h2 className="font-display text-xl font-bold text-foreground tracking-wider">
                                    {type === "CHALLENGE"
                                        ? `Did they hold the ${claimedCards[0]}?`
                                        : `Analyzing: ${claimedCards.join(" & ")}`
                                    }
                                </h2>
                            </motion.div>

                            {/* Arena Display */}
                            <div className="flex items-center justify-center gap-6 w-full">
                                <AnimatePresence>
                                    {showPlayers && (
                                        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-full glass-panel-strong flex items-center justify-center border border-secondary/30 relative shadow-[0_0_15px_rgba(167,139,250,0.2)]">
                                                <span className="font-display text-sm font-bold text-secondary">{challengerInitials}</span>
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center">
                                                    <span className="text-[10px]">⚔</span>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-display text-xs font-semibold text-foreground">{challengerName}</p>
                                                <p className="font-display text-[8px] text-secondary tracking-[0.2em] font-bold">ATTACKER</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex flex-col items-center gap-2 w-32 shrink-0">
                                    <AnimatePresence mode="wait">
                                        {(stage === "challenger" || stage === "defender") && (
                                            <motion.div key="vs" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.5 }} className="font-display text-2xl font-black text-muted-foreground/20">VS</motion.div>
                                        )}
                                        {stage === "clash" && (
                                            <motion.div key="clash" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1.2, rotate: 0 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: "spring" }}>
                                                <Swords className="w-12 h-12 text-accent" />
                                            </motion.div>
                                        )}
                                        {stage === "verifying" && (
                                            <motion.div key="ring" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative flex items-center justify-center">
                                                <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
                                                    <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="4" className="text-border/30" />
                                                    <motion.circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="text-primary" />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="font-display text-xs font-bold">{Math.round(progress)}%</span>
                                                </div>
                                            </motion.div>
                                        )}
                                        {stage === "resolved" && (
                                            <motion.div key="resolved" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 12 }}>
                                                {isSuccess ?
                                                    <CheckCircle className="w-16 h-16 text-primary drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> :
                                                    <XCircle className="w-16 h-16 text-destructive drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                                }
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <AnimatePresence>
                                    {(stage === "defender" || stage === "clash" || stage === "verifying" || stage === "resolved") && (
                                        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-full gradient-emerald flex items-center justify-center border border-primary/30 relative shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                                <span className="font-display text-sm font-bold text-primary-foreground">{defenderInitials}</span>
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                                                    <span className="text-[10px]">🛡</span>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-display text-xs font-semibold text-foreground">{defenderName}</p>
                                                <p className="font-display text-[8px] text-primary tracking-[0.2em] font-bold">DEFENDER</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <AnimatePresence mode="wait">
                                {stage === "verifying" && (
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-body text-[10px] text-muted-foreground uppercase tracking-[0.2em] text-center italic">
                                        {type === "CHALLENGE" ? "Verifying Cryptographic Wards..." : "Analyzing Influence Resonance..."}
                                    </motion.p>
                                )}
                                {stage === "resolved" && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                                        <div className={`p-4 rounded border text-center transition-colors ${isSuccess ? "border-primary/30 bg-primary/5" : "border-destructive/30 bg-destructive/5"
                                            }`}>
                                            <p className={`font-display text-sm font-bold tracking-widest uppercase mb-1 ${isSuccess ? "text-primary" : "text-destructive"
                                                }`}>
                                                {isSuccess
                                                    ? (type === "CHALLENGE" ? "Liar Exposed!" : "Verdict Absolute!")
                                                    : (type === "CHALLENGE" ? "Truth Verified!" : "Verdict Denied!")
                                                }
                                            </p>
                                            <p className="font-body text-[11px] text-muted-foreground italic">
                                                {isSuccess
                                                    ? `${defenderName} loses 1 influence card.`
                                                    : `${challengerName} loses 1 influence card.`
                                                }
                                            </p>
                                        </div>

                                        <button
                                            onClick={onClose}
                                            className="w-full mt-6 py-3 rounded glass-panel hover:bg-white/5 transition-all font-display text-xs uppercase tracking-[0.2em] font-bold text-foreground"
                                        >
                                            Confirm Verdict
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Aesthetic Borders */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/20" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/20" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/20" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/20" />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VerdictModal;
