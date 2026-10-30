import Image from "next/image";
import Link from "next/link";
import type { MobileAppHeaderProps } from "@/components/_types/mobile-app-header";

const assets = {
  avatar: "/assets/avatarIcon.svg",
  logo: "/assets/repmate-logo.svg",
} as const;

export const MobileAppHeader = ({
  className = "px-5 pb-4 pt-[calc(var(--spacing)*4+env(safe-area-inset-top))]",
  innerClassName = "w-full",
}: MobileAppHeaderProps) => (
  // 外側のdivで固定ヘッダーと同じ高さを確保し、本文がヘッダーの下へ隠れるのを防ぐ。
  <div className="h-[calc(68px+env(safe-area-inset-top))] w-full shrink-0 min-[769px]:h-auto">
    <header
      className={`fixed inset-x-0 top-0 z-50 flex w-full shrink-0 items-center justify-center bg-[#0b0d12] min-[769px]:static ${className}`}
    >
      {/* safe-area-inset-topはiPhoneなどのノッチ領域を避けるための余白。 */}
      <div className={`flex items-center justify-between ${innerClassName}`}>
        <Link
          href="/"
          className="relative h-9 w-[84px] shrink-0 transition-opacity hover:opacity-90"
          aria-label="ホームへ戻る"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="RepMate"
            className="block size-full max-w-none"
            src={assets.logo}
          />
        </Link>
        <Link
          href="/mypage"
          className="relative size-8 shrink-0 overflow-hidden rounded-2xl transition-opacity hover:opacity-90"
          aria-label="マイページ"
        >
          <Image
            src={assets.avatar}
            alt=""
            fill
            className="object-cover"
            sizes="32px"
          />
        </Link>
      </div>
    </header>
  </div>
);
