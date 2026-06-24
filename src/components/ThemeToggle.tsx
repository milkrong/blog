import { useEffect, useState } from "react";

// Mono text toggle — keeps the brutalist voice and avoids an icon dependency.
export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="切换深浅色主题"
      className="pixel-chip bg-[var(--surface)] text-fg active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
    >
      {/* render a stable label before mount to avoid hydration mismatch */}
      {mounted ? (dark ? "LIGHT" : "DARK") : "THEME"}
    </button>
  );
}

export default ThemeToggle;
