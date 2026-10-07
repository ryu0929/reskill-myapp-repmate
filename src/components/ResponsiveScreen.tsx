"use client";

import type { ReactNode } from "react";
import { AppDesktopLayout } from "@/components/AppDesktopLayout";

type ResponsiveScreenProps = {
  mobile: ReactNode;
  desktop: ReactNode;
  userName?: string;
};

export const ResponsiveScreen = ({ mobile, desktop, userName }: ResponsiveScreenProps) => (
  <>
    <div className="max-[768px]:block min-[769px]:hidden">{mobile}</div>
    <div className="hidden w-full min-[769px]:flex">
      <AppDesktopLayout userName={userName}>{desktop}</AppDesktopLayout>
    </div>
  </>
);
