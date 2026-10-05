import { ethers, network } from "hardhat";
import { readDeployment } from "./lib/deployments";

const ERC20_ABI = [
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function balanceOf(address) external view returns (uint256)",
  "function allowance(address, address) external view returns (uint256)",
  "function approve(address, uint256) external returns (bool)",
];

async function main() {
  const chainId = network.config.chainId;
  if (chainId !== 143) {
    throw new Error(`test_monad_mainnet_full must run on monadMainnet (chainId 143), got ${chainId}`);
  }

  const [deployer] = await ethers.getSigners();
  console.log("===============================================================================");
  console.log("          MONAD MAINNET END-TO-END VERIFICATION & INTEGRATION SUITE             ");
  console.log("===============================================================================");
  console.log(`Tester/Deployer: ${deployer.address}`);
  console.log(`Balance:         ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} MON`);
  console.log(`Block Number:    ${await ethers.provider.getBlockNumber()}\n`);

  const deployment = readDeployment(143);
  if (!deployment) throw new Error("No deployment found in deployments/143.json");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}${details ? ` -> ${details}` : ""}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // Test 1: Canonical Circle USDC Token
  // -------------------------------------------------------------------------
  console.log("--- 1. Testing Canonical Circle USDC Token ---");
  const usdc = new ethers.Contract(deployment.usdcAddress, ERC20_ABI, deployer);
  const usdcDecimals = await usdc.decimals();
  const usdcSymbol = await usdc.symbol();
  assert(Number(usdcDecimals) === 6, "USDC has 6 decimals", `got ${usdcDecimals}`);
  assert(usdcSymbol === "USDC", "USDC symbol is USDC", `got ${usdcSymbol}`);
  assert(
    deployment.usdcAddress.toLowerCase() === "0x754704Bc059F8C67012fEd69BC8A327a5aafb603".toLowerCase(),
    "USDC address matches canonical Circle USDC on Monad Mainnet"
  );

  // -------------------------------------------------------------------------
  // Test 2: ClawdHQCore & Sovereign Identity
  // -------------------------------------------------------------------------
  console.log("\n--- 2. Testing ClawdHQCore Identity & Agents ---");
  const core = await ethers.getContractAt("ClawdHQCore", deployment.proxyAddress);
  const totalAgents = await core.totalAgents();
  assert(totalAgents >= 1n, "Core has registered agents", `got ${totalAgents}`);

  const coreUsdc = await core.usdc();
  assert(coreUsdc.toLowerCase() === deployment.usdcAddress.toLowerCase(), "Core USDC reference matches canonical USDC");

  const coreStaking = await core.stakingContract();
  assert(coreStaking.toLowerCase() === deployment.stakingProxyAddress?.toLowerCase(), "Core stakingContract is wired to ClawdHQStaking");

  const coreEvalPool = await core.evaluatorPoolContract();
  assert(coreEvalPool.toLowerCase() === deployment.evaluatorPoolProxyAddress?.toLowerCase(), "Core evaluatorPoolContract is wired to ClawdHQEvaluatorPool");

  const isNegotTrusted = await core.trustedNegotiationContracts(deployment.negotiationProxyAddress!);
  assert(isNegotTrusted === true, "Core trusts ClawdHQNegotiation proxy");

  // -------------------------------------------------------------------------
  // Test 3: AgentWalletRegistry
  // -------------------------------------------------------------------------
  console.log("\n--- 3. Testing AgentWalletRegistry ---");
  const registry = await ethers.getContractAt("AgentWalletRegistry", deployment.agentWalletRegistryAddress!);
  const regOwner = await registry.owner();
  const regRegistrar = await registry.registrar();
  assert(regOwner.toLowerCase() === deployer.address.toLowerCase(), "AgentWalletRegistry owner matches deployer");
  assert(regRegistrar.toLowerCase() === deployer.address.toLowerCase(), "AgentWalletRegistry registrar matches deployer");

  // -------------------------------------------------------------------------
  // Test 4: ClawdHQAgentExchange
  // -------------------------------------------------------------------------
  console.log("\n--- 4. Testing ClawdHQAgentExchange ---");
  const exchange = await ethers.getContractAt("ClawdHQAgentExchange", deployment.exchangeProxyAddress!);
  const exCore = await exchange.core();
  assert(exCore.toLowerCase() === deployment.proxyAddress.toLowerCase(), "Exchange points to ClawdHQCore");

  // -------------------------------------------------------------------------
  // Test 5: ClawdHQLaunchpad & Bonding Curves
  // -------------------------------------------------------------------------
  console.log("\n--- 5. Testing ClawdHQLaunchpad & Bonding Curves ---");
  const launchpad = await ethers.getContractAt("ClawdHQLaunchpad", deployment.launchpadProxyAddress!);
  const lpRouter = await launchpad.uniswapV2Router();
  assert(
    lpRouter.toLowerCase() === deployment.xeroRouterAddress?.toLowerCase() ||
    lpRouter.toLowerCase() === deployment.uniswapV4GraduationAdapterAddress?.toLowerCase(),
    "Launchpad DEX router is configured"
  );

  if (deployment.uniswapV4HookAddress) {
    console.log("   Checking Uniswap v4 Hook configuration on Monad...");
    assert(
      deployment.uniswapV4PoolManagerAddress.toLowerCase() === "0x188d586Ddcf52439676Ca21A244753fA19F9Ea8e".toLowerCase(),
      "Uniswap v4 PoolManager matches official Monad deployment"
    );
  }

  const lpReserve = await launchpad.defaultInitialVirtualUsdcReserve();
  assert(lpReserve === ethers.parseUnits("4000", 6), "Launchpad defaultInitialVirtualUsdcReserve is 4,000 USDC");

  const lpGraduation = await launchpad.defaultGraduationThreshold();
  assert(lpGraduation === ethers.parseUnits("19000", 6), "Launchpad defaultGraduationThreshold is 19,000 USDC");

  // -------------------------------------------------------------------------
  // Test 6: ClawdHQStaking & Reliability Bonds
  // -------------------------------------------------------------------------
  console.log("\n--- 6. Testing ClawdHQStaking & Slashers ---");
  const staking = await ethers.getContractAt("ClawdHQStaking", deployment.stakingProxyAddress!);
  const stakingCore = await staking.core();
  assert(stakingCore.toLowerCase() === deployment.proxyAddress.toLowerCase(), "Staking core points to ClawdHQCore");

  const isCoreSlasher = await staking.authorizedSlashers(deployment.proxyAddress);
  assert(isCoreSlasher === true, "ClawdHQCore is authorized slasher on Staking");

  // -------------------------------------------------------------------------
  // Test 7: ClawdHQEvaluatorPool
  // -------------------------------------------------------------------------
  console.log("\n--- 7. Testing ClawdHQEvaluatorPool ---");
  const evalPool = await ethers.getContractAt("ClawdHQEvaluatorPool", deployment.evaluatorPoolProxyAddress!);
  const epCore = await evalPool.core();
  assert(epCore.toLowerCase() === deployment.proxyAddress.toLowerCase(), "EvaluatorPool points to ClawdHQCore");

  // -------------------------------------------------------------------------
  // Test 8: ClawdHQNegotiation
  // -------------------------------------------------------------------------
  console.log("\n--- 8. Testing ClawdHQNegotiation ---");
  const negotiation = await ethers.getContractAt("ClawdHQNegotiation", deployment.negotiationProxyAddress!);
  const negCore = await negotiation.core();
  assert(negCore.toLowerCase() === deployment.proxyAddress.toLowerCase(), "Negotiation points to ClawdHQCore");

  // -------------------------------------------------------------------------
  // Test 9: ClawdHQGovernor
  // -------------------------------------------------------------------------
  console.log("\n--- 9. Testing ClawdHQGovernor ---");
  const governor = await ethers.getContractAt("ClawdHQGovernor", deployment.governorProxyAddress!);
  const govStaking = await governor.staking();
  assert(govStaking.toLowerCase() === deployment.stakingProxyAddress?.toLowerCase(), "Governor points to Staking contract");

  // -------------------------------------------------------------------------
  // Test 10: Xero Protocol (DEX)
  // -------------------------------------------------------------------------
  console.log("\n--- 10. Testing Xero Protocol (Uniswap V2) ---");
  const xeroFactory = await ethers.getContractAt("XeroFactory", deployment.xeroFactoryAddress!);
  const xeroRouter = await ethers.getContractAt("XeroRouter", deployment.xeroRouterAddress!);
  const routerFactory = await xeroRouter.factory();
  assert(routerFactory.toLowerCase() === deployment.xeroFactoryAddress?.toLowerCase(), "XeroRouter factory matches XeroFactory");

  // -------------------------------------------------------------------------
  // Test 11: X402Facilitator (HTTP 402 Micropayments)
  // -------------------------------------------------------------------------
  console.log("\n--- 11. Testing X402Facilitator ---");
  const facilitator = await ethers.getContractAt("X402Facilitator", deployment.x402FacilitatorAddress!);
  const facUsdc = await facilitator.usdc();
  assert(facUsdc.toLowerCase() === deployment.usdcAddress.toLowerCase(), "X402Facilitator USDC matches canonical USDC");

  // -------------------------------------------------------------------------
  // Test 12: Circuits Degen Vaults
  // -------------------------------------------------------------------------
  console.log("\n--- 12. Testing Circuits Degen Vaults ---");
  const agentVault = await ethers.getContractAt("CircuitsAgentTradingVault", deployment.agentTradingVaultProxyAddress!);
  const perpApproved = await agentVault.approvedVenues(deployment.perpVaultProxyAddress!);
  const predApproved = await agentVault.approvedVenues(deployment.predictionVaultProxyAddress!);
  const lpApproved = await agentVault.approvedVenues(deployment.launchpadProxyAddress!);
  assert(perpApproved === true, "PerpVault is approved venue on AgentTradingVault");
  assert(predApproved === true, "PredictionVault is approved venue on AgentTradingVault");
  assert(lpApproved === true, "Launchpad is approved venue on AgentTradingVault");

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log("\n===============================================================================");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("===============================================================================");

  if (failed > 0) {
    throw new Error(`Mainnet integration suite failed with ${failed} failing tests`);
  }
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
