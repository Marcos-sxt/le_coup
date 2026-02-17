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
          ? ["hsl(185, 100%, 50%)", "hsl(300, 100%, 50%)", "hsl(185, 100%, 50%)"]
          : "hsl(185, 40%, 18%)",
      }}
      transition={{ duration: 2, repeat: Infinity }}
      className="glass-panel px-4 py-2 border-2 flex items-center gap-3"
    >
      <motion.div
        animate={isYourTurn ? {
          scale: [1, 1.3, 1],
          boxShadow: [
            "0 0 0px hsl(185, 100%, 50%)",
            "0 0 15px hsl(185, 100%, 50%)",
            "0 0 0px hsl(185, 100%, 50%)",
          ],
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={`w-2.5 h-2.5 rounded-full ${isYourTurn ? "bg-primary" : "bg-muted-foreground/40"}`}
      />
      <span className="font-mono text-sm font-semibold">
        {isYourTurn ? (
          <span className="text-primary neon-text-cyan">YOUR TURN</span>
        ) : (
          <span className="text-muted-foreground">Waiting for {playerName}...</span>
        )}
      </span>
    </motion.div>
  );
};

export default TurnIndicator;
