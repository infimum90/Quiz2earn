import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "dotenv/config";

const accounts = process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    // BOT Chain is a Parlia/BSC-style chain; paris avoids relying on newer opcodes.
    settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: "paris" },
  },
  networks: {
    // Local node uses the testnet chain id so the web app can talk to it unchanged.
    hardhat: { chainId: 968 },
    localhost: { url: "http://127.0.0.1:8545", chainId: 968 },
    botTestnet: { url: "https://rpc.bohr.life", chainId: 968, accounts },
    botMainnet: { url: "https://rpc.botchain.ai", chainId: 677, accounts },
  },
};

export default config;
