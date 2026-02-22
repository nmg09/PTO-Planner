import type { PropsWithChildren } from "react";

export const Badge = ({
  children,
  tone = "slate"
}: PropsWithChildren<{ tone?: "slate" | "sky" | "mint" | "amber" | "rose" }>) => {
  const tones = {
    slate: "border border-slate-200 bg-slate-100/90 text-slate-700",
    sky: "border border-sky-200 bg-sky-100/90 text-sky-700",
    mint: "border border-emerald-200 bg-emerald-100/90 text-emerald-700",
    amber: "border border-amber-200 bg-amber-100/90 text-amber-700",
    rose: "border border-rose-200 bg-rose-100/90 text-rose-700"
  };

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
};
