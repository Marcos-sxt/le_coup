import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
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
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}




export const Errors = {
  1: {message:"GameNotFound"},
  2: {message:"NotPlayer"},
  3: {message:"GameAlreadyEnded"},
  4: {message:"InvalidState"},
  5: {message:"TimeoutNotReached"},
  6: {message:"InvalidProof"},
  7: {message:"DisputeAlreadyActive"},
  8: {message:"NoDisputeActive"}
}

export type GameStatus = {tag: "Active", values: void} | {tag: "Dispute", values: void} | {tag: "Finished", values: void};


export interface Game {
  accuser: Option<string>;
  claimed_card: Option<u32>;
  dispute_timer: u64;
  p1_commitment: Buffer;
  p2_commitment: Buffer;
  player1: string;
  player1_points: i128;
  player2: string;
  player2_points: i128;
  status: GameStatus;
  winner: Option<string>;
}

export type DataKey = {tag: "Game", values: readonly [u32]} | {tag: "GameHubAddress", values: void} | {tag: "Admin", values: void};

export interface Client {
  /**
   * Construct and simulate a start_game transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Start a new game with commitments
   */
  start_game: ({session_id, player1, player2, player1_points, player2_points, p1_commit, p2_commit}: {session_id: u32, player1: string, player2: string, player1_points: i128, player2_points: i128, p1_commit: Buffer, p2_commit: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a raise_dispute transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Raise a dispute (Challenge a player's claim)
   */
  raise_dispute: ({session_id, challenger, claimed_card}: {session_id: u32, challenger: string, claimed_card: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a resolve_dispute transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Resolve a dispute by providing a ZK proof
   * proof: The ZK proof (stubbed as Bytes for now)
   * This should be called by the DEFENDER (the one who was challenged)
   */
  resolve_dispute: ({session_id, defender, proof}: {session_id: u32, defender: string, proof: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a force_end transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Force end the game if opponent didn't respond in time
   */
  force_end: ({session_id}: {session_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_game transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_game: ({session_id}: {session_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Game>>>

  /**
   * Construct and simulate a set_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_admin: ({new_admin}: {new_admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a upgrade transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  upgrade: ({new_wasm_hash}: {new_wasm_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {admin, game_hub}: {admin: string, game_hub: string},
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
    return ContractClient.deploy({admin, game_hub}, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACAAAAAAAAAAMR2FtZU5vdEZvdW5kAAAAAQAAAAAAAAAJTm90UGxheWVyAAAAAAAAAgAAAAAAAAAQR2FtZUFscmVhZHlFbmRlZAAAAAMAAAAAAAAADEludmFsaWRTdGF0ZQAAAAQAAAAAAAAAEVRpbWVvdXROb3RSZWFjaGVkAAAAAAAABQAAAAAAAAAMSW52YWxpZFByb29mAAAABgAAAAAAAAAURGlzcHV0ZUFscmVhZHlBY3RpdmUAAAAHAAAAAAAAAA9Ob0Rpc3B1dGVBY3RpdmUAAAAACA==",
        "AAAAAgAAAAAAAAAAAAAACkdhbWVTdGF0dXMAAAAAAAMAAAAAAAAAAAAAAAZBY3RpdmUAAAAAAAAAAAAAAAAAB0Rpc3B1dGUAAAAAAAAAAAAAAAAIRmluaXNoZWQ=",
        "AAAAAQAAAAAAAAAAAAAABEdhbWUAAAALAAAAAAAAAAdhY2N1c2VyAAAAA+gAAAATAAAAAAAAAAxjbGFpbWVkX2NhcmQAAAPoAAAABAAAAAAAAAANZGlzcHV0ZV90aW1lcgAAAAAAAAYAAAAAAAAADXAxX2NvbW1pdG1lbnQAAAAAAAPuAAAAIAAAAAAAAAANcDJfY29tbWl0bWVudAAAAAAAA+4AAAAgAAAAAAAAAAdwbGF5ZXIxAAAAABMAAAAAAAAADnBsYXllcjFfcG9pbnRzAAAAAAALAAAAAAAAAAdwbGF5ZXIyAAAAABMAAAAAAAAADnBsYXllcjJfcG9pbnRzAAAAAAALAAAAAAAAAAZzdGF0dXMAAAAAB9AAAAAKR2FtZVN0YXR1cwAAAAAAAAAAAAZ3aW5uZXIAAAAAA+gAAAAT",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAEAAAAAAAAABEdhbWUAAAABAAAABAAAAAAAAAAAAAAADkdhbWVIdWJBZGRyZXNzAAAAAAAAAAAAAAAAAAVBZG1pbgAAAA==",
        "AAAAAAAAABdJbml0aWFsaXplIHRoZSBjb250cmFjdAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAIZ2FtZV9odWIAAAATAAAAAA==",
        "AAAAAAAAACFTdGFydCBhIG5ldyBnYW1lIHdpdGggY29tbWl0bWVudHMAAAAAAAAKc3RhcnRfZ2FtZQAAAAAABwAAAAAAAAAKc2Vzc2lvbl9pZAAAAAAABAAAAAAAAAAHcGxheWVyMQAAAAATAAAAAAAAAAdwbGF5ZXIyAAAAABMAAAAAAAAADnBsYXllcjFfcG9pbnRzAAAAAAALAAAAAAAAAA5wbGF5ZXIyX3BvaW50cwAAAAAACwAAAAAAAAAJcDFfY29tbWl0AAAAAAAD7gAAACAAAAAAAAAACXAyX2NvbW1pdAAAAAAAA+4AAAAgAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAACxSYWlzZSBhIGRpc3B1dGUgKENoYWxsZW5nZSBhIHBsYXllcidzIGNsYWltKQAAAA1yYWlzZV9kaXNwdXRlAAAAAAAAAwAAAAAAAAAKc2Vzc2lvbl9pZAAAAAAABAAAAAAAAAAKY2hhbGxlbmdlcgAAAAAAEwAAAAAAAAAMY2xhaW1lZF9jYXJkAAAABAAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAJtSZXNvbHZlIGEgZGlzcHV0ZSBieSBwcm92aWRpbmcgYSBaSyBwcm9vZgpwcm9vZjogVGhlIFpLIHByb29mIChzdHViYmVkIGFzIEJ5dGVzIGZvciBub3cpClRoaXMgc2hvdWxkIGJlIGNhbGxlZCBieSB0aGUgREVGRU5ERVIgKHRoZSBvbmUgd2hvIHdhcyBjaGFsbGVuZ2VkKQAAAAAPcmVzb2x2ZV9kaXNwdXRlAAAAAAMAAAAAAAAACnNlc3Npb25faWQAAAAAAAQAAAAAAAAACGRlZmVuZGVyAAAAEwAAAAAAAAAFcHJvb2YAAAAAAAPuAAAAIAAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAADVGb3JjZSBlbmQgdGhlIGdhbWUgaWYgb3Bwb25lbnQgZGlkbid0IHJlc3BvbmQgaW4gdGltZQAAAAAAAAlmb3JjZV9lbmQAAAAAAAABAAAAAAAAAApzZXNzaW9uX2lkAAAAAAAEAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAAAAAAAIZ2V0X2dhbWUAAAABAAAAAAAAAApzZXNzaW9uX2lkAAAAAAAEAAAAAQAAA+kAAAfQAAAABEdhbWUAAAAD",
        "AAAAAAAAAAAAAAAJc2V0X2FkbWluAAAAAAAAAQAAAAAAAAAJbmV3X2FkbWluAAAAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAAA" ]),
      options
    )
  }
  public readonly fromJSON = {
    start_game: this.txFromJSON<Result<void>>,
        raise_dispute: this.txFromJSON<Result<void>>,
        resolve_dispute: this.txFromJSON<Result<void>>,
        force_end: this.txFromJSON<Result<void>>,
        get_game: this.txFromJSON<Result<Game>>,
        set_admin: this.txFromJSON<null>,
        upgrade: this.txFromJSON<null>
  }
}