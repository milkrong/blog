import React from "react";
import Link from "next/link";
import { PixelButton } from "./PixelButton";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[linear-gradient(180deg,#e2e8f0,#cbd5e1)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(31,41,55,0.05)_1px,transparent_1px),linear-gradient(180deg,rgba(31,41,55,0.05)_1px,transparent_1px)] [background-size:16px_16px]"
      />
      {/* Header */}
      <header className="bg-white border-b-4 border-gray-800 shadow-[4px_4px_0_0_#1f2937]">
        <div className="max-w-6xl mx-auto px-4 flex h-16 items-center justify-between">
          <Link
            href="/"
            className="font-mono text-xl font-bold tracking-tight text-gray-900 hover:text-blue-600 transition-colors"
          >
            milkrong blog
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="inline-block">
              <PixelButton variant="secondary" size="sm">
                登录
              </PixelButton>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 py-10">
        <div className="max-w-6xl mx-auto px-4 space-y-8">{children}</div>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t-4 border-gray-800 shadow-[0_-4px_0_0_#1f2937] py-6 text-center text-sm font-mono text-gray-600">
        © {new Date().getFullYear()} milkrong blog · Crafted in pixel style
      </footer>
    </div>
  );
}
