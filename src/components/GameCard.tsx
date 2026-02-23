import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Sword, Shield, Coins, RefreshCw, Ban, Eye } from "lucide-react";

import ambassadorImg from "@/assets/cards/chameleon.png";
import assassinImg from "@/assets/cards/spider.png";
import captainImg from "@/assets/cards/crow.png";
import contessaImg from "@/assets/cards/snake.png";
import dukeImg from "@/assets/cards/lion.png";

export type CardType = "LION" | "SPIDER" | "CROW" | "CHAMELEON" | "SNAKE";

interface GameCardProps {
  card: CardType;
  faceDown?: boolean;
  eliminated?: boolean;
  revealed?: boolean;
  size?: "sm" | "md" | "lg";
  clickable?: boolean;
  onClick?: () => void;
  isTargetable?: boolean;
}

const cardConfig: Record<CardType, {
  image: string;
  ability: string;
  description: string;
  icon: JSX.Element;
  color: string;
}> = {
  LION: {
    image: dukeImg,
    ability: "Tax",
    description: "Collect 3 coins from the treasury. This action cannot be blocked.",
    icon: <Coins className="w-5 h-5" />,
    color: "hsl(80 35% 42%)",
  },
  SPIDER: {
    image: assassinImg,
    ability: "Assassinate",
    description: "Pay 3 coins to eliminate an opponent's influence. Can be blocked by the SNAKE.",
    icon: <Sword className="w-5 h-5" />,
    color: "hsl(0 65% 42%)",
  },
  CROW: {
    image: captainImg,
    ability: "Steal",
    description: "Steal 2 coins from any player. Can be blocked by the CHAMELEON or another CROW.",
    icon: <Coins className="w-5 h-5" />,
    color: "hsl(145 45% 32%)",
  },
  CHAMELEON: {
    image: ambassadorImg,
    ability: "Exchange",
    description: "Exchange one or both of your cards with the deck. Can also block CROW's stealing.",
    icon: <RefreshCw className="w-5 h-5" />,
    color: "hsl(140 50% 40%)",
  },
  SNAKE: {
    image: contessaImg,
    ability: "Block Assassination",
    description: "Has no own action, but can block any assassination attempt against you.",
    icon: <Shield className="w-5 h-5" />,
    color: "hsl(275 50% 38%)",
  },
};

const sizeClasses = {
  sm: "w-16 h-24",
  md: "w-24 h-36",
  lg: "w-32 h-48",
};

const GameCard = ({ card, faceDown = false, eliminated = false, revealed = false, size = "md", clickable = false, onClick, isTargetable = false }: GameCardProps) => {
  const [hovered, setHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const config = cardConfig[card];

  const canClick = clickable && !faceDown && !eliminated;

  return (
    <>
      <motion.div
        className={`relative ${sizeClasses[size]} select-none ${(canClick || isTargetable) ? "cursor-pointer" : "cursor-default"}`}
        whileHover={!eliminated ? { y: -10, rotateY: 3 } : {}}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={() => {
          if (onClick) onClick();
          else if (canClick) setModalOpen(true);
        }}
        style={{ perspective: 800 }}
      >
        <motion.div
          className={`
            w-full h-full rounded border overflow-hidden relative
            ${eliminated ? "opacity-40 grayscale" : ""}
            ${isTargetable ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse" : ""}
            ${faceDown
              ? "bg-gradient-to-br from-muted to-background " + (isTargetable ? "border-red-500" : "border-border/50")
              : "border-primary/25"
            }
          `}
          animate={hovered && !faceDown && !eliminated ? {
            boxShadow: `0 0 20px hsl(145 45% 32% / 0.25), 0 0 40px hsl(145 45% 32% / 0.08)`,
          } : {
            boxShadow: `0 0 0px transparent`,
          }}
        >
          {faceDown ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-3/4 h-3/4 border border-border/30 rounded flex items-center justify-center">
                <span className="font-display text-[8px] text-muted-foreground tracking-[0.2em] rotate-90 select-none">
                  LE COUP
                </span>
              </div>
              <div className="absolute inset-2 border border-dashed border-border/15 rounded" />
            </div>
          ) : (
            <div className="w-full h-full relative">
              <img
                src={config.image}
                alt={card}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                <span className="font-display text-[9px] uppercase tracking-[0.15em] text-foreground font-semibold">
                  {card}
                </span>
              </div>
              {canClick && hovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-primary/10 flex items-center justify-center"
                >
                  <span className="font-display text-[8px] text-primary tracking-[0.2em] uppercase bg-background/60 px-2 py-1 rounded">
                    VIEW CARD
                  </span>
                </motion.div>
              )}
            </div>
          )}

          {revealed && !faceDown && !eliminated && (
            <div className="absolute inset-0 bg-destructive/20 pointer-events-none z-10 transition-all duration-500">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,hsl(0_65%_42%/0.4)_100%)]" />
              <div className="absolute top-2 right-2 animate-pulse">
                <Eye className="w-5 h-5 text-destructive drop-shadow-[0_0_8px_hsl(0_65%_42%)]" />
              </div>
            </div>
          )}

          {eliminated && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/40">
              <span className="text-destructive font-display font-bold text-lg rotate-12 tracking-wider">
                DEAD
              </span>
            </div>
          )}
        </motion.div>

        {hovered && !faceDown && !eliminated && size !== "sm" && !canClick && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 glass-panel-strong px-3 py-1.5 z-50 whitespace-nowrap"
          >
            <span className="text-xs font-display text-primary tracking-wider">{config.ability}</span>
          </motion.div>
        )}
      </motion.div>

      {/* Fullsize Card Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            onClick={() => setModalOpen(false)}
          >
            <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />

            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="relative z-10 flex flex-col md:flex-row gap-12 items-center max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="relative w-80 h-[30rem] rounded-xl overflow-hidden border-2 flex-shrink-0"
                style={{ borderColor: config.color, boxShadow: `0 0 40px ${config.color}88, 0 0 100px ${config.color}33` }}
              >
                <img src={config.image} alt={card} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-transparent p-6">
                  <span className="font-display text-xl uppercase tracking-[0.3em] text-foreground font-black italic">
                    {card}
                  </span>
                </div>
              </motion.div>

              <div className="flex flex-col gap-8 flex-1 bg-background/60 backdrop-blur-2xl p-12 rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div>
                  <div className="flex items-center gap-3 mb-3" style={{ color: config.color }}>
                    {config.icon}
                    <span className="font-display text-xs uppercase tracking-[0.4em] font-black opacity-60">Ability Signature</span>
                  </div>
                  <h2 className="font-display text-5xl font-black text-foreground tracking-tighter uppercase mb-2 leading-none">{config.ability}</h2>
                  <div className="h-1 w-24" style={{ background: config.color }} />
                </div>

                <p className="font-body text-xl text-muted-foreground leading-relaxed italic pr-8 opacity-90">
                  "{config.description}"
                </p>

                <div className="flex flex-col gap-6">
                  <div
                    className="self-start px-6 py-3 rounded-lg font-display text-xs font-black tracking-[0.3em] uppercase"
                    style={{ background: `${config.color}33`, color: config.color, border: `1px solid ${config.color}66` }}
                  >
                    IDENTIFIER: {card} // CRYPTO-HASH: {Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase()}
                  </div>

                  <p className="font-display text-xs text-muted-foreground/30 tracking-[0.3em] uppercase font-bold italic animate-pulse">
                    click outside to close terminal
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GameCard;
