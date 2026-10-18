import type { ReactNode } from "react";

export type AppUserContextValue = {
  userName: string;
};

export type AppUserProviderProps = AppUserContextValue & {
  children: ReactNode;
};
