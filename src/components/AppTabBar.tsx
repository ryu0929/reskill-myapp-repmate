import Link from "next/link";
import type {
  AppTabBarProps,
  TabConfig,
} from "@/components/_types/app-tab-bar";

const homeTabs: TabConfig[] = [
  { id: "home", href: "/", label: "home", icon: "/assets/tab-home.svg" },
  {
    id: "consult",
    href: "/consult",
    label: "consult",
    icon: "/assets/tab-consult.svg",
  },
  {
    id: "report",
    href: "/report",
    label: "report",
    icon: "/assets/tab-report.svg",
  },
  {
    id: "progress",
    href: "/progress",
    label: "progress",
    icon: "/assets/tab-progress.svg",
  },
];

export const AppTabBar = ({ active }: AppTabBarProps) => {
  // 下部のホームインジケーター領域を含めた高さを、余白確保と固定navで共有する。
  const heightClass = "h-[calc(80px+env(safe-area-inset-bottom))]";
  return (
    // 外側のdivが本文の末尾に余白を作り、固定ナビとの重なりを防ぐ。
    <div className={`${heightClass} w-full shrink-0`}>
      <nav
        className={`fixed inset-x-0 bottom-0 z-50 flex ${heightClass} w-full shrink-0 items-center justify-between border-t border-[#242c3b] bg-[#141822] px-4 pb-[env(safe-area-inset-bottom)] min-[769px]:static`}
        aria-label="メイン"
      >
        {homeTabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg ${
                isActive ? "bg-[#1d3f83]" : ""
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="flex size-5 items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="" className="size-5" src={tab.icon} />
              </span>
              <span
                className={`font-[family-name:var(--font-urbanist)] text-[10px] font-semibold uppercase ${
                  isActive ? "text-[#f8fafc]" : "text-[#6b7280]"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
