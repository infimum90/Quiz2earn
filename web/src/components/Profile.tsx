"use client";

import Link from "next/link";
import { useConnection, useReadContract } from "wagmi";
import { usePassed, useQuizzes } from "@/hooks/useQuizData";
import { explorerUrl } from "@/lib/chains";
import { quizContract } from "@/lib/contract";
import { formatBot, shortAddress } from "@/lib/format";
import { lessons } from "@/lib/quizzes";
import { WalletButton } from "./WalletButton";

const LEADERBOARD_SIZE = 10;
const MAX_PLAYERS_SCANNED = 500n;

export function Profile() {
  const { address } = useConnection();
  const enabled = !!quizContract.address;
  const { data: quizzes } = useQuizzes();
  const { data: passed } = usePassed();
  const { data: me } = useReadContract({
    ...quizContract,
    functionName: "players",
    args: address ? [address] : undefined,
    query: { enabled: enabled && !!address },
  });

  const [earned, passedCount, attempts] = me ?? [0n, 0, 0];

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-10 md:px-8 md:py-16">
      <h1 className="text-[28px] leading-9 font-semibold tracking-[-0.01em] text-text">Profile</h1>

      {!address ? (
        <div className="mt-6 max-w-md rounded-lg border border-border bg-surface p-6">
          <p className="text-text-muted">Connect your wallet to see your progress and rewards.</p>
          <div className="mt-4">
            <WalletButton />
          </div>
        </div>
      ) : (
        <>
          <a
            href={`${explorerUrl}/address/${address}`}
            target="_blank"
            rel="noreferrer"
            className="link mt-2 inline-block font-mono text-sm"
          >
            {shortAddress(address)} ↗
          </a>

          <dl className="mt-8 grid grid-cols-3 divide-x divide-border border-y border-border">
            <Stat label="BOT earned" value={formatBot(earned)} reward />
            <Stat label="Lessons passed" value={`${passedCount} / ${lessons.length}`} />
            <Stat label="Attempts" value={String(attempts)} />
          </dl>

          <h2 className="mt-12 text-xl font-semibold text-text">Your lessons</h2>
          <ul className="mt-4 border-t border-border">
            {lessons.map((l, id) => (
              <li key={l.slug} className="flex items-center justify-between gap-4 border-b border-border py-4">
                <Link href={`/quiz/${l.slug}`} className="text-text hover:underline">
                  {l.title}
                </Link>
                {passed?.[id] ? (
                  <span className="font-mono text-sm text-correct">✓ +{quizzes ? formatBot(quizzes[id].reward) : "?"} BOT</span>
                ) : (
                  <span className="font-mono text-sm text-text-faint">Not passed</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      <Leaderboard me={address} />
    </div>
  );
}

function Stat({ label, value, reward }: { label: string; value: string; reward?: boolean }) {
  return (
    <div className="px-4 py-5 first:pl-0 md:px-6">
      <dt className="label-sm text-text-faint">{label}</dt>
      <dd className={`mt-1 font-mono text-xl ${reward ? "text-reward" : "text-text"}`}>{value}</dd>
    </div>
  );
}

function Leaderboard({ me }: { me?: string }) {
  const enabled = !!quizContract.address;
  const { data } = useReadContract({
    ...quizContract,
    functionName: "getPlayers",
    args: [0n, MAX_PLAYERS_SCANNED],
    query: { enabled },
  });

  const rows = data
    ? data[0]
        .map((addr, i) => ({ addr, ...data[1][i] }))
        .filter((r) => r.quizzesPassed > 0)
        .sort((a, b) => b.quizzesPassed - a.quizzesPassed || Number(a.firstSeen - b.firstSeen))
        .slice(0, LEADERBOARD_SIZE)
    : [];

  return (
    <section className="mt-16">
      <h2 className="text-xl font-semibold text-text">Leaderboard</h2>
      <p className="mt-1 text-sm text-text-faint">Most lessons passed. Ties go to whoever started first.</p>
      {rows.length === 0 ? (
        <p className="mt-6 border-y border-border py-6 text-text-muted">No one has passed a lesson yet. You could be first.</p>
      ) : (
        <table className="mt-4 w-full text-left text-sm">
          <thead className="label-sm text-text-faint">
            <tr className="border-b border-border">
              <th className="py-3 pr-4 font-semibold">#</th>
              <th className="py-3 pr-4 font-semibold">Wallet</th>
              <th className="py-3 pr-4 text-right font-semibold">Passed</th>
              <th className="py-3 text-right font-semibold">Earned</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((r, i) => {
              const isMe = me && r.addr.toLowerCase() === me.toLowerCase();
              return (
                <tr key={r.addr} className={`border-b border-border ${isMe ? "text-text" : "text-text-muted"}`}>
                  <td className="py-3 pr-4 text-text-faint">{String(i + 1).padStart(2, "0")}</td>
                  <td className="py-3 pr-4">
                    {shortAddress(r.addr)}
                    {isMe && <span className="ml-2 text-text-muted">you</span>}
                  </td>
                  <td className="py-3 pr-4 text-right">{r.quizzesPassed}</td>
                  <td className="py-3 text-right text-reward">{formatBot(r.totalEarned)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
