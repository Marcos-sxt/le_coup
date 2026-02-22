import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

interface ProofBadgeProps {
  label?: string;
}

const ProofBadge = ({ label = "Wards Active" }: ProofBadgeProps) => {
  return (
    <motion.div
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 4, repeat: Infinity }}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-primary/20 bg-primary/5"
    >
      <ShieldCheck className="w-3 h-3 text-primary" />
      <span className="font-display text-[9px] text-primary tracking-[0.15em]">{label}</span>
    </motion.div>
  );
};

export default ProofBadge;
