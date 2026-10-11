import Image from "next/image";
import { explorerUrl } from "@/lib/chains";
import { contractAddress } from "@/lib/contract";
import { shortAddress } from "@/lib/format";
import { Wordmark } from "./Logo";

const xHandle = process.env.NEXT_PUBLIC_X_HANDLE;

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto grid max-w-[1080px] gap-10 px-4 py-10 text-sm text-text-muted md:grid-cols-[1fr_auto_auto] md:px-8">
        <div className="max-w-xs space-y-3">
          <Wordmark />
          <p>Short lessons on Web3 basics. Pass the quiz, and a smart contract pays you in BOT.</p>
        </div>

        <div className="space-y-3">
          <p className="label-sm text-text-faint">Project</p>
          <ul className="space-y-2">
            {contractAddress && (
              <li>
                <a className="link font-mono" href={`${explorerUrl}/address/${contractAddress}`} target="_blank" rel="noreferrer">
                  Contract {shortAddress(contractAddress)}
                </a>
              </li>
            )}
            {xHandle && (
              <li>
                <a className="link" href={`https://x.com/${xHandle}`} target="_blank" rel="noreferrer">
                  X / @{xHandle}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div className="space-y-3">
          <p className="label-sm text-text-faint">Ecosystem</p>
          <a href="https://botchain.ai" target="_blank" rel="noreferrer" className="block w-fit">
            <Image src="/botchain-logo.png" alt="BOT Chain" width={110} height={24} />
          </a>
          <ul className="space-y-2">
            <li>
              <a className="link" href="https://botchain.ai" target="_blank" rel="noreferrer">https://botchain.ai</a>
            </li>
            <li>
              <a className="link" href="https://scan.botchain.ai" target="_blank" rel="noreferrer">https://scan.botchain.ai</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-[1080px] px-4 py-4 font-mono text-xs text-text-faint md:px-8">
          Built on BOT Chain
        </p>
      </div>
    </footer>
  );
}
