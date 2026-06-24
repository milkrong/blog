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
      "inline-flex items-center justify-center gap-1.5 font-mono font-bold border-[3px] border-[var(--ink)] shadow-[3px_3px_0_0_var(--ink)] transition-all duration-75 hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent)] disabled:opacity-50 disabled:pointer-events-none";

    const variantClasses = {
      primary: "bg-[var(--accent)] text-[var(--accent-fg)]",
      secondary: "bg-[var(--surface-2)] text-fg hover:bg-[var(--surface)]",
      danger: "bg-[var(--danger)] text-white",
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
