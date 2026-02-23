import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { ID_TO_NAME } from "@/services/GameEngine";
import { useNavigate } from "react-router-dom";
import ActionResponseModal from "@/components/ActionResponseModal";
import ZKAuditModal from "@/components/ZKAuditModal";
import { Coins, Heart, AlertTriangle, FileSearch } from "lucide-react";
import GameCard from "@/components/GameCard";
import ActionPanel from "@/components/ActionPanel";
import GameLog from "@/components/GameLog";
import TurnIndicator from "@/components/TurnIndicator";
import ZKProofModal from '@/components/ZKProofModal';
import CoupDeGraceModal from '@/components/CoupDeGraceModal';
import VerdictModal from '@/components/VerdictModal';
import ProofBadge from '@/components/ProofBadge';
import { CardType } from '@/components/GameCard';
import { ID_TO_NAME as ENGINE_ID_TO_NAME } from '@/services/GameEngine';

const Game = () => {
  const navigate = useNavigate();
  const { gameState, initializeGame, applyAction, applyResponse, engine, resetGame } = useGameStore();
  const [coupDeGraceOpen, setCoupDeGraceOpen] = useState(false);
  const [verdictOpen, setVerdictOpen] = useState(false);
  const [verdictData, setVerdictData] = useState<{
    type: "CHALLENGE" | "COUP_DE_GRACE";
    cards: string[];
    isSuccess: boolean;
  } | null>(null);
  const [pendingTargetAction, setPendingTargetAction] = useState<string | null>(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  useEffect(() => {
    // If not initialized, or missing ZK commitment, initialize properly
    // We only do this once on mount if the state is not ready
    if (!gameState || gameState.id === 'demo-session' || !gameState.p1Commitment) {
      initializeGame('local-match');
    }
  }, [initializeGame]); // Remove gameState and p1Commitment from deps to break the loop

  useEffect(() => {
    // This effect only handles the cleanup when the component genuinely unmounts
    return () => {
      console.log("[Game] Leaving room, resetting state...");
      resetGame();
    };
  }, [resetGame]);

  // AI Opponent Logic (neon_rook / p2)
  useEffect(() => {
    if (!gameState || gameState.winner) return;

    // AI Turn handling
    if (gameState.phase === 'MAIN_TURN' && gameState.turn === 'p2') {
      const aiActionTimeout = setTimeout(() => {
        const coins = gameState.p2Coins;
        let action = "INCOME";

        if (coins >= 7) action = "COUP";
        else if (coins >= 3 && Math.random() > 0.5) action = "REVEAL";
        else if (Math.random() > 0.3) action = "TAX";

        console.log(`%c[AI] Decision: ${action} (Coins: ${coins})`, "color: #ec4899; font-weight: bold;");
        applyAction({
          type: action,
          source: 'p2',
          target: 'p1',
          payload: action === "COUP" || action === "REVEAL" ? { targetCardIndex: 0 } : {}
        });
      }, 3000); // Relaxed AI decision pace
      return () => clearTimeout(aiActionTimeout);
    }

    // AI Response handling (Targeted by P1)
    if (gameState.phase === 'ACTION_RESPONSE' && gameState.pendingAction?.target === 'p2') {
      console.log(`%c[AI] Targeted by ${gameState.pendingAction.type}. Choosing to PASS (ALLOW).`, "color: #ec4899;");
      const aiResponseTimeout = setTimeout(() => {
        applyResponse('ALLOW');
      }, 4000); // More time for player to see what AI is doing
      return () => clearTimeout(aiResponseTimeout);
    }

    // AI Challenge handling (Action was BLOCKED by P1)
    if (gameState.phase === 'BLOCK_RESPONSE' && gameState.pendingAction?.source === 'p2') {
      console.log(`%c[AI] Action was BLOCKED. Accepting block.`, "color: #ec4899;");
      const aiBlockResponseTimeout = setTimeout(() => {
        applyResponse('ALLOW'); // AI accepts the block and doesn't challenge
      }, 2000);
      return () => clearTimeout(aiBlockResponseTimeout);
    }
  }, [gameState, applyAction, applyResponse]);

  const isYourTurn = gameState?.turn === 'p1';
  const coins = gameState?.p1Coins || 0;
  const opponentCoins = gameState?.p2Coins || 0;

  const playerCards: { card: CardType; eliminated: boolean; revealedPublic: boolean }[] = (gameState?.myHand || []).map(c => ({
    card: (ENGINE_ID_TO_NAME[c.id] || "LION") as CardType,
    eliminated: c.isDead,
    revealedPublic: c.revealedPublic
  }));

  // Fallback if empty based on lives
  if (playerCards.length === 0) {
    const lives = gameState?.p1Lives >= 0 ? gameState.p1Lives : 2;
    for (let i = 0; i < lives; i++) playerCards.push({ card: "CROW", eliminated: false, revealedPublic: false });
    for (let i = lives; i < 2; i++) playerCards.push({ card: "CROW", eliminated: true, revealedPublic: false });
  }

  const opponentCards = (gameState?.opponentHand || []).map(c => ({
    eliminated: c.isDead,
    card: (ENGINE_ID_TO_NAME[c.id] || "LION") as CardType,
    revealedPublic: c.revealedPublic
  }));

  if (opponentCards.length === 0) {
    const lives = gameState?.p2Lives >= 0 ? gameState.p2Lives : 2;
    for (let i = 0; i < lives; i++) opponentCards.push({ eliminated: false, card: "LION", revealedPublic: false });
    for (let i = lives; i < 2; i++) opponentCards.push({ eliminated: true, card: "LION", revealedPublic: false });
  }

  const handleAction = (action: string) => {
    let type = action.toUpperCase().replace(/ /g, "_");

    if (type === "COUP_DE_GRACE") {
      setCoupDeGraceOpen(true);
      return;
    }

    if (["REVEAL", "COUP"].includes(type)) {
      setPendingTargetAction(type);
      return;
    }

    applyAction({
      type,
      source: 'p1',
      target: 'p2'
    });
  };

  const handleTargetSelect = (targetIndex: number) => {
    if (!pendingTargetAction || !gameState || gameState.phase !== 'MAIN_TURN') return;

    applyAction({
      type: pendingTargetAction,
      source: 'p1',
      target: 'p2',
      payload: { targetCardIndex: targetIndex }
    });
    setPendingTargetAction(null);
  };

  const handleCoupDeGraceSubmit = (guess1: CardType, guess2: CardType) => {
    // Check result before triggering animation
    const targetHand = gameState.opponentHand.filter(c => !c.isDead);
    const targetCards = targetHand.map(c => ENGINE_ID_TO_NAME[c.id]);
    const isSuccess = targetCards.includes(guess1) || targetCards.includes(guess2);

    setVerdictData({
      type: "COUP_DE_GRACE",
      cards: [guess1, guess2],
      isSuccess: isSuccess
    });
    setVerdictOpen(true);

    applyAction({
      type: 'COUP_DE_GRACE',
      source: 'p1',
      target: 'p2',
      payload: { card1: guess1, card2: guess2 }
    });
  };

  const handleChallenge = () => {
    const action = gameState.pendingAction;
    if (!action) return;

    let isLying = false;
    if (action.source === 'p1') {
      const lastProof = gameState.matchProofs[gameState.matchProofs.length - 1];
      isLying = lastProof ? !lastProof.valid : true;
    } else {
      const targetCardId = engine.getActionCardId(action.type);
      isLying = !gameState.opponentHand.some(c => c.id === targetCardId && !c.isDead);
    }

    setVerdictData({
      type: "CHALLENGE",
      cards: [engine.getActionCardName(action.type)],
      isSuccess: isLying
    });
    setVerdictOpen(true);
  };

  const onVerdictClose = () => {
    if (verdictData?.type === "CHALLENGE") {
      applyResponse('CHALLENGE');
    } else if (verdictData?.type === "COUP_DE_GRACE") {
      // Logic for Coup de Grace result is already handled by applyAction in engine
      // but we show the animation first. 
    }
    setVerdictOpen(false);
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
              <div className="flex items-center gap-3">
                <span className="font-display text-[10px] text-muted-foreground tracking-widest font-bold opacity-50">AUDIT LOG READY</span>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center relative">
              {pendingTargetAction && (
                <div className="absolute -top-8 bg-destructive/20 text-destructive border border-destructive px-3 py-1 rounded text-xs font-display font-medium uppercase animate-pulse">
                  Select Target to {pendingTargetAction}
                </div>
              )}
              {opponentCards.map((c, i) => (
                <GameCard
                  key={i}
                  card={c.card as any}
                  faceDown={!c.eliminated && !c.revealedPublic}
                  eliminated={c.eliminated}
                  revealed={c.revealedPublic}
                  isTargetable={pendingTargetAction !== null && !c.eliminated}
                  onClick={() => handleTargetSelect(i)}
                />
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
                  <GameCard key={i} card={c.card} eliminated={c.eliminated} revealed={c.revealedPublic} size="lg" clickable />
                ))}
              </div>
              <div className="flex-1">
                <ActionPanel
                  onAction={handleAction}
                  disabled={!isYourTurn || gameState?.phase !== 'MAIN_TURN'}
                  coins={coins}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Side panel - Game Log */}
        <div className="w-72 border-l border-border/20 p-4">
          <GameLog />
        </div>
      </div>

      {/* Game Over Banner Overlay */}
      <AnimatePresence>
        {gameState?.winner && !verdictOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-background/40 backdrop-blur-sm pt-20"
          >
            <motion.div
              initial={{ x: "-100%", skewX: -20 }}
              animate={{ x: 0, skewX: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className={`w-full py-12 relative overflow-hidden border-y-4 ${gameState.winner === 'p1'
                ? "bg-primary/20 border-primary shadow-[0_0_100px_rgba(16,185,129,0.3)] text-primary"
                : "bg-destructive/20 border-destructive shadow-[0_0_100px_rgba(239,68,68,0.3)] text-destructive"
                }`}
            >
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-[80%] h-full rounded-full blur-[120px] ${gameState.winner === 'p1' ? "bg-primary" : "bg-destructive"
                    }`}
                />
              </div>

              <div className="relative z-10 flex flex-col items-center justify-center gap-4">
                <motion.h1
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
                  className="font-display text-7xl md:text-9xl font-black italic tracking-tighter uppercase drop-shadow-[0_0_20px_currentColor]"
                >
                  {gameState.winner === 'p1' ? "Victory Achieved" : "Influence Lost"}
                </motion.h1>
                <div className="flex flex-col md:flex-row gap-4">
                  <button
                    onClick={() => navigate("/lobby")}
                    className={`px-12 py-4 rounded-full border-2 bg-background font-display text-sm font-bold tracking-widest uppercase hover:scale-110 transition-transform ${gameState.winner === 'p1' ? "border-primary text-primary" : "border-destructive text-destructive"
                      }`}
                  >
                    Return to Lobby
                  </button>
                  <button
                    onClick={() => setAuditModalOpen(true)}
                    className={`px-12 py-4 rounded-full border-2 bg-background/40 backdrop-blur-sm font-display text-sm font-bold tracking-widest uppercase hover:scale-110 transition-all flex items-center gap-2 group ${gameState.winner === 'p1' ? "border-primary/50 text-table-text" : "border-destructive/50 text-table-text"
                      }`}
                  >
                    <FileSearch className="w-4 h-4 group-hover:scale-125 transition-transform" />
                    View ZK Audit Pack
                  </button>
                </div>
              </div>

              {/* Decorative scanlines or glitch lines could go here */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ZKAuditModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        auditData={engine?.getAuditData() || null}
      />

      <VerdictModal
        isOpen={verdictOpen}
        onClose={onVerdictClose}
        type={verdictData?.type || "CHALLENGE"}
        claimedCards={verdictData?.cards || []}
        isSuccess={verdictData?.isSuccess || false}
      />

      <CoupDeGraceModal
        isOpen={coupDeGraceOpen}
        onClose={() => setCoupDeGraceOpen(false)}
        onSubmit={handleCoupDeGraceSubmit}
      />

      <ActionResponseModal
        isOpen={gameState?.phase === 'ACTION_RESPONSE' && gameState?.pendingAction?.target === 'p1'}
        actionType={gameState?.pendingAction?.type || ""}
        sourcePlayer="neon_rook"
        onAllow={() => applyResponse('ALLOW')}
        onChallenge={handleChallenge}
        onBlock={(cardId) => applyResponse('BLOCK', { cardId })}
      />
    </div >
  );
};

export default Game;
