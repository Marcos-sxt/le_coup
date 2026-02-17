import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal } from "lucide-react";

interface LogEntry {
  id: number;
  player: string;
  action: string;
  timestamp: string;
  type: "action" | "challenge" | "block" | "system";
}

const mockLog: LogEntry[] = [
  { id: 1, player: "System", action: "Game started. Stakes: 50 XLM", timestamp: "00:00", type: "system" },
  { id: 2, player: "You", action: "Income (+1 coin)", timestamp: "00:12", type: "action" },
  { id: 3, player: "Opponent", action: "Claimed Duke — Tax (+3 coins)", timestamp: "00:24", type: "action" },
  { id: 4, player: "You", action: "Steal from Opponent (Captain)", timestamp: "00:38", type: "action" },
  { id: 5, player: "Opponent", action: "⚡ CHALLENGED your Captain!", timestamp: "00:45", type: "challenge" },
  { id: 6, player: "System", action: "ZK Proof verified — Captain confirmed ✓", timestamp: "00:48", type: "system" },
  { id: 7, player: "Opponent", action: "Lost 1 influence (challenge failed)", timestamp: "00:49", type: "system" },
  { id: 8, player: "Opponent", action: "Foreign Aid (+2 coins)", timestamp: "01:02", type: "action" },
  { id: 9, player: "You", action: "Blocked Foreign Aid (Duke)", timestamp: "01:08", type: "block" },
];

const typeColors: Record<LogEntry["type"], string> = {
  action: "text-foreground/80",
  challenge: "text-secondary",
  block: "text-neon-gold",
  system: "text-primary/60",
};

const GameLog = () => {
  return (
    <div className="glass-panel p-4 h-full flex flex-col">
      <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
        <Terminal className="w-3 h-3" />
        Game Log
      </h3>
      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-2">
          {mockLog.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-2 text-xs"
            >
              <span className="font-mono text-muted-foreground/50 shrink-0 w-10">
                {entry.timestamp}
              </span>
              <span className={`font-mono ${typeColors[entry.type]}`}>
                <span className="text-primary/80 font-semibold">{entry.player}</span>
                {" — "}
                {entry.action}
              </span>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default GameLog;
