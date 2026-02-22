import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Sword, Shield, Coins, RefreshCw, Ban } from "lucide-react";

import ambassadorImg from "@/assets/cards/ambassador.png";
import assassinImg from "@/assets/cards/assassin.png";
import captainImg from "@/assets/cards/captain.png";
import contessaImg from "@/assets/cards/contessa.png";
import dukeImg from "@/assets/cards/duke.png";

export type CardType = "Duke" | "Assassin" | "Captain" | "Ambassador" | "Contessa";

interface GameCardProps {
  card: CardType;
  faceDown?: boolean;
  eliminated?: boolean;
  size?: "sm" | "md" | "lg";
  clickable?: boolean;
}

const cardConfig: Record<CardType, {
  image: string;
  ability: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}> = {
  Duke: {
    image: dukeImg,
    ability: "Tax",
    description: "Receba 3 moedas do tesouro. Ninguém pode bloquear esta ação.",
    icon: <Coins className="w-5 h-5" />,
    color: "hsl(80 35% 42%)",
  },
  Assassin: {
    image: assassinImg,
    ability: "Assassinate",
    description: "Pague 3 moedas para eliminar uma influência do oponente. Pode ser bloqueado pela Contessa.",
    icon: <Sword className="w-5 h-5" />,
    color: "hsl(0 65% 42%)",
  },
  Captain: {
    image: captainImg,
    ability: "Steal",
    description: "Roube 2 moedas de qualquer jogador. Pode ser bloqueado pelo Embaixador ou por outro Capitão.",
    icon: <Coins className="w-5 h-5" />,
    color: "hsl(145 45% 32%)",
  },
  Ambassador: {
    image: ambassadorImg,
    ability: "Exchange",
    description: "Troque uma ou ambas as suas cartas com o baralho. Também pode bloquear roubos do Capitão.",
    icon: <RefreshCw className="w-5 h-5" />,
    color: "hsl(140 50% 40%)",
  },
  Contessa: {
    image: contessaImg,
    ability: "Block Assassination",
    description: "Você não possui ação própria, mas pode bloquear qualquer tentativa de assassinato contra você.",
    icon: <Shield className="w-5 h-5" />,
    color: "hsl(275 50% 38%)",
  },
};

const sizeClasses = {
  sm: "w-16 h-24",
  md: "w-24 h-36",
  lg: "w-32 h-48",
};

const GameCard = ({ card, faceDown = false, eliminated = false, size = "md", clickable = false }: GameCardProps) => {
  const [hovered, setHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const config = cardConfig[card];

  const canClick = clickable && !faceDown && !eliminated;

  return (
    <>
      <motion.div
        className={`relative ${sizeClasses[size]} select-none ${canClick ? "cursor-pointer" : "cursor-default"}`}
        whileHover={!eliminated ? { y: -10, rotateY: 3 } : {}}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={() => canClick && setModalOpen(true)}
        style={{ perspective: 800 }}
      >
        <motion.div
          className={`
            w-full h-full rounded border overflow-hidden relative
            ${eliminated ? "opacity-40 grayscale" : ""}
            ${faceDown
              ? "bg-gradient-to-br from-muted to-background border-border/50"
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
                    ver carta
                  </span>
                </motion.div>
              )}
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
              className="relative z-10 flex flex-col sm:flex-row gap-6 items-center max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="relative w-48 h-72 rounded overflow-hidden border-2 flex-shrink-0"
                style={{ borderColor: config.color, boxShadow: `0 0 30px ${config.color}44, 0 0 60px ${config.color}18` }}
              >
                <img src={config.image} alt={card} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                  <span className="font-display text-sm uppercase tracking-[0.15em] text-foreground font-bold">
                    {card}
                  </span>
                </div>
              </motion.div>

              <div className="flex flex-col gap-4 flex-1">
                <div>
                  <div className="flex items-center gap-2 mb-1" style={{ color: config.color }}>
                    {config.icon}
                    <span className="font-display text-[10px] uppercase tracking-[0.2em] opacity-70">Habilidade</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground tracking-wider">{config.ability}</h2>
                </div>

                <div className="h-px w-full" style={{ background: `${config.color}33` }} />

                <p className="font-body text-sm text-muted-foreground leading-relaxed italic">
                  {config.description}
                </p>

                <div
                  className="self-start px-3 py-1.5 rounded font-display text-[10px] font-semibold tracking-[0.15em]"
                  style={{ background: `${config.color}18`, color: config.color, border: `1px solid ${config.color}33` }}
                >
                  {card.toUpperCase()}
                </div>

                <p className="font-body text-[10px] text-muted-foreground/50 tracking-wider italic">
                  clique fora para fechar
                </p>
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
