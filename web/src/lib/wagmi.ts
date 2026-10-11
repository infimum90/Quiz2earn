import { createConfig, http, injected } from "wagmi";
import { activeChain, botMainnet, botTestnet } from "./chains";

// Injected only: MetaMask, BO Wallet, OKX and any EIP-6963 wallet show up automatically.
export const wagmiConfig = createConfig({
  chains: [activeChain],
  connectors: [injected()],
  transports: { [botTestnet.id]: http(), [botMainnet.id]: http() },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
