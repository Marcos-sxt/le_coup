import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Zap } from "lucide-react";

interface WalletButtonProps {
  onConnect?: () => void;
}

const WalletButton = ({ onConnect }: WalletButtonProps) => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");

  const handleConnect = () => {
    // Mock wallet connection
    setConnected(true);
    setAddress("GDKX...F4Q7");
    onConnect?.();
  };

  if (connected) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-panel px-4 py-2 flex items-center gap-3 neon-glow-cyan"
      >
        <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse-neon" />
        <span className="font-mono text-sm text-primary">{address}</span>
        <span className="text-xs text-muted-foreground">Testnet</span>
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
      <Wallet className="w-5 h-5 text-primary group-hover:drop-shadow-[0_0_8px_hsl(185_100%_50%/0.8)]" />
      <span className="font-mono text-sm font-semibold text-primary">
        Connect Freighter
      </span>
      <Zap className="w-4 h-4 text-neon-gold" />
    </motion.button>
  );
};

export default WalletButton;
