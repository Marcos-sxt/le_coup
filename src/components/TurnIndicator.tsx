import { motion } from "framer-motion";

interface TurnIndicatorProps {
  isYourTurn: boolean;
  playerName?: string;
}

const TurnIndicator = ({ isYourTurn, playerName = "Opponent" }: TurnIndicatorProps) => {
  return (
    <motion.div
      animate={{
        borderColor: isYourTurn
          ? ["hsl(145, 45%, 32%)", "hsl(275, 50%, 38%)", "hsl(145, 45%, 32%)"]
          : "hsl(150, 20%, 16%)",
      }}
      transition={{ duration: 3, repeat: Infinity }}
      className="glass-panel px-5 py-2.5 border-2 flex items-center gap-3"
    >
      <motion.div
        animate={isYourTurn ? {
          scale: [1, 1.3, 1],
          boxShadow: [
            "0 0 0px hsl(145, 45%, 32%)",
            "0 0 12px hsl(145, 45%, 32%)",
            "0 0 0px hsl(145, 45%, 32%)",
          ],
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        className={`w-2.5 h-2.5 rounded-full ${isYourTurn ? "bg-primary" : "bg-muted-foreground/40"}`}
      />
      <span className="font-display text-sm tracking-wider">
        {isYourTurn ? (
          <span className="text-primary text-glow-emerald">YOUR TURN</span>
        ) : (
          <span className="text-muted-foreground">Waiting for {playerName}...</span>
        )}
      </span>
    </motion.div>
  );
};

export default TurnIndicator;
