import React from "react";

interface Props {
  tag: string;
}

export default function Tag({ tag }: Props) {
  return (
    <span className="pixel-chip mr-2 mb-2 bg-[var(--surface-2)] text-fg-muted">
      <span className="text-accent">#</span>
      {tag}
    </span>
  );
}
