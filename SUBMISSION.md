# Monad Metropolis Hackathon — Submission Reviewer Guide

**Project**: Circuits Protocol  
**Track**: **Trust, Identity, and AI Infrastructure**  
**Repository**: [https://github.com/hackcat29/circuits-protocol-monad](https://github.com/hackcat29/circuits-protocol-monad)  
**Live Production Web App**: [https://circuitsprotocol.com](https://circuitsprotocol.com) | [https://app.circuitsprotocol.com](https://app.circuitsprotocol.com)  

---

## 📋 Track Evaluation Matrix

| Track Requirement | How Circuits Protocol Solves It | Key Contracts | Live Proofs |
| :--- | :--- | :--- | :--- |
| **1. Agent Identity** | Sovereign ERC-721 / ERC-8004 identity with immutable metadata hashes (prompts, endpoints, capabilities) + autonomous execution wallet delegation (`AgentWalletRegistry`). | `ClawdHQCore.sol`<br>`AgentWalletRegistry.sol` | 5 Autonomous Agents registered on Monad Mainnet (`Agent IDs #1-#5`). |
| **2. Economic Trust** | Economic security bonds (`ClawdHQStaking`) with automated slashing on SLA breach + Decentralized Staked Evaluator Pool for consensus task verification. | `ClawdHQStaking.sol`<br>`ClawdHQEvaluatorPool.sol`<br>`ClawdHQNegotiation.sol` | Live Staking (`0xfc4C...`) & Evaluator Pool (`0xf42B...`) on Monadscan. |
| **3. AI Infrastructure** | High-throughput HTTP 402 micropayments rail + Official Uniswap v4 Hook graduation (`CircuitsAgentHook.sol`) with dynamic fee auto-compounding into reliability bonds and anti-rug liquidity locking on the Monad v4 PoolManager (`0x188d58...`). | `X402Facilitator.sol`<br>`ClawdHQLaunchpad.sol`<br>`CircuitsAgentHook.sol`<br>`UniswapV4GraduationAdapter.sol` | Sub-second settlement (`0xE012...`) and Uniswap v4 Hook on Monadscan. |

---

## ⚡️ 60-Second Reviewer Verification

You can verify our live contracts and registered autonomous agents on Monad Mainnet without needing funds:

```bash
# 1. Clone repository
git clone https://github.com/hackcat29/circuits-protocol-monad.git
cd circuits-protocol-monad

# 2. Install dependencies
npm install

# 3. Verify all 15 live contracts & 5 registered autonomous agents on Monad Mainnet
npm run verify:mainnet
```

Expected output:
```
================================================================================
  Circuits Protocol — Monad Mainnet End-to-End Verification Suite
================================================================================
[1/24] Testing RPC connectivity to Monad Mainnet (Chain ID 143)... PASS
[2/24] Checking USDC contract at 0x754704Bc059F8C67012fEd69BC8A327a5aafb603... PASS
[3/24] Checking AgentWalletRegistry at 0xE17a676753e9fC58101F6cb8050309c73238a30e... PASS
[4/24] Checking ClawdHQCore UUPS proxy at 0xcB30D334c9fb9F7c0e753ef413f5233ACFBC3fAd... PASS
...
================================================================================
  All 24 Verification Checks Passed on Monad Mainnet!
================================================================================
```

---

## 🔗 Key Links

* **Live Application**: [https://circuitsprotocol.com](https://circuitsprotocol.com)
* **Application Dashboard**: [https://app.circuitsprotocol.com](https://app.circuitsprotocol.com)
* **Native Mobile Client**: Located in [`mobile/`](./mobile) with production screenshots
* **Monad Block Explorer**: [https://monadscan.com](https://monadscan.com)
* **Canonical Settlement USDC**: [`0x754704Bc059F8C67012fEd69BC8A327a5aafb603`](https://monadscan.com/address/0x754704Bc059F8C67012fEd69BC8A327a5aafb603)
