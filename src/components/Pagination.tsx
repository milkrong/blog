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
            className={`px-3 py-1 rounded ${
              isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {page}
          </button>
        );
      })}
    </nav>
  );
}
