"use client";

import { useReadContract } from "wagmi";
import { quizContract } from "@/lib/contract";
import { formatBot } from "@/lib/format";
import { lessons } from "@/lib/quizzes";

/** Live numbers read straight from the contract. Hidden until a contract is configured. */
export function ChainStats() {
  const enabled = !!quizContract.address;
  const { data: players } = useReadContract({ ...quizContract, functionName: "playerCount", query: { enabled } });
  const { data: paid } = useReadContract({ ...quizContract, functionName: "totalPaid", query: { enabled } });

  const rows = [
    { label: "Lessons", value: String(lessons.length) },
    { label: "Learners", value: players !== undefined ? players.toString() : "–" },
    { label: "BOT paid out", value: paid !== undefined ? formatBot(paid) : "–" },
  ];

  return (
    <dl className="grid grid-cols-3 divide-x divide-border border-y border-border">
      {rows.map((r) => (
        <div key={r.label} className="px-4 py-5 first:pl-0 md:px-6">
          <dt className="label-sm text-text-faint">{r.label}</dt>
          <dd className="mt-1 font-mono text-xl text-text">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
