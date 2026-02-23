import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
import * as stellarSdk from '@stellar/stellar-sdk';
export { stellarSdk as sdk };
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}




export const Errors = {
  1: { message: "GameNotFound" },
  2: { message: "NotPlayer" },
  3: { message: "GameAlreadyEnded" },
  4: { message: "InvalidState" },
  5: { message: "TimeoutNotReached" },
  6: { message: "InvalidProof" },
  7: { message: "DisputeAlreadyActive" },
  8: { message: "NoDisputeActive" }
}

export type GameStatus = { tag: "Active", values: void } | { tag: "Dispute", values: void } | { tag: "Finished", values: void };

export type Action = { tag: "Income", values: void } | { tag: "ForeignAid", values: void } | { tag: "Tax", values: void } | { tag: "Steal", values: void } | { tag: "Assassinate", values: void } | { tag: "Coup", values: void };


export interface Game {
  accuser: Option<string>;
  claimed_card: Option<u32>;
  dispute_timer: u64;
  p1_commitment: Buffer;
  p1_lives: u32;
  p2_commitment: Buffer;
  p2_lives: u32;
  player1: string;
  player1_points: i128;
  player2: string;
  player2_points: i128;
  status: GameStatus;
  winner: Option<string>;
}


export interface ZKVerificationKey {
  alpha: Buffer;
  beta: Buffer;
  delta: Buffer;
  gamma: Buffer;
  ic: Array<Buffer>;
}


export interface ZKProof {
  a: Buffer;
  b: Buffer;
  c: Buffer;
}

export type DataKey = { tag: "Game", values: readonly [u32] } | { tag: "GameHubAddress", values: void } | { tag: "Admin", values: void } | { tag: "CheckHandVK", values: void } | { tag: "ShiftVK", values: void };

export interface Client {
  /**
   * Construct and simulate a start_game transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Start a new game with commitments
   */
  start_game: ({ session_id, player1, player2, player1_points, player2_points, p1_commit, p2_commit }: { session_id: u32, player1: string, player2: string, player1_points: i128, player2_points: i128, p1_commit: Buffer, p2_commit: Buffer }, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a play_turn transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  play_turn: ({ session_id, player, action }: { session_id: u32, player: string, action: Action }, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a paradigm_shift transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Change a player's commitment (The "Paradigm Shift")
   * player: The player shifting their paradigm
   * new_commit: The new Poseidon hash
   * proof: ZK proof that the transition is valid (stubbed for MVP)
   */
  paradigm_shift: ({ session_id, player, new_commit, proof }: { session_id: u32, player: string, new_commit: Buffer, proof: ZKProof }, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a raise_dispute transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Raise a dispute (Challenge a player's claim)
   */
  raise_dispute: ({ session_id, challenger, claimed_card }: { session_id: u32, challenger: string, claimed_card: u32 }, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a resolve_dispute transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Resolve a dispute by providing a ZK proof
   * proof: The ZK proof (stubbed as Bytes for now)
   * This should be called by the DEFENDER (the one who was challenged)
   */
  resolve_dispute: ({ session_id, defender, proof }: { session_id: u32, defender: string, proof: ZKProof }, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a force_end transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Force end the game if opponent didn't respond in time
   */
  force_end: ({ session_id }: { session_id: u32 }, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_game transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_game: ({ session_id }: { session_id: u32 }, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<Game>>>

  /**
   * Construct and simulate a set_vk transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Set the ZK Verification Key for Groth16 (BN254)
   * circuit_type: 0 for CheckHand, 1 for Shift
   */
  set_vk: ({ circuit_type, vk }: { circuit_type: u32, vk: ZKVerificationKey }, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a set_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_admin: ({ new_admin }: { new_admin: string }, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a upgrade transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  upgrade: ({ new_wasm_hash }: { new_wasm_hash: Buffer }, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Constructor/Initialization Args for the contract's `__constructor` method */
    { admin, game_hub }: { admin: string, game_hub: string },
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy({ admin, game_hub }, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec(["AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACAAAAAAAAAAMR2FtZU5vdEZvdW5kAAAAAQAAAAAAAAAJTm90UGxheWVyAAAAAAAAAgAAAAAAAAAQR2FtZUFscmVhZHlFbmRlZAAAAAMAAAAAAAAADEludmFsaWRTdGF0ZQAAAAQAAAAAAAAAEVRpbWVvdXROb3RSZWFjaGVkAAAAAAAABQAAAAAAAAAMSW52YWxpZFByb29mAAAABgAAAAAAAAAURGlzcHV0ZUFscmVhZHlBY3RpdmUAAAAHAAAAAAAAAA9Ob0Rpc3B1dGVBY3RpdmUAAAAACA==",
        "AAAAAgAAAAAAAAAAAAAACkdhbWVTdGF0dXMAAAAAAAMAAAAAAAAAAAAAAAZBY3RpdmUAAAAAAAAAAAAAAAAAB0Rpc3B1dGUAAAAAAAAAAAAAAAAIRmluaXNoZWQ=",
        "AAAAAgAAAAAAAAAAAAAABkFjdGlvbgAAAAAABgAAAAAAAAAAAAAABkluY29tZQAAAAAAAAAAAAAAAAAKRm9yZWlnbkFpZAAAAAAAAAAAAAAAAAADVGF4AAAAAAAAAAAAAAAABVN0ZWFsAAAAAAAAAAAAAAAAAAALQXNzYXNzaW5hdGUAAAAAAAAAAAAAAAAEQ291cA==",
        "AAAAAQAAAAAAAAAAAAAABEdhbWUAAAANAAAAAAAAAAdhY2N1c2VyAAAAA+gAAAATAAAAAAAAAAxjbGFpbWVkX2NhcmQAAAPoAAAABAAAAAAAAAANZGlzcHV0ZV90aW1lcgAAAAAAAAYAAAAAAAAADXAxX2NvbW1pdG1lbnQAAAAAAAPuAAAAIAAAAAAAAAAIcDFfbGl2ZXMAAAAEAAAAAAAAAA1wMl9jb21taXRtZW50AAAAAAAD7gAAACAAAAAAAAAACHAyX2xpdmVzAAAABAAAAAAAAAAHcGxheWVyMQAAAAATAAAAAAAAAA5wbGF5ZXIxX3BvaW50cwAAAAAACwAAAAAAAAAHcGxheWVyMgAAAAATAAAAAAAAAA5wbGF5ZXIyX3BvaW50cwAAAAAACwAAAAAAAAAGc3RhdHVzAAAAAAfQAAAACkdhbWVTdGF0dXMAAAAAAAAAAAAGd2lubmVyAAAAAAPoAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAAEVpLVmVyaWZpY2F0aW9uS2V5AAAAAAAABQAAAAAAAAAFYWxwaGEAAAAAAAPuAAAAQAAAAAAAAAAEYmV0YQAAA+4AAACAAAAAAAAAAAVkZWx0YQAAAAAAA+4AAACAAAAAAAAAAAVnYW1tYQAAAAAAA+4AAACAAAAAAAAAAAJpYwAAAAAD6gAAA+4AAABA",
        "AAAAAQAAAAAAAAAAAAAAB1pLUHJvb2YAAAAAAwAAAAAAAAABYQAAAAAAA+4AAABAAAAAAAAAAAFiAAAAAAAD7gAAAIAAAAAAAAAAAWMAAAAAAAPuAAAAQA==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABQAAAAEAAAAAAAAABEdhbWUAAAABAAAABAAAAAAAAAAAAAAADkdhbWVIdWJBZGRyZXNzAAAAAAAAAAAAAAAAAAVBZG1pbgAAAAAAAAAAAAAAAAAAC0NoZWNrSGFuZFZLAAAAAAAAAAAAAAAAB1NoaWZ0VksA",
        "AAAAAAAAABdJbml0aWFsaXplIHRoZSBjb250cmFjdAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAIZ2FtZV9odWIAAAATAAAAAA==",
        "AAAAAAAAACFTdGFydCBhIG5ldyBnYW1lIHdpdGggY29tbWl0bWVudHMAAAAAAAAKc3RhcnRfZ2FtZQAAAAAABwAAAAAAAAAKc2Vzc2lvbl9pZAAAAAAABAAAAAAAAAAHcGxheWVyMQAAAAATAAAAAAAAAAdwbGF5ZXIyAAAAABMAAAAAAAAADnBsYXllcjFfcG9pbnRzAAAAAAALAAAAAAAAAA5wbGF5ZXIyX3BvaW50cwAAAAAACwAAAAAAAAAJcDFfY29tbWl0AAAAAAAD7gAAACAAAAAAAAAACXAyX2NvbW1pdAAAAAAAA+4AAAAgAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAAAAAAAJcGxheV90dXJuAAAAAAAAAwAAAAAAAAAKc2Vzc2lvbl9pZAAAAAAABAAAAAAAAAAGcGxheWVyAAAAAAATAAAAAAAAAAZhY3Rpb24AAAAAB9AAAAAGQWN0aW9uAAAAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAL9DaGFuZ2UgYSBwbGF5ZXIncyBjb21taXRtZW50IChUaGUgIlBhcmFkaWdtIFNoaWZ0IikKcGxheWVyOiBUaGUgcGxheWVyIHNoaWZ0aW5nIHRoZWlyIHBhcmFkaWdtCm5ld19jb21taXQ6IFRoZSBuZXcgUG9zZWlkb24gaGFzaApwcm9vZjogWksgcHJvb2YgdGhhdCB0aGUgdHJhbnNpdGlvbiBpcyB2YWxpZCAoc3R1YmJlZCBmb3IgTVZQKQAAAAAOcGFyYWRpZ21fc2hpZnQAAAAAAAQAAAAAAAAACnNlc3Npb25faWQAAAAAAAQAAAAAAAAABnBsYXllcgAAAAAAEwAAAAAAAAAKbmV3X2NvbW1pdAAAAAAD7gAAACAAAAAAAAAABXByb29mAAAAAAAH0AAAAAdaS1Byb29mAAAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAACxSYWlzZSBhIGRpc3B1dGUgKENoYWxsZW5nZSBhIHBsYXllcidzIGNsYWltKQAAAA1yYWlzZV9kaXNwdXRlAAAAAAAAAwAAAAAAAAAKc2Vzc2lvbl9pZAAAAAAABAAAAAAAAAAKY2hhbGxlbmdlcgAAAAAAEwAAAAAAAAAMY2xhaW1lZF9jYXJkAAAABAAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAJtSZXNvbHZlIGEgZGlzcHV0ZSBieSBwcm92aWRpbmcgYSBaSyBwcm9vZgpwcm9vZjogVGhlIFpLIHByb29mIChzdHViYmVkIGFzIEJ5dGVzIGZvciBub3cpClRoaXMgc2hvdWxkIGJlIGNhbGxlZCBieSB0aGUgREVGRU5ERVIgKHRoZSBvbmUgd2hvIHdhcyBjaGFsbGVuZ2VkKQAAAAAPcmVzb2x2ZV9kaXNwdXRlAAAAAAMAAAAAAAAACnNlc3Npb25faWQAAAAAAAQAAAAAAAAACGRlZmVuZGVyAAAAEwAAAAAAAAAFcHJvb2YAAAAAAAfQAAAAB1pLUHJvb2YAAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAADVGb3JjZSBlbmQgdGhlIGdhbWUgaWYgb3Bwb25lbnQgZGlkbid0IHJlc3BvbmQgaW4gdGltZQAAAAAAAAlmb3JjZV9lbmQAAAAAAAABAAAAAAAAAApzZXNzaW9uX2lkAAAAAAAEAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAAAAAAAIZ2V0X2dhbWUAAAABAAAAAAAAAApzZXNzaW9uX2lkAAAAAAAEAAAAAQAAA+kAAAfQAAAABEdhbWUAAAAD",
        "AAAAAAAAAFpTZXQgdGhlIFpLIFZlcmlmaWNhdGlvbiBLZXkgZm9yIEdyb3RoMTYgKEJOMjU0KQpjaXJjdWl0X3R5cGU6IDAgZm9yIENoZWNrSGFuZCwgMSBmb3IgU2hpZnQAAAAAAAZzZXRfdmsAAAAAAAIAAAAAAAAADGNpcmN1aXRfdHlwZQAAAAQAAAAAAAAAAnZrAAAAAAfQAAAAEVpLVmVyaWZpY2F0aW9uS2V5AAAAAAAAAA==",
        "AAAAAAAAAAAAAAAJc2V0X2FkbWluAAAAAAAAAQAAAAAAAAAJbmV3X2FkbWluAAAAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAAA"]),
      options
    )
  }
  public readonly fromJSON = {
    start_game: this.txFromJSON<Result<void>>,
    play_turn: this.txFromJSON<Result<void>>,
    paradigm_shift: this.txFromJSON<Result<void>>,
    raise_dispute: this.txFromJSON<Result<void>>,
    resolve_dispute: this.txFromJSON<Result<void>>,
    force_end: this.txFromJSON<Result<void>>,
    get_game: this.txFromJSON<Result<Game>>,
    set_vk: this.txFromJSON<null>,
    set_admin: this.txFromJSON<null>,
    upgrade: this.txFromJSON<null>
  }
}