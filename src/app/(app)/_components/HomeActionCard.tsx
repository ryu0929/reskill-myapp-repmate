import Image from "next/image";
import Link from "next/link";
import type { HomeActionCardProps } from "../_types/home";

const assets = {
  trainerAvatar: "/assets/trainer-avatar.png",
  chevronRight: "/assets/chevron-right.svg",
} as const;

export const HomeActionCard = ({
  title,
  href,
  lines,
  mobileActionIcon,
  mobileActionIconClassName = "size-3.5",
  actionLabel,
}: HomeActionCardProps) => (
  <Link
    href={href}
    className="flex w-full min-w-0 items-center gap-3 rounded-lg bg-gradient-to-r from-[#2a52a0] to-[#1e418c] p-4 text-left shadow-[0px_4px_6px_rgba(24,86,237,0.2)] transition-opacity hover:opacity-95 min-[769px]:min-h-[148px] min-[769px]:flex-1 min-[769px]:gap-6 min-[769px]:rounded-xl min-[769px]:bg-gradient-to-r min-[769px]:from-[#2a5ab6] min-[769px]:to-[#173b84] min-[769px]:p-6 min-[769px]:shadow-[0px_6px_18px_rgba(24,86,237,0.2)]"
  >
    <div className="flex min-w-0 flex-1 items-center gap-3 min-[769px]:gap-[18px]">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-full min-[769px]:size-16">
        <Image
          src={assets.trainerAvatar}
          alt=""
          fill
          className="object-cover"
          sizes="(min-width: 769px) 64px, 48px"
        />
      </div>
      <div className="min-w-0 flex-1 text-[#f9fafb] min-[769px]:text-[#f8fafc]">
        <p className="text-xl font-bold min-[769px]:text-2xl">{title}</p>
        <div className="text-[11px] font-normal min-[769px]:mt-1.5 min-[769px]:text-[13px] min-[769px]:leading-[1.5]">
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    </div>
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#0b0d12] min-[769px]:size-[42px] min-[769px]:bg-[#080b10]"
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        className={`${mobileActionIconClassName} min-[769px]:hidden`}
        src={mobileActionIcon}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        className="hidden size-[18px] min-[769px]:block"
        src={assets.chevronRight}
      />
    </span>
    <span className="sr-only">{actionLabel}</span>
  </Link>
);
