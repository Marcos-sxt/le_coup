import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Target } from "lucide-react";

import ambassadorImg from "@/assets/cards/chameleon.png";
import assassinImg from "@/assets/cards/spider.png";
import captainImg from "@/assets/cards/crow.png";
import contessaImg from "@/assets/cards/snake.png";
import dukeImg from "@/assets/cards/lion.png";
import type { CardType } from "./GameCard";

interface CoupDeGraceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (guess1: CardType, guess2: CardType) => void;
}

const ALL_CARDS: { id: CardType; image: string; name: string }[] = [
    { id: "LION", image: dukeImg, name: "Lion" },
    { id: "SPIDER", image: assassinImg, name: "Spider" },
    { id: "CROW", image: captainImg, name: "Crow" },
    { id: "SNAKE", image: contessaImg, name: "Snake" },
    { id: "CHAMELEON", image: ambassadorImg, name: "Chameleon" },
];

const CoupDeGraceModal = ({ isOpen, onClose, onSubmit }: CoupDeGraceModalProps) => {
    const [selectedCards, setSelectedCards] = useState<CardType[]>([]);

    const toggleSelect = (card: CardType) => {
        if (selectedCards.includes(card)) {
            setSelectedCards(selectedCards.filter(c => c !== card));
        } else if (selectedCards.length < 2) {
            setSelectedCards([...selectedCards, card]);
        }
    };

    const handleExecute = () => {
        if (selectedCards.length === 2) {
            onSubmit(selectedCards[0], selectedCards[1]);
            onClose();
            // Reset after closing
            setTimeout(() => setSelectedCards([]), 300);
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
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="p-1 rounded-lg bg-gradient-to-br from-purple-500/30 to-background max-w-2xl w-full"
                    >
                        <div className="glass-panel w-full p-8 relative overflow-hidden bg-background/95">
                            {/* Background accent */}
                            <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col items-center text-center relative z-10 mb-8">
                                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                                    <Target className="w-8 h-8 text-purple-400" />
                                </div>
                                <h2 className="font-display text-2xl uppercase tracking-[0.2em] font-bold text-foreground mb-2 drop-shadow-md">
                                    Coup de Grace
                                </h2>
                                <p className="text-muted-foreground font-body text-sm max-w-md">
                                    Guess the opponent's exact two hidden cards. If you are correct, you win instantly. If you are wrong, you lose one of your influences forever.
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-4 mb-8">
                                {ALL_CARDS.map((card) => {
                                    const isSelected = selectedCards.includes(card.id);
                                    const isDisabled = !isSelected && selectedCards.length >= 2;

                                    return (
                                        <motion.div
                                            key={card.id}
                                            whileHover={isDisabled ? {} : { y: -5 }}
                                            whileTap={isDisabled ? {} : { scale: 0.95 }}
                                            onClick={() => !isDisabled && toggleSelect(card.id)}
                                            className={`
                        w-24 h-36 rounded border overflow-hidden relative cursor-pointer
                        transition-all duration-300
                        ${isSelected ? "border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)] transform scale-105" : "border-border/50"}
                        ${isDisabled ? "opacity-30 cursor-not-allowed grayscale" : ""}
                      `}
                                        >
                                            <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1 text-center">
                                                <span className="font-display text-[9px] uppercase tracking-wider font-semibold text-white">
                                                    {card.id}
                                                </span>
                                            </div>
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-purple-500/20 pointer-events-none flex items-center justify-center">
                                                    <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                                                        ✓
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <div className="flex justify-center">
                                <motion.button
                                    whileHover={selectedCards.length === 2 ? { scale: 1.05 } : {}}
                                    whileTap={selectedCards.length === 2 ? { scale: 0.95 } : {}}
                                    onClick={handleExecute}
                                    disabled={selectedCards.length !== 2}
                                    className={`
                    px-8 py-3 rounded font-display uppercase tracking-widest text-sm font-bold
                    transition-all duration-300
                    ${selectedCards.length === 2
                                            ? "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)] cursor-pointer"
                                            : "bg-muted text-muted-foreground border border-border cursor-not-allowed"}
                  `}
                                >
                                    {selectedCards.length === 2 ? "Execute Verdict" : `Select ${2 - selectedCards.length} more`}
                                </motion.button>
                            </div>

                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CoupDeGraceModal;
