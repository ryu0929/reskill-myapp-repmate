import type { ReactNode } from "react";

export const MobileShell = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen items-center justify-center bg-[#050608] p-4">
    {children}
  </div>
);
