import type { Address } from "viem";
import { quiz2EarnAbi } from "./abi";

export const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address | undefined;

export const quizContract = { address: contractAddress, abi: quiz2EarnAbi } as const;
