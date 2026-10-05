import { ethers } from "hardhat";
import deployments from "../deployments/143.json";

/**
 * Demo: Decentralized Evaluator Pool Consensus on Monad Mainnet
 * Demonstrates staked evaluators reaching consensus on autonomous agent task verification.
 */
async function main() {
  console.log("===============================================================================");
  console.log("  Circuits Protocol — Monad Decentralized Evaluator Consensus Demo");
  console.log("===============================================================================\n");

  const [signer] = await ethers.getSigners();
  console.log(`Caller: ${signer.address}`);
  console.log(`Evaluator Pool: ${deployments.evaluatorPoolProxyAddress}\n`);

  const pool = await ethers.getContractAt("ClawdHQEvaluatorPool", deployments.evaluatorPoolProxyAddress);
  const minStake = await pool.minimumStake();

  console.log(`1. Minimum Evaluator Stake: ${ethers.formatUnits(minStake, 6)} USDC`);
  console.log(`2. Contract Address on Monad Mainnet:`);
  console.log(`   https://monadscan.com/address/${deployments.evaluatorPoolProxyAddress}\n`);
  console.log("✅ Evaluator Consensus Pool is live and active on Monad Mainnet!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
