import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variantClass: Record<Variant, string> = {
  primary:
    "border border-sky-500 bg-gradient-to-b from-sky-500 to-sky-600 text-primary-foreground shadow-[0_10px_18px_rgba(14,165,233,0.28)] hover:brightness-105",
  secondary:
    "border border-slate-200 bg-white/85 text-slate-700 shadow-[0_6px_14px_rgba(15,23,42,0.06)] hover:bg-white",
  danger: "border border-red-500 bg-red-500 text-white hover:bg-red-600",
  ghost: "bg-transparent text-slate-600 hover:bg-white/70"
};

export const Button = ({
  variant = "primary",
  className = "",
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: Variant;
}) => (
  <button
    className={`inline-flex items-center justify-center gap-1 rounded-2xl px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variantClass[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
);
