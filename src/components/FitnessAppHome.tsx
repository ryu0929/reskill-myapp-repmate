import Image from "next/image";
import Link from "next/link";
import { AppTabBar } from "@/components/AppTabBar";
import { ResponsiveScreen } from "@/components/ResponsiveScreen";

const assets = {
  avatar: "/assets/avatar.png",
  avatarFrame: "/assets/avatar-frame.png",
  lineGrid: "/assets/line-grid.png",
  logo: "/assets/repmate-logo.svg",
  chevronRight: "/assets/chevron-right.svg",
  chevronRightGoal: "/assets/chevron-right-goal.svg",
  play: "/assets/play.svg",
  trendingUp: "/assets/trending-up.svg",
  sparkline1: "/assets/sparkline-1.svg",
  sparkline2: "/assets/sparkline-2.svg",
  sparkline3: "/assets/sparkline-3.svg",
  sparkline4: "/assets/sparkline-4.svg",
  ellipseBlue: "/assets/ellipse-blue.svg",
} as const;


type GoalSummary = {
  name: string;
  statusLabel: string;
  description: string;
};

type FitnessAppHomeProps = {
  goal?: GoalSummary | null;
  userName?: string;
};

const ActionCard = ({
  title,
  lines,
  actionIcon,
  actionIconClassName = "size-3.5",
  actionLabel,
}: {
  title: string;
  lines: string[];
  actionIcon: string;
  actionIconClassName?: string;
  actionLabel: string;
}) => (
  <button
    type="button"
    className="flex w-full items-center gap-3 rounded-lg bg-gradient-to-r from-[#2a52a0] to-[#1e418c] p-4 text-left shadow-[0px_4px_6px_rgba(24,86,237,0.2)] transition-opacity hover:opacity-95"
  >
    <div className="relative size-12 shrink-0 overflow-hidden rounded-3xl">
      <Image
        src={assets.avatarFrame}
        alt=""
        fill
        className="object-cover"
        sizes="48px"
      />
    </div>
    <div className="min-w-0 flex-1 text-[#f9fafb]">
      <p className="text-xl font-bold">{title}</p>
      {lines.map((line) => (
        <p key={line} className="text-[11px] font-normal">
          {line}
        </p>
      ))}
    </div>
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#0b0d12]"
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className={actionIconClassName} src={actionIcon} />
    </span>
    <span className="sr-only">{actionLabel}</span>
  </button>
);

const HeaderLogo = ({ badgeSize = "text-[9px]" }: { badgeSize?: string }) => (
  <div className="flex items-center gap-2">
    <div className="relative h-9 w-[84px] shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="RepMate" className="block size-full max-w-none" src={assets.logo} />
    </div>
    <span
      className={`rounded bg-[#1856ed] px-1.5 py-0.5 font-[family-name:var(--font-urbanist)] font-bold text-[#0b0d12] ${badgeSize}`}
    >
      AI
    </span>
  </div>
);

const MobileGoalSection = ({ goal }: { goal?: GoalSummary | null }) => (
  <section className="flex w-full flex-col gap-2">
    <h2 className="text-xs font-bold text-[#9ca3af]">今日の目標</h2>
    {goal ? (
      <div className="flex flex-col gap-3 rounded-lg border border-[#242c3b] bg-[linear-gradient(164deg,#141822_25%,#0b0d12_75%)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#10b981]" aria-hidden />
            <p className="text-sm font-bold text-[#f9fafb]">{goal.name}</p>
          </div>
          <span className="shrink-0 text-[11px] font-bold text-[#10b981]">
            {goal.statusLabel}
          </span>
        </div>
        <p className="text-[13px] leading-[1.4] text-[#9ca3af]">{goal.description}</p>
      </div>
    ) : (
      <div className="flex flex-col gap-3 rounded-lg border border-[#242c3b] bg-[#141822] p-4">
        <p className="text-[13px] leading-[1.4] text-[#9ca3af]">
          今日の目標はまだ設定されていません。ワークアウトの計画を作成しましょう。
        </p>
        <button
          type="button"
          className="flex w-fit items-center gap-1 text-[13px] font-bold text-[#1856ed] transition-opacity hover:opacity-90"
        >
          目標を設定する
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" className="size-3" src={assets.chevronRightGoal} />
        </button>
      </div>
    )}
  </section>
);

const MobileHomeView = ({ goal }: { goal?: GoalSummary | null }) => (
  <div
    className="mx-auto flex min-h-[812px] w-full max-w-[375px] flex-col overflow-hidden rounded-2xl bg-[#0b0d12] shadow-2xl"
    data-name="/"
    data-node-id="165:520"
  >
      <header className="flex w-full shrink-0 items-center justify-between px-5 py-4">
        <HeaderLogo />
        <button
          type="button"
          className="relative size-8 shrink-0 overflow-hidden rounded-2xl transition-opacity hover:opacity-90"
          aria-label="プロフィール"
        >
          <Image
            src={assets.avatar}
            alt=""
            fill
            className="object-cover"
            sizes="32px"
          />
        </button>
      </header>

      <main className="flex h-[664px] w-full shrink-0 flex-col gap-4 overflow-y-auto px-5 pb-4">
        <ActionCard
          title="相談する"
          lines={[
            "AIトレーナーとチャットでメニューや強度を相談",
            "現在のメニューを最適化しましょう",
          ]}
          actionIcon={assets.chevronRight}
          actionLabel="相談画面を開く"
        />

        <MobileGoalSection goal={goal} />

        <ActionCard
          title="報告する"
          lines={["AIトレーナーとチャットでトレーニングを記録"]}
          actionIcon={assets.play}
          actionIconClassName="size-4"
          actionLabel="報告画面を開く"
        />

        <section className="flex w-full flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#9ca3af]">成長レポート</h2>
            <button
              type="button"
              className="text-[11px] text-[#6b7280] transition-colors hover:text-[#9ca3af]"
            >
              詳細表示
            </button>
          </div>
          <div className="flex flex-col gap-3 rounded-lg border border-[#242c3b] bg-[#141822] p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-[#9ca3af]">推定 1RM 推移 (Bench Press)</p>
                <p className="font-[family-name:var(--font-urbanist)] text-[#f9fafb]">
                  <span className="text-2xl font-bold">92.5 </span>
                  <span className="text-sm font-medium text-[#9ca3af]">kg</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1 rounded-md bg-[rgba(16,185,129,0.13)] px-2 py-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="" className="size-3" src={assets.trendingUp} />
                <span className="font-[family-name:var(--font-urbanist)] text-xs font-bold text-[#10b981]">
                  +4.2%
                </span>
              </div>
            </div>

            <div className="flex h-[60px] w-full flex-col justify-center">
              <div className="relative h-10 w-full max-w-[303px]">
                <div className="absolute left-0 top-[10px] h-px w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="" className="h-px w-full max-w-none" src={assets.lineGrid} />
                </div>
                <div className="absolute left-0 top-[30px] h-px w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="" className="h-px w-full max-w-none" src={assets.lineGrid} />
                </div>
                <div className="absolute left-[10px] top-[19.47px] flex h-[15.529px] w-[57.956px] items-center justify-center">
                  <div className="-rotate-[15deg]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" className="w-[60px] max-w-none" src={assets.sparkline1} />
                  </div>
                </div>
                <div className="absolute left-[68px] top-[12.46px] flex h-[6.537px] w-[74.715px] items-center justify-center">
                  <div className="-rotate-[5deg]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" className="w-[75px] max-w-none" src={assets.sparkline2} />
                  </div>
                </div>
                <div className="absolute left-[143px] top-3 flex h-[16.633px] w-[78.252px] items-center justify-center">
                  <div className="rotate-12">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" className="w-20 max-w-none" src={assets.sparkline3} />
                  </div>
                </div>
                <div className="absolute left-[221px] top-[-1.43px] flex h-[30.429px] w-[65.254px] items-center justify-center">
                  <div className="-rotate-[25deg]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" className="w-[72px] max-w-none" src={assets.sparkline4} />
                  </div>
                </div>
                <div className="absolute left-[288px] top-[-3px] size-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="" className="size-full" src={assets.ellipseBlue} />
                </div>
              </div>
            </div>

            <div className="flex items-start justify-between gap-2 text-[11px]">
              <span className="text-[#6b7280]">過去30日間の記録</span>
              <span className="text-right text-[#9ca3af]">
                自己ベスト更新まであと 2.5kg
              </span>
            </div>
          </div>
        </section>
      </main>

      <AppTabBar active="home" variant="home" />
    </div>
);

const DesktopActionCard = ({
  title,
  lines,
  href,
}: {
  title: string;
  lines: string[];
  href: string;
}) => (
  <Link
    href={href}
    className="flex min-h-[148px] flex-1 flex-col items-start justify-center gap-[18px] rounded-xl bg-gradient-to-r from-[#2a5ab6] to-[#173b84] p-6 shadow-[0px_6px_18px_rgba(24,86,237,0.2)] transition-opacity hover:opacity-95"
  >
    <div className="relative size-16 overflow-hidden rounded-full">
      <Image src={assets.avatarFrame} alt="" fill className="object-cover" sizes="64px" />
    </div>
    <div className="w-full text-[#f8fafc]">
      <p className="text-2xl font-bold">{title}</p>
      {lines.map((line) => (
        <p key={line} className="mt-1 text-[13px] leading-[1.5]">
          {line}
        </p>
      ))}
    </div>
    <span
      className="flex size-[42px] items-center justify-center rounded-lg bg-[#080b10]"
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="size-[18px]" src={assets.chevronRight} />
    </span>
  </Link>
);

const DesktopGoalPanel = ({ goal }: { goal?: GoalSummary | null }) => (
  <section className="flex min-w-0 flex-1 flex-col gap-2.5">
    <h2 className="text-sm font-bold text-[#98a2b3]">今日の目標</h2>
    {goal ? (
      <div className="flex min-h-[180px] flex-col items-start gap-4 rounded-xl border border-[#273142] bg-[linear-gradient(164deg,#161c27_25%,#080b10_75%)] p-6">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#10b981]" aria-hidden />
            <p className="text-sm font-bold text-[#f8fafc]">{goal.name}</p>
          </div>
          <span className="shrink-0 text-xs font-bold text-[#10b981]">
            {goal.statusLabel}
          </span>
        </div>
        <p className="text-sm leading-[1.5] text-[#98a2b3]">{goal.description}</p>
      </div>
    ) : (
      <div className="flex min-h-[180px] flex-col items-start gap-4 rounded-xl border border-[#273142] bg-[#161c27] p-6">
        <p className="text-sm leading-[1.5] text-[#98a2b3]">
          今日の目標はまだ設定されていません。ワークアウトの計画を作成しましょう。
        </p>
        <button
          type="button"
          className="text-sm font-bold text-[#2463eb] transition-opacity hover:opacity-80"
        >
          目標を設定する &gt;
        </button>
      </div>
    )}
  </section>
);

const DesktopGrowthReport = () => (
  <section className="flex min-w-0 flex-1 flex-col gap-2.5">
    <div>
      <h2 className="text-sm font-bold text-[#98a2b3]">成長レポート</h2>
      <button
        type="button"
        className="mt-1 text-xs text-[#667085] transition-colors hover:text-[#98a2b3]"
      >
        詳細表示
      </button>
    </div>
    <div className="flex min-h-[300px] flex-col gap-[18px] rounded-xl border border-[#273142] bg-[#161c27] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] text-[#98a2b3]">
            推定 1RM 推移 (Bench Press)
          </p>
          <p className="font-[family-name:var(--font-urbanist)] text-[32px] font-bold text-[#f8fafc]">
            92.5 kg
          </p>
        </div>
        <div className="rounded-md bg-[#0d3b33] px-2.5 py-1.5">
          <p className="font-[family-name:var(--font-urbanist)] text-[13px] font-bold text-[#19c48a]">
            +4.2%
          </p>
        </div>
      </div>

      <div className="relative h-[110px] w-full overflow-hidden">
        <div className="absolute left-0 top-[30px] h-px w-full bg-[#273142]" />
        <div className="absolute left-0 top-[78px] h-px w-full bg-[#273142]" />
        <svg aria-hidden className="absolute inset-x-2 top-[18px] h-[82px] w-[calc(100%-16px)]" viewBox="0 0 450 82" preserveAspectRatio="none">
          <polyline
            points="0,66 110,48 230,38 330,55 450,28"
            fill="none"
            stroke="#1856ed"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
        </svg>
      </div>

      <div className="flex items-start justify-between gap-3 text-[11px]">
        <span className="text-[#667085]">過去30日間の記録</span>
        <span className="text-right text-[#98a2b3]">
          自己ベスト更新まであと 2.5kg
        </span>
      </div>
    </div>
  </section>
);

const DesktopHomeView = ({ goal }: { goal?: GoalSummary | null }) => (
  <main className="flex flex-col gap-6 p-10">
        <section className="flex gap-6">
          <DesktopActionCard
            title="相談する"
            lines={[
              "AIトレーナーとチャットでメニューや強度を相談",
              "現在のメニューを最適化しましょう",
            ]}
            href="/consult"
          />
          <DesktopActionCard
            title="報告する"
            lines={["AIトレーナーとチャットでトレーニングを記録"]}
            href="/report"
          />
        </section>
        <section className="flex gap-6">
          <DesktopGoalPanel goal={goal} />
          <DesktopGrowthReport />
        </section>
      </main>
);

export const FitnessAppHome = ({ goal = null, userName }: FitnessAppHomeProps) => (
  <ResponsiveScreen
    userName={userName}
    mobile={<MobileHomeView goal={goal} />}
    desktop={<DesktopHomeView goal={goal} />}
  />
);
