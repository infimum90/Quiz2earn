"use client";

import { useConnection, useReadContract } from "wagmi";
import { quizContract } from "@/lib/contract";

const enabled = !!quizContract.address;

/** On-chain quiz config (reward, pass mark, active) for every lesson. */
export function useQuizzes() {
  return useReadContract({
    address: quizContract.address,
    abi: quizContract.abi,
    functionName: "getQuizzes",
    query: { enabled },
  });
}

/** Which quizzes the connected wallet has already passed, by quiz id. */
export function usePassed() {
  const { address } = useConnection();
  return useReadContract({
    address: quizContract.address,
    abi: quizContract.abi,
    functionName: "passedBy",
    args: address ? [address] : undefined,
    query: { enabled: enabled && !!address },
  });
}
