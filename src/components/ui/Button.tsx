import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variantClass: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-sky-600",
  secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  danger: "bg-rose text-white hover:bg-red-600",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100"
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
    className={`rounded-xl px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variantClass[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
);
