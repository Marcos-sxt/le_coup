
import { contractService } from './contractService';
import { WalletService } from './walletService';
import { Keypair, Transaction, Networks } from '@stellar/stellar-sdk';
import { Client } from './bindings/paradigm-shift/src/index';

const DEV_PLAYER2_SECRET = import.meta.env.VITE_DEV_PLAYER2_SECRET;
const DEV_PLAYER1_SECRET = import.meta.env.VITE_DEV_PLAYER1_SECRET;
const RPC_URL = import.meta.env.VITE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const CONTRACT_ID = import.meta.env.VITE_PARADIGM_SHIFT_CONTRACT_ID;

export const DevTestService = {
    async startDevGame() {
        console.log("DevTest: Starting Dev-vs-Dev On-Chain Game...");

        if (!DEV_PLAYER1_SECRET) throw new Error("Missing VITE_DEV_PLAYER1_SECRET");
        const p1Keypair = Keypair.fromSecret(DEV_PLAYER1_SECRET);

        if (!DEV_PLAYER2_SECRET) throw new Error("Missing VITE_DEV_PLAYER2_SECRET");
        const p2Keypair = Keypair.fromSecret(DEV_PLAYER2_SECRET);

        const sessionId = Math.floor(Math.random() * 1000000);
        console.log("DevTest: Session ID:", sessionId);

        const p1Commit = Buffer.alloc(32);
        const p2Commit = Buffer.alloc(32);

        try {
            console.log("DevTest: Initializing game on contract...");

            const client = new Client({
                contractId: CONTRACT_ID,
                networkPassphrase: Networks.TESTNET,
                rpcUrl: RPC_URL,
                publicKey: p1Keypair.publicKey(),
            });

            const tx = await client.start_game({
                session_id: sessionId,
                player1: p1Keypair.publicKey(),
                player2: p2Keypair.publicKey(),
                player1_points: 2n,
                player2_points: 2n,
                p1_commit: p1Commit,
                p2_commit: p2Commit
            });

            const simulated = await tx.simulate();

            await simulated.signAndSend({
                signTransaction: async (chkXdr) => {
                    const txObj = new Transaction(chkXdr, Networks.TESTNET);
                    txObj.sign(p1Keypair);
                    // txObj.sign(p2Keypair); // Removed since auth disabled
                    return { signedTxXdr: txObj.toXDR() };
                }
            });

            console.log("DevTest: Game Started! Session:", sessionId);
            alert(`Game Started! ID: ${sessionId}`);
            return sessionId.toString();

        } catch (e) {
            console.error(e);
            alert("Failed to start dev game. Check console.");
            throw e;
        }
    },

    async probeContract() {
        console.log("DevTest: Probing contract state (get_game)...");
        const sessionId = 0;
        const game = await contractService.getGame(sessionId);
        console.log("DevTest: getGame result:", game);
        if (game === null) {
            console.log("DevTest: Success! Contract returned null (GameNotFound), meaning we connected.");
            alert("Contract Connection Verified: GameNotFound (Expected)");
        } else {
            console.log("DevTest: Success! Game found.");
            alert("Contract Connection Verified: Game Found");
        }
    },

    async simulateOpponentTurn(sessionIdStr: string) {
        if (!DEV_PLAYER2_SECRET) throw new Error("Missing P2 Secret");
        const p2Keypair = Keypair.fromSecret(DEV_PLAYER2_SECRET);
        const p2Address = p2Keypair.publicKey();

        const sessionId = parseInt(sessionIdStr.replace('session-', ''));
        if (isNaN(sessionId)) {
            console.error("Invalid session ID for simulation");
            alert("Invalid Session ID. Start a real game first.");
            return;
        }

        console.log("DevTest: Simulating Opponent (P2) Turn...");

        const game = await contractService.getGame(sessionId);
        if (!game) {
            console.error("Game not found on chain");
            alert("Game not found on-chain. Did you start it?");
            return;
        }

        const currentP1 = Number(game.player1_points);
        const currentP2 = Number(game.player2_points);

        const newP2 = currentP2 + 1;
        console.log(`DevTest: P2 (${p2Address}) playing turn. Points: ${currentP2} -> ${newP2}`);

        try {
            const tx = await contractService.playTurn(sessionId, p2Address, currentP1, newP2);

            const simulated = await tx.simulate();

            await simulated.signAndSend({
                signTransaction: async (chkXdr) => {
                    const txObj = new Transaction(chkXdr, Networks.TESTNET);
                    txObj.sign(p2Keypair);
                    return { signedTxXdr: txObj.toXDR() };
                }
            });

            console.log("DevTest: Opponent turn submitted!");
            alert("Opponent Action Submitted! Wait for polling...");
        } catch (e) {
            console.error("DevTest: Failed to simulate turn", e);
            alert("Failed to simulate turn. Check console.");
        }
    }
};
