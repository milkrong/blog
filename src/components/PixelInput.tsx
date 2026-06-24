import React, { forwardRef, InputHTMLAttributes } from "react";

export interface PixelInputProps
  extends InputHTMLAttributes<HTMLInputElement> {}

export const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`pixel-input ${className}`}
        {...props}
      />
    );
  }
);
PixelInput.displayName = "PixelInput";
