import React from 'react';

interface Props {
  current: number;
  total: number;
  onPageChange?: (page: number) => void;
}

export default function Pagination({ current, total, onPageChange }: Props) {
  return (
    <nav className="flex justify-center space-x-2">
      {Array.from({ length: total }).map((_, i) => {
        const page = i + 1;
        const isActive = page === current;
        return (
          <button
            key={page}
            onClick={() => onPageChange && onPageChange(page)}
            className={`font-mono text-sm border-[3px] border-[var(--ink)] px-3 py-1 shadow-[2px_2px_0_0_var(--ink)] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
              isActive
                ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
                : 'bg-[var(--surface)] text-fg-muted hover:text-accent'
            }`}
          >
            {page}
          </button>
        );
      })}
    </nav>
  );
}
