import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="bg-slate-100">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="font-semibold text-xl">
            Milkrong blog
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">登录</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 py-8">
        <div className="container max-w-5xl mx-auto">{children}</div>
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} milkrong blog. All rights reserved.
      </footer>
    </div>
  );
}
