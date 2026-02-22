import { useState } from "react";
import { motion } from "framer-motion";
import { Fingerprint, User } from "lucide-react";

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
        className="glass-panel px-4 py-2 flex items-center gap-3 glow-emerald"
      >
        <div className="w-2 h-2 rounded-full bg-primary animate-flicker" />
        <User className="w-4 h-4 text-primary" />
        <span className="font-display text-xs text-primary tracking-wider">{username}</span>
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
        <span className="font-body text-sm text-primary italic">Authenticating...</span>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05, boxShadow: "0 0 25px hsl(145 45% 32% / 0.3)" }}
      whileTap={{ scale: 0.95 }}
      onClick={handleConnect}
      className="glass-panel px-6 py-3 flex items-center gap-3 cursor-pointer transition-all duration-300 hover:border-primary/60 group"
    >
      <Fingerprint className="w-5 h-5 text-primary group-hover:drop-shadow-[0_0_6px_hsl(145_45%_32%/0.6)]" />
      <span className="font-display text-xs font-semibold text-primary tracking-[0.1em]">
        Sign In
      </span>
    </motion.button>
  );
};

export default PasskeyButton;
