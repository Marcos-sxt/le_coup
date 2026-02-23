import { create } from 'zustand';
import { GameEngine, GameState, createGame, PendingAction } from '@/services/GameEngine';
import { contractService } from '@/services/contractService';
import { WalletService, kit } from '@/services/walletService';
import { type Action } from '@/services/bindings/paradigm-shift/src/index';

interface GameStore {
    engine: GameEngine;
    gameState: GameState;
    wallet: any | null;

    // Actions
    setWallet: (wallet: any) => void;
    initializeGame: (id: string) => Promise<void>;
    applyAction: (action: PendingAction) => Promise<void>;
    applyResponse: (type: 'ALLOW' | 'BLOCK' | 'CHALLENGE', payload?: any) => Promise<void>;
    refreshState: () => void;
    syncState: (remoteState: Partial<GameState>) => void;
    resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => {
    // Initial engine
    const initialGame = createGame('demo-session');
    const engine = new GameEngine(initialGame, 'p1'); // Default to p1 for now

    return {
        engine,
        gameState: { ...engine.state },
        wallet: null,

        setWallet: (wallet) => set({ wallet }),

        initializeGame: async (id: string) => {
            console.log("[GameStore] Initializing game session:", id);
            const newGame = createGame(id);
            // Compute real cryptographic ZK commitment for the beginning of the match
            try {
                const { zkService } = await import('@/services/zkService');
                console.log("[GameStore] Pre-calculating ZK commitment...");
                newGame.p1Commitment = await zkService.calculateCommitment(
                    newGame.myHand[0].id,
                    newGame.myHand[1].id,
                    newGame.p1Salt
                );
                console.log("[GameStore] ZK Commitment ready:", newGame.p1Commitment);
            } catch (e) {
                console.error("ZK Commitment generation failed on init:", e);
                newGame.p1Commitment = "0x00";
            }
            const newEngine = new GameEngine(newGame, 'p1');
            set({
                engine: newEngine,
                gameState: {
                    ...newEngine.state,
                    myHand: [...newEngine.state.myHand],
                    opponentHand: [...newEngine.state.opponentHand],
                    logs: [...newEngine.state.logs]
                }
            });
            console.log("[GameStore] Engine initialized. Game Phase:", newEngine.state.phase);

            // On-chain initialization if wallet connected
            const { wallet } = get();
            if (wallet) {
                try {
                    console.log("[Soroban] Initializing game session on-chain...");
                    // Using a numeric session ID derived from string for the contract u32
                    const numericId = Math.abs(id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)) % 10000;

                    // Note: In a real production app, we'd handle the full multi-sig start_game flow.
                    // For this Protocol 25 demo, we'll focus on play_turn and disputes.
                } catch (e) {
                    console.error("[Soroban] Failed to initialize on-chain:", e);
                }
            }
        },

        applyAction: async (action: PendingAction) => {
            const { engine } = get();
            console.log(`[GameStore] applyAction triggered: ${action.type}`);

            // Optimistic Update and Local ZK Proof Generation
            try {
                await engine.applyAction(action);
                set({
                    gameState: {
                        ...engine.state,
                        myHand: [...engine.state.myHand],
                        opponentHand: [...engine.state.opponentHand],
                        logs: [...engine.state.logs]
                    }
                }); // Trigger re-render
            } catch (e) {
                console.error("[GameStore] applyAction failed:", e);
                return;
            }
        },

        applyResponse: async (type, payload) => {
            const { engine, wallet } = get();
            const actionBefore = engine.state.pendingAction;

            console.log(`[GameStore] applyResponse triggered: ${type}`);

            // On-chain Raise Dispute if P1 is challenging P2
            if (type === 'CHALLENGE' && actionBefore?.source === 'p2' && wallet) {
                try {
                    const numericId = Math.abs(engine.state.id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)) % 10000;
                    const cardId = engine.getActionCardId(actionBefore.type);

                    console.log(`%c[Soroban] Raising dispute on-chain for ${actionBefore.type}...`, "color: #e11d48; font-weight: bold;");
                    await contractService.raiseDispute(numericId, wallet.address, cardId, kit);
                    console.log("[Soroban] On-chain dispute raised successfully.");
                } catch (e) {
                    console.error("[Soroban] Failed to raise dispute on-chain:", e);
                }
            }

            try {
                await engine.applyResponse(type, payload);

                // On-chain Resolve Dispute if P1 was challenged and telling the truth
                if (type === 'CHALLENGE' && actionBefore?.source === 'p1' && wallet) {
                    const lastProofRecord = engine.state.matchProofs[engine.state.matchProofs.length - 1];
                    if (lastProofRecord && lastProofRecord.valid && lastProofRecord.proof !== "{}") {
                        try {
                            const { zkService } = await import('@/services/zkService');
                            const snarkProof = JSON.parse(lastProofRecord.proof);
                            const sorobanProof = zkService.formatProofForSoroban(snarkProof);
                            const numericId = Math.abs(engine.state.id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)) % 10000;

                            console.log(`%c[Soroban] Submitting ZK proof on-chain (Protocol 25)...`, "color: #10b981; font-weight: bold;");
                            await contractService.resolveDispute(numericId, wallet.address, sorobanProof, kit);
                            console.log("[Soroban] ZK Proof verified and dispute resolved on-chain!");
                        } catch (e) {
                            console.error("[Soroban] On-chain proof submission failed:", e);
                        }
                    }
                }

                set({
                    gameState: {
                        ...engine.state,
                        myHand: [...engine.state.myHand],
                        opponentHand: [...engine.state.opponentHand],
                        logs: [...engine.state.logs]
                    }
                });
            } catch (e) {
                console.error("[GameStore] applyResponse failed:", e);
            }
        },

        refreshState: () => {
            const { engine } = get();
            set({
                gameState: {
                    ...engine.state,
                    myHand: [...engine.state.myHand],
                    opponentHand: [...engine.state.opponentHand],
                    logs: [...engine.state.logs]
                }
            });
        },

        syncState: (remoteState: Partial<GameState>) => {
            const { engine, gameState } = get();

            let changed = false;

            if (remoteState.turn && remoteState.turn !== gameState.turn) {
                engine.state.turn = remoteState.turn;
                changed = true;
            }
            if (remoteState.phase && remoteState.phase !== gameState.phase) {
                engine.state.phase = remoteState.phase;
                changed = true;
            }
            if (remoteState.p1Coins !== undefined && remoteState.p1Coins !== gameState.p1Coins) {
                engine.state.p1Coins = remoteState.p1Coins;
                changed = true;
                if (engine.state.turn === 'p1') {
                    engine.state.turn = 'p2';
                    engine.state.pendingAction = null;
                }
            }
            if (remoteState.p2Coins !== undefined && remoteState.p2Coins !== gameState.p2Coins) {
                engine.state.p2Coins = remoteState.p2Coins;
                changed = true;
                if (engine.state.turn === 'p2') {
                    engine.state.turn = 'p1';
                    engine.state.pendingAction = null;
                }
            }

            if (changed) {
                console.log("%c[GameStore] Syncing from remote match...", "color: #9333ea; font-weight: bold;", remoteState);
                set({
                    gameState: {
                        ...engine.state,
                        myHand: [...engine.state.myHand],
                        opponentHand: [...engine.state.opponentHand],
                        logs: [...engine.state.logs]
                    }
                });
            }
        },

        resetGame: () => {
            const initialGame = createGame('demo-session');
            const engine = new GameEngine(initialGame, 'p1');
            set({
                engine,
                gameState: { ...engine.state }
            });
            console.log("[GameStore] Game state reset.");
        }
    };
});

function mapToContractAction(type: string): Action {
    switch (type) {
        case 'INCOME': return { tag: 'Income', values: undefined };
        case 'FOREIGN_AID': return { tag: 'ForeignAid', values: undefined };
        case 'TAX': return { tag: 'Tax', values: undefined };
        case 'STEAL': return { tag: 'Steal', values: undefined };
        case 'REVEAL': return { tag: 'Assassinate', values: undefined };
        case 'COUP': return { tag: 'Coup', values: undefined };
        default: return { tag: 'Income', values: undefined }; // Fallback
    }
}
