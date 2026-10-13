import Image from "next/image";
import Link from "next/link";
import type { MobileAppHeaderProps } from "@/components/_types/mobile-app-header";

const assets = {
  avatar: "/assets/avatarIcon.svg",
  logo: "/assets/repmate-logo.svg",
} as const;

export const MobileAppHeader = ({
  className = "px-5 py-4",
  innerClassName = "w-full",
}: MobileAppHeaderProps) => (
  <header className={`flex w-full shrink-0 items-center justify-center ${className}`}>
    <div className={`flex items-center justify-between ${innerClassName}`}>
      <div className="relative h-9 w-[84px] shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="RepMate" className="block size-full max-w-none" src={assets.logo} />
      </div>
      <Link
        href="/mypage"
        className="relative size-8 shrink-0 overflow-hidden rounded-2xl transition-opacity hover:opacity-90"
        aria-label="マイページ"
      >
        <Image src={assets.avatar} alt="" fill className="object-cover" sizes="32px" />
      </Link>
    </div>
  </header>
);
