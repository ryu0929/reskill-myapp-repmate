"use client";

import { AppDesktopLayout } from "@/components/AppDesktopLayout";
import type { ResponsiveScreenProps } from "@/components/_types/responsive-screen";

export const ResponsiveScreen = ({
  mobile,
  desktop,
  userName,
}: ResponsiveScreenProps) => (
  <>
    {/* 768pxまでは各画面のモバイル表示を使用する。 */}
    <div className="block h-full w-full min-w-0 min-[769px]:hidden">
      {mobile}
    </div>
    {/* 769px以上では共通サイドバー・ヘッダーの内側にPC表示を配置する。 */}
    <div className="hidden w-full min-[769px]:flex">
      <AppDesktopLayout userName={userName}>{desktop}</AppDesktopLayout>
    </div>
  </>
);
