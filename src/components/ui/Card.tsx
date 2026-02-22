import type { PropsWithChildren, ReactNode } from "react";

type CardProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
}>;

export const Card = ({ title, subtitle, right, className = "", children }: CardProps) => (
  <section className={`rounded-2xl bg-white p-4 shadow-panel ${className}`}>
    {(title || subtitle || right) && (
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          {title && <h3 className="text-sm font-semibold text-ink">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        {right}
      </header>
    )}
    {children}
  </section>
);
