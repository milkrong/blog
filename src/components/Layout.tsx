import React from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col">
      {/* graph-paper grid, theme-aware via --grid-line */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 [background-size:18px_18px]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--grid-line) 1px, transparent 1px), linear-gradient(180deg, var(--grid-line) 1px, transparent 1px)",
        }}
      />

      {/* Header — single line, 64px */}
      <header className="sticky top-0 z-40 border-b-[3px] border-[var(--ink)] bg-[var(--surface)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-mono text-lg font-extrabold tracking-tight text-fg"
          >
            <span
              aria-hidden
              className="grid h-6 w-6 place-items-center border-2 border-[var(--ink)] bg-[var(--hi)] text-[var(--hi-ink)] text-[11px] font-black shadow-[2px_2px_0_0_var(--ink)]"
            >
              M
            </span>
            <span className="group-hover:text-accent transition-colors">
              milkrong<span className="text-fg-muted">/blog</span>
            </span>
          </Link>

          <nav className="flex items-center gap-3 font-mono text-sm">
            <a
              href="https://github.com/milkrong"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline text-fg-muted hover:text-accent transition-colors"
            >
              GitHub
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 py-10">
        <div className="mx-auto max-w-6xl space-y-10 px-4">{children}</div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t-[3px] border-[var(--ink)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 font-mono text-sm text-fg-muted sm:flex-row">
          <span>© {new Date().getFullYear()} milkrong blog</span>
          <span className="text-xs">Built with Next.js, served in pixels.</span>
        </div>
      </footer>
    </div>
  );
}
