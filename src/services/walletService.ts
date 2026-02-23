import { SmartAccountKit, IndexedDBStorage } from 'smart-account-kit';

const RPC_URL = import.meta.env.VITE_RPC_URL;
const NETWORK_PASSPHRASE = import.meta.env.VITE_NETWORK_PASSPHRASE_TESTNET;
const ACCOUNT_WASM_HASH = import.meta.env.VITE_ACCOUNT_WASM_HASH;
const WEBAUTHN_VERIFIER_ADDRESS = import.meta.env.VITE_WEBAUTHN_VERIFIER_ADDRESS;

if (!RPC_URL || !ACCOUNT_WASM_HASH || !WEBAUTHN_VERIFIER_ADDRESS) {
    console.error("Missing Smart Account Kit configuration in .env");
}

export const kit = new SmartAccountKit({
    rpcUrl: RPC_URL,
    networkPassphrase: NETWORK_PASSPHRASE,
    accountWasmHash: ACCOUNT_WASM_HASH,
    webauthnVerifierAddress: WEBAUTHN_VERIFIER_ADDRESS,
    storage: new IndexedDBStorage(),
});

export interface WalletUser {
    address: string; // The Contract ID (C...) of the Smart Account
    credentialId?: string;
}

export class WalletService {

    /**
     * Connects to an existing wallet session or prompts for Passkey login.
     * @param options { prompt: boolean } Force user prompt
     */
    static async connect(options: { prompt?: boolean } = {}): Promise<WalletUser | null> {
        try {
            console.log("WalletService: Connecting...");
            const result = await kit.connectWallet(options);

            if (result && result.contractId) {
                console.log("WalletService: Connected to", result.contractId);
                return {
                    address: result.contractId,
                    credentialId: result.credentialId
                };
            }
            return null;
        } catch (error) {
            console.error("WalletService: Connection failed", error);
            throw error;
        }
    }

    /**
     * Creates a new Smart Wallet 
     */
    static async createWallet(email: string): Promise<WalletUser> {
        try {
            console.log("WalletService: Starting createWallet flow for", email);
            console.log("WalletService: WebAuthn ID initialized, calling kit.createWallet...");

            // Set a diagnostic timeout
            const timeout = setTimeout(() => {
                console.warn("WalletService: createWallet is taking longer than 15s. Check browser WebAuthn prompts.");
            }, 15000);

            const result = await kit.createWallet('Le Coup', email, {
                autoSubmit: true,
                autoFund: true, // Testnet only
            });

            clearTimeout(timeout);
            const { contractId, credentialId } = result;

            console.log("WalletService: Successfully created account", contractId);
            return { address: contractId, credentialId };
        } catch (error) {
            console.error("WalletService: Creation failed during WebAuthn or Onboarding", error);
            throw error;
        }
    }

    static async signAndSubmit(transaction: any, options?: any) {
        console.log("WalletService: Signing transaction...");
        return await kit.signAndSubmit(transaction, options);
    }

    static async disconnect() {
        await kit.disconnect();
    }

    static getClient() {
        return kit;
    }
}
