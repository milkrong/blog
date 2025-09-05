import React from "react";
import { Badge } from "./ui/badge";

interface Props {
  tag: string;
}

export default function Tag({ tag }: Props) {
  return (
    <Badge variant="secondary" className="mr-2">
      {tag}
    </Badge>
  );
}
