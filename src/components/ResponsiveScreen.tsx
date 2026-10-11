"use client";

import { AppDesktopLayout } from "@/components/AppDesktopLayout";
import type { ResponsiveScreenProps } from "@/components/_types/responsive-screen";

export const ResponsiveScreen = ({ mobile, desktop, userName }: ResponsiveScreenProps) => (
  <>
    <div className="max-[768px]:block min-[769px]:hidden">{mobile}</div>
    <div className="hidden w-full min-[769px]:flex">
      <AppDesktopLayout userName={userName}>{desktop}</AppDesktopLayout>
    </div>
  </>
);
