import type { PropsWithChildren, ReactNode } from "react";

type CardProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
}>;

export const Card = ({ title, subtitle, right, className = "", children }: CardProps) => (
  <section
    className={`rounded-3xl border border-white/80 bg-white/90 p-4 shadow-[0_12px_26px_rgba(15,23,42,0.08)] backdrop-blur ${className}`}
  >
    {(title || subtitle || right) && (
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          {title && <h3 className="text-sm font-semibold tracking-tight text-ink">{title}</h3>}
          {subtitle && <p className="text-xs leading-relaxed text-slate-500">{subtitle}</p>}
        </div>
        {right}
      </header>
    )}
    {children}
  </section>
);
