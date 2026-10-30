import type { ReactNode } from "react";

export const MobileShell = ({ children }: { children: ReactNode }) => (
  // dvhはブラウザのアドレスバーを考慮した「実際に見えている高さ」に合わせられる。
  <div className="flex h-dvh items-center justify-center overflow-hidden bg-[#050608] min-[769px]:h-auto min-[769px]:min-h-screen min-[769px]:overflow-visible min-[769px]:p-4">
    {children}
  </div>
);
