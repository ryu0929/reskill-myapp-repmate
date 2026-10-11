import type { ReactNode } from "react";

export type ResponsiveScreenProps = {
  mobile: ReactNode;
  desktop: ReactNode;
  userName?: string;
};
