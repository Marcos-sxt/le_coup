import { motion } from "framer-motion";
import { Coins, Shield, Skull, ArrowRightLeft, Ban, Swords, Eye, Target } from "lucide-react";

interface Action {
  name: string;
  icon: React.ReactNode;
  character?: string;
  cost?: number;
  description: string;
  colorClass: string;
}

const actions: Action[] = [
  { name: "Income", icon: <Coins className="w-4 h-4" />, description: "+1 coin", colorClass: "border-foreground/15 hover:border-foreground/30" },
  { name: "Foreign Aid", icon: <Coins className="w-4 h-4" />, description: "+2 coins", colorClass: "border-foreground/15 hover:border-foreground/30" },
  { name: "Tax", icon: <Coins className="w-4 h-4" />, character: "LION", cost: 0, description: "+3 coins", colorClass: "border-accent/25 hover:border-accent/50" },
  { name: "Steal", icon: <ArrowRightLeft className="w-4 h-4" />, character: "CROW", cost: 0, description: "Take 2 from target", colorClass: "border-primary/25 hover:border-primary/50" },
  { name: "Reveal", icon: <Eye className="w-4 h-4" />, character: "SPIDER", cost: 3, description: "Reveal target 3 turns", colorClass: "border-destructive/25 hover:border-destructive/50" },
  { name: "Exchange", icon: <Shield className="w-4 h-4" />, character: "CHAMELEON", cost: 0, description: "Swap with deck", colorClass: "border-emerald-glow/25 hover:border-emerald-glow/50" },
  { name: "Coup", icon: <Swords className="w-4 h-4" />, cost: 7, description: "Force kill (unstoppable)", colorClass: "border-secondary/25 hover:border-secondary/50" },
  { name: "Coup de Grace", icon: <Target className="w-4 h-4" />, description: "Guess both cards to win", colorClass: "border-purple-500/25 hover:border-purple-500/50" },
];

interface ActionPanelProps {
  onAction?: (action: string) => void;
  disabled?: boolean;
  coins?: number;
}

const ActionPanel = ({ onAction, disabled = false, coins = 2 }: ActionPanelProps) => {
  return (
    <div className="glass-panel p-4">
      <h3 className="font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
        <Ban className="w-3 h-3" />
        Actions
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, i) => {
          const canAfford = !action.cost || coins >= action.cost;
          return (
            <motion.button
              key={action.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={!disabled && canAfford ? { scale: 1.03 } : {}}
              whileTap={!disabled && canAfford ? { scale: 0.97 } : {}}
              onClick={() => !disabled && canAfford && onAction?.(action.name)}
              disabled={disabled || !canAfford}
              className={`
                flex flex-col gap-1 p-3 rounded border transition-all duration-200
                ${action.colorClass}
                ${disabled || !canAfford ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                bg-background/40 hover:bg-background/60
              `}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  {action.icon}
                  <span className="font-display text-[10px] font-semibold tracking-wider">{action.name}</span>
                </div>
                {action.cost !== undefined && action.cost > 0 && (
                  <span className="text-[10px] font-body text-accent">{action.cost}💰</span>
                )}
              </div>
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] text-muted-foreground font-body">{action.description}</span>
                {action.character && (
                  <span className="text-[10px] font-display text-primary/50 tracking-wider">{action.character}</span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ActionPanel;
