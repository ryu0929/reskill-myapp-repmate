"use client";

import { createContext, useContext } from "react";
import type {
  AppUserContextValue,
  AppUserProviderProps,
} from "@/components/_types/app-user";

const AppUserContext = createContext<AppUserContextValue | null>(null);

export const AppUserProvider = ({
  children,
  userName,
}: AppUserProviderProps) => (
  <AppUserContext.Provider value={{ userName }}>
    {children}
  </AppUserContext.Provider>
);

export const useAppUser = () => {
  const context = useContext(AppUserContext);

  if (!context) {
    throw new Error("useAppUser must be used within AppUserProvider");
  }

  return context;
};
