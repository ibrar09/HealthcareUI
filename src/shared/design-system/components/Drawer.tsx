import { ReactNode } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  widthClass?: string;
}

/**
 * Right-side slide-over panel — the shared shell for every "Add/Edit X" form
 * across modules, so create/edit flows look and behave the same everywhere.
 */
export function Drawer({ open, onClose, title, subtitle, children, footer, widthClass = "max-w-xl" }: DrawerProps) {
  return (
    <>
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={clsx(
          "fixed inset-0 z-40 bg-ink-navy/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={clsx(
          "fixed top-0 right-0 z-50 flex h-full w-full flex-col bg-white transition-transform duration-300 ease-in-out",
          widthClass,
          // shadow-2xl only while open — its blur radius bleeds ~40-50px past
          // the panel's own edge in every direction, including inward toward
          // the viewport. With this many drawers kept mounted off-screen at
          // once (translate-x-full, not unmounted), an always-on shadow from
          // every closed one stacks into a visible dark band at the viewport
          // edge — that's what was showing up as a "screen shading" bug.
          open ? "translate-x-0 shadow-2xl" : "translate-x-full"
        )}
      >
        <div className="flex flex-shrink-0 items-start justify-between border-b border-line px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-on-surface">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-on-surface-variant">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {footer && <div className="flex-shrink-0 border-t border-line px-6 py-4">{footer}</div>}
      </div>
    </>
  );
}
