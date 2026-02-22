import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 text-sm text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 ${className}`}
      {...props}
    />
  )
);

Input.displayName = "Input";

export const Select = ({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className={`w-full rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 text-sm text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 ${className}`}
    {...props}
  />
);

export const Textarea = ({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={`w-full rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 text-sm text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 ${className}`}
    {...props}
  />
);
