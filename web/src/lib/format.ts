import { formatEther } from "viem";

export const shortAddress = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

/** Trim trailing zeros, keep at most 4 decimals: 1.5, 0.25, 12 */
export function formatBot(wei: bigint) {
  const [whole, frac = ""] = formatEther(wei).split(".");
  const f = frac.slice(0, 4).replace(/0+$/, "");
  return f ? `${whole}.${f}` : whole;
}

export const LETTERS = ["A", "B", "C", "D"] as const;
