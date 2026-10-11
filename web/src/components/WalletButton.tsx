"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useBalance, useConnect, useConnection, useConnectors, useDisconnect, useSwitchChain } from "wagmi";
import { activeChain, explorerUrl } from "@/lib/chains";
import { formatBot, shortAddress } from "@/lib/format";

export function WalletButton({ block = false }: { block?: boolean }) {
  const { address, chainId, status } = useConnection();
  const connectors = useConnectors();
  const connect = useConnect();
  const switchChain = useSwitchChain();
  const disconnect = useDisconnect();
  const { data: balance } = useBalance({ address, chainId: activeChain.id, query: { enabled: !!address } });
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const width = block ? "w-full" : "";

  // Wallet state only exists in the browser; render a stable placeholder on the server.
  if (!mounted || status === "reconnecting") {
    return <button className={`btn-secondary ${width}`} disabled>Wallet</button>;
  }

  if (address && chainId !== activeChain.id) {
    return (
      <button
        className={`btn border border-error text-error hover:bg-error/10 ${width}`}
        onClick={() => switchChain.mutate({ chainId: activeChain.id })}
        disabled={switchChain.isPending}
      >
        {switchChain.isPending ? "Switching…" : "Switch to BOT Chain"}
      </button>
    );
  }

  if (address) {
    return (
      <div ref={ref} className={`relative ${width}`}>
        <button className={`btn-secondary gap-3 px-4 ${width}`} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {balance && <span className="font-mono text-reward">{formatBot(balance.value)} BOT</span>}
          <span className="font-mono text-text-muted">{shortAddress(address)}</span>
        </button>
        {open && (
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-md border border-border bg-surface p-1 text-sm">
            <a
              href={`${explorerUrl}/address/${address}`}
              target="_blank"
              rel="noreferrer"
              className="block rounded-sm px-3 py-2 text-text-muted hover:bg-surface-raised hover:text-text"
            >
              View on explorer
            </a>
            <button
              className="block w-full rounded-sm px-3 py-2 text-left text-text-muted hover:bg-surface-raised hover:text-text"
              onClick={() => {
                disconnect.mutate();
                setOpen(false);
              }}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  // EIP-6963 discovery lists every installed wallet; drop the generic fallback when real ones exist.
  const named = connectors.filter((c) => c.id !== "injected");
  const options = named.length ? named : connectors;

  if (options.length <= 1) {
    const only = options[0];
    return (
      <div className={width}>
        <button
          className={`btn-primary ${width}`}
          disabled={connect.isPending}
          onClick={() => only && connect.mutate({ connector: only, chainId: activeChain.id })}
        >
          {connect.isPending ? "Check your wallet…" : "Connect wallet"}
        </button>
        {connect.error && <NoWalletHint />}
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative ${width}`}>
      <button className={`btn-primary ${width}`} onClick={() => setOpen((o) => !o)} disabled={connect.isPending}>
        {connect.isPending ? "Check your wallet…" : "Connect wallet"}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-60 rounded-md border border-border bg-surface p-1 text-sm">
          <p className="label-sm px-3 pt-2 pb-1 text-text-faint">Choose a wallet</p>
          {options.map((c) => (
            <button
              key={c.uid}
              className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-text hover:bg-surface-raised"
              onClick={() => {
                connect.mutate({ connector: c, chainId: activeChain.id });
                setOpen(false);
              }}
            >
              {c.icon ? (
                // eslint-disable-next-line @next/next/no-img-element -- wallet icons are data URIs
                <img src={c.icon} alt="" className="size-5 rounded-sm" />
              ) : (
                <span className="size-5" />
              )}
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const noopSubscribe = () => () => {};

function NoWalletHint() {
  return (
    <p className="mt-2 max-w-64 text-xs text-text-faint">
      No wallet found. Install MetaMask or BO Wallet, or open this page in your wallet&apos;s browser.
    </p>
  );
}
