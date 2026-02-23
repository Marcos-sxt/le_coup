import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen } from "lucide-react";
import { useGameStore } from "@/store/gameStore";

const GameLog = () => {
  const gameState = useGameStore(state => state.gameState);
  const logs = gameState?.logs || [];

  return (
    <div className="glass-panel p-4 h-full flex flex-col">
      <h3 className="font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
        <BookOpen className="w-3 h-3" />
        Chronicle
      </h3>
      <ScrollArea className="flex-1">
        <div className="space-y-3 pr-2">
          {logs.map((log, i) => {
            const isSystem = log.includes("[ZK]") || log.includes("Game Started");
            const isAction = log.includes("attempts") || log.includes("collected");

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-1 text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-1 h-1 rounded-full ${isSystem ? 'bg-primary' : isAction ? 'bg-accent' : 'bg-secondary'}`} />
                  <span className={`font-body leading-relaxed ${isSystem ? 'text-primary/60 italic' : 'text-foreground/80'}`}>
                    {log}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default GameLog;
