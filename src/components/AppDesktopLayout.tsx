"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppUser } from "@/components/AppUserProvider";
import type {
  AppDesktopLayoutProps,
  DesktopHeaderProps,
  DesktopNavigationItem,
  DesktopNavItemProps,
  DesktopPageMeta,
  DesktopSidebarProps,
} from "@/components/_types/app-desktop-layout";

const assets = {
  avatar: "/assets/avatarIcon.svg",
  logo: "/assets/repmate-logo.svg",
  tabHome: "/assets/tab-home.svg",
  tabConsult: "/assets/tab-consult.svg",
  tabReport: "/assets/tab-report.svg",
  tabProgress: "/assets/tab-progress.svg",
} as const;

const navigationItems: DesktopNavigationItem[] = [
  { label: "HOME", href: "/", icon: assets.tabHome, id: "home" },
  {
    label: "CONSULT",
    href: "/consult",
    icon: assets.tabConsult,
    id: "consult",
  },
  { label: "REPORT", href: "/report", icon: assets.tabReport, id: "report" },
  {
    label: "PROGRESS",
    href: "/progress",
    icon: assets.tabProgress,
    id: "progress",
  },
];

const desktopPageMeta: Record<string, DesktopPageMeta> = {
  "/": {
    active: "home",
    title: "ホーム",
    subtitle: "今日も一歩ずつ、目標に近づきましょう。",
  },
  "/consult": {
    active: "consult",
    title: "AIトレーナー相談",
    subtitle: "現在のメニューを最適化しましょう。",
  },
  "/report": {
    active: "report",
    title: "トレーニング記録",
    subtitle: "AIトレーナーとチャットで本日のワークアウトを記録しましょう。",
  },
  "/progress": {
    active: "progress",
    title: "トレーニング進捗",
    subtitle: "過去のトレーニングデータとAIによる詳細分析。",
  },
};

const getDesktopPageMeta = (pathname: string) =>
  desktopPageMeta[pathname] ?? desktopPageMeta["/"];

const HeaderLogo = () => (
  <Link
    href="/"
    className="flex w-fit self-center items-center gap-2 transition-opacity hover:opacity-90"
    aria-label="ホームへ戻る"
  >
    <div className="relative h-9 w-[84px] shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="RepMate"
        className="block size-full max-w-none"
        src={assets.logo}
      />
    </div>
  </Link>
);

const DesktopNavItem = ({ label, href, icon, active }: DesktopNavItemProps) => (
  <Link
    href={href}
    className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-3 transition-colors ${
      active
        ? "bg-[#1d3f83] text-[#f8fafc]"
        : "text-[#98a2b3] hover:bg-[#161c27]"
    }`}
    aria-current={active ? "page" : undefined}
  >
    <span className="flex size-5 items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="size-5" src={icon} />
    </span>
    <span className="font-[family-name:var(--font-urbanist)] text-xs font-semibold tracking-wide">
      {label}
    </span>
  </Link>
);

const DesktopSidebar = ({ active, userName }: DesktopSidebarProps) => (
  <aside className="flex w-[248px] shrink-0 flex-col justify-between border-r border-[#273142] bg-[#111620] px-5 pb-6 pt-[30px]">
    <div className="flex flex-col gap-8">
      <HeaderLogo />
      <nav className="flex flex-col gap-2" aria-label="メイン">
        {navigationItems.map((item) => (
          <DesktopNavItem
            key={item.href}
            {...item}
            active={item.id === active}
          />
        ))}
      </nav>
    </div>

    <Link
      href="/mypage"
      className="flex items-center gap-3 rounded-lg bg-[#161c27] p-3 transition-opacity hover:opacity-90"
      aria-label="マイページ"
    >
      <div className="relative size-9 overflow-hidden rounded-full">
        <Image
          src={assets.avatar}
          alt=""
          fill
          className="object-cover"
          sizes="36px"
        />
      </div>
      <div>
        <p className="max-w-[11em] truncate text-[13px] font-bold text-[#f8fafc]">
          {userName}
        </p>
        <p className="text-[11px] text-[#98a2b3]">トレーニング中</p>
      </div>
    </Link>
  </aside>
);

const DesktopHeader = ({
  active,
  title,
  subtitle,
  userName,
}: DesktopHeaderProps) => (
  <header className="flex h-[88px] shrink-0 items-center justify-between border-b border-[#273142] px-10">
    <div className="min-w-0">
      {active === "home" ? (
        <h1 className="flex min-w-0 items-baseline text-2xl font-bold text-[#f8fafc]">
          <span className="shrink-0">おかえりなさい、</span>
          <span className="inline-block max-w-[11em] truncate align-bottom">
            {userName}
          </span>
          <span className="shrink-0">さん</span>
        </h1>
      ) : (
        <h1 className="text-2xl font-bold text-[#f8fafc]">{title}</h1>
      )}
      <p className="mt-1 text-[13px] text-[#98a2b3]">{subtitle}</p>
    </div>
    <div className="flex items-center gap-3">
      <Link
        href="/mypage"
        className="relative size-10 overflow-hidden rounded-full transition-opacity hover:opacity-90"
        aria-label="マイページ"
      >
        <Image
          src={assets.avatar}
          alt=""
          fill
          className="object-cover"
          sizes="40px"
        />
      </Link>
    </div>
  </header>
);

export const AppDesktopLayout = ({
  children,
  userName: userNameProp,
}: AppDesktopLayoutProps) => {
  // URLから選択中メニューとヘッダー文言を決め、全PC画面で表示を統一する。
  const pathname = usePathname();
  const meta = getDesktopPageMeta(pathname);
  const { userName: contextUserName } = useAppUser();
  const userName = userNameProp ?? contextUserName;

  return (
    // 左を固定幅のaside、右をflex-1にして大きなモニターでも右側を埋める。
    <div className="flex min-h-[calc(100vh-32px)] w-full overflow-hidden rounded-2xl bg-[#080b10] shadow-2xl">
      <DesktopSidebar active={meta.active} userName={userName} />
      {/* min-w-0が右列のはみ出しを防ぎ、子画面側のスクロールを有効にする。 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <DesktopHeader
          active={meta.active}
          title={meta.title}
          subtitle={meta.subtitle}
          userName={userName}
        />
        {children}
      </div>
    </div>
  );
};
