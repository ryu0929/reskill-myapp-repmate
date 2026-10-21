"use client";

import { AppDesktopLayout } from "@/components/AppDesktopLayout";
import type { ResponsiveScreenProps } from "@/components/_types/responsive-screen";

export const ResponsiveScreen = ({ mobile, desktop, userName }: ResponsiveScreenProps) => (
  <>
    <div className="block h-full w-full min-w-0 min-[769px]:hidden">{mobile}</div>
    <div className="hidden w-full min-[769px]:flex">
      <AppDesktopLayout userName={userName}>{desktop}</AppDesktopLayout>
    </div>
  </>
);
