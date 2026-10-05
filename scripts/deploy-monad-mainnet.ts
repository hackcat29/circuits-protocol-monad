import { ethers, network } from "hardhat";
import * as fs from "node:fs";
import * as path from "node:path";
import { readDeployment, updateDeployment } from "./lib/deployments";

import deployCore from "./00-deploy-core";
import deployExchange from "./01-deploy-exchange";
import deployLaunchpad from "./01b-deploy-launchpad";
import grantRoles from "./01-grant-roles";
import deployStaking from "./02c-deploy-staking";
import deployEvaluatorPool from "./02d-deploy-evaluator-pool";
import deployNegotiation from "./02e-deploy-negotiation";
import deployGovernor from "./02h-deploy-governor";
import deployXero from "./02i-deploy-xero";
import configureFeesAndRouter from "./06-configure-fees-and-router";
import setBondingParams from "./07-set-bonding-params";
import deployPredictionVault from "./02j-deploy-prediction-vault";
import deployPerpVault from "./02k-deploy-perp-vault";
import deployAgentTradingVault from "./02l-deploy-agent-trading-vault";

/**
 * Master orchestrator for full Monad Mainnet deployment.
 * Chain ID: 143 (0x8f)
 * Currency: MON (18 decimals)
 * Canonical Circle USDC: 0x754704Bc059F8C67012fEd69BC8A327a5aafb603
 */
const CANONICAL_MONAD_MAINNET_USDC = "0x754704Bc059F8C67012fEd69BC8A327a5aafb603";

async function retryTx<T>(fn: () => Promise<T>, label: string, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      if (i === retries - 1) throw err;
      console.warn(`[Retry] ${label} failed with ${err.message || err}, retrying in 3s... (attempt ${i + 2}/${retries})`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw new Error(`Exhausted retries for ${label}`);
}

async function main() {
  const chainId = network.config.chainId;
  if (chainId !== 143) {
    throw new Error(`deploy_monad_mainnet_full must run on monadMainnet (chainId 143), got ${chainId} (${network.name})`);
  }

  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(deployerAddress);
  console.log("===============================================================================");
  console.log("       CIRCUITS PROTOCOL — MONAD MAINNET DEPLOYMENT (CHAIN ID 143)             ");
  console.log("       10,000 TPS Parallel EVM Production Deployment                           ");
  console.log("===============================================================================");
  console.log(`Deployer: ${deployerAddress}`);
  console.log(`Balance:  ${ethers.formatEther(balance)} MON`);
  console.log(`Block:    ${await ethers.provider.getBlockNumber()}`);
  console.log("===============================================================================\n");

  if (balance === 0n) {
    throw new Error(
      `Deployer ${deployerAddress} has zero MON balance on Monad Mainnet.\n` +
      `Please fund this address with MON before running deployment.`
    );
  }

  // --------------------------------------------------------------------------
  // Step 1: Resolve Canonical Circle USDC (6 decimals)
  // --------------------------------------------------------------------------
  const usdcAddress = process.env.NEXT_PUBLIC_MONAD_MAINNET_USDC_ADDRESS || CANONICAL_MONAD_MAINNET_USDC;
  console.log(`[USDC] Using canonical Monad Mainnet Circle USDC: ${usdcAddress}`);
  process.env.NEXT_PUBLIC_MONAD_MAINNET_USDC_ADDRESS = usdcAddress;
  process.env.MONAD_MAINNET_USDC_ADDRESS = usdcAddress;

  const existingRecord = readDeployment(143);

  // --------------------------------------------------------------------------
  // Step 2: Deploy ClawdHQCore (+ AgentWalletRegistry)
  // --------------------------------------------------------------------------
  console.log("\n--- [Step 2] Deploying Core & AgentWalletRegistry ---");
  const coreAddress = await deployCore();

  // --------------------------------------------------------------------------
  // Step 3: Deploy ClawdHQAgentExchange
  // --------------------------------------------------------------------------
  console.log("\n--- [Step 3] Deploying ClawdHQAgentExchange ---");
  const exchangeAddress = await deployExchange();

  // --------------------------------------------------------------------------
  // Step 4: Deploy ClawdHQLaunchpad
  // --------------------------------------------------------------------------
  console.log("\n--- [Step 4] Deploying ClawdHQLaunchpad ---");
  const launchpadAddress = await deployLaunchpad();

  // --------------------------------------------------------------------------
  // Step 5: Grant Roles
  // --------------------------------------------------------------------------
  console.log("\n--- [Step 5] Granting Roles ---");
  await grantRoles();

  // --------------------------------------------------------------------------
  // Step 6: Deploy ClawdHQStaking
  // --------------------------------------------------------------------------
  console.log("\n--- [Step 6] Deploying ClawdHQStaking ---");
  const stakingAddress = await deployStaking();

  // --------------------------------------------------------------------------
  // Step 7: Deploy ClawdHQEvaluatorPool
  // --------------------------------------------------------------------------
  console.log("\n--- [Step 7] Deploying ClawdHQEvaluatorPool ---");
  const evaluatorPoolAddress = await deployEvaluatorPool();

  // --------------------------------------------------------------------------
  // Step 8: Deploy ClawdHQNegotiation
  // --------------------------------------------------------------------------
  console.log("\n--- [Step 8] Deploying ClawdHQNegotiation ---");
  const negotiationAddress = await deployNegotiation();

  // --------------------------------------------------------------------------
  // Step 9: Deploy ClawdHQGovernor
  // --------------------------------------------------------------------------
  console.log("\n--- [Step 9] Deploying ClawdHQGovernor ---");
  const governorAddress = await deployGovernor();

  // --------------------------------------------------------------------------
  // Step 10: Deploy Xero Protocol (Uniswap V2 fork)
  // --------------------------------------------------------------------------
  console.log("\n--- [Step 10] Deploying Xero Protocol ---");
  const { xeroFactoryAddress, xeroRouterAddress } = await deployXero();

  // --------------------------------------------------------------------------
  // Step 11: Configure Fees and Wire Xero Router to Launchpad
  // --------------------------------------------------------------------------
  console.log("\n--- [Step 11] Wiring Xero Router to Launchpad ---");
  process.env.UNISWAP_V2_ROUTER_ADDRESS = xeroRouterAddress;
  await configureFeesAndRouter();

  // --------------------------------------------------------------------------
  // Step 12: Set Launchpad Bonding Curve Params
  // --------------------------------------------------------------------------
  console.log("\n--- [Step 12] Setting Launchpad Bonding Curve Defaults ---");
  process.env.GRADUATION_THRESHOLD_USDC = "19000";
  process.env.INITIAL_VIRTUAL_USDC_RESERVE = "4000";
  await setBondingParams();

  // --------------------------------------------------------------------------
  // Step 13: Wire Core Authorizations
  // --------------------------------------------------------------------------
  console.log("\n--- [Step 13] Connecting Core Authorizations ---");
  const core = await ethers.getContractAt("ClawdHQCore", coreAddress);
  const staking = await ethers.getContractAt("ClawdHQStaking", stakingAddress);

  await retryTx(async () => {
    const currentStaking = await core.stakingContract();
    if (currentStaking.toLowerCase() !== stakingAddress.toLowerCase()) {
      console.log(`[Wiring] Setting core.stakingContract -> ${stakingAddress}...`);
      await (await core.setStakingContract(stakingAddress)).wait();
    }
  }, "Set Staking Contract");

  await retryTx(async () => {
    const isSlasher = await staking.authorizedSlashers(coreAddress);
    if (!isSlasher) {
      console.log(`[Wiring] Authorizing core as slasher on staking contract...`);
      await (await staking.setAuthorizedSlasher(coreAddress, true)).wait();
    }
  }, "Set Authorized Slasher");

  await retryTx(async () => {
    const currentEvaluatorPool = await core.evaluatorPoolContract();
    if (currentEvaluatorPool.toLowerCase() !== evaluatorPoolAddress.toLowerCase()) {
      console.log(`[Wiring] Setting core.evaluatorPoolContract -> ${evaluatorPoolAddress}...`);
      await (await core.setEvaluatorPoolContract(evaluatorPoolAddress)).wait();
    }
  }, "Set Evaluator Pool Contract");

  await retryTx(async () => {
    const isNegotiationTrusted = await core.trustedNegotiationContracts(negotiationAddress);
    if (!isNegotiationTrusted) {
      console.log(`[Wiring] Setting core trustedNegotiationContracts(${negotiationAddress}) -> true...`);
      await (await core.setTrustedNegotiationContract(negotiationAddress, true)).wait();
    }
  }, "Set Trusted Negotiation Contract");

  // --------------------------------------------------------------------------
  // Step 14: Deploy X402Facilitator (HTTP 402 Micro-payments for AI Agents)
  // --------------------------------------------------------------------------
  console.log("\n--- [Step 14] Deploying X402Facilitator ---");
  let x402Address = existingRecord?.x402FacilitatorAddress;
  if (!x402Address) {
    const FacilitatorFactory = await ethers.getContractFactory("X402Facilitator");
    const facilitatorContract = await FacilitatorFactory.deploy(deployerAddress, usdcAddress, deployerAddress);
    await facilitatorContract.waitForDeployment();
    x402Address = await facilitatorContract.getAddress();
    console.log(`[X402] Facilitator deployed at ${x402Address}`);
    updateDeployment(143, {
      x402FacilitatorAddress: x402Address,
      x402FacilitatorDeployedAt: new Date().toISOString(),
    });
  } else {
    console.log(`[X402] Reusing existing X402Facilitator at ${x402Address}`);
  }

  // --------------------------------------------------------------------------
  // Step 15: Deploy Circuits Degen Suite (Prediction, Perp, AgentTradingVault)
  // --------------------------------------------------------------------------
  console.log("\n--- [Step 15] Deploying Circuits Degen Suite ---");
  const predictionVaultAddress = await retryTx(() => deployPredictionVault(), "Deploy Prediction Vault");
  const perpVaultAddress = await retryTx(() => deployPerpVault(), "Deploy Perp Vault");
  const agentTradingVaultAddress = await retryTx(() => deployAgentTradingVault(), "Deploy Agent Trading Vault");

  // --------------------------------------------------------------------------
  // Step 16: Read Final Record & Print Deployment Summary
  // --------------------------------------------------------------------------
  const finalRecord = readDeployment(143);
  console.log("\n===============================================================================");
  console.log("           MONAD MAINNET DEPLOYMENT COMPLETE! ADDRESS SUMMARY                  ");
  console.log("===============================================================================");
  console.log(`Circle USDC (6 decimals):        ${finalRecord?.usdcAddress}`);
  console.log(`AgentWalletRegistry:             ${finalRecord?.agentWalletRegistryAddress}`);
  console.log(`ClawdHQCore Proxy:               ${finalRecord?.proxyAddress}`);
  console.log(`ClawdHQCore Impl:                ${finalRecord?.implementationAddress}`);
  console.log(`ClawdHQAgentExchange Proxy:      ${finalRecord?.exchangeProxyAddress}`);
  console.log(`ClawdHQLaunchpad Proxy:          ${finalRecord?.launchpadProxyAddress}`);
  console.log(`ClawdHQStaking Proxy:            ${finalRecord?.stakingProxyAddress}`);
  console.log(`ClawdHQEvaluatorPool Proxy:      ${finalRecord?.evaluatorPoolProxyAddress}`);
  console.log(`ClawdHQNegotiation Proxy:        ${finalRecord?.negotiationProxyAddress}`);
  console.log(`ClawdHQGovernor Proxy:           ${finalRecord?.governorProxyAddress}`);
  console.log(`XeroFactory:                     ${finalRecord?.xeroFactoryAddress}`);
  console.log(`XeroRouter:                      ${finalRecord?.xeroRouterAddress}`);
  console.log(`X402Facilitator:                 ${finalRecord?.x402FacilitatorAddress}`);
  console.log(`CircuitsPredictionVault Proxy:   ${finalRecord?.predictionVaultProxyAddress}`);
  console.log(`CircuitsPerpVault Proxy:         ${finalRecord?.perpVaultProxyAddress}`);
  console.log(`CircuitsAgentTradingVault Proxy: ${finalRecord?.agentTradingVaultProxyAddress}`);
  console.log("===============================================================================\n");

  console.log("=== Copy & Paste the following into your .env and apps/web/.env.local ===\n");
  console.log(`NEXT_PUBLIC_MONAD_MAINNET_RPC_URL="https://rpc.monad.xyz"`);
  console.log(`NEXT_PUBLIC_MONAD_MAINNET_USDC_ADDRESS="${finalRecord?.usdcAddress}"`);
  console.log(`NEXT_PUBLIC_MONAD_MAINNET_CONTRACT_ADDRESS="${finalRecord?.proxyAddress}"`);
  console.log(`NEXT_PUBLIC_MONAD_MAINNET_EXCHANGE_ADDRESS="${finalRecord?.exchangeProxyAddress}"`);
  console.log(`NEXT_PUBLIC_MONAD_MAINNET_LAUNCHPAD_ADDRESS="${finalRecord?.launchpadProxyAddress}"`);
  console.log(`NEXT_PUBLIC_MONAD_MAINNET_STAKING_ADDRESS="${finalRecord?.stakingProxyAddress}"`);
  console.log(`NEXT_PUBLIC_MONAD_MAINNET_EVALUATOR_POOL_ADDRESS="${finalRecord?.evaluatorPoolProxyAddress}"`);
  console.log(`NEXT_PUBLIC_MONAD_MAINNET_NEGOTIATION_ADDRESS="${finalRecord?.negotiationProxyAddress}"`);
  console.log(`NEXT_PUBLIC_MONAD_MAINNET_GOVERNOR_ADDRESS="${finalRecord?.governorProxyAddress}"`);
  console.log(`NEXT_PUBLIC_MONAD_MAINNET_XERO_FACTORY_ADDRESS="${finalRecord?.xeroFactoryAddress}"`);
  console.log(`NEXT_PUBLIC_MONAD_MAINNET_XERO_ROUTER_ADDRESS="${finalRecord?.xeroRouterAddress}"`);
  console.log(`NEXT_PUBLIC_MONAD_MAINNET_X402_FACILITATOR_ADDRESS="${finalRecord?.x402FacilitatorAddress}"`);
  console.log(`NEXT_PUBLIC_MONAD_MAINNET_PREDICTION_VAULT_ADDRESS="${finalRecord?.predictionVaultProxyAddress}"`);
  console.log(`NEXT_PUBLIC_MONAD_MAINNET_PERP_VAULT_ADDRESS="${finalRecord?.perpVaultProxyAddress}"`);
  console.log(`NEXT_PUBLIC_MONAD_MAINNET_AGENT_TRADING_VAULT_ADDRESS="${finalRecord?.agentTradingVaultProxyAddress}"`);
  console.log("\n===============================================================================\n");
}

main().catch((err) => {
  console.error("Monad Mainnet Deployment failed:", err);
  process.exit(1);
});
