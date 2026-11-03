import type { ReactNode } from "react";

export type BottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  ariaLabel: string;
  closeLabel: string;
  children: ReactNode;
  size?: "medium" | "large";
  variant?: "default" | "accent";
};
