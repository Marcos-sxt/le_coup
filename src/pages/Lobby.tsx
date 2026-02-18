import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowRight, Zap, Users, Trophy } from "lucide-react";
import NeonGrid from "@/components/NeonGrid";
import WalletButton from "@/components/WalletButton";

const mockGames = [
  { id: "PSG-7A3F", creator: "GDKX...F4Q7", stake: 25, status: "waiting" },
  { id: "PSG-B1D9", creator: "GCQR...2K8P", stake: 50, status: "waiting" },
  { id: "PSG-E5C2", creator: "GBWM...9J1L", stake: 100, status: "in_progress" },
];

const Lobby = () => {
  const navigate = useNavigate();
  const [gameId, setGameId] = useState("");
  const [stake, setStake] = useState("25");

  return (
    <div className="relative min-h-screen overflow-hidden">
      <NeonGrid />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background pointer-events-none" />

      <header className="relative z-10 flex items-center justify-between p-6">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
          <Zap className="w-5 h-5 text-primary" />
          <span className="font-mono text-sm font-bold text-foreground tracking-wider">LE COUP zk</span>
        </button>
        <WalletButton />
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-mono text-3xl font-bold text-foreground mb-2">Game Lobby</h1>
          <p className="text-sm text-muted-foreground">Create or join a session to begin.</p>
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
              <h2 className="font-mono text-lg font-bold text-foreground">Create Game</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Stake (XLM)
                </label>
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  className="w-full bg-background/60 border border-border/50 rounded-md px-4 py-2.5 font-mono text-sm text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                  placeholder="25"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/game")}
                className="w-full py-3 rounded-md gradient-neon font-mono font-bold text-sm text-background tracking-wider cursor-pointer"
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
              <h2 className="font-mono text-lg font-bold text-foreground">Join Game</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Game ID
                </label>
                <input
                  type="text"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  className="w-full bg-background/60 border border-border/50 rounded-md px-4 py-2.5 font-mono text-sm text-foreground uppercase focus:outline-none focus:border-secondary/60 focus:ring-1 focus:ring-secondary/30 transition-all"
                  placeholder="PSG-XXXX"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/game")}
                className="w-full py-3 rounded-md border border-secondary/40 font-mono font-bold text-sm text-secondary tracking-wider cursor-pointer hover:bg-secondary/10 transition-colors"
              >
                JOIN GAME
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Active Games */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-neon-gold" />
            <h2 className="font-mono text-lg font-bold text-foreground">Open Games</h2>
          </div>
          <div className="space-y-2">
            {mockGames.map((game) => (
              <motion.div
                key={game.id}
                whileHover={{ backgroundColor: "hsl(240, 10%, 12%)" }}
                className="flex items-center justify-between p-3 rounded-md border border-border/20 transition-colors cursor-pointer"
                onClick={() => navigate("/game")}
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-bold text-primary">{game.id}</span>
                  <span className="font-mono text-xs text-muted-foreground">{game.creator}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-neon-gold" />
                    <span className="font-mono text-xs text-neon-gold">{game.stake} XLM</span>
                  </div>
                  <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    game.status === "waiting"
                      ? "text-neon-green border-neon-green/30"
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
