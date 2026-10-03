import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import type { ClawdHQCore, ClawdHQLaunchpad, MockUSDC, MockUniswapV2Router } from "../typechain-types";
import type { Signer } from "ethers";

const USDC = (n: number) => ethers.parseUnits(n.toString(), 6);
const TOKEN = (n: number) => ethers.parseUnits(n.toString(), 18);
const TRADE_FEE_BPS = 100n; // 1%, matches ClawdHQLaunchpad.TRADE_FEE_BPS
const DAY = 24 * 60 * 60;
// Matches ClawdHQLaunchpad.BuybackInterval's declaration order exactly (Solidity enums compile
// to a plain uint8, so these are just numeric literals, not a generated JS enum).
const DAILY = 0;
const WEEKLY = 1;
const MONTHLY = 2;
const QUARTERLY = 3;

async function advanceTime(seconds: number): Promise<void> {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []);
}

async function deployFixture() {
  const [admin, treasury, employer, agentOwner1, agentOwner2, other] = await ethers.getSigners();

  const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
  const usdc = (await MockUSDCFactory.deploy()) as unknown as MockUSDC;

  const RegistryFactory = await ethers.getContractFactory("AgentWalletRegistry");
  const registry = await RegistryFactory.deploy(await admin.getAddress(), await admin.getAddress());
  await registry.waitForDeployment();

  const CoreFactory = await ethers.getContractFactory("ClawdHQCore");
  const core = (await upgrades.deployProxy(
    CoreFactory,
    [await admin.getAddress(), await usdc.getAddress(), await treasury.getAddress()],
    { unsafeAllow: ["constructor"], constructorArgs: [await registry.getAddress()] }
  )) as unknown as ClawdHQCore;

  const LaunchpadFactory = await ethers.getContractFactory("ClawdHQLaunchpad");
  const launchpad = (await upgrades.deployProxy(
    LaunchpadFactory,
    [await admin.getAddress(), await core.getAddress(), await usdc.getAddress(), await treasury.getAddress(), await registry.getAddress()],
    // Same ReentrancyGuard constructor note as ClawdHQCore/ClawdHQAgentExchange's fixtures.
    { unsafeAllow: ["constructor"] }
  )) as unknown as ClawdHQLaunchpad;

  const MockRouterFactory = await ethers.getContractFactory("MockUniswapV2Router");
  const mockRouter = (await MockRouterFactory.deploy()) as unknown as MockUniswapV2Router;

  for (const signer of [employer, agentOwner1, agentOwner2, other]) {
    await usdc.mint(await signer.getAddress(), USDC(1_000_000));
    await usdc.connect(signer).approve(await core.getAddress(), ethers.MaxUint256);
    await usdc.connect(signer).approve(await launchpad.getAddress(), ethers.MaxUint256);
  }

  return { admin, treasury, employer, agentOwner1, agentOwner2, other, usdc, core, launchpad, registry, mockRouter };
}

async function registerAgent(core: ClawdHQCore, owner: Signer, name = "agent-one") {
  const tx = await core
    .connect(owner)
    .registerAgent(name, "ipfs://uri", "https://endpoint.example", ethers.ZeroHash, true, true, true);
  await tx.wait();
  return core.agentIdByNameHash(ethers.keccak256(ethers.toUtf8Bytes(name)));
}

/** The fee this contract deducts from a raw buy amount before it reaches the curve. */
function buyFee(usdcAmount: bigint): bigint {
  return (usdcAmount * TRADE_FEE_BPS) / 10_000n;
}

/** Mirrors ClawdHQLaunchpad's v3 constant-product curve (_tokensOutForBuy/_usdcOutForSell) in
 * TS, for computing expected values independently of the contract under test. `k` is always
 * `initialVirtualUsdcReserve * totalSupply` — never stored on-chain, recomputed here the same
 * way. */
const TOTAL_SUPPLY_RAW = TOKEN(1_000_000_000);

function kFor(initialVirtualUsdcReserve: bigint): bigint {
  return initialVirtualUsdcReserve * TOTAL_SUPPLY_RAW;
}

function tokensOutForBuy(initialVirtualUsdcReserve: bigint, usdcRaised: bigint, tokensSold: bigint, netUsdcIn: bigint): bigint {
  const virtualUsdc = initialVirtualUsdcReserve + usdcRaised;
  const realTokens = TOTAL_SUPPLY_RAW - tokensSold;
  const k = kFor(initialVirtualUsdcReserve);
  const newRealTokens = k / (virtualUsdc + netUsdcIn);
  return realTokens - newRealTokens;
}

function usdcOutForSell(initialVirtualUsdcReserve: bigint, usdcRaised: bigint, tokensSold: bigint, tokenAmount: bigint): bigint {
  const virtualUsdc = initialVirtualUsdcReserve + usdcRaised;
  const realTokens = TOTAL_SUPPLY_RAW - tokensSold;
  const k = kFor(initialVirtualUsdcReserve);
  const newVirtualUsdc = k / (realTokens + tokenAmount);
  return virtualUsdc - newVirtualUsdc;
}

describe("ClawdHQLaunchpad", () => {
  describe("Launchpad", () => {
    it("creates a 100% fair-launch launch with no creator pre-allocation, and locks transfers pre-graduation", async () => {
      const { core, launchpad, agentOwner1, other } = await deployFixture();
      const agentId = await registerAgent(core, agentOwner1);

      await launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin", "AGT", DAILY, 2000, 0);
      const launch = await launchpad.launches(1);
      expect(launch.creator).to.equal(await agentOwner1.getAddress());

      const AgentToken = await ethers.getContractFactory("AgentToken");
      const token = AgentToken.attach(launch.token);
      // No pre-allocation: the creator holds nothing at launch, and the launchpad itself holds
      // the entire fixed supply, fully available on the curve.
      expect(await (token as any).balanceOf(await agentOwner1.getAddress())).to.equal(0n);
      expect(await (token as any).balanceOf(await launchpad.getAddress())).to.equal(TOKEN(1_000_000_000));

      // Pre-graduation peer-to-peer transfer is locked.
      await expect((token as any).connect(agentOwner1).transfer(await other.getAddress(), 1n)).to.be.revertedWithCustomError(
        token,
        "TransfersLocked"
      );
    });

    it("blocks buyTokens/sellTokens before a scheduled launchAt, and allows them once it arrives", async () => {
      const { core, launchpad, agentOwner1, employer } = await deployFixture();
      const agentId = await registerAgent(core, agentOwner1);

      const now = await ethers.provider.getBlock("latest").then((b) => b!.timestamp);
      const launchAt = now + 2 * DAY;
      await launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin", "AGT", DAILY, 2000, launchAt);

      const launch = await launchpad.launches(1);
      expect(launch.tradingStartsAt).to.equal(BigInt(launchAt));

      await expect(launchpad.connect(employer).buyTokens(1, USDC(10), 0n)).to.be.revertedWithCustomError(launchpad, "LaunchNotStarted");

      await advanceTime(2 * DAY + 60); // past launchAt
      await expect(launchpad.connect(employer).buyTokens(1, USDC(10), 0n)).to.not.be.reverted;
    });

    it("startTradingNow lets the creator open a scheduled launch early, but only the creator, and only once", async () => {
      const { core, launchpad, agentOwner1, other, employer } = await deployFixture();
      const agentId = await registerAgent(core, agentOwner1);

      const now = await ethers.provider.getBlock("latest").then((b) => b!.timestamp);
      const launchAt = now + 2 * DAY;
      await launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin", "AGT", DAILY, 2000, launchAt);

      await expect(launchpad.connect(other).startTradingNow(1)).to.be.revertedWithCustomError(launchpad, "NotAgentOwner");
      await expect(launchpad.connect(employer).buyTokens(1, USDC(10), 0n)).to.be.revertedWithCustomError(launchpad, "LaunchNotStarted");

      await launchpad.connect(agentOwner1).startTradingNow(1);
      const launch = await launchpad.launches(1);
      expect(launch.tradingStartsAt).to.be.lessThanOrEqual(BigInt(await ethers.provider.getBlock("latest").then((b) => b!.timestamp)));

      await expect(launchpad.connect(employer).buyTokens(1, USDC(10), 0n)).to.not.be.reverted;
      await expect(launchpad.connect(agentOwner1).startTradingNow(1)).to.be.revertedWithCustomError(launchpad, "TradingAlreadyStarted");
    });

    it("a launchAt in the past or 0 behaves exactly like today — trading opens immediately", async () => {
      const { core, launchpad, agentOwner1, employer } = await deployFixture();
      const agentId = await registerAgent(core, agentOwner1);

      await launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin", "AGT", DAILY, 2000, 0);
      await expect(launchpad.connect(employer).buyTokens(1, USDC(10), 0n)).to.not.be.reverted;
    });

    it("anchors the anti-snipe fee window to tradingStartsAt, not createdAt, for a scheduled launch", async () => {
      const { core, launchpad, agentOwner1, employer } = await deployFixture();
      const agentId = await registerAgent(core, agentOwner1);

      const now = await ethers.provider.getBlock("latest").then((b) => b!.timestamp);
      const launchAt = now + 2 * DAY;
      await launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin", "AGT", DAILY, 2000, launchAt);

      // Land just after tradingStartsAt — if antiSnipeUntil were still anchored to createdAt
      // (2 days ago), the anti-snipe window would have already elapsed and this buy would pay
      // the normal 2% fee instead of the 20% anti-snipe fee.
      await advanceTime(2 * DAY + 60);
      const launch = await launchpad.launches(1);
      const netForCurve = USDC(10) - (USDC(10) * 2_000n) / 10_000n; // ANTI_SNIPE_FEE_BPS
      const expectedTokensOut = tokensOutForBuy(launch.initialVirtualUsdcReserve, 0n, 0n, netForCurve);

      await launchpad.connect(employer).buyTokens(1, USDC(10), 0n);
      expect((await launchpad.launches(1)).tokensSold).to.equal(expectedTokensOut);
    });

    it("rejects a second launch for the same agent", async () => {
      const { core, launchpad, agentOwner1 } = await deployFixture();
      const agentId = await registerAgent(core, agentOwner1);
      await launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin", "AGT", DAILY, 2000, 0);
      await expect(launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin 2", "AGT2", DAILY, 2000, 0)).to.be.revertedWithCustomError(
        launchpad,
        "AlreadyLaunched"
      );
    });

    it("computes buy-side curve math correctly against the constant-product invariant, net of the trade fee", async () => {
      const { core, launchpad, agentOwner1, employer } = await deployFixture();
      const agentId = await registerAgent(core, agentOwner1);
      await launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin", "AGT", DAILY, 2000, 0);
      await advanceTime(11 * 60); // past the anti-snipe window — this test is about curve math, not its fee

      const launch = await launchpad.launches(1);
      const initialVirtualUsdcReserve = launch.initialVirtualUsdcReserve; // 4_000e6 ($4,000), the default set in initialize()
      expect(initialVirtualUsdcReserve).to.equal(USDC(4_000));

      const grossBudget = USDC(1_000);
      const fee = buyFee(grossBudget);
      const netForCurve = grossBudget - fee;
      const expectedTokensOut = tokensOutForBuy(initialVirtualUsdcReserve, 0n, 0n, netForCurve);

      await launchpad.connect(employer).buyTokens(1, grossBudget, expectedTokensOut);
      const after = await launchpad.launches(1);
      expect(after.tokensSold).to.equal(expectedTokensOut);
      expect(after.usdcRaised).to.equal(netForCurve);

      // Constant product invariant holds against the launch's own post-trade state, up to the
      // one-wei-scale rounding integer division always introduces: newRealTokens = k/newVirtualUsdc
      // floors, so the post-trade product is always <= k, never > it, and the gap is bounded by
      // newVirtualUsdc (the standard error bound for a single floored division).
      const k = kFor(initialVirtualUsdcReserve);
      const virtualUsdc = initialVirtualUsdcReserve + after.usdcRaised;
      const realTokens = TOTAL_SUPPLY_RAW - after.tokensSold;
      const product = virtualUsdc * realTokens;
      expect(product).to.be.lessThanOrEqual(k);
      expect(k - product).to.be.lessThan(virtualUsdc);
    });

    it("FDV at zero tokens sold equals exactly initialVirtualUsdcReserve — the totalSupply factor cancels out", async () => {
      const { core, launchpad, agentOwner1 } = await deployFixture();
      const agentId = await registerAgent(core, agentOwner1);
      // $2,000 here, not the $400 default: at $400 the true price ($0.0000004/token) is below
      // getCurrentPrice's own integer floor (see the dedicated floor test just below), which
      // would make this specific assertion collide with a different thing entirely.
      await launchpad.setBondingParams(USDC(2_000), USDC(19_000));
      await launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin", "AGT", DAILY, 2000, 0);

      const priceWhole = await launchpad.getCurrentPrice(1); // USDC (6dec) per whole token
      const fdv = priceWhole * 1_000_000_000n;
      expect(fdv).to.equal(USDC(2_000));
    });

    it("getCurrentPrice floors to 0 for a launch whose true price is below $0.000001/token, but trade execution stays exact", async () => {
      const { core, launchpad, agentOwner1, employer } = await deployFixture();
      const agentId = await registerAgent(core, agentOwner1);
      // A $400 FDV over the fixed 1B supply is $0.0000004/token — genuinely below what a single
      // integer return value can represent, exactly the documented limitation on this one view
      // function (see its NatSpec) — buyTokens itself never rounds through this at all. The
      // $4,000 default doesn't hit this floor (see the FDV test above), so this test configures
      // a smaller reserve explicitly to demonstrate the documented edge case on purpose.
      await launchpad.setBondingParams(USDC(400), USDC(19_000));
      await launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin", "AGT", DAILY, 2000, 0);
      await advanceTime(11 * 60); // past the anti-snipe window — this test is about the price floor, not its fee

      expect(await launchpad.getCurrentPrice(1)).to.equal(0n);

      const launch = await launchpad.launches(1);
      const netForCurve = USDC(10) - buyFee(USDC(10));
      const expectedTokensOut = tokensOutForBuy(launch.initialVirtualUsdcReserve, 0n, 0n, netForCurve);
      expect(expectedTokensOut).to.be.greaterThan(0n);

      await launchpad.connect(employer).buyTokens(1, USDC(10), expectedTokensOut);
      expect((await launchpad.launches(1)).tokensSold).to.equal(expectedTokensOut);
    });

    it("splits every buy's fee 50/30/20 between protocol, creator, and the buyback pool", async () => {
      const { core, launchpad, usdc, agentOwner1, employer, treasury } = await deployFixture();
      const agentId = await registerAgent(core, agentOwner1);
      await launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin", "AGT", MONTHLY, 2000, 0);
      // Past the anti-snipe window: at the $400 default's much shallower curve, a $1,000 buy
      // moves >5% of supply and isn't itself what this test means to exercise.
      await advanceTime(11 * 60);

      const grossBudget = USDC(1_000);
      const fee = buyFee(grossBudget);
      const protocolShare = (fee * 50n) / 100n;
      const creatorShare = (fee * 30n) / 100n;
      const agentShare = fee - protocolShare - creatorShare; // 20%

      const creatorBefore = await usdc.balanceOf(await agentOwner1.getAddress());
      const treasuryBefore = await usdc.balanceOf(await treasury.getAddress());
      await launchpad.connect(employer).buyTokens(1, grossBudget, 0n);

      // Without a provisioned agent wallet, agent share falls back to creator (30% + 20% = 50%)
      expect(await usdc.balanceOf(await agentOwner1.getAddress())).to.equal(creatorBefore + creatorShare + agentShare);
      expect(await usdc.balanceOf(await treasury.getAddress())).to.equal(treasuryBefore + protocolShare);
    });

    it("routes 20% agent share to provisioned AgentWallet and 30% to creator", async () => {
      const { core, launchpad, usdc, employer, agentOwner1, registry, admin, treasury } = await deployFixture();
      const agentId = await registerAgent(core, agentOwner1);
      const [, , , , , , agentWalletSigner] = await ethers.getSigners();
      const agentWalletAddr = await agentWalletSigner.getAddress();
      await registry.connect(admin).setAgentWallet(agentId, agentWalletAddr);

      await launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin", "AGT", MONTHLY, 2000, 0);
      await advanceTime(11 * 60);

      const grossBudget = USDC(1_000);
      const fee = buyFee(grossBudget);
      const protocolShare = (fee * 50n) / 100n;
      const creatorShare = (fee * 30n) / 100n;
      const agentShare = fee - protocolShare - creatorShare;

      const creatorBefore = await usdc.balanceOf(await agentOwner1.getAddress());
      const agentWalletBefore = await usdc.balanceOf(agentWalletAddr);
      const treasuryBefore = await usdc.balanceOf(await treasury.getAddress());

      await launchpad.connect(employer).buyTokens(1, grossBudget, 0n);

      expect(await usdc.balanceOf(await agentOwner1.getAddress())).to.equal(creatorBefore + creatorShare);
      expect(await usdc.balanceOf(agentWalletAddr)).to.equal(agentWalletBefore + agentShare);
      expect(await usdc.balanceOf(await treasury.getAddress())).to.equal(treasuryBefore + protocolShare);
    });

    it("charges the elevated 20% anti-snipe fee during the initial window instead of a hard cap, then falls back to the normal 2% after", async () => {
      const { core, launchpad, usdc, employer, agentOwner1 } = await deployFixture();
      const agentId = await registerAgent(core, agentOwner1);
      await launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin", "AGT", MONTHLY, 2000, 0);

      const launch = await launchpad.launches(1);
      expect(launch.antiSnipeUntil).to.be.greaterThan(0n);

      // A buy that would have blown well past the old 5%-of-supply cap now simply succeeds, at
      // a steeper fee — no AntiSnipeLimitExceeded revert exists anymore.
      const grossBudget = USDC(10_000);
      const snipeFee = (grossBudget * 2_000n) / 10_000n; // ANTI_SNIPE_FEE_BPS = 2,000 (20%)
      const netForCurve = grossBudget - snipeFee;
      const expectedTokensOut = tokensOutForBuy(launch.initialVirtualUsdcReserve, 0n, 0n, netForCurve);
      expect(expectedTokensOut).to.be.greaterThan((TOTAL_SUPPLY_RAW * 500n) / 10_000n); // > 5% of supply — would have reverted under the old cap

      const creatorBefore = await usdc.balanceOf(await agentOwner1.getAddress());
      await launchpad.connect(employer).buyTokens(1, grossBudget, expectedTokensOut);

      const after = await launchpad.launches(1);
      expect(after.tokensSold).to.equal(expectedTokensOut);
      expect(after.usdcRaised).to.equal(netForCurve);
      // Unprovisioned agent wallet routes both creator share (30%) and agent share (20%) = 50% to creator
      const snipeCreatorShare = (snipeFee * 30n) / 100n;
      const snipeAgentShare = snipeFee - (snipeFee * 50n) / 100n - snipeCreatorShare;
      expect(await usdc.balanceOf(await agentOwner1.getAddress())).to.equal(creatorBefore + snipeCreatorShare + snipeAgentShare);

      // Past the window, a same-sized buy now pays the normal 2% instead.
      await advanceTime(11 * 60);
      const normalFee = buyFee(grossBudget);
      const normalNetForCurve = grossBudget - normalFee;
      const expectedTokensOut2 = tokensOutForBuy(launch.initialVirtualUsdcReserve, after.usdcRaised, after.tokensSold, normalNetForCurve);
      await launchpad.connect(employer).buyTokens(1, grossBudget, expectedTokensOut2);
      expect((await launchpad.launches(1)).usdcRaised).to.equal(after.usdcRaised + normalNetForCurve);
    });

    it("exempts the creator's own buy from the anti-snipe fee, even inside the window — only other buyers pay it", async () => {
      const { core, launchpad, agentOwner1, employer } = await deployFixture();
      const agentId = await registerAgent(core, agentOwner1);
      await launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin", "AGT", MONTHLY, 2000, 0);

      const launch = await launchpad.launches(1);
      expect(BigInt(await ethers.provider.getBlock("latest").then((b) => b!.timestamp))).to.be.lessThan(launch.antiSnipeUntil);

      // Creator buys first, still well inside the anti-snipe window — pays 0 fee.
      const creatorBudget = USDC(1_000);
      const creatorNetForCurve = creatorBudget;
      const creatorExpectedOut = tokensOutForBuy(launch.initialVirtualUsdcReserve, 0n, 0n, creatorNetForCurve);
      await launchpad.connect(agentOwner1).buyTokens(1, creatorBudget, creatorExpectedOut);
      expect((await launchpad.launches(1)).usdcRaised).to.equal(creatorNetForCurve);

      // A different buyer, same window, same size — still pays the full 20% anti-snipe fee.
      const afterCreatorBuy = await launchpad.launches(1);
      const sniperBudget = USDC(1_000);
      const sniperNetForCurve = sniperBudget - (sniperBudget * 2_000n) / 10_000n; // ANTI_SNIPE_FEE_BPS
      const sniperExpectedOut = tokensOutForBuy(launch.initialVirtualUsdcReserve, afterCreatorBuy.usdcRaised, afterCreatorBuy.tokensSold, sniperNetForCurve);
      await launchpad.connect(employer).buyTokens(1, sniperBudget, sniperExpectedOut);
      expect((await launchpad.launches(1)).usdcRaised).to.equal(afterCreatorBuy.usdcRaised + sniperNetForCurve);
    });

    it("sells tokens back through the curve, splitting the 2% fee 50/30/20", async () => {
      const { core, launchpad, usdc, agentOwner1, employer, treasury } = await deployFixture();
      const agentId = await registerAgent(core, agentOwner1);
      await launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin", "AGT", MONTHLY, 2000, 0);

      const launch = await launchpad.launches(1);
      const grossBudget = USDC(1_000);
      await launchpad.connect(employer).buyTokens(1, grossBudget, 0n);
      const afterBuy = await launchpad.launches(1);
      const tokensBought = afterBuy.tokensSold;

      const AgentToken = await ethers.getContractFactory("AgentToken");
      const token = AgentToken.attach(launch.token);
      await (token as any).connect(employer).approve(await launchpad.getAddress(), tokensBought);

      const creatorBefore = await usdc.balanceOf(await agentOwner1.getAddress());
      const treasuryBefore = await usdc.balanceOf(await treasury.getAddress());
      const employerUsdcBefore = await usdc.balanceOf(await employer.getAddress());

      await launchpad.connect(employer).sellTokens(1, tokensBought, 0n);

      const usdcRaisedAfterSell = (await launchpad.launches(1)).usdcRaised;
      const grossActual = afterBuy.usdcRaised - usdcRaisedAfterSell;
      const feeExpected = buyFee(grossActual);
      const protocolShareExpected = (feeExpected * 50n) / 100n;
      const creatorShareExpected = (feeExpected * 30n) / 100n;
      const agentShareExpected = feeExpected - protocolShareExpected - creatorShareExpected;

      expect(await usdc.balanceOf(await agentOwner1.getAddress())).to.equal(creatorBefore + creatorShareExpected + agentShareExpected);
      expect(await usdc.balanceOf(await treasury.getAddress())).to.equal(treasuryBefore + protocolShareExpected);
      expect(await usdc.balanceOf(await employer.getAddress())).to.equal(employerUsdcBefore + grossActual - feeExpected);
      expect((await launchpad.launches(1)).tokensSold).to.equal(0n);
    });

    it("executeBuyback spends the configured percentage of the agent operating treasury and burns the tokens, once due", async () => {
      const { core, launchpad, agentOwner1, employer, registry, admin, usdc } = await deployFixture();
      const agentId = await registerAgent(core, agentOwner1);

      const [, , , , , , agentWalletSigner] = await ethers.getSigners();
      const agentWalletAddr = await agentWalletSigner.getAddress();
      await registry.connect(admin).setAgentWallet(agentId, agentWalletAddr);

      // Create launch with 20% buyback percentage (2000 bps)
      await launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin", "AGT", MONTHLY, 2000, 0);

      // Fund the agent operating treasury with 10,000 USDC and approve Launchpad
      await usdc.mint(agentWalletAddr, USDC(10_000));
      await usdc.connect(agentWalletSigner).approve(await launchpad.getAddress(), ethers.MaxUint256);

      const beforeBuyback = await launchpad.launches(1);
      const AgentToken = await ethers.getContractFactory("AgentToken");
      const token = AgentToken.attach(beforeBuyback.token);
      const burnedBefore = await (token as any).burnedSupply();

      const expectedBuybackUsdc = USDC(2_000); // 20% of 10,000 USDC

      await advanceTime(30 * DAY + 1);
      await launchpad.executeBuyback(1);

      const afterBuyback = await launchpad.launches(1);
      expect(afterBuyback.usdcRaised).to.equal(beforeBuyback.usdcRaised + expectedBuybackUsdc);
      expect(afterBuyback.tokensSold).to.be.greaterThan(beforeBuyback.tokensSold);
      const tokensBurned = afterBuyback.tokensSold - beforeBuyback.tokensSold;
      expect(await (token as any).burnedSupply()).to.equal(burnedBefore + tokensBurned);
      expect(await usdc.balanceOf(agentWalletAddr)).to.equal(USDC(8_000));

      // Executing again immediately reverts BuybackNotDue
      await expect(launchpad.executeBuyback(1)).to.be.revertedWithCustomError(launchpad, "BuybackNotDue");
      await advanceTime(30 * DAY + 1);
      await expect(launchpad.executeBuyback(1)).to.not.be.reverted;
    });

    it("setBuybackConfig allows owner to adjust cadence and treasury percentage", async () => {
      const { core, launchpad, agentOwner1 } = await deployFixture();
      const agentId = await registerAgent(core, agentOwner1);
      await launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin", "AGT", MONTHLY, 2000, 0);

      await launchpad.connect(agentOwner1).setBuybackConfig(1, WEEKLY, 1000);
      const launch = await launchpad.launches(1);
      expect(launch.buybackInterval).to.equal(WEEKLY);
      expect(launch.buybackBps).to.equal(1000);
    });

    it("executeBuyback reverts when agent operating treasury is empty", async () => {
      const { core, launchpad, agentOwner1, registry, admin } = await deployFixture();
      const agentId = await registerAgent(core, agentOwner1);
      const [, , , , , , agentWalletSigner] = await ethers.getSigners();
      await registry.connect(admin).setAgentWallet(agentId, await agentWalletSigner.getAddress());

      await launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin", "AGT", MONTHLY, 2000, 0);

      await advanceTime(30 * DAY + 1);
      await expect(launchpad.executeBuyback(1)).to.be.revertedWithCustomError(launchpad, "NoBuybackFunds");
    });

    it("each launch's buyback interval can be chosen by creator", async () => {
      const { core, launchpad, agentOwner1, agentOwner2, employer, registry, admin, usdc } = await deployFixture();
      const agentId1 = await registerAgent(core, agentOwner1, "agent-one");
      const agentId2 = await registerAgent(core, agentOwner2, "agent-two");

      const [, , , , , , walletSigner1, walletSigner2] = await ethers.getSigners();
      await registry.connect(admin).setAgentWallet(agentId1, await walletSigner1.getAddress());
      await registry.connect(admin).setAgentWallet(agentId2, await walletSigner2.getAddress());

      await usdc.mint(await walletSigner1.getAddress(), USDC(1_000));
      await usdc.mint(await walletSigner2.getAddress(), USDC(1_000));
      await usdc.connect(walletSigner1).approve(await launchpad.getAddress(), ethers.MaxUint256);
      await usdc.connect(walletSigner2).approve(await launchpad.getAddress(), ethers.MaxUint256);

      await launchpad.connect(agentOwner1).createLaunch(agentId1, "Agent Coin", "AGT", MONTHLY, 2000, 0);
      await launchpad.connect(agentOwner2).createLaunch(agentId2, "Agent Coin 2", "AGT2", WEEKLY, 1000, 0);

      const launch1 = await launchpad.launches(1);
      const launch2 = await launchpad.launches(2);
      expect(launch1.buybackInterval).to.equal(MONTHLY);
      expect(launch2.buybackInterval).to.equal(WEEKLY);
      expect(launch1.nextBuybackAt).to.equal(launch1.createdAt + BigInt(30 * DAY));
      expect(launch2.nextBuybackAt).to.equal(launch2.createdAt + BigInt(7 * DAY));

      await advanceTime(30 * DAY + 1);
      await expect(launchpad.executeBuyback(1)).to.not.be.reverted;
      await expect(launchpad.executeBuyback(2)).to.not.be.reverted;
    });

    it("graduateLaunch reverts if no Uniswap V2 router is configured for this chain", async () => {
      const { core, launchpad, agentOwner1, employer } = await deployFixture();
      const agentId = await registerAgent(core, agentOwner1);
      await launchpad.setBondingParams(USDC(4_000), USDC(1)); // tiny threshold so the test is cheap
      await launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin", "AGT", DAILY, 2000, 0);
      await launchpad.connect(employer).buyTokens(1, USDC(2), 0n); // clears the tiny threshold post-fee

      await expect(launchpad.graduateLaunch(1)).to.be.revertedWithCustomError(launchpad, "DexNotConfigured");
    });

    it("graduates only once the threshold is met, migrates liquidity to the DEX, and unlocks transfers", async () => {
      const { core, launchpad, agentOwner1, employer, other, mockRouter, usdc } = await deployFixture();
      const agentId = await registerAgent(core, agentOwner1);
      await launchpad.setBondingParams(USDC(4_000), USDC(1)); // tiny threshold so the test is cheap
      await launchpad.setUniswapV2Router(await mockRouter.getAddress());
      await launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin", "AGT", DAILY, 2000, 0);

      await expect(launchpad.graduateLaunch(1)).to.be.revertedWithCustomError(launchpad, "ThresholdNotMet");

      await launchpad.connect(employer).buyTokens(1, USDC(2), 0n); // 2 gross, ~1.96 net clears the 1 USDC threshold
      const beforeGraduate = await launchpad.launches(1);

      await launchpad.graduateLaunch(1);

      const launch = await launchpad.launches(1);
      expect(launch.graduated).to.equal(true);

      // The mock router pulled both legs of liquidity and minted its LP token straight to
      // BURN_ADDRESS — never back to this contract or the creator.
      const remainingTokens = launch.totalSupply - beforeGraduate.tokensSold;
      const burnAddress = await launchpad.BURN_ADDRESS();
      const lpMinted = await mockRouter.balanceOf(burnAddress);
      expect(lpMinted).to.equal(remainingTokens + beforeGraduate.usdcRaised);
      expect(await usdc.balanceOf(await mockRouter.getAddress())).to.equal(beforeGraduate.usdcRaised);

      const AgentToken = await ethers.getContractFactory("AgentToken");
      const token = AgentToken.attach(launch.token);
      const balance = await (token as any).balanceOf(await employer.getAddress());
      if (balance > 0n) {
        const creatorAddr = await agentOwner1.getAddress();
        const protocolTreasuryAddr = await launchpad.treasury();
        const agentWalletAddr = await (token as any).agentTreasury();

        const transferTx = await (token as any).connect(employer).transfer(await other.getAddress(), balance);
        await transferTx.wait();

        const fee = (balance * 100n) / 10_000n; // 1%
        const expectedProtocol = (fee * 50n) / 100n;
        const expectedCreator = (fee * 30n) / 100n;
        const expectedAgent = fee - expectedProtocol - expectedCreator; // 20%
        const expectedNet = balance - fee;

        expect(await (token as any).balanceOf(await other.getAddress())).to.equal(expectedNet);
        expect(await (token as any).balanceOf(protocolTreasuryAddr)).to.equal(expectedProtocol);
        if (creatorAddr === agentWalletAddr) {
          expect(await (token as any).balanceOf(creatorAddr)).to.equal(expectedCreator + expectedAgent);
        } else {
          expect(await (token as any).balanceOf(creatorAddr)).to.equal(expectedCreator);
          expect(await (token as any).balanceOf(agentWalletAddr)).to.equal(expectedAgent);
        }
        expect(await (token as any).burnedSupply()).to.equal(0n); // 0% burned!
      }
    });
  });

  describe("Virtual liquidity migration", () => {
    it("setBondingParams never allows the default virtual reserve back to 0 — the only thing that would make createLaunch's own VirtualReserveNotConfigured guard fire", async () => {
      const { launchpad, core, agentOwner1 } = await deployFixture();
      const agentId = await registerAgent(core, agentOwner1);

      await expect(launchpad.setBondingParams(0, USDC(1))).to.be.revertedWith("InvalidVirtualReserve");

      // deployFixture's initialize() already sets a working $4,000 default — every launch in
      // this whole file succeeding is itself evidence createLaunch's guard isn't tripped in the
      // normal case; this test's job is just confirming there's no admin path back to the zero
      // state.
      await launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin", "AGT", DAILY, 2000, 0);
      expect((await launchpad.launches(1)).initialVirtualUsdcReserve).to.equal(USDC(4_000));
    });

    it("migrateLaunchVirtualLiquidity reverts on a launch that already has a virtual reserve (every launch created after this upgrade)", async () => {
      const { launchpad, core, agentOwner1 } = await deployFixture();
      const agentId = await registerAgent(core, agentOwner1);
      await launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin", "AGT", DAILY, 2000, 0);

      await expect(launchpad.migrateLaunchVirtualLiquidity(1, USDC(4_000))).to.be.revertedWithCustomError(launchpad, "AlreadyMigrated");
    });

    it("migrateLaunchVirtualLiquidity is restricted to DEFAULT_ADMIN_ROLE", async () => {
      const { launchpad, other } = await deployFixture();
      await expect(launchpad.connect(other).migrateLaunchVirtualLiquidity(1, USDC(4_000))).to.be.reverted;
    });
  });

  describe("Agent ownership check", () => {
    it("only the agent's Core-registered owner can create its launch", async () => {
      const { core, launchpad, agentOwner1, other } = await deployFixture();
      const agentId = await registerAgent(core, agentOwner1);
      await expect(launchpad.connect(other).createLaunch(agentId, "Agent Coin", "AGT", DAILY, 2000, 0)).to.be.revertedWithCustomError(
        launchpad,
        "NotAgentOwner"
      );
    });
  });

  describe("Access control & pausability", () => {
    it("restricts admin-only setters to DEFAULT_ADMIN_ROLE", async () => {
      const { launchpad, other } = await deployFixture();
      await expect(launchpad.connect(other).setLaunchFee(USDC(1))).to.be.reverted;
      await expect(launchpad.connect(other).setBondingParams(1, USDC(1))).to.be.reverted;
      await expect(launchpad.connect(other).setTreasury(await other.getAddress())).to.be.reverted;
      await expect(launchpad.connect(other).setAgentWalletRegistry(await other.getAddress())).to.be.reverted;
      await expect(launchpad.connect(other).setUniswapV2Router(await other.getAddress())).to.be.reverted;
      await expect(launchpad.connect(other).withdrawStuckTokens(ethers.ZeroAddress, 0, await other.getAddress())).to.be.reverted;
    });

    it("restricts pause/unpause to PAUSER_ROLE and blocks state-changing calls while paused", async () => {
      const { core, launchpad, admin, agentOwner1, other } = await deployFixture();
      const agentId = await registerAgent(core, agentOwner1);

      await expect(launchpad.connect(other).pause()).to.be.reverted;
      await launchpad.connect(admin).pause();

      await expect(launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin", "AGT", DAILY, 2000, 0)).to.be.revertedWithCustomError(
        launchpad,
        "EnforcedPause"
      );

      await launchpad.connect(admin).unpause();
      await expect(launchpad.connect(agentOwner1).createLaunch(agentId, "Agent Coin", "AGT", DAILY, 2000, 0)).to.not.be.reverted;
    });

    it("only DEFAULT_ADMIN_ROLE can authorize a UUPS upgrade", async () => {
      const { launchpad, other } = await deployFixture();
      const LaunchpadFactory = await ethers.getContractFactory("ClawdHQLaunchpad");
      await expect(
        upgrades.upgradeProxy(await launchpad.getAddress(), LaunchpadFactory.connect(other), { unsafeAllow: ["constructor"] })
      ).to.be.reverted;
    });
  });
});
