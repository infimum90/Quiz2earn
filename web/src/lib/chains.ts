import { defineChain } from "viem";

// NEXT_PUBLIC_RPC_URL lets local development point the testnet config at a Hardhat node.
const testnetRpc = process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.bohr.life";

export const botTestnet = defineChain({
  id: 968,
  name: "BOT Chain Testnet",
  nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
  rpcUrls: { default: { http: [testnetRpc] } },
  blockExplorers: { default: { name: "BOTScan Testnet", url: "https://scan.bohr.life" } },
  testnet: true,
});

export const botMainnet = defineChain({
  id: 677,
  name: "BOT Chain",
  nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.botchain.ai"] } },
  blockExplorers: { default: { name: "BOTScan", url: "https://scan.botchain.ai" } },
});

/** The one chain this deployment talks to. Set NEXT_PUBLIC_NETWORK=mainnet for production. */
export const activeChain = process.env.NEXT_PUBLIC_NETWORK === "mainnet" ? botMainnet : botTestnet;

export const explorerUrl = activeChain.blockExplorers.default.url;
