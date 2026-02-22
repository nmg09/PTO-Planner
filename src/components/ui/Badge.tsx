import type { PropsWithChildren } from "react";

export const Badge = ({
  children,
  tone = "slate"
}: PropsWithChildren<{ tone?: "slate" | "sky" | "mint" | "amber" | "rose" }>) => {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    sky: "bg-sky-100 text-sky-700",
    mint: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700"
  };

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
};
