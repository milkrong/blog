import React, { forwardRef, InputHTMLAttributes } from "react";

export interface PixelInputProps
  extends InputHTMLAttributes<HTMLInputElement> {}

export const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`font-mono w-full border-4 border-gray-800 bg-white shadow-[3px_3px_0_0_#1f2937] focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-2 text-sm placeholder:text-gray-400 ${className}`}
        {...props}
      />
    );
  }
);
PixelInput.displayName = "PixelInput";
