import Link from "next/link";
import { Wordmark } from "./Logo";
import { WalletButton } from "./WalletButton";

export function Nav() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 max-w-[1080px] items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Wordmark />
          <nav className="hidden items-center gap-6 text-sm sm:flex">
            <Link href="/#lessons" className="link">Lessons</Link>
            <Link href="/me" className="link">Profile</Link>
          </nav>
        </div>
        <WalletButton />
      </div>
    </header>
  );
}
