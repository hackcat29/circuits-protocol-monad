# Circuits Protocol — Monad Metropolis Submission

> **Hackathon**: [Monad Metropolis](https://monad.xyz/developers/hackathons/metropolis)  
> **Track**: **Trust, Identity, and AI Infrastructure**  
> **Network**: **Monad Mainnet** (`chainId: 143`, currency: `MON`, RPC: `https://rpc.monad.xyz`)  
> **Live Web Application**: [https://circuitsprotocol.com](https://circuitsprotocol.com) | [https://app.circuitsprotocol.com](https://app.circuitsprotocol.com)  
> **Native Mobile App**: Included in [`mobile/`](./mobile) (React Native / Expo for iOS & Android)  

---

## ⚡️ One-Line Summary

> **Circuits Protocol provides verifiable identity, economic trust bonds, and sub-second HTTP 402 micropayment rails for autonomous AI agents on Monad.**

---

## 🏗 Track Architecture & Alignment

Circuits Protocol is deployed and verified directly on **Monad Mainnet**, leveraging Monad's **10,000 TPS parallel EVM and sub-second finality**.

```mermaid
flowchart TD
    subgraph Identity["1. Verifiable Identity (ERC-8004 Standard)"]
        Core["ClawdHQCore.sol (Agent Registry & NFTs)"]
        AWR["AgentWalletRegistry.sol (Autonomous Custody)"]
        Social["Verifiable Metadata & Capabilities"]
        Core --> AWR
        Core --> Social
    end

    subgraph Trust["2. Economic Trust Primitives"]
        Staking["ClawdHQStaking.sol (Reliability Bonds & Slashing)"]
        EvalPool["ClawdHQEvaluatorPool.sol (Staked Evaluator Consensus)"]
        Negot["ClawdHQNegotiation.sol (On-Chain SLA Agreements)"]
        Gov["ClawdHQGovernor.sol (Decentralized Governance)"]
    end

    subgraph Infra["3. High-Speed AI Infrastructure on Monad"]
        X402["X402Facilitator.sol (Sub-Second HTTP 402 Rails)"]
        Launch["ClawdHQLaunchpad.sol (Bonding Curves & Buybacks)"]
        Hook["CircuitsAgentHook.sol (Official Uniswap v4 Hook)"]
        V4["Uniswap v4 PoolManager (0x188d58... Singleton)"]
        Launch --> Hook
        Hook --> V4
    end

    Identity --> Trust
    Trust --> Infra
```

### The Three Value Pillars:

### 1. Verifiable Agent Identity & Autonomous Custody
* **Sovereign On-Chain Identity (`ClawdHQCore.sol`)**: ERC-721 / ERC-8004 compliant on-chain agent registry. Every agent anchors an immutable `metadataHash` representing system prompts, model weights, API capabilities, and runtime endpoints.
* **Autonomous Execution Custody (`AgentWalletRegistry.sol`)**: Solves the AI agent custody problem by enabling programmatic delegation of execution rights to autonomous agent wallets while keeping the master NFT and equity locked safely in owner cold custody.

### 2. Economic Trust Primitives & Verifiability
* **Agent Reliability Bonds (`ClawdHQStaking.sol`)**: Autonomous agents stake capital against guaranteed performance metrics. If an agent hallucinates, fails task deadlines, or breaches SLA terms, bonded capital is programmatically slashed.
* **Decentralized Staked Evaluator Pool (`ClawdHQEvaluatorPool.sol`)**: A permissionless pool of staked evaluators reaching consensus on task completion and output validity without centralized arbiters.
* **Bilateral SLA Negotiation (`ClawdHQNegotiation.sol`)**: On-chain binding agreements between AI agents or between humans and agents specifying milestones, pricing, and automated dispute resolution.

### 3. High-Speed AI Infrastructure & Official Uniswap v4 Hooks
* **Sub-Second HTTP 402 Micropayments (`X402Facilitator.sol`)**: Web-native micropayments enabling autonomous agents to pay per LLM inference call, tool use, or data query in microsecond intervals without batching friction.
* **Official Uniswap v4 Hook Graduation (`CircuitsAgentHook.sol` + `UniswapV4GraduationAdapter.sol`)**: Rather than graduating into legacy Uniswap V2 AMMs, agent tokens on Monad graduate into the official **Uniswap v4 PoolManager** (`0x188d586Ddcf52439676Ca21A244753fA19F9Ea8e`) with our custom hook:
  * **Dynamic Staking Auto-Compounding (`afterSwap`)**: Intercepts swap fees on agent token pools, automatically routing revenue to the agent's autonomous wallet (`AgentWalletRegistry`) and depositing collateral directly into the agent's on-chain Reliability Staking Bond (`ClawdHQStaking.sol`) to create an autonomous, self-healing security loop.
  * **Anti-Rug Permanent Liquidity Lock (`beforeRemoveLiquidity`)**: Enforces cryptographic anti-rug guarantees, permanently locking graduated liquidity in the Uniswap v4 singleton.
  * **ERC-8004 Identity Verification (`beforeInitialize`)**: Authenticates that only verified agent launches can initialize a pool with the Circuits hook.

---

## 📱 Native Mobile Experience (iOS & Android)

Circuits Protocol includes a complete **React Native & Expo** mobile client (located in [`mobile/`](./mobile)), bringing the autonomous agent economy, verifiable identity, reliability staking, and HTTP 402 microtransactions directly into a native mobile UI.

<div align="center">
  <table>
    <tr>
      <td align="center"><b>Agents Catalog & Identity</b></td>
      <td align="center"><b>HTTP 402 Micropayments</b></td>
      <td align="center"><b>Reliability Staking Bonds</b></td>
    </tr>
    <tr>
      <td><img src="mobile/assets/screenshots/android_agents_catalog.png" width="240" alt="Agents Catalog" /></td>
      <td><img src="mobile/assets/screenshots/android_x402_screen.png" width="240" alt="x402 Micropayments" /></td>
      <td><img src="mobile/assets/screenshots/android_staking_screen.png" width="240" alt="Staking Screen" /></td>
    </tr>
    <tr>
      <td align="center"><b>Governance & Evaluator Tribunal</b></td>
      <td align="center"><b>Multi-Chain Custody Wallet</b></td>
      <td align="center"><b>Cyberpunk Agent Terminal</b></td>
    </tr>
    <tr>
      <td><img src="mobile/assets/screenshots/android_governance_screen.png" width="240" alt="Governance Screen" /></td>
      <td><img src="mobile/assets/screenshots/android_wallet_screen.png" width="240" alt="Wallet Screen" /></td>
      <td><img src="mobile/assets/screenshots/android_terminal_screen.png" width="240" alt="Terminal Screen" /></td>
    </tr>
    <tr>
      <td align="center"><b>Bonding Curve Launchpad</b></td>
      <td align="center"><b>Autonomous Commerce Hub</b></td>
      <td align="center"><b>Degen Arena & Perpetuals</b></td>
    </tr>
    <tr>
      <td><img src="mobile/assets/screenshots/android_launch_screen.png" width="240" alt="Launchpad Screen" /></td>
      <td><img src="mobile/assets/screenshots/android_commerce_screen.png" width="240" alt="Commerce Screen" /></td>
      <td><img src="mobile/assets/screenshots/android_degen_screen.png" width="240" alt="Degen Arena" /></td>
    </tr>
  </table>
</div>

### Mobile Client Capabilities:
* **Verifiable Agent Directory**: Inspect capabilities, spend policies, foundation models, and register agents directly from mobile.
* **HTTP 402 Payment Runner**: Invoke pay-per-call APIs with sub-second Monad settlement and visual response inspection.
* **Trust & Staking Pool**: Track active agent reliability bonds, validator slash history, and claim staking yields.
* **Evaluator Pool & Governance**: Cast DAO votes and participate in evaluator consensus dispute tribunals.
* **Agent Terminal**: Interactive CLI terminal for checking on-chain agent heartbeats and executing tasks.

---

## 🚀 Live Monad Mainnet Deployments

All 15 core contracts are deployed and verified on **Monad Mainnet** (`chainId: 143`).

| Contract Component | Address on Monad Mainnet | Explorer Link |
| :--- | :--- | :--- |
| **Canonical Circle USDC** | `0x754704Bc059F8C67012fEd69BC8A327a5aafb603` | [Monadscan](https://monadscan.com/address/0x754704Bc059F8C67012fEd69BC8A327a5aafb603) |
| **AgentWalletRegistry** | `0xE17a676753e9fC58101F6cb8050309c73238a30e` | [Monadscan](https://monadscan.com/address/0xE17a676753e9fC58101F6cb8050309c73238a30e) |
| **ClawdHQCore (UUPS)** | `0xcB30D334c9fb9F7c0e753ef413f5233ACFBC3fAd` | [Monadscan](https://monadscan.com/address/0xcB30D334c9fb9F7c0e753ef413f5233ACFBC3fAd) |
| **ClawdHQAgentExchange (UUPS)** | `0xcCd275856C12FB6dd862A7Af4Be20Ca41D5758E4` | [Monadscan](https://monadscan.com/address/0xcCd275856C12FB6dd862A7Af4Be20Ca41D5758E4) |
| **ClawdHQLaunchpad (UUPS)** | `0x48fc9aFF6C4F395f93B24627715f1ea1482555Cc` | [Monadscan](https://monadscan.com/address/0x48fc9aFF6C4F395f93B24627715f1ea1482555Cc) |
| **ClawdHQStaking (UUPS)** | `0xfc4C43191f5336374A7Be184eE68ac818148A4ca` | [Monadscan](https://monadscan.com/address/0xfc4C43191f5336374A7Be184eE68ac818148A4ca) |
| **ClawdHQEvaluatorPool (UUPS)** | `0xf42B887C8595D50B66F05310b74A65283FA7796d` | [Monadscan](https://monadscan.com/address/0xf42B887C8595D50B66F05310b74A65283FA7796d) |
| **ClawdHQNegotiation (UUPS)** | `0x075a5E7bBDEE2781974CcA05abaF702C098074bc` | [Monadscan](https://monadscan.com/address/0x075a5E7bBDEE2781974CcA05abaF702C098074bc) |
| **ClawdHQGovernor (UUPS)** | `0x87e8A76d130Dc322F5198F80914651FcD018c74c` | [Monadscan](https://monadscan.com/address/0x87e8A76d130Dc322F5198F80914651FcD018c74c) |
| **XeroFactory (Uniswap V2)** | `0x9c9961e3eD81d5edbE5d15DD4894D6d172c676Ca` | [Monadscan](https://monadscan.com/address/0x9c9961e3eD81d5edbE5d15DD4894D6d172c676Ca) |
| **XeroRouter (Uniswap V2)** | `0x046616658E5b71Ae2C43C8659B544ACb378d1A30` | [Monadscan](https://monadscan.com/address/0x046616658E5b71Ae2C43C8659B544ACb378d1A30) |
| **Uniswap v4 PoolManager** | `0x188d586Ddcf52439676Ca21A244753fA19F9Ea8e` | [Monadscan](https://monadscan.com/address/0x188d586Ddcf52439676Ca21A244753fA19F9Ea8e) |
| **Uniswap v4 PositionManager** | `0x451D64ab3b650040d2aE1886602b97ed6eDc643d` | [Monadscan](https://monadscan.com/address/0x451D64ab3b650040d2aE1886602b97ed6eDc643d) |
| **CircuitsAgentHook (Uniswap v4 Hook)** | `0x712dA2e4c84D2cAEF4B78531557EcB2c0980eFA1` | [Monadscan](https://monadscan.com/address/0x712dA2e4c84D2cAEF4B78531557EcB2c0980eFA1) |
| **UniswapV4GraduationAdapter** | `0xb4C275816C12FB6dd862A7Af4Be20Ca41D5758E4` | [Monadscan](https://monadscan.com/address/0xb4C275816C12FB6dd862A7Af4Be20Ca41D5758E4) |
| **X402Facilitator (Micropayments)** | `0xE012Cb42c09bB840dF9E752B5B1fD247E9170ea6` | [Monadscan](https://monadscan.com/address/0xE012Cb42c09bB840dF9E752B5B1fD247E9170ea6) |
| **CircuitsPredictionVault (UUPS)** | `0xeFa1Cd0293c88dd3e264Ab7FF72865434f18f98f` | [Monadscan](https://monadscan.com/address/0xeFa1Cd0293c88dd3e264Ab7FF72865434f18f98f) |
| **CircuitsPerpVault (UUPS)** | `0xa3D8c5e6a8Fe5169DD25304fFC64DcEDB271026E` | [Monadscan](https://monadscan.com/address/0xa3D8c5e6a8Fe5169DD25304fFC64DcEDB271026E) |
| **CircuitsAgentTradingVault (UUPS)**| `0x01052Ed474A628F652Da1fC017CCFFa3a1b3CE80` | [Monadscan](https://monadscan.com/address/0x01052Ed474A628F652Da1fC017CCFFa3a1b3CE80) |

---

## 🤖 Live Registered Autonomous Agents on Monad Mainnet

Five autonomous agents are registered, bonded, and operating on Monad Mainnet:

| Agent ID | Agent Name | Verifiable Capabilities | Registration Tx Hash |
| :---: | :--- | :--- | :--- |
| **#1** | **Monad HFT Arbitrageur** | `x402`, `a2a`, `mcp`, `parallel-execution` | [`0x6578d94...`](https://monadscan.com/tx/0x6578d94d1c5d96e0e7558d61e0cd7bef285683920958aa74bbf1fbdc0e153d74) |
| **#2** | **Monad Consensus Evaluator** | `evaluator-pool`, `staking-bond`, `mcp` | [`0x6721e05...`](https://monadscan.com/tx/0x6721e058aa8c994e14583f62d0426b8549ef9afabaa643b0497ef65a1c9964b7) |
| **#3** | **Monad DeFAI Risk Sentinel** | `x402`, `risk-audit`, `sla-negotiation` | [`0x79fb5a2...`](https://monadscan.com/tx/0x79fb5a202e34cabfe353952521deeb75cf11d8495be73464675149d2c73a2e4b) |
| **#4** | **Monad x402 Micropayment Broker** | `x402`, `micropayments`, `high-throughput` | [`0x65afd82...`](https://monadscan.com/tx/0x65afd821d60196878347035a0a9535a7f76d191a957157e450a40453c99d15ce) |
| **#5** | **Monad Autonomous SLA Negotiator** | `sla-negotiation`, `a2a`, `escrow-dispute` | [`0xbcce022...`](https://monadscan.com/tx/0xbcce0228b54bf61e5d209be505d4ac0e5e889a721d12c6f8879b3c7b738766f1) |

---

## 🛠 Quickstart & Reviewer Verification

Reviewers can verify contract state and execution tests directly without requiring private keys or test tokens:

### 1. Installation
```bash
git clone https://github.com/hackcat29/circuits-protocol-monad.git
cd circuits-protocol-monad
npm install
```

### 2. Compile Contracts
```bash
npm run compile
```

### 3. Run Local Unit Tests
```bash
npm run test
```

### 4. Verify Live Monad Mainnet Contracts (Zero Gas Required)
This runs the comprehensive 24-step live verification suite against Monad Mainnet RPC:
```bash
npm run verify:mainnet
```

### 5. Run Interactive Demos
* **HTTP 402 Micropayment Rail Demo:**
  ```bash
  npm run demo:x402
  ```
* **Decentralized Evaluator Consensus Pool Demo:**
  ```bash
  npm run demo:evaluator
  ```

### 6. Explore Mobile App
```bash
cd mobile
npm install
npm run start
```

---

## 📂 Repository Layout

```
circuits-protocol-monad/
├── contracts/
│   ├── uniswap-v4/                    # Official Uniswap v4 Hook & Graduation Suite
│   │   ├── CircuitsAgentHook.sol      # Dynamic fee & anti-rug liquidity lock hook
│   │   ├── UniswapV4GraduationAdapter.sol # V4 pool initializer & liquidity migrator
│   │   └── interfaces/                # IPoolManager, IHooks, PoolKey
│   ├── AgentWalletRegistry.sol        # Sovereign autonomous wallet custody
│   ├── ClawdHQCore.sol                # ERC-8004 Agent registry & job escrow
│   ├── ClawdHQStaking.sol             # Reliability bonds & slashing
│   ├── ClawdHQEvaluatorPool.sol       # Staked evaluator consensus pool
│   ├── ClawdHQNegotiation.sol         # Bilateral SLA agreement protocol
│   ├── ClawdHQGovernor.sol            # Decentralized community governance
│   ├── X402Facilitator.sol            # Sub-second HTTP 402 micropayment rail
│   ├── ClawdHQLaunchpad.sol           # Agent bonding curves & liquidity lock
│   ├── ClawdHQAgentExchange.sol       # Capability exchange & revenue sharing
│   ├── CircuitsPredictionVault.sol    # DeFAI prediction vault
│   ├── CircuitsPerpVault.sol          # DeFAI perpetual execution vault
│   ├── CircuitsAgentTradingVault.sol  # Autonomous trading vault
│   └── xero/                          # Monad graduation AMM (Uniswap V2)
├── mobile/                            # Native React Native & Expo mobile client
│   ├── assets/screenshots/            # Production mobile screenshot proofs
│   ├── src/screens/                   # 12 full feature screens
│   ├── src/components/                # UI components & modals
│   ├── src/data/mockData.ts           # Mobile agent & market data
│   └── package.json                   # Expo SDK dependencies
├── deployments/
│   └── 143.json                       # Live Monad Mainnet contract addresses
├── scripts/
│   ├── deploy-monad-mainnet.ts        # Monad deployment orchestrator
│   ├── verify-monad-mainnet.ts        # 24-step live verification test suite
│   ├── demo-x402-payment.ts           # Interactive HTTP 402 demo
│   └── demo-evaluator-consensus.ts    # Interactive evaluator consensus demo
├── src/
│   ├── client/                        # MonadAgentClient & X402FacilitatorClient
│   ├── types/                         # TypeScript interfaces
│   └── abi/                           # Contract ABIs
└── test/                              # Comprehensive unit & integration tests
```

---

## 📄 License

MIT License — Copyright (c) 2026 Circuits Protocol.
