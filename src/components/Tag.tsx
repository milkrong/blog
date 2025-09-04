import React from 'react';

interface Props {
  tag: string;
}

export default function Tag({ tag }: Props) {
  return (
    <span className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded mr-2 text-sm">
      {tag}
    </span>
  );
}
