import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, CheckCircle, User } from "lucide-react";

interface PasskeyButtonProps {
  onConnect?: (username: string) => void;
}

const PasskeyButton = ({ onConnect }: PasskeyButtonProps) => {
  const [stage, setStage] = useState<"idle" | "scanning" | "connected">("idle");
  const [username] = useState("cipher_fox");

  const handleConnect = () => {
    setStage("scanning");
    setTimeout(() => {
      setStage("connected");
      onConnect?.(username);
    }, 1400);
  };

  if (stage === "connected") {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-panel px-4 py-2 flex items-center gap-3 neon-glow-cyan"
      >
        <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse-neon" />
        <User className="w-4 h-4 text-primary" />
        <span className="font-mono text-sm text-primary">{username}</span>
      </motion.div>
    );
  }

  if (stage === "scanning") {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-panel px-5 py-2.5 flex items-center gap-3"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <Fingerprint className="w-5 h-5 text-primary" />
        </motion.div>
        <span className="font-mono text-sm text-primary">Authenticating...</span>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05, boxShadow: "0 0 30px hsl(185 100% 50% / 0.4)" }}
      whileTap={{ scale: 0.95 }}
      onClick={handleConnect}
      className="glass-panel px-6 py-3 flex items-center gap-3 cursor-pointer transition-all duration-300 hover:border-primary/60 group"
    >
      <Fingerprint className="w-5 h-5 text-primary group-hover:drop-shadow-[0_0_8px_hsl(185_100%_50%/0.8)]" />
      <span className="font-mono text-sm font-semibold text-primary">
        Sign In with Passkey
      </span>
    </motion.button>
  );
};

export default PasskeyButton;
