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
    <div className="fixed inset-0 z-50 flex items-end bg-slate-900/40 p-3 sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-4 shadow-panel">
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
  );
};
