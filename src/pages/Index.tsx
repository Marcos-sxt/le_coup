import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Zap, Shield, Eye, Swords } from "lucide-react";
import NeonGrid from "@/components/NeonGrid";
import PasskeyButton from "@/components/PasskeyButton";

const features = [
  { icon: <Shield className="w-5 h-5" />, title: "Tamper-Proof Hands", desc: "Your cards are private — no one can peek" },
  { icon: <Eye className="w-5 h-5" />, title: "Hidden Information", desc: "Bluff freely with cryptographic backing" },
  { icon: <Swords className="w-5 h-5" />, title: "Fair Disputes", desc: "Challenges resolved instantly and fairly" },
  { icon: <Zap className="w-5 h-5" />, title: "Bluff & Deduce", desc: "Outsmart opponents with pure strategy" },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <NeonGrid />

      {/* Ambient gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

      {/* Top nav */}
      <header className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <span className="font-mono text-sm font-bold text-foreground tracking-wider">LE COUP zk</span>
        </div>
        <PasskeyButton />
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6 max-w-2xl"
        >
          <div className="space-y-2">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-mono text-xs uppercase tracking-[0.3em] text-primary/80"
          >
            The Strategy Game of Bluff & Proof
          </motion.p>
            <h1 className="text-5xl md:text-7xl font-mono font-extrabold leading-tight">
              <span className="gradient-neon-text">LE COUP</span>
              <br />
              <span className="text-foreground">zk</span>
            </h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed"
          >
            Bluff. Prove. Conquer. A turn-based strategy game where your hidden cards are protected by zero-knowledge cryptography.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-4 pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px hsl(185 100% 50% / 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/lobby")}
              className="px-8 py-3.5 rounded-lg font-mono font-bold text-sm gradient-neon text-background tracking-wider cursor-pointer"
            >
              ENTER LOBBY
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/game")}
              className="px-8 py-3.5 rounded-lg font-mono font-bold text-sm glass-panel border-primary/30 text-primary tracking-wider cursor-pointer hover:bg-primary/5 transition-colors"
            >
              DEMO GAME
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-3xl w-full"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + i * 0.1 }}
              whileHover={{ y: -4, borderColor: "hsl(185, 100%, 50%)" }}
              className="glass-panel p-4 space-y-2 cursor-default transition-colors"
            >
              <div className="text-primary">{f.icon}</div>
              <h3 className="font-mono text-xs font-semibold text-foreground">{f.title}</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8">
        <p className="font-mono text-xs text-muted-foreground/40">
          Le Coup zk · Integrity-protected gameplay
        </p>
      </footer>
    </div>
  );
};

export default Index;
