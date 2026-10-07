import Link from "next/link";

export type AppTabId = "home" | "consult" | "report" | "progress";

type TabConfig = {
  id: AppTabId;
  href: string;
  label: string;
  icon: string;
};

const homeTabs: TabConfig[] = [
  { id: "home", href: "/", label: "home", icon: "/assets/tab-home.svg" },
  { id: "consult", href: "/consult", label: "consult", icon: "/assets/tab-consult.svg" },
  { id: "report", href: "/report", label: "report", icon: "/assets/tab-report.svg" },
  { id: "progress", href: "/progress", label: "progress", icon: "/assets/tab-progress.svg" },
];

const consultTabs: TabConfig[] = [
  { id: "home", href: "/", label: "HOME", icon: "/assets/consult/tab-home.svg" },
  { id: "consult", href: "/consult", label: "CONSULT", icon: "/assets/consult/tab-consult.svg" },
  { id: "report", href: "/report", label: "REPORT", icon: "/assets/consult/tab-report.svg" },
  { id: "progress", href: "/progress", label: "PROGRESS", icon: "/assets/consult/tab-progress.svg" },
];

type AppTabBarProps = {
  active: AppTabId;
  variant?: "home" | "consult";
};

export const AppTabBar = ({ active, variant = "home" }: AppTabBarProps) => {
  const tabs = variant === "consult" ? consultTabs : homeTabs;
  const heightClass = variant === "consult" ? "h-[84px]" : "h-20";
  const iconClass = variant === "consult" ? "size-4" : "size-5";
  const labelClass =
    variant === "consult"
      ? "font-bold uppercase"
      : "font-semibold uppercase";

  return (
    <nav
      className={`flex ${heightClass} w-full shrink-0 items-center justify-between border-t border-[#242c3b] bg-[#141822] px-4`}
      aria-label="メイン"
    >
      {tabs.map((tab) => {
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
              <img alt="" className={iconClass} src={tab.icon} />
            </span>
            <span
              className={`font-[family-name:var(--font-urbanist)] text-[10px] ${labelClass} ${
                isActive ? "text-[#f8fafc]" : "text-[#6b7280]"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
