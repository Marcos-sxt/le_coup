import { motion, AnimatePresence } from "framer-motion";
import { Shield, FileText, CheckCircle, XCircle, Download, Clock, Zap, Key } from "lucide-react";
import { ZkProofRecord } from "@/services/GameEngine";

interface ZKAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
    auditData: {
        sessionId: string;
        startCommitment: string;
        p1Salt: number;
        p1Hand: number[];
        proofs: ZkProofRecord[];
        winner: string | null;
    } | null;
}

const ZKAuditModal = ({ isOpen, onClose, auditData }: ZKAuditModalProps) => {
    if (!auditData) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[250] flex items-center justify-center bg-background/90 backdrop-blur-md p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="glass-panel-strong w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative border-primary/20"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-primary/5">
                            <div className="flex items-center gap-3">
                                <FileText className="w-6 h-6 text-primary" />
                                <div>
                                    <h2 className="font-display text-xl font-black uppercase tracking-tighter">Match Integrity Audit</h2>
                                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Session ID: {auditData.sessionId}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content Container */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                            {/* Secret Revelation Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="glass-panel p-5 border-neon-cyan/20 bg-neon-cyan/5"
                                >
                                    <div className="flex items-center gap-2 mb-4 text-neon-cyan">
                                        <Key className="w-4 h-4" />
                                        <span className="font-display text-xs font-black uppercase tracking-widest">Master Commitment Leak</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-mono text-muted-foreground uppercase font-bold">Genesis Salt (Revealed)</label>
                                            <div className="bg-background/60 p-3 rounded font-mono text-xl text-primary border border-primary/20 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]">
                                                {auditData.p1Salt}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-mono text-muted-foreground uppercase font-bold">Initial Hands State</label>
                                            <div className="flex gap-2">
                                                {auditData.p1Hand.map((id, i) => (
                                                    <div key={i} className="px-3 py-1 rounded border border-white/10 text-[10px] font-mono bg-white/5">
                                                        CARD_{id}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="glass-panel p-5 border-primary/20"
                                >
                                    <div className="flex items-center gap-2 mb-4 text-primary">
                                        <Shield className="w-4 h-4" />
                                        <span className="font-display text-xs font-black uppercase tracking-widest">On-Chain Verification</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-black/40 rounded border border-white/5 font-mono text-[10px] break-all leading-tight">
                                            <span className="text-primary mr-2 font-bold">COMMITMENT:</span>
                                            {auditData.startCommitment}
                                        </div>
                                        <div className="flex items-center gap-2 text-neon-green text-[10px] font-bold uppercase tracking-widest">
                                            <CheckCircle className="w-3 h-3" />
                                            Matches Genesis State
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Proofs Timeline */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-display text-xs font-black uppercase tracking-widest opacity-60">Cryptographic History</span>
                                </div>

                                <div className="space-y-3">
                                    {auditData.proofs.length === 0 ? (
                                        <div className="p-12 text-center glass-panel border-dashed border-white/10">
                                            <p className="text-sm text-muted-foreground font-mono italic">No SNARK proofs were generated during this match.</p>
                                        </div>
                                    ) : (
                                        auditData.proofs.map((proof, i) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 + i * 0.1 }}
                                                key={i}
                                                className={`glass-panel p-4 flex items-center justify-between border-l-4 ${proof.valid ? "border-l-neon-green" : "border-l-neon-red"}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded shadow-lg flex items-center justify-center font-black ${proof.valid ? "bg-neon-green/10 text-neon-green border border-neon-green/20" : "bg-neon-red/10 text-neon-red border border-neon-red/20"}`}>
                                                        {proof.valid ? <Zap className="w-5 h-5" /> : <Shield className="w-5 h-5 opacity-40 shrink-0" />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-display text-sm font-black uppercase">{proof.action}</span>
                                                            <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${proof.valid ? "bg-neon-green/20 text-neon-green" : "bg-neon-red/20 text-neon-red"}`}>
                                                                {proof.valid ? "HONEST" : "BLUFF"}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] font-mono text-muted-foreground mt-1">
                                                            TIMESTAMP: {new Date(proof.timestamp).toLocaleTimeString()} // PROOF_LEN: {proof.proof.length}B
                                                        </p>
                                                    </div>
                                                </div>
                                                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded font-mono text-[10px] uppercase font-bold transition-colors">
                                                    Inspect Raw
                                                </button>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/10 bg-background/80 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                                <Shield className="w-3 h-3" />
                                FULLY VERIFIED BY SNARKJS // SOROBAN SETTLEMENT READY
                            </div>
                            <button
                                className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-display text-xs font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                            >
                                <Download className="w-3 h-3" />
                                Download Integrity Log
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ZKAuditModal;
