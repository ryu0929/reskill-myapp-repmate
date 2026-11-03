"use client";

import type { BottomSheetProps } from "./_types/bottom-sheet";

const BottomSheet = ({
  isOpen,
  onClose,
  ariaLabel,
  closeLabel,
  children,
  size = "medium",
  variant = "default",
}: BottomSheetProps) => {
  const maxHeightClass = size === "large" ? "max-h-[72%]" : "max-h-[65%]";

  const backgroundClass =
    variant === "accent"
      ? "bg-gradient-to-r from-[#1a2744] to-[#0f1520]"
      : "bg-[#111620]";

  return (
    <>
      <div
        className={`absolute inset-0 z-20 bg-black/40 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden
      />

      <aside
        aria-label={ariaLabel}
        className={`absolute inset-x-0 bottom-[calc(80px+env(safe-area-inset-bottom))] z-30 flex flex-col gap-4 rounded-t-2xl border-t border-[#242c3b] px-5 pb-5 pt-2 transition-transform duration-200 ease-out ${maxHeightClass} ${backgroundClass} ${
          isOpen ? "translate-y-0" : "translate-y-[110%]"
        }`}
      >
        <div className="relative flex justify-center">
          <span className="h-1 w-10 rounded-full bg-[#384255]" aria-hidden />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 top-0 flex size-7 items-center justify-center text-lg text-[#98a2b3]"
            aria-label={closeLabel}
          >
            ×
          </button>
        </div>

        {children}
      </aside>
    </>
  );
};

export default BottomSheet;
