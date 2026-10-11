import Link from "next/link";

export function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2 text-text" aria-label="Quiz2Earn home">
      <span className="grid size-7 place-items-center rounded-sm border border-border font-mono text-xs font-semibold text-text">
        Q2
      </span>
      <span className="text-[15px] font-semibold tracking-[-0.01em]">Quiz2Earn</span>
    </Link>
  );
}
