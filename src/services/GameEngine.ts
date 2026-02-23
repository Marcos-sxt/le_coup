export enum CardId {
    LION = 1,
    SPIDER = 2,
    SNAKE = 3,
    CROW = 4,
    CHAMELEON = 5
}

export const ID_TO_NAME: Record<number, string> = {
    1: 'LION',
    2: 'SPIDER',
    3: 'SNAKE',
    4: 'CROW',
    5: 'CHAMELEON'
};

export type Card = {
    id: number; // 1=LION, 2=SPIDER, 3=SNAKE, 4=CROW, 5=CHAMELEON
    revealedPublic: boolean;
    revealedToOpponent: boolean;
    isDead: boolean;
    cooldown: number;
    revealedCountdown: number;
};

export type PlayerId = 'p1' | 'p2';

export type GamePhase = 'MAIN_TURN' | 'ACTION_RESPONSE' | 'BLOCK_RESPONSE' | 'CHALLENGE_RESPONSE' | 'RESOLVING';

export interface PendingAction {
    type: string;
    source: PlayerId;
    target: PlayerId;
    payload?: any;
    blocker?: PlayerId;
    blockCardId?: number;
    challenger?: PlayerId;
}

export interface ZkProofRecord {
    action: string;
    source: PlayerId;
    valid: boolean;
    proof: string;
    timestamp: number;
}

export interface GameState {
    id: string;
    myHand: Card[];
    opponentHand: Card[];
    p1Coins: number;
    p2Coins: number;
    p1Lives: number;
    p2Lives: number;
    p1Salt: number;
    p1Commitment: string;
    turn: PlayerId;
    winner: PlayerId | 'draw' | null;
    logs: string[];
    phase: GamePhase;
    pendingAction: PendingAction | null;
    matchProofs: ZkProofRecord[];
}

export class GameEngine {
    state: GameState;
    myPlayerId: PlayerId;

    constructor(initialState: GameState, myId: PlayerId) {
        this.state = initialState;
        this.myPlayerId = myId;
    }

    // --- Core Logic ---

    // Check win condition
    private checkWinCondition() {
        const p1Alive = this.state.myHand.some(c => !c.isDead);
        const p2Alive = this.state.opponentHand.some(c => !c.isDead);

        if (!p1Alive) this.state.winner = 'p2';
        else if (!p2Alive) this.state.winner = 'p1';
    }

    private log(msg: string) {
        console.log(`%c[GameEngine] ${msg}`, "color: #10b981; font-weight: bold;");
        this.state.logs = [...this.state.logs, msg];
    }

    // Apply ACTION
    public async applyAction(action: PendingAction) {
        console.group(`[GameEngine] Applying Action: ${action.type}`);
        console.log("Source:", action.source, "Target:", action.target, "Payload:", action.payload);

        if (this.state.phase !== 'MAIN_TURN') {
            console.error("Action rejected: Not in MAIN_TURN phase. Current phase:", this.state.phase);
            console.groupEnd();
            throw new Error("Not in main turn phase");
        }
        if (this.state.turn !== action.source) {
            console.error("Action rejected: Not player's turn. Turn:", this.state.turn, "Action Source:", action.source);
            console.groupEnd();
            throw new Error("Not your turn");
        }

        if (['INCOME', 'COUP', 'COUP_DE_GRACE'].includes(action.type)) {
            console.log("Unstoppable action. Resolving immediately...");
            this.state.phase = 'RESOLVING';
            await this.resolveAction(action);
        } else if (['TAX', 'STEAL', 'REVEAL', 'FOREIGN_AID', 'EXCHANGE'].includes(action.type)) {
            console.log("Interruptible action. Waiting for response...");
            this.state.pendingAction = action;
            this.state.phase = 'ACTION_RESPONSE';
            this.log(`${action.source} attempts ${action.type}`);
        }
        console.groupEnd();
    }

    // Apply RESPONSE (Allow, Block, Challenge)
    public async applyResponse(actionType: 'ALLOW' | 'BLOCK' | 'CHALLENGE', payload?: any) {
        console.group(`[GameEngine] Applying Response: ${actionType}`);
        if (!this.state.pendingAction) {
            console.warn("[GameEngine] Response ignored: No pending action found (likely already resolved).");
            console.groupEnd();
            return; // Exit silently to avoid UI crashes
        }

        if (actionType === 'ALLOW') {
            if (this.state.phase === 'BLOCK_RESPONSE') {
                console.log("Block allowed. Canceling action...");
                this.log(`Block accepted. Action ${this.state.pendingAction.type} was canceled.`);
                this.state.pendingAction = null;
                this.state.phase = 'MAIN_TURN';
                this.nextTurn();
            } else {
                console.log("Action allowed. Resolving...");
                this.state.phase = 'RESOLVING';
                await this.resolveAction(this.state.pendingAction);
            }
        } else if (actionType === 'BLOCK') {
            console.log("Action blocked. Setting blocker to:", this.state.turn === 'p1' ? 'p2' : 'p1');
            this.state.pendingAction.blocker = this.state.turn === 'p1' ? 'p2' : 'p1';
            this.state.pendingAction.blockCardId = payload.cardId;
            this.state.phase = 'BLOCK_RESPONSE';
            this.log(`Blocked with ${payload.cardId}`);
        } else if (actionType === 'CHALLENGE') {
            console.warn("Challenge initiated!");
            const action = this.state.pendingAction;
            this.log(`Challenge raised by ${this.state.turn === 'p1' ? 'p2' : 'p1'} against ${action.source}'s ${action.type}!`);

            let isLying = false;
            if (action.source === 'p1') {
                // For P1, we check the accrued ZK metadata (or bluff record)
                // In a real ZK system, we'd verify the proof here. 
                // For this prototype, our engine already knows if it was a bluff.
                const lastProof = this.state.matchProofs[this.state.matchProofs.length - 1];
                isLying = lastProof ? !lastProof.valid : true;
            } else {
                // For P2 (AI), we verify against their current hand
                const targetCardId = this.getActionCardId(action.type);
                const aiHand = this.state.opponentHand;
                isLying = !aiHand.some(c => c.id === targetCardId && !c.isDead);
            }

            if (isLying) {
                this.log(`SUCCESS! ${action.source} was caught lying!`);
                this.eliminateCard(action.source);
            } else {
                this.log(`FAIL! ${action.source} was telling the truth! Challenger loses a card.`);
                const challenger = action.source === 'p1' ? 'p2' : 'p1';
                this.eliminateCard(challenger);

                // If the player was truthful, their action proceeds
                this.log(`Action ${action.type} proceeds after failed challenge.`);
                await this.resolveAction(action);
            }
            this.state.pendingAction = null;
            this.nextTurn();
        }
        console.groupEnd();
    }

    private async resolveAction(action: PendingAction) {
        const isP1 = action.source === 'p1';
        console.log(`[GameEngine] Resolving ${action.type} for ${action.source}`);

        if (action.type === 'TAX') {
            if (isP1) this.state.p1Coins += 3; else this.state.p2Coins += 3;
            this.log(`${action.source} collected TAX (+3 coins)`);
        } else if (action.type === 'INCOME') {
            if (isP1) this.state.p1Coins += 1; else this.state.p2Coins += 1;
            this.log(`${action.source} collected INCOME (+1 coin)`);
        } else if (action.type === 'FOREIGN_AID') {
            if (isP1) this.state.p1Coins += 2; else this.state.p2Coins += 2;
            this.log(`${action.source} collected FOREIGN AID (+2 coins)`);
        } else if (action.type === 'STEAL') {
            const stealAmount = isP1 ? Math.min(2, this.state.p2Coins) : Math.min(2, this.state.p1Coins);
            if (isP1) {
                this.state.p1Coins += stealAmount;
                this.state.p2Coins -= stealAmount;
            } else {
                this.state.p2Coins += stealAmount;
                this.state.p1Coins -= stealAmount;
            }
            this.log(`${action.source} STOLE ${stealAmount} coins from ${action.target}`);
        } else if (action.type === 'REVEAL') {
            if (isP1) this.state.p1Coins -= 3; else this.state.p2Coins -= 3;
            const targetHand = isP1 ? this.state.opponentHand : this.state.myHand;
            const idx = action.payload?.targetCardIndex;

            let victim = null;
            if (idx !== undefined && targetHand[idx] && !targetHand[idx].isDead) {
                victim = targetHand[idx];
            } else {
                const validTargets = targetHand.filter(c => !c.isDead && c.revealedCountdown === 0);
                if (validTargets.length > 0) victim = validTargets[0];
            }

            if (victim) {
                victim.revealedCountdown = 3;
                victim.revealedPublic = true;
                this.log(`${action.source} REVEALED a card from ${action.target} for 3 turns!`);
            }
        } else if (action.type === 'COUP') {
            if (isP1) this.state.p1Coins -= 7; else this.state.p2Coins -= 7;
            const targetHand = isP1 ? this.state.opponentHand : this.state.myHand;
            const idx = action.payload?.targetCardIndex;

            let victim = null;
            if (idx !== undefined && targetHand[idx] && !targetHand[idx].isDead) {
                victim = targetHand[idx];
            } else {
                const validTargets = targetHand.filter(c => !c.isDead);
                if (validTargets.length > 0) victim = validTargets[0];
            }

            if (victim) {
                victim.isDead = true;
                victim.revealedPublic = true;
                this.log(`${action.source} used a COUP against ${action.target}! A card was eliminated.`);
            }
        } else if (action.type === 'EXCHANGE') {
            const deckIds = [1, 2, 3, 4, 5];
            const allCards = [...this.state.myHand, ...this.state.opponentHand];
            const usedIds = allCards.map(c => c.id);
            const courtId = deckIds.find(id => !usedIds.includes(id)) || 5;

            const sourceHand = isP1 ? this.state.myHand : this.state.opponentHand;
            const validTargets = sourceHand.filter(c => !c.isDead);
            if (validTargets.length > 0) {
                const cardToSwap = validTargets[0];
                cardToSwap.id = courtId;
                this.log(`${action.source} EXCHANGED a card with the court deck.`);

                if (isP1) {
                    await this.recomputeP1Commitment();
                }
            }
        } else if (action.type === 'COUP_DE_GRACE') {
            const guess1 = action.payload.card1;
            const guess2 = action.payload.card2;
            const targetHand = isP1 ? this.state.opponentHand : this.state.myHand;
            const aliveCards = targetHand.filter(c => !c.isDead);
            const actualIds = aliveCards.map(c => c.id).sort();

            const guessIds = [
                Object.keys(ID_TO_NAME).find(key => ID_TO_NAME[parseInt(key)] === guess1),
                Object.keys(ID_TO_NAME).find(key => ID_TO_NAME[parseInt(key)] === guess2)
            ].filter(Boolean).map(id => parseInt(id as string)).sort();

            // Logic: If target has 2 cards, must guess BOTH correct.
            // If target has 1 card, must guess that 1 card correctly (either guess1 or guess2 matches it).
            let isCorrect = false;
            if (actualIds.length === 2) {
                isCorrect = actualIds.length === guessIds.length && actualIds.every((val, index) => val === guessIds[index]);
            } else if (actualIds.length === 1) {
                isCorrect = guessIds.includes(actualIds[0]);
            }

            if (isCorrect) {
                this.log(`${action.source} used COUP DE GRACE and guessed correctly! WINS!`);
                this.state.winner = action.source;
                targetHand.forEach(c => { c.isDead = true; c.revealedPublic = true; });
            } else {
                this.log(`${action.source} used COUP DE GRACE but guessed incorrectly. Severe penalty.`);
                const sourceHand = isP1 ? this.state.myHand : this.state.opponentHand;
                const sourceValid = sourceHand.filter(c => !c.isDead);
                if (sourceValid.length > 0) {
                    sourceValid[0].isDead = true;
                    sourceValid[0].revealedPublic = true;
                }
            }
        }

        await this.generateRealProof(action);
        this.checkWinCondition();
        this.nextTurn();
    }

    private async generateRealProof(action: PendingAction) {
        const isP1 = action.source === 'p1';
        if (!isP1) return;

        const sourceHand = this.state.myHand;
        let targetCardId = 0;

        if (action.type === 'TAX') targetCardId = CardId.LION;
        else if (action.type === 'STEAL') targetCardId = CardId.CROW;
        else if (action.type === 'REVEAL') targetCardId = CardId.SPIDER;
        else if (action.type === 'EXCHANGE') targetCardId = CardId.CHAMELEON;
        else return;

        const hasCard = sourceHand.some(c => c.id === targetCardId && !c.isDead);

        if (!hasCard) {
            console.warn(`%c[ZK Layer] BLUFF DETECTED. Action: ${action.type}. Skipping snarkjs proof generation.`, "color: #f59e0b; font-weight: bold;");
            this.state.matchProofs.push({
                action: action.type,
                source: 'p1',
                valid: false,
                proof: "{}",
                timestamp: Date.now()
            });
            this.log(`[ZK] Bluff for ${action.type} recorded.`);
            return;
        }

        console.log(`%c[ZK Layer] Generating real snarkjs proof for ${action.type}...`, "color: #3b82f6; font-weight: bold;");

        try {
            const { zkService } = await import('@/services/zkService');
            console.log("[ZK Layer] Input mapping:", { commitment: this.state.p1Commitment, targetCard: targetCardId });
            const { proof } = await zkService.generateActionProof({
                commitment: this.state.p1Commitment,
                targetCard: targetCardId,
                card1: sourceHand[0].id,
                card2: sourceHand[1].id,
                salt: this.state.p1Salt
            });
            console.log("[ZK Layer] Proof generated successfully.");

            this.state.matchProofs.push({
                action: action.type,
                source: 'p1',
                valid: true,
                proof: JSON.stringify(proof),
                timestamp: Date.now()
            });
            this.log(`[ZK] Proof for ${action.type} accrued.`);
        } catch (e) {
            console.error("[ZK Layer] Proof Generation Failed:", e);
            this.state.matchProofs.push({
                action: action.type,
                source: 'p1',
                valid: false,
                proof: "{}",
                timestamp: Date.now()
            });
            this.log(`[ZK] Proof FAILED for ${action.type}. Player likely lied or system error.`);
        }
    }

    public getActionCardId(type: string): number {
        switch (type) {
            case 'TAX': return CardId.LION;
            case 'STEAL': return CardId.CROW;
            case 'REVEAL': return CardId.SPIDER;
            case 'EXCHANGE': return CardId.CHAMELEON;
            default: return 0;
        }
    }

    public getActionCardName(type: string): string {
        const id = this.getActionCardId(type);
        return ID_TO_NAME[id] || "UNKNOWN";
    }

    private eliminateCard(playerId: PlayerId) {
        const hand = playerId === 'p1' ? this.state.myHand : this.state.opponentHand;
        const validCards = hand.filter(c => !c.isDead);

        if (validCards.length > 0) {
            // In a real game, the player chooses which card to lose.
            // For this version, we lose the first valid card.
            const cardToLose = validCards[0];
            cardToLose.isDead = true;
            cardToLose.revealedPublic = true;
            this.log(`${playerId} lost their ${ID_TO_NAME[cardToLose.id]} influence.`);

            if (playerId === 'p1') this.state.p1Lives--;
            else this.state.p2Lives--;

            if (this.state.p1Lives <= 0) {
                this.state.winner = 'p2';
                this.log("GAME OVER! p2 wins!");
            } else if (this.state.p2Lives <= 0) {
                this.state.winner = 'p1';
                this.log("GAME OVER! p1 wins!");
            }
        }
    }

    private async recomputeP1Commitment() {
        console.log(`%c[ZK Layer] Re-calculating P1 Commitment after EXCHANGE...`, "color: #3b82f6; font-weight: bold;");
        try {
            const { zkService } = await import('@/services/zkService');
            this.state.p1Commitment = await zkService.calculateCommitment(
                this.state.myHand[0].id,
                this.state.myHand[1].id,
                this.state.p1Salt
            );
            console.log("[ZK Layer] P1 Commitment updated successfully:", this.state.p1Commitment);
        } catch (e) {
            console.error("[ZK Layer] Failed to recompute commitment:", e);
        }
    }

    private nextTurn() {
        if (this.state.winner) {
            this.state.phase = 'MAIN_TURN'; // Final state
            return;
        }

        const nextPlayer = this.state.turn === 'p1' ? 'p2' : 'p1';
        const nextPlayerHand = nextPlayer === 'p1' ? this.state.myHand : this.state.opponentHand;

        nextPlayerHand.forEach(card => {
            if (card.revealedCountdown > 0) {
                card.revealedCountdown -= 1;
                if (card.revealedCountdown === 0 && !card.isDead) {
                    card.revealedPublic = false;
                    this.log(`${nextPlayer} card hidden again.`);
                }
            }
        });

        console.log(`%c[GameEngine] Turn complete. Next Player: ${nextPlayer}`, "color: #fbbf24;");
        this.state.turn = nextPlayer;
        this.state.phase = 'MAIN_TURN';
        this.state.pendingAction = null;
    }

    public getAuditData() {
        return {
            sessionId: this.state.id,
            startCommitment: this.state.p1Commitment,
            p1Salt: this.state.p1Salt,
            p1Hand: this.state.myHand.map(c => c.id),
            proofs: this.state.matchProofs,
            winner: this.state.winner
        };
    }
}

export function createGame(id: string = '0', p1Coins: number = 2, p2Coins: number = 2): GameState {
    const deckIds = [1, 2, 3, 4, 5];
    for (let i = deckIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deckIds[i], deckIds[j]] = [deckIds[j], deckIds[i]];
    }

    const buildHand = (ids: number[]): Card[] => ids.map(id => ({
        id, revealedPublic: false, revealedToOpponent: false, isDead: false, cooldown: 0, revealedCountdown: 0
    }));

    return {
        id,
        myHand: buildHand(deckIds.slice(0, 2)),
        opponentHand: buildHand(deckIds.slice(2, 4)),
        p1Coins, p2Coins, p1Lives: 2, p2Lives: 2,
        p1Salt: Math.floor(Math.random() * 1000000000),
        p1Commitment: "",
        turn: 'p1',
        winner: null,
        logs: ["Game Started."],
        phase: 'MAIN_TURN',
        pendingAction: null,
        matchProofs: []
    };
}
