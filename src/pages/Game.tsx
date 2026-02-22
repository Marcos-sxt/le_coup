import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Coins, Heart, AlertTriangle } from "lucide-react";
import GameCard from "@/components/GameCard";
import ActionPanel from "@/components/ActionPanel";
import GameLog from "@/components/GameLog";
import TurnIndicator from "@/components/TurnIndicator";
import DisputeModal from "@/components/DisputeModal";
import ProofBadge from "@/components/ProofBadge";
import type { CardType } from "@/components/GameCard";

const Game = () => {
  const navigate = useNavigate();
  const [isYourTurn, setIsYourTurn] = useState(true);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [coins, setCoins] = useState(2);
  const [opponentCoins, setOpponentCoins] = useState(2);

  const playerCards: { card: CardType; eliminated: boolean }[] = [
    { card: "Captain", eliminated: false },
    { card: "Duke", eliminated: false },
  ];

  const opponentCards = [
    { eliminated: false },
    { eliminated: true },
  ];

  const handleAction = (action: string) => {
    if (action === "Tax") setCoins((c) => c + 3);
    else if (action === "Income") setCoins((c) => c + 1);
    else if (action === "Foreign Aid") setCoins((c) => c + 2);
    setIsYourTurn(false);
    setTimeout(() => setIsYourTurn(true), 2000);
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Atmospheric ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/4 rounded-full blur-[120px]" />
      </div>
      <div className="absolute inset-0 film-grain pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 border-b border-border/20">
        <button onClick={() => navigate("/lobby")} className="flex items-center gap-3 cursor-pointer">
          <span className="text-primary">✦</span>
          <span className="font-display text-xs font-bold text-foreground tracking-[0.15em]">LE COUP</span>
        </button>
        <div className="flex items-center gap-4">
          <span className="font-display text-[10px] text-muted-foreground tracking-wider">Room: COUP-7A3F</span>
          <div className="flex items-center gap-1 font-body text-xs text-accent">
            <Coins className="w-3 h-3" />
            <span>50 coin wager</span>
          </div>
          <ProofBadge />
        </div>
      </header>

      <div className="relative z-10 flex h-[calc(100vh-57px)]">
        {/* Main game area */}
        <div className="flex-1 flex flex-col p-6 gap-6">
          {/* Opponent area */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full glass-panel-strong flex items-center justify-center border border-secondary/20">
                  <span className="font-display text-[10px] text-secondary">NR</span>
                </div>
                <div>
                  <span className="font-display text-sm font-semibold text-foreground tracking-wider">neon_rook</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-body text-xs text-accent flex items-center gap-1">
                      <Coins className="w-3 h-3" /> {opponentCoins}
                    </span>
                    <span className="font-body text-xs text-muted-foreground flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {opponentCards.filter(c => !c.eliminated).length} influence
                    </span>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDisputeOpen(true)}
                className="px-3 py-1.5 rounded border border-secondary/40 font-display text-[10px] text-secondary cursor-pointer hover:bg-secondary/10 transition-colors flex items-center gap-1.5 tracking-wider"
              >
                <AlertTriangle className="w-3 h-3" />
                CHALLENGE
              </motion.button>
            </div>
            <div className="flex items-center gap-3 justify-center">
              {opponentCards.map((c, i) => (
                <GameCard key={i} card="Duke" faceDown={!c.eliminated} eliminated={c.eliminated} />
              ))}
            </div>
          </motion.div>

          {/* Center - Turn indicator */}
          <div className="flex-1 flex items-center justify-center">
            <TurnIndicator isYourTurn={isYourTurn} playerName="neon_rook" />
          </div>

          {/* Player area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full gradient-emerald flex items-center justify-center">
                  <span className="font-display text-[10px] text-primary-foreground font-bold">CF</span>
                </div>
                <div>
                  <span className="font-display text-sm font-semibold text-foreground tracking-wider">cipher_fox</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-body text-xs text-accent flex items-center gap-1">
                      <Coins className="w-3 h-3" /> {coins}
                    </span>
                    <span className="font-body text-xs text-muted-foreground flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {playerCards.filter(c => !c.eliminated).length} influence
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {playerCards.map((c, i) => (
                  <GameCard key={i} card={c.card} eliminated={c.eliminated} size="lg" clickable />
                ))}
              </div>
              <div className="flex-1">
                <ActionPanel onAction={handleAction} disabled={!isYourTurn} coins={coins} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Side panel - Game Log */}
        <div className="w-72 border-l border-border/20 p-4">
          <GameLog />
        </div>
      </div>

      <DisputeModal
        isOpen={disputeOpen}
        onClose={() => setDisputeOpen(false)}
        claimedCard="Captain"
      />
    </div>
  );
};

export default Game;
