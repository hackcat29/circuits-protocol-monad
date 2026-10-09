import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("Uniswap v4 Hooks Graduation on Monad", function () {
  let deployer: any;
  let creator: any;
  let buyer: any;
  let treasury: any;
  let usdc: any;
  let launchpad: any;
  let agentToken: any;
  let hook: any;
  let adapter: any;

  beforeEach(async function () {
    [deployer, creator, buyer, treasury] = await ethers.getSigners();

    // Deploy Mock USDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();

    // Deploy CircuitsAgentHook
    // Use deployer as placeholder pool manager for testing unit callbacks
    const CircuitsAgentHook = await ethers.getContractFactory("CircuitsAgentHook");
    hook = await CircuitsAgentHook.deploy(
      deployer.address, // pool manager mock
      deployer.address, // launchpad initially
      deployer.address, // agent wallet registry
      deployer.address, // staking contract
      treasury.address
    );
    await hook.waitForDeployment();

    // Deploy UniswapV4GraduationAdapter
    const UniswapV4GraduationAdapter = await ethers.getContractFactory("UniswapV4GraduationAdapter");
    adapter = await UniswapV4GraduationAdapter.deploy(
      deployer.address, // pool manager
      await hook.getAddress(),
      deployer.address
    );
    await adapter.waitForDeployment();

    // Deploy AgentWalletRegistry and Core
    const AgentWalletRegistry = await ethers.getContractFactory("AgentWalletRegistry");
    const registry = await AgentWalletRegistry.deploy(deployer.address, deployer.address);
    await registry.waitForDeployment();

    const ClawdHQCore = await ethers.getContractFactory("ClawdHQCore");
    const core = await upgrades.deployProxy(
      ClawdHQCore,
      [deployer.address, await usdc.getAddress(), treasury.address],
      { unsafeAllow: ["constructor"], constructorArgs: [await registry.getAddress()] }
    );
    await core.waitForDeployment();

    // Deploy ClawdHQLaunchpad (UUPS)
    const ClawdHQLaunchpad = await ethers.getContractFactory("ClawdHQLaunchpad");
    launchpad = await upgrades.deployProxy(
      ClawdHQLaunchpad,
      [deployer.address, await core.getAddress(), await usdc.getAddress(), treasury.address, await registry.getAddress()],
      { unsafeAllow: ["constructor"], kind: "uups" }
    );
    await launchpad.waitForDeployment();

    // Configure Launchpad to use Uniswap v4
    await launchpad.setUniswapV4(deployer.address, await adapter.getAddress());
    await adapter.setLaunchpad(await launchpad.getAddress());
    await hook.setLaunchpad(await adapter.getAddress());

    // Set bonding params: 100 USDC initial reserve, 500 USDC graduation threshold
    await launchpad.setBondingParams(ethers.parseUnits("100", 6), ethers.parseUnits("500", 6));

    // Fund buyer with USDC
    await usdc.mint(buyer.address, ethers.parseUnits("10000", 6));
    await usdc.connect(buyer).approve(await launchpad.getAddress(), ethers.MaxUint256);
  });

  it("configures Uniswap v4 PoolManager and Hook on launchpad", async function () {
    expect(await launchpad.uniswapV4PoolManager()).to.equal(deployer.address);
    expect(await launchpad.uniswapV4Hook()).to.equal(await adapter.getAddress());
  });

  it("authorizes agent token and registers pool with CircuitsAgentHook", async function () {
    const tokenAddress = ethers.Wallet.createRandom().address;
    await hook.authorizeAgentToken(tokenAddress, 42);

    expect(await hook.isAuthorizedToken(tokenAddress)).to.be.true;
    expect(await hook.agentIdByToken(tokenAddress)).to.equal(42);
  });

  it("enforces rug-proof permanent liquidity locking via hook", async function () {
    const key = {
      currency0: ethers.Wallet.createRandom().address,
      currency1: await usdc.getAddress(),
      fee: 3000,
      tickSpacing: 60,
      hooks: await hook.getAddress(),
    };
    const params = {
      tickLower: -887220,
      tickUpper: 887220,
      liquidityDelta: 1000,
      salt: ethers.ZeroHash,
    };

    // Attempting to remove liquidity through hook must revert
    await expect(
      hook.beforeRemoveLiquidity(deployer.address, key, params, "0x")
    ).to.be.revertedWithCustomError(hook, "LiquidityPermanentlyLocked");
  });
});
