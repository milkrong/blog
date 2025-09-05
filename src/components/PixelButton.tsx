import { ButtonHTMLAttributes, forwardRef } from "react";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

export const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  (
    { className = "", variant = "primary", size = "md", children, ...props },
    ref
  ) => {
    const baseClasses =
      "font-mono border-2 transition-all duration-75 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variantClasses = {
      primary:
        "bg-blue-500 border-blue-700 text-white shadow-[2px_2px_0px_0px_#1d4ed8] hover:bg-blue-600 focus:ring-blue-500",
      secondary:
        "bg-gray-300 border-gray-500 text-gray-800 shadow-[2px_2px_0px_0px_#6b7280] hover:bg-gray-400 focus:ring-gray-500",
      danger:
        "bg-red-500 border-red-700 text-white shadow-[2px_2px_0px_0px_#b91c1c] hover:bg-red-600 focus:ring-red-500",
    };

    const sizeClasses = {
      sm: "px-3 py-1 text-sm",
      md: "px-4 py-2",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PixelButton.displayName = "PixelButton";
