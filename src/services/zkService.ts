// @ts-ignore
import { groth16 } from 'snarkjs';
// @ts-ignore
import { buildPoseidon } from 'circomlibjs';

export interface ProofInput {
    commitment: string;
    targetCard: number;
    card1: number;
    card2: number;
    salt: number | bigint;
}

export type ProofResult = {
    proof: any;
    publicSignals: any;
}

export interface SorobanZKProof {
    a: Buffer;
    b: Buffer;
    c: Buffer;
}

export class ZKProofService {
    private poseidon: any = null;

    async init() {
        if (!this.poseidon) {
            this.poseidon = await buildPoseidon();
        }
    }

    async calculateCommitment(card1: number, card2: number, salt: bigint | number): Promise<string> {
        await this.init();
        const hash = this.poseidon([card1, card2, salt]);
        return this.poseidon.F.toString(hash);
    }

    async generateActionProof(input: ProofInput): Promise<ProofResult> {
        const wasmPath = '/check_hand.wasm';
        const zkeyPath = '/check_hand_final.zkey';

        console.log(`[ZK Layer] Generating BLS12-381 / BN254 snarkjs proof for action...`);
        console.dir({
            commitment: input.commitment,
            targetCard: input.targetCard,
            card1: input.card1,
            card2: input.card2,
            salt: input.salt.toString()
        });

        try {
            const { proof, publicSignals } = await groth16.fullProve(
                input,
                wasmPath,
                zkeyPath
            );
            return { proof, publicSignals };
        } catch (error) {
            console.error("[ZK Layer] Proof Generation Failed:", error);
            throw error;
        }
    }

    formatProofForSoroban(proof: any): SorobanZKProof {
        const to32ByteBuf = (val: string) => {
            const hex = BigInt(val).toString(16).padStart(64, '0');
            return Buffer.from(hex, 'hex');
        };

        const a = Buffer.concat([
            to32ByteBuf(proof.pi_a[0]),
            to32ByteBuf(proof.pi_a[1])
        ]);

        const b = Buffer.concat([
            to32ByteBuf(proof.pi_b[0][1]), // x1, x2 order depends on library, usually G2 coordinates are flipped or bundled
            to32ByteBuf(proof.pi_b[0][0]),
            to32ByteBuf(proof.pi_b[1][1]),
            to32ByteBuf(proof.pi_b[1][0])
        ]);

        const c = Buffer.concat([
            to32ByteBuf(proof.pi_c[0]),
            to32ByteBuf(proof.pi_c[1])
        ]);

        return { a, b, c };
    }
}

export const zkService = new ZKProofService();
