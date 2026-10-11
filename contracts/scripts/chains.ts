import hre from "hardhat";
import { defineChain } from "viem";
import { hardhat } from "viem/chains";

const bot = (id: number, name: string, rpc: string, explorer: string) =>
  defineChain({
    id,
    name,
    nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
    rpcUrls: { default: { http: [rpc] } },
    blockExplorers: { default: { name: "BOTScan", url: explorer } },
  });

const chains = {
  botTestnet: bot(968, "BOT Chain Testnet", "https://rpc.bohr.life", "https://scan.bohr.life"),
  botMainnet: bot(677, "BOT Chain", "https://rpc.botchain.ai", "https://scan.botchain.ai"),
} as const;

/** hardhat-viem doesn't know BOT Chain, so clients for it need the chain passed explicitly. */
export function currentChain() {
  const known = chains[hre.network.name as keyof typeof chains];
  if (known) return known;
  // Local nodes reuse id 968; give viem a chain object with that id.
  return { ...hardhat, id: hre.network.config.chainId ?? hardhat.id };
}
