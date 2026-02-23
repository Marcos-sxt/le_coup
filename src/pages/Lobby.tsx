import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowRight, Users, Trophy } from "lucide-react";
import NeonGrid from "@/components/NeonGrid";
import PasskeyButton from "@/components/PasskeyButton";
import ProofBadge from "@/components/ProofBadge";

const mockGames = [
  { id: "COUP-7A3F", creator: "cipher_fox", stake: 25, status: "waiting" },
  { id: "COUP-B1D9", creator: "neon_rook", stake: 50, status: "waiting" },
  { id: "COUP-E5C2", creator: "zero_ghost", stake: 100, status: "in_progress" },
];

const Lobby = () => {
  const navigate = useNavigate();
  const [gameId, setGameId] = useState("");
  const [stake, setStake] = useState("25");

  return (
    <div className="relative min-h-screen overflow-hidden">
      <NeonGrid />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background pointer-events-none" />
      <div className="absolute inset-0 film-grain pointer-events-none" />

      <header className="relative z-50 flex items-center justify-between p-6">
        <button onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer">
          <span className="text-primary text-lg">✦</span>
          <span className="font-display text-sm font-semibold text-foreground tracking-[0.15em]">LE COUP</span>
        </button>
        <div className="flex items-center gap-3">
          <ProofBadge />
          <PasskeyButton />
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2 tracking-wider">The Parlour</h1>
          <p className="text-sm text-muted-foreground font-body italic">Create or join a session to begin your game of wits.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Game */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel-strong p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-bold text-foreground tracking-wider">Create Game</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-display text-[10px] text-muted-foreground uppercase tracking-[0.2em] block mb-1.5">
                  Wager (coins)
                </label>
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  className="w-full bg-background/60 border border-border/50 rounded px-4 py-2.5 font-body text-sm text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                  placeholder="25"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/game")}
                className="w-full py-3 rounded gradient-emerald font-display font-semibold text-sm text-primary-foreground tracking-[0.15em] cursor-pointer"
              >
                CREATE & WAIT
              </motion.button>
            </div>
          </motion.div>

          {/* Join Game */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel-strong p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-secondary" />
              <h2 className="font-display text-lg font-bold text-foreground tracking-wider">Join Game</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-display text-[10px] text-muted-foreground uppercase tracking-[0.2em] block mb-1.5">
                  Game ID
                </label>
                <input
                  type="text"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  className="w-full bg-background/60 border border-border/50 rounded px-4 py-2.5 font-body text-sm text-foreground uppercase focus:outline-none focus:border-secondary/60 focus:ring-1 focus:ring-secondary/30 transition-all"
                  placeholder="COUP-XXXX"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/game")}
                className="w-full py-3 rounded border border-secondary/40 font-display font-semibold text-sm text-secondary tracking-[0.15em] cursor-pointer hover:bg-secondary/10 transition-colors"
              >
                JOIN GAME
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Open Games */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            <h2 className="font-display text-lg font-bold text-foreground tracking-wider">Open Tables</h2>
          </div>
          <div className="space-y-2">
            {mockGames.map((game) => (
              <motion.div
                key={game.id}
                whileHover={{ backgroundColor: "hsl(150, 15%, 9%)" }}
                className="flex items-center justify-between p-3 rounded border border-border/20 transition-colors cursor-pointer"
                onClick={() => navigate("/game")}
              >
                <div className="flex items-center gap-4">
                  <span className="font-display text-sm font-bold text-primary tracking-wider">{game.id}</span>
                  <span className="font-body text-xs text-muted-foreground italic">{game.creator}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-accent" />
                    <span className="font-body text-xs text-accent">{game.stake} coins</span>
                  </div>
                  <span className={`font-display text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border ${game.status === "waiting"
                      ? "text-primary border-primary/30"
                      : "text-muted-foreground border-muted-foreground/30"
                    }`}>
                    {game.status === "waiting" ? "Open" : "Live"}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Lobby;
