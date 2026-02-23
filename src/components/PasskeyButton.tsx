import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, User, ShieldCheck, Mail, ArrowRight, X } from "lucide-react";
import { WalletService } from "@/services/walletService";
import { useGameStore } from "@/store/gameStore";

interface PasskeyButtonProps {
  onConnect?: (username: string, address: string) => void;
}

const PasskeyButton = ({ onConnect }: PasskeyButtonProps) => {
  const [stage, setStage] = useState<"idle" | "scanning" | "connected" | "creating">("idle");
  const [address, setAddress] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const setWallet = useGameStore((state) => state.setWallet);


  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const user = await WalletService.connect({ prompt: false });
        if (user && user.address) {
          setAddress(user.address);
          setStage("connected");
          setWallet(user);
          onConnect?.("Player", user.address);
        }
      } catch (e) {
        // Not connected
      }
    };
    checkConnection();
  }, [onConnect]);

  const handleConnect = async () => {
    setStage("scanning");
    try {
      const user = await WalletService.connect({ prompt: true });
      if (user && user.address) {
        setAddress(user.address);
        setStage("connected");
        setWallet(user);
        onConnect?.("Player", user.address);
      } else {
        setStage("idle");
      }
    } catch (e: any) {
      console.warn("No credentials found or user canceled connection. Trying create flow.", e);
      setIsModalOpen(true);
      setStage("idle");
    }
  };

  const handleCreateSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!emailInput || emailInput.trim() === "") return;

    setIsModalOpen(false);
    setStage("scanning");

    try {
      const user = await WalletService.createWallet(emailInput);
      if (user && user.address) {
        setAddress(user.address);
        setStage("connected");
        setWallet(user);
        onConnect?.(emailInput.split('@')[0], user.address);
      }
    } catch (err: any) {
      console.error("Failed to create wallet", err);
      setStage("idle");
      alert("Failed to create Passkey account: " + err?.message);
    }
  };

  const formatAddress = (addr: string) => `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;

  if (stage === "connected" && address) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-panel px-4 py-2 flex items-center gap-3 glow-emerald cursor-pointer hover:border-primary/50"
        onClick={() => {
          WalletService.disconnect();
          setStage("idle");
          setAddress(null);
          setWallet(null);
        }}
      >
        <div className="w-2 h-2 rounded-full bg-primary animate-flicker" />
        <User className="w-4 h-4 text-primary" />
        <span className="font-display text-xs text-primary tracking-wider font-semibold">{formatAddress(address)}</span>
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
        <span className="font-body text-sm text-primary italic">Awaiting OS...</span>
      </motion.div>
    );
  }

  return (
    <div className="relative z-50 flex gap-2 pointer-events-auto">
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className="absolute right-[110%] top-0 glass-panel-strong p-3 flex flex-col gap-3 min-w-[260px] border-secondary/50 glow-purple"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-[10px] uppercase tracking-[0.1em] text-secondary">New Identity</span>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-2">
              <div className="relative flex items-center">
                <Mail className="absolute w-4 h-4 left-3 text-muted-foreground" />
                <input
                  type="email"
                  autoFocus
                  placeholder="name@empire.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-background/50 border border-border/50 rounded pl-9 pr-3 py-2 text-sm font-body focus:outline-none focus:border-secondary/60 focus:ring-1 focus:ring-secondary/30"
                />
              </div>
              <button
                type="submit"
                disabled={!emailInput}
                className="w-full bg-secondary/20 hover:bg-secondary/30 border border-secondary/40 text-secondary-foreground py-2 rounded text-xs font-display flex items-center justify-center gap-2 tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
              >
                PROCEED <ArrowRight className="w-3 h-3" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className="glass-panel px-4 py-3 flex items-center gap-2 cursor-pointer transition-all border-secondary/40 hover:border-secondary text-secondary relative"
      >
        <ShieldCheck className="w-4 h-4" />
        <span className="font-display text-xs font-semibold tracking-[0.1em]">Create Account</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05, boxShadow: "0 0 25px hsl(145 45% 32% / 0.3)" }}
        whileTap={{ scale: 0.95 }}
        onClick={handleConnect}
        className="glass-panel px-6 py-3 flex items-center gap-3 cursor-pointer transition-all duration-300 hover:border-primary/60 group relative"
      >
        <Fingerprint className="w-5 h-5 text-primary group-hover:drop-shadow-[0_0_6px_hsl(145_45%_32%/0.6)]" />
        <span className="font-display text-xs font-semibold text-primary tracking-[0.1em]">
          Sign In
        </span>
      </motion.button>
    </div>
  );
};

export default PasskeyButton;
