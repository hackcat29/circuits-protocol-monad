import { HardhatUserConfig } from "hardhat/config";
import * as dotenv from "dotenv";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";

dotenv.config({ path: ".env" });

const DEPLOYER_PRIVATE_KEY =
  process.env.EVM_DEPLOYER_PRIVATE_KEY ||
  "0x0000000000000000000000000000000000000000000000000000000000000001";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
    ],
    overrides: {
      "contracts/ClawdHQCore.sol": {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1,
          },
          viaIR: true,
          metadata: {
            bytecodeHash: "none",
          },
        },
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    monadMainnet: {
      url: process.env.MONAD_MAINNET_RPC_URL || "https://rpc.monad.xyz",
      chainId: 143,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      monadMainnet: process.env.MONADSCAN_API_KEY || "placeholder",
    },
    customChains: [
      {
        network: "monadMainnet",
        chainId: 143,
        urls: {
          apiURL: "https://api.monadscan.com/api",
          browserURL: "https://monadscan.com",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
