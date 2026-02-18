import { motion } from "framer-motion";
import { useState } from "react";

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
}

const cardConfig: Record<CardType, { image: string; ability: string }> = {
  Duke: {
    image: dukeImg,
    ability: "Tax: Take 3 coins",
  },
  Assassin: {
    image: assassinImg,
    ability: "Assassinate: Pay 3, kill target",
  },
  Captain: {
    image: captainImg,
    ability: "Steal: Take 2 coins from target",
  },
  Ambassador: {
    image: ambassadorImg,
    ability: "Exchange: Swap cards with deck",
  },
  Contessa: {
    image: contessaImg,
    ability: "Block assassination",
  },
};

const sizeClasses = {
  sm: "w-16 h-24",
  md: "w-24 h-36",
  lg: "w-32 h-48",
};

const GameCard = ({ card, faceDown = false, eliminated = false, size = "md" }: GameCardProps) => {
  const [hovered, setHovered] = useState(false);
  const config = cardConfig[card];

  return (
    <motion.div
      className={`relative ${sizeClasses[size]} cursor-pointer select-none`}
      whileHover={!eliminated ? { y: -12, rotateY: 5 } : {}}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{ perspective: 800 }}
    >
      <motion.div
        className={`
          w-full h-full rounded-lg border overflow-hidden relative
          ${eliminated ? "opacity-40 grayscale" : ""}
          ${faceDown
            ? "bg-gradient-to-br from-muted to-background border-border/50"
            : "border-primary/30"
          }
        `}
        animate={hovered && !faceDown && !eliminated ? {
          boxShadow: `0 0 25px hsl(185 100% 50% / 0.3), 0 0 50px hsl(185 100% 50% / 0.1)`,
        } : {
          boxShadow: `0 0 0px transparent`,
        }}
      >
        {faceDown ? (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-3/4 h-3/4 border border-border/30 rounded-md flex items-center justify-center">
              <span className="font-mono text-[10px] text-muted-foreground tracking-widest rotate-90 select-none">
                LE COUP
              </span>
            </div>
            <div className="absolute inset-2 border border-dashed border-border/20 rounded" />
          </div>
        ) : (
          <div className="w-full h-full relative">
            <img
              src={config.image}
              alt={card}
              className="w-full h-full object-cover"
            />
            {/* Card name overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-foreground font-semibold">
                {card}
              </span>
            </div>
          </div>
        )}

        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 scanline" />

        {eliminated && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/40">
            <span className="text-destructive font-mono font-bold text-lg rotate-12">
              DEAD
            </span>
          </div>
        )}
      </motion.div>

      {/* Tooltip on hover */}
      {hovered && !faceDown && !eliminated && size !== "sm" && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 glass-panel-strong px-3 py-1.5 z-50 whitespace-nowrap"
        >
          <span className="text-xs font-mono text-primary">{config.ability}</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GameCard;
