import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, Check, X } from "lucide-react";

import ambassadorImg from "@/assets/cards/chameleon.png";
import assassinImg from "@/assets/cards/spider.png";
import captainImg from "@/assets/cards/crow.png";
import contessaImg from "@/assets/cards/snake.png";
import dukeImg from "@/assets/cards/lion.png";
import { useState, useEffect } from "react";

interface ActionResponseModalProps {
    isOpen: boolean;
    actionType: string;
    sourcePlayer: string;
    onAllow: () => void;
    onChallenge: () => void;
    onBlock: (card: string) => void;
}

const BLOCK_MAPPING: Record<string, { id: string; name: string; image: string }[]> = {
    FOREIGN_AID: [{ id: "LION", name: "Lion (Duke)", image: dukeImg }],
    STEAL: [
        { id: "CROW", name: "Crow (Captain)", image: captainImg },
        { id: "CHAMELEON", name: "Chameleon (Ambassador)", image: ambassadorImg }
    ],
    REVEAL: [{ id: "SNAKE", name: "Snake (Contessa)", image: contessaImg }],
};

const ActionResponseModal = ({
    isOpen,
    actionType,
    sourcePlayer,
    onAllow,
    onChallenge,
    onBlock,
}: ActionResponseModalProps) => {
    const [showBlockOptions, setShowBlockOptions] = useState(false);

    // When modal closes or opens, reset block options state
    if (!isOpen && showBlockOptions) {
        setShowBlockOptions(false);
    }

    const blockableCards = BLOCK_MAPPING[actionType];

    const [timeLeft, setTimeLeft] = useState(6000); // 6 seconds in ms

    useEffect(() => {
        if (!isOpen) {
            setTimeLeft(6000);
            return;
        }

        if (showBlockOptions) return; // Stop timer if inspecting block cards

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 100) {
                    clearInterval(interval);
                    onAllow(); // Auto-allow when time runs out
                    return 0;
                }
                return prev - 100;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [isOpen, showBlockOptions, onAllow]);

    const handleBlockClick = () => {
        if (blockableCards.length === 1) {
            onBlock(blockableCards[0].id);
        } else {
            setShowBlockOptions(true);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 10 }}
                        className="w-full max-w-md"
                    >
                        <div className="glass-panel p-6 overflow-hidden relative">
                            {/* Animated progress bar */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-border/30">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-red-500"
                                    initial={{ width: '100%' }}
                                    animate={{ width: `${(timeLeft / 6000) * 100}%` }}
                                    transition={{ ease: "linear", duration: 0.1 }}
                                />
                            </div>

                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 text-destructive mb-3 border border-destructive/20">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <h2 className="font-display text-lg uppercase tracking-widest font-bold text-foreground">
                                    Action Pending
                                </h2>
                                <p className="text-muted-foreground mt-2 text-sm">
                                    <span className="font-bold text-primary">{sourcePlayer}</span> is attempting to use{" "}
                                    <span className="font-bold text-secondary">{actionType.replace('_', ' ')}</span>.
                                </p>
                            </div>

                            {!showBlockOptions ? (
                                <div className="grid gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={onAllow}
                                        className="flex items-center justify-between p-3 rounded border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Check className="w-4 h-4" />
                                            <span className="font-display text-xs uppercase tracking-wider font-bold">Pass</span>
                                        </div>
                                        <span className="text-xs opacity-70">Let action proceed ({Math.ceil(timeLeft / 1000)}s)</span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={onChallenge}
                                        className="flex items-center justify-between p-3 rounded border border-destructive/30 bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span className="font-display text-xs uppercase tracking-wider font-bold">Challenge</span>
                                        </div>
                                        <span className="text-xs opacity-70">Call out a bluff (ZK)</span>
                                    </motion.button>

                                    {blockableCards && (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleBlockClick}
                                            className="flex items-center justify-between p-3 rounded border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4" />
                                                <span className="font-display text-xs uppercase tracking-wider font-bold">Block</span>
                                            </div>
                                            <span className="text-xs opacity-70">Claim counter-card</span>
                                        </motion.button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                    <h3 className="text-sm font-display text-center uppercase tracking-widest text-muted-foreground">
                                        Block using:
                                    </h3>
                                    <div className="flex justify-center gap-4">
                                        {blockableCards.map((card) => (
                                            <motion.div
                                                key={card.id}
                                                whileHover={{ y: -5 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => onBlock(card.id)}
                                                className="w-24 h-36 rounded border border-blue-500/30 overflow-hidden relative cursor-pointer hover:border-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                                            >
                                                <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1 text-center">
                                                    <span className="font-display text-[9px] uppercase tracking-wider font-semibold text-white">
                                                        {card.id}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setShowBlockOptions(false)}
                                        className="w-full mt-4 p-2 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors"
                                    >
                                        <X className="w-3 h-3" /> Back
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ActionResponseModal;
