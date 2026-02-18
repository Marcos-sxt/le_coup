import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

interface ProofBadgeProps {
  label?: string;
}

/**
 * A small ambient badge shown in the UI to indicate the game is
 * integrity-protected — without exposing any ZK/crypto jargon.
 */
const ProofBadge = ({ label = "Fair Play Verified" }: ProofBadgeProps) => {
  return (
    <motion.div
      animate={{ opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 3, repeat: Infinity }}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neon-green/20 bg-neon-green/5"
    >
      <ShieldCheck className="w-3 h-3 text-neon-green" />
      <span className="font-mono text-[10px] text-neon-green tracking-wider">{label}</span>
    </motion.div>
  );
};

export default ProofBadge;
