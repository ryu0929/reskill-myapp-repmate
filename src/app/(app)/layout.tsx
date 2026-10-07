import type { ReactNode } from "react";
import { MobileShell } from "@/components/MobileShell";

const AppLayout = ({ children }: { children: ReactNode }) => (
  <MobileShell>{children}</MobileShell>
);

export default AppLayout;
