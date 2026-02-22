import { X } from "lucide-react";
import type { PropsWithChildren } from "react";

type ModalProps = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  title: string;
}>;

export const Modal = ({ open, onClose, title, children }: ModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/45 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center px-3 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
        <div
          className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/70 bg-white/95 p-4 shadow-[0_24px_48px_rgba(15,23,42,0.18)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">{title}</h3>
            <button
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
