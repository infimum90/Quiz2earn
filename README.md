# Quiz2Earn

Learn Web3 in short lessons, pass the quiz, earn BOT. An educational dApp that onboards new users to BOT Chain.

**Live:** https://quiz2earn.vercel.app
**Contract (testnet):** [`0x37fdfb7e3b14d9f84072f43a24c0a412a1bcf4e4`](https://scan.bohr.life/address/0x37fdfb7e3b14d9f84072f43a24c0a412a1bcf4e4)

Built for the 45-in-90 BOTChain Challenge.
Chain: BOTChain Testnet/Mainnet
Tech: Next.js, Solidity, Wagmi, Tailwind

## How it works

- 6 lessons (wallets, gas, USDT, scams, the explorer, smart contracts and AI agents), each with 5 questions.
- Answers are shown with an explanation after each question. 4/5 passes.
- On pass, the user calls `submit(quizId, answers)`. The contract re-scores the answers on-chain and pays native BOT from its pool. One reward per wallet per lesson.
- No backend. Lesson content lives in `web/src/content/quizzes.json`; the deploy script reads the same file to set the on-chain answer keys.

## Layout

```
contracts/   Hardhat project: Quiz2Earn.sol, tests, deploy + ABI export scripts
web/         Next.js 16 app (App Router, Wagmi 3, Tailwind 4)
DESIGN.md    Design system. Read before touching the UI.
```

## Develop locally

```bash
# 1. Local chain (uses chain id 968 so the app treats it as testnet)
cd contracts && pnpm install && npx hardhat node

# 2. In another terminal: deploy + fund
cd contracts && npx hardhat run scripts/deploy.ts --network localhost

# 3. Web app
cd web && pnpm install
cp .env.example .env.local   # set NEXT_PUBLIC_CONTRACT_ADDRESS, and NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
pnpm dev
```

Tests: `cd contracts && pnpm test`

Changed the contract? Run `pnpm export-abi` in `contracts/` to refresh `web/src/lib/abi.ts`.

## Adding a lesson

Append to `quizzes.json` (never reorder: the array index is the on-chain quiz id), then call `addQuiz(answers, passMark, reward)` from the owner wallet.

## Deploy checklist

1. **Contract**: `cp contracts/.env.example contracts/.env`, add the deployer key, then `pnpm deploy:testnet` (or `deploy:mainnet`). Get test BOT from https://faucet.botchain.ai/basic.
2. **Verify** the contract on the explorer (scan.bohr.life for testnet, scan.botchain.ai for mainnet).
3. **Vercel**: import the repo, set the root directory to `web/`, and add the env vars `NEXT_PUBLIC_NETWORK`, `NEXT_PUBLIC_CONTRACT_ADDRESS` and `NEXT_PUBLIC_X_HANDLE`.
4. **Fund** the contract by sending BOT to its address. Watch the balance: claims revert with `RewardPoolEmpty` when it runs out.
5. **Announce** on X: "Officially launched on BOT Chain Mainnet."

## Networks

| | Chain ID | RPC | Explorer |
|---|---|---|---|
| Testnet | 968 | https://rpc.bohr.life | https://scan.bohr.life |
| Mainnet | 677 | https://rpc.botchain.ai | https://scan.botchain.ai |

Note: the public mainnet RPC disables `eth_getLogs`, so the app reads everything from contract storage (no event scanning).

---

Ecosystem: [BOT Chain](https://botchain.ai) · [BOTScan](https://scan.botchain.ai)
