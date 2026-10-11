import Link from "next/link";
import { ChainStats } from "@/components/ChainStats";
import { LessonGrid } from "@/components/LessonGrid";
import { SampleQuestion } from "@/components/SampleQuestion";
import { activeChain } from "@/lib/chains";

const steps = [
  { n: "01", title: "Read a short lesson", body: "Three or four paragraphs in plain English. No jargon without an explanation." },
  { n: "02", title: "Answer five questions", body: "You see the right answer and why after each one. Get four right to pass." },
  { n: "03", title: "Claim BOT on-chain", body: "A smart contract checks your answers and pays you. One reward per wallet, per lesson." },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-[1080px] px-4 md:px-8">
      <section className="grid items-center gap-12 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
        <div>
          <p className="label-sm text-text-muted">Learn Web3 on BOT Chain</p>
          <h1 className="mt-4 font-display text-[44px] leading-[48px] text-text md:text-[56px] md:leading-[60px]">
            Learn how crypto works. Pass the quiz. Get paid in BOT.
          </h1>
          <p className="mt-5 max-w-md text-text-muted">
            Six short lessons on wallets, gas, USDT and staying safe from scams. Each one ends with five questions,
            and if you pass, a smart contract sends BOT straight to your wallet.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/quiz/wallets" className="btn-primary">Start the first lesson</Link>
            <Link href="#how" className="btn-secondary">How it works</Link>
          </div>
        </div>
        <SampleQuestion />
      </section>

      <ChainStats />

      <section id="lessons" className="scroll-mt-8 pt-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-[-0.01em] text-text">Lessons</h2>
          <p className="font-mono text-xs text-text-faint">Start anywhere. Each one stands alone.</p>
        </div>
        <LessonGrid />
      </section>

      <section id="how" className="scroll-mt-8 pt-16">
        <h2 className="text-2xl font-semibold tracking-[-0.01em] text-text">How it works</h2>
        <ol className="mt-6 border-t border-border">
          {steps.map((s) => (
            <li key={s.n} className="grid gap-2 border-b border-border py-5 md:grid-cols-[80px_240px_1fr] md:gap-6">
              <span className="font-mono text-sm text-text-faint">{s.n}</span>
              <span className="font-semibold text-text">{s.title}</span>
              <span className="text-text-muted">{s.body}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-text-faint">
          You need a little BOT in your wallet to pay gas when you claim.
          {activeChain.testnet && (
            <>
              {" "}On testnet, get free test BOT from the{" "}
              <a className="link" href="https://faucet.botchain.ai/basic" target="_blank" rel="noreferrer">
                BOT Chain faucet
              </a>
              .
            </>
          )}
        </p>
      </section>
    </div>
  );
}
