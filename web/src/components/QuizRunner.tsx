"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toHex } from "viem";
import { useConnection, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { usePassed, useQuizzes } from "@/hooks/useQuizData";
import { activeChain, explorerUrl } from "@/lib/chains";
import { quizContract } from "@/lib/contract";
import { formatBot, LETTERS, shortAddress } from "@/lib/format";
import type { Lesson } from "@/lib/quizzes";
import { WalletButton } from "./WalletButton";

type Stage = "read" | "quiz" | "result";

export function QuizRunner({ id, lesson }: { id: number; lesson: Lesson }) {
  const [stage, setStage] = useState<Stage>("read");
  const [answers, setAnswers] = useState<number[]>([]);

  const restart = () => {
    setAnswers([]);
    setStage("quiz");
  };

  return (
    <div className="mx-auto max-w-[640px] px-4 py-10 md:py-16">
      <Link href="/#lessons" className="link font-mono text-xs">← All lessons</Link>
      <p className="label-sm mt-8 text-text-faint">
        Lesson {String(id + 1).padStart(2, "0")} · {lesson.topic}
      </p>
      <h1 className="mt-2 text-[28px] leading-9 font-semibold tracking-[-0.01em] text-text">{lesson.title}</h1>

      {stage === "read" && <Reading lesson={lesson} onStart={() => setStage("quiz")} />}
      {stage === "quiz" && (
        <Quiz
          lesson={lesson}
          onFinish={(a) => {
            setAnswers(a);
            setStage("result");
          }}
        />
      )}
      {stage === "result" && (
        <Result id={id} lesson={lesson} answers={answers} onRetry={restart} onReview={() => setStage("read")} />
      )}
    </div>
  );
}

function Reading({ lesson, onStart }: { lesson: Lesson; onStart: () => void }) {
  return (
    <>
      <div className="mt-6 space-y-5 text-base leading-7 text-text-muted">
        {lesson.lesson.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>
      <div className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6">
        <span className="font-mono text-xs text-text-faint">{lesson.questions.length} questions · pass with 4</span>
        <button className="btn-primary" onClick={onStart}>Start quiz</button>
      </div>
    </>
  );
}

function Quiz({ lesson, onFinish }: { lesson: Lesson; onFinish: (answers: number[]) => void }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);

  const q = lesson.questions[index];
  const total = lesson.questions.length;
  const last = index === total - 1;

  const next = useCallback(() => {
    if (!locked) {
      if (selected === null) return;
      setLocked(true);
      setAnswers((a) => [...a, selected]);
      return;
    }
    if (last) {
      onFinish(answers);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setLocked(false);
  }, [locked, selected, last, answers, onFinish]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const i = LETTERS.indexOf(e.key.toUpperCase() as (typeof LETTERS)[number]);
      if (i !== -1 && i < q.options.length && !locked) setSelected(i);
      // A focused button already handles Enter as a click.
      if (e.key === "Enter" && !(e.target instanceof HTMLButtonElement)) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [q, locked, next]);

  return (
    <section className="mt-8 rounded-lg border border-border bg-surface p-4 md:p-6">
      <div className="flex items-center justify-between font-mono text-xs text-text-faint">
        <span>
          Q{index + 1} / {total}
        </span>
        <span className="hidden sm:inline">Keys A–D, Enter</span>
      </div>
      <div className="mt-3 h-1 rounded-full bg-border">
        <div
          className="h-1 rounded-full bg-text transition-[width] duration-300"
          style={{ width: `${((index + (locked ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      <p className="mt-6 text-lg leading-7 font-medium text-text">{q.q}</p>

      <ul className="mt-5 space-y-2" role="radiogroup">
        {q.options.map((option, i) => (
          <li key={option}>
            <Option
              letter={LETTERS[i]}
              text={option}
              state={optionState(i, selected, locked, q.answer)}
              disabled={locked}
              onSelect={() => setSelected(i)}
            />
          </li>
        ))}
      </ul>

      {locked && (
        <p className="mt-5 border-t border-dashed border-border pt-4 text-sm leading-6 text-text-muted">
          <span className={selected === q.answer ? "text-correct" : "text-error"}>
            {selected === q.answer ? "Correct. " : `The answer is ${LETTERS[q.answer]}. `}
          </span>
          {q.explain}
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <button className="btn-primary min-w-36" onClick={next} disabled={selected === null}>
          {!locked ? "Lock answer" : last ? "See result" : "Next question"}
        </button>
      </div>
    </section>
  );
}

type OptionState = "idle" | "selected" | "correct" | "wrong" | "faded";

function optionState(i: number, selected: number | null, locked: boolean, answer: number): OptionState {
  if (!locked) return selected === i ? "selected" : "idle";
  if (i === answer) return "correct";
  if (i === selected) return "wrong";
  return "faded";
}

const optionStyles: Record<OptionState, { row: string; box: string }> = {
  idle: { row: "border-border text-text hover:border-border-strong", box: "border-border text-text-muted" },
  selected: { row: "border-text bg-surface-raised text-text", box: "border-text bg-text text-canvas" },
  correct: { row: "border-correct text-text", box: "border-correct bg-correct text-canvas" },
  wrong: { row: "border-error text-text", box: "border-error bg-error text-canvas" },
  faded: { row: "border-border text-text-faint", box: "border-border text-text-faint" },
};

function Option(props: { letter: string; text: string; state: OptionState; disabled: boolean; onSelect: () => void }) {
  const s = optionStyles[props.state];
  return (
    <button
      role="radio"
      aria-checked={props.state === "selected"}
      disabled={props.disabled}
      onClick={props.onSelect}
      className={`flex w-full items-center gap-3 rounded-md border px-4 py-3.5 text-left text-[15px] leading-6 transition-colors disabled:cursor-default ${s.row}`}
    >
      <span className={`grid size-7 shrink-0 place-items-center rounded-sm border font-mono text-xs ${s.box}`}>
        {props.letter}
      </span>
      {props.text}
    </button>
  );
}

function Result(props: { id: number; lesson: Lesson; answers: number[]; onRetry: () => void; onReview: () => void }) {
  const { id, lesson, answers } = props;
  const score = answers.filter((a, i) => a === lesson.questions[i].answer).length;
  const { data: quizzes } = useQuizzes();
  const chainQuiz = quizzes?.[id];
  const passMark = chainQuiz?.passMark ?? 4;
  const passed = score >= passMark;

  return (
    <section className="mt-8 rounded-lg border border-border bg-surface p-6 md:p-8">
      <p className="label-sm text-text-faint">Result</p>
      <h2 className="mt-2 font-display text-[40px] leading-[44px] text-text">
        {passed ? "You passed." : "Not this time."}
      </h2>

      <dl className="mt-6 grid grid-cols-2 border-t border-dashed border-border pt-5">
        <div>
          <dt className="label-sm text-text-faint">Score</dt>
          <dd className="mt-1 font-mono text-xl text-text">
            {score} / {lesson.questions.length}
          </dd>
        </div>
        <div>
          <dt className="label-sm text-text-faint">Reward</dt>
          <dd className="mt-1 font-mono text-xl text-reward">
            {chainQuiz ? `+${formatBot(chainQuiz.reward)} BOT` : "–"}
          </dd>
        </div>
      </dl>

      {passed ? (
        <Claim id={id} answers={answers} reward={chainQuiz?.reward} active={chainQuiz?.active} />
      ) : (
        <>
          <p className="mt-6 text-text-muted">You need {passMark} correct answers to pass. Read the lesson again and have another go.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn-primary" onClick={props.onRetry}>Try again</button>
            <button className="btn-secondary" onClick={props.onReview}>Review lesson</button>
          </div>
        </>
      )}
    </section>
  );
}

function Claim({ id, answers, reward, active }: { id: number; answers: number[]; reward?: bigint; active?: boolean }) {
  const { address, chainId } = useConnection();
  const { data: passed, refetch } = usePassed();
  const write = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash: write.data, chainId: activeChain.id });

  useEffect(() => {
    if (receipt.isSuccess) refetch();
  }, [receipt.isSuccess, refetch]);

  if (!quizContract.address) {
    return <Note>The contract isn&apos;t configured yet. Set NEXT_PUBLIC_CONTRACT_ADDRESS to enable claiming.</Note>;
  }

  if (receipt.isSuccess && write.data) {
    return (
      <div className="mt-6 space-y-2">
        <p className="text-correct">Claimed. The BOT is in your wallet.</p>
        <a className="link font-mono text-xs" href={`${explorerUrl}/tx/${write.data}`} target="_blank" rel="noreferrer">
          tx {shortAddress(write.data)} ↗
        </a>
        <NextSteps />
      </div>
    );
  }

  if (passed?.[id]) {
    return (
      <div className="mt-6">
        <Note>This wallet has already claimed the reward for this lesson. Try another one.</Note>
        <NextSteps />
      </div>
    );
  }

  if (!address || chainId !== activeChain.id) {
    return (
      <div className="mt-6 space-y-3">
        <p className="text-text-muted">Connect your wallet to claim your reward.</p>
        <WalletButton />
      </div>
    );
  }

  if (active === false) return <Note>Rewards for this lesson are paused right now.</Note>;

  const pending = write.isPending || receipt.isLoading;
  const label = write.isPending ? "Confirm in wallet…" : receipt.isLoading ? "Confirming…" : `Claim ${reward !== undefined ? formatBot(reward) + " BOT" : "reward"}`;

  return (
    <div className="mt-6">
      <button
        className="btn-primary min-w-44 font-mono"
        disabled={pending}
        onClick={() =>
          write.mutate({
            address: quizContract.address!,
            abi: quizContract.abi,
            functionName: "submit",
            args: [BigInt(id), toHex(Uint8Array.from(answers))],
            chainId: activeChain.id,
          })
        }
      >
        {label}
      </button>
      {(write.error || receipt.error) && <p className="mt-3 text-sm text-error">{errorMessage(write.error ?? receipt.error)}</p>}
      <p className="mt-3 text-xs text-text-faint">The contract checks your answers again on-chain before paying.</p>
    </div>
  );
}

function NextSteps() {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <Link href="/#lessons" className="btn-secondary">Next lesson</Link>
      <Link href="/me" className="btn-secondary">Your profile</Link>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="mt-6 rounded-md border border-border px-4 py-3 text-sm text-text-muted">{children}</p>;
}

function errorMessage(err: Error | null) {
  const msg = err?.message ?? "";
  if (/User rejected|denied/i.test(msg)) return "You cancelled the transaction.";
  if (msg.includes("RewardPoolEmpty")) return "The reward pool is empty right now. Your pass isn't lost: come back and claim later.";
  if (msg.includes("AlreadyPassed")) return "This wallet has already claimed this lesson.";
  if (/insufficient funds/i.test(msg)) return "You need a little BOT in your wallet to pay gas.";
  return "Something went wrong. Please try again.";
}
