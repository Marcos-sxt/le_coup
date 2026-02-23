# Le Coup zk - Game Tutorial 🃏

Welcome to **Le Coup zk**, a trustless, zero-knowledge adaptation of the classic deduction game "Coup", built on the Stellar network. In this game, your hand is hidden and your actions can be bluffs, but the cryptographic truth is always verified!

## Objective
Be the last player standing. Every player starts with **2 Lives** (representing your two hidden influence cards) and initial **Coins**. When you lose both your lives, you are out of the game.

## The Paradigm (Smart Contracts & Privacy)
Instead of revealing your hand to a centralized server, your hand is committed to the Stellar blockchain via a **Poseidon Hash Commitment**. Your cards are kept strictly private on your device. Opponents and the blockchain only see a cryptographic hash!

---

## Core Actions
On your turn, you may choose one of the following actions. Some actions explicitly require a character "Card" to play, but you can always choose to **Bluff**!

### Standard Actions (No card required)
*These actions are available to anyone and cannot be challenged for lying.*
- **💰 Income:** Take 1 coin from the bank. (Cannot be blocked)
- **🤝 Foreign Aid:** Take 2 coins from the bank. (Can be blocked by the Lion)
- **🗡️ Coup:** Pay 7 coins to launch a Coup. Target opponent loses 1 life immediately. (Cannot be blocked or challenged)

### Character Actions (Card required... or bluff!)
*If you declare one of these actions, you are claiming to hold the corresponding card.*
- **👑 Tax (Lion / Duke):** Take 3 coins from the bank.
- **🔪 Assassinate (Spider / Assassin):** Pay 3 coins. Target opponent loses 1 life. *(Can be blocked by the Snake)*
- **🏴‍☠️ Steal (Crow / Captain):** Take 2 coins from the target opponent. *(Can be blocked by another Crow or the Chameleon)*

---

## 🔐 ZK-Powered Mechanics
The true magic of *Le Coup zk* lies in our cryptographic mechanics:

### 1. 🛡️ Challenges & Dispute Resolution
If you claim to play a character action (like Tax) and an opponent doesn't believe you, they can raise a **Challenge**.
- If challenged, you must prove you are telling the truth by generating a **Zero-Knowledge Proof (ZK-SNARK)** in your browser!
- This proof computationally verifies that your hidden hand (the one matching your on-chain hash commitment) actually contains the card you claimed.
- **If your proof is mathematically valid:** You win the challenge, and the challenger loses 1 life for doubting you.
- **If you were bluffing:** Your proof will fail (or you won't be able to generate one). You will lose 1 life for lying.
- *Everything is verified securely by the Soroban smart contract using X-Ray (Stellar Protocol 25) BN254 host functions.*

### 2. 🌀 The Paradigm Shift (Exchange)
Players can perform a "Paradigm Shift" (inspired by the Chameleon / Ambassador action) to secretly swap a card in their hand for a new one.
- You generate a **ZK Proof** proving that your new hidden hand correctly transitions from your old hand (changing exactly 1 card to a valid new card).
- You prove this *without ever revealing which card you swapped or what your new card is!*
- The smart contract mathematically verifies the proof before accepting your new locked commitment.

---

## How to play
1. Click **Connect Wallet** (or use your Passkey Smart Account for gasless transactions).
2. You will be matched with an opponent on the Stellar Testnet.
3. Your hand of 2 cards will be dealt and secretly hashed on-chain.
4. Take turns performing actions or bluffing.
5. Use the "Challenge" button if you think your opponent is lying about their cards!
6. Survive, eliminate your opponent's influence, and win the game!

**Good luck, and may the most clever bluffer win!** 🃏✨
