import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, Swords, Flame } from "lucide-react";
import NeonGrid from "@/components/NeonGrid";
import PasskeyButton from "@/components/PasskeyButton";

const features = [
  { icon: <Shield className="w-5 h-5" />, title: "Sealed Hands", desc: "Your cards are bound by oath — none may glimpse them" },
  { icon: <Eye className="w-5 h-5" />, title: "Hidden Intent", desc: "Deceive freely under the veil of cryptographic wards" },
  { icon: <Swords className="w-5 h-5" />, title: "Trial by Challenge", desc: "Disputes resolved by an impartial arbiter" },
  { icon: <Flame className="w-5 h-5" />, title: "Bluff & Conquer", desc: "Outwit your rival with cunning alone" },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <NeonGrid />

      {/* Fog overlay */}
      <div className="absolute inset-0 fog-overlay pointer-events-none" />

      {/* Film grain */}
      <div className="absolute inset-0 film-grain pointer-events-none" />

      {/* Top nav */}
      <header className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <span className="text-primary text-lg">✦</span>
          <span className="font-display text-sm font-semibold text-foreground tracking-[0.15em]">LE COUP</span>
        </div>
        <PasskeyButton />
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="space-y-8 max-w-2xl"
        >
          <div className="space-y-3">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="font-display text-[10px] uppercase tracking-[0.4em] text-primary/70"
            >
              A Game of Deception & Proof
            </motion.p>

            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight">
              <span className="gradient-emerald-text">LE COUP</span>
            </h1>

            {/* Ornamental divider */}
            <div className="ornament-divider mx-auto w-48 mt-4" />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground text-lg font-body max-w-md mx-auto leading-relaxed italic"
          >
            Bluff. Prove. Conquer. A turn-based game of hidden influence, where your cards are sealed by ancient wards.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-4 pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px hsl(145 45% 32% / 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/lobby")}
              className="px-8 py-3.5 rounded font-display font-semibold text-sm gradient-emerald text-primary-foreground tracking-[0.15em] cursor-pointer"
            >
              ENTER THE PARLOUR
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/game")}
              className="px-8 py-3.5 rounded font-display font-semibold text-sm glass-panel border-primary/30 text-primary tracking-[0.15em] cursor-pointer hover:bg-primary/5 transition-colors"
            >
              DEMO GAME
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-3xl w-full"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + i * 0.1 }}
              whileHover={{ y: -4, borderColor: "hsl(145, 45%, 32%)" }}
              className="glass-panel p-4 space-y-2 cursor-default transition-colors"
            >
              <div className="text-primary">{f.icon}</div>
              <h3 className="font-display text-[11px] font-semibold text-foreground tracking-wider">{f.title}</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-body">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8">
        <p className="font-display text-[10px] text-muted-foreground/40 tracking-[0.2em]">
          Le Coup · Integrity-protected gameplay
        </p>
      </footer>
    </div>
  );
};

export default Index;
