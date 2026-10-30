import Link from "next/link";
import { AppTabBar } from "@/components/AppTabBar";
import { MobileAppHeader } from "@/components/MobileAppHeader";
import { ResponsiveScreen } from "@/components/ResponsiveScreen";
import type {
  FitnessAppHomeProps,
  GoalSummary,
  GrowthReportSummary,
} from "../_types/home";
import { HomeActionCard } from "./HomeActionCard";

const assets = {
  avatar: "/assets/avatarIcon.svg",
  logo: "/assets/repmate-logo.svg",
  chevronRight: "/assets/chevron-right.svg",
  chevronRightGoal: "/assets/chevron-right-goal.svg",
  play: "/assets/play.svg",
} as const;

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
        <p className="text-[13px] leading-[1.4] text-[#9ca3af]">
          {goal.description}
        </p>
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

const getChartPoints = (chart: GrowthReportSummary["chart"]) => {
  // 値の最小・最大をSVGの高さへ変換し、重量の範囲が違ってもグラフ内に収める。
  const width = 300;
  const height = 60;
  const values = chart.map(({ value }) => value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return chart.map(({ value }, index) => ({
    x: chart.length === 1 ? width / 2 : (index / (chart.length - 1)) * width,
    y: height - ((value - min) / range) * (height - 16) - 8,
  }));
};

const GrowthChart = ({ chart }: { chart: GrowthReportSummary["chart"] }) => {
  const points = getChartPoints(chart);

  return (
    <div className="relative h-[76px] w-full">
      <div className="absolute inset-x-0 top-4 h-px bg-[#273142]" />
      <div className="absolute inset-x-0 bottom-4 h-px bg-[#273142]" />
      <svg
        aria-label="推定1RMの推移"
        className="absolute inset-0 size-full"
        role="img"
        viewBox="0 0 300 60"
        preserveAspectRatio="none"
      >
        <polyline
          points={points.map(({ x, y }) => `${x},${y}`).join(" ")}
          fill="none"
          stroke="#1856ed"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />
        {points.map(({ x, y }, index) => (
          <circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            fill={index === points.length - 1 ? "#1856ed" : "#141822"}
            r="3"
            stroke="#1856ed"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );
};

const GrowthReportContent = ({
  growthReport,
}: {
  growthReport?: GrowthReportSummary | null;
}) => {
  if (!growthReport) {
    return (
      <div className="flex min-h-[180px] flex-col items-start justify-center gap-3 rounded-lg border border-[#242c3b] bg-[#141822] p-4 min-[769px]:min-h-[300px] min-[769px]:rounded-xl min-[769px]:border-[#273142] min-[769px]:bg-[#161c27] min-[769px]:p-6">
        <p className="text-[13px] leading-[1.5] text-[#9ca3af]">
          トレーニングを報告すると、好調な種目の推移がここに表示されます。
        </p>
        <Link
          href="/report"
          className="text-[13px] font-bold text-[#1856ed] transition-opacity hover:opacity-80"
        >
          トレーニングを報告する
        </Link>
      </div>
    );
  }

  const trendPrefix = growthReport.trendRate > 0 ? "+" : "";
  const trendClassName =
    growthReport.trendRate > 0
      ? "bg-[rgba(16,185,129,0.13)] text-[#10b981]"
      : growthReport.trendRate < 0
        ? "bg-[rgba(239,68,68,0.13)] text-[#ef4444]"
        : "bg-[#242c3b] text-[#9ca3af]";

  return (
    <div className="flex min-h-[220px] flex-col gap-3 rounded-lg border border-[#242c3b] bg-[#141822] p-4 min-[769px]:min-h-[300px] min-[769px]:gap-[18px] min-[769px]:rounded-xl min-[769px]:border-[#273142] min-[769px]:bg-[#161c27] min-[769px]:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs text-[#9ca3af] min-[769px]:text-[13px]">
            推定 1RM 推移（{growthReport.exercise}）
          </p>
          <p className="font-[family-name:var(--font-urbanist)] text-[#f9fafb]">
            <span className="text-2xl font-bold min-[769px]:text-[32px]">
              {growthReport.estimatedOneRepMax.toFixed(1)}
            </span>{" "}
            <span className="text-sm font-medium text-[#9ca3af]">kg</span>
          </p>
        </div>
        <div
          className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ${trendClassName}`}
        >
          {trendPrefix}
          {growthReport.trendRate.toFixed(1)}%
        </div>
      </div>

      <GrowthChart chart={growthReport.chart} />

      <div className="flex items-start justify-between gap-3 text-[11px]">
        <span className="text-[#6b7280]">過去90日間の記録</span>
        <span className="text-right text-[#9ca3af]">最も伸び率が高い種目</span>
      </div>
    </div>
  );
};

const MobileHomeView = ({
  goal,
  growthReport,
}: {
  goal?: GoalSummary | null;
  growthReport?: GrowthReportSummary | null;
}) => (
  // 親のデバイス高を引き継ぎ、ヘッダーとナビ以外のmainだけをスクロールさせる。
  <div
    className="mx-auto flex h-full w-full flex-col overflow-hidden bg-[#0b0d12] shadow-2xl"
    data-name="/"
    data-node-id="165:520"
  >
    <MobileAppHeader />

    {/* min-h-0とoverflow-y-autoの組み合わせで、狭い端末でも内容を縦に閲覧できる。 */}
    <main className="flex min-h-0 w-full flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-5 pb-4 [&>*]:shrink-0">
      <HomeActionCard
        title="相談する"
        href="/consult"
        lines={[
          "AIトレーナーとチャットでメニューや強度を相談",
          "現在のメニューを最適化しましょう",
        ]}
        mobileActionIcon={assets.chevronRight}
        actionLabel="相談画面を開く"
      />

      <MobileGoalSection goal={goal} />

      <HomeActionCard
        title="報告する"
        href="/report"
        lines={["AIトレーナーとチャットでトレーニングを記録"]}
        mobileActionIcon={assets.play}
        mobileActionIconClassName="size-4"
        actionLabel="報告画面を開く"
      />

      <section className="flex w-full flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#9ca3af]">成長レポート</h2>
          <Link
            href="/progress"
            className="text-[11px] text-[#6b7280] transition-colors hover:text-[#9ca3af]"
          >
            詳細表示
          </Link>
        </div>
        <GrowthReportContent growthReport={growthReport} />
      </section>
    </main>

    <AppTabBar active="home" />
  </div>
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
        <p className="text-sm leading-[1.5] text-[#98a2b3]">
          {goal.description}
        </p>
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

const DesktopGrowthReport = ({
  growthReport,
}: {
  growthReport?: GrowthReportSummary | null;
}) => (
  <section className="flex min-w-0 flex-1 flex-col gap-2.5">
    <div>
      <h2 className="text-sm font-bold text-[#98a2b3]">成長レポート</h2>
      <Link
        href="/progress"
        className="mt-1 text-xs text-[#667085] transition-colors hover:text-[#98a2b3]"
      >
        詳細表示
      </Link>
    </div>
    <GrowthReportContent growthReport={growthReport} />
  </section>
);

const DesktopHomeView = ({
  goal,
  growthReport,
}: {
  goal?: GoalSummary | null;
  growthReport?: GrowthReportSummary | null;
}) => (
  // PCは上段に主要アクション、下段に目標と成長レポートを2列で配置する。
  <main className="flex flex-col gap-6 p-10">
    <section className="flex gap-6">
      <HomeActionCard
        title="相談する"
        lines={[
          "AIトレーナーとチャットでメニューや強度を相談",
          "現在のメニューを最適化しましょう",
        ]}
        href="/consult"
        mobileActionIcon={assets.chevronRight}
        actionLabel="相談画面を開く"
      />
      <HomeActionCard
        title="報告する"
        lines={["AIトレーナーとチャットでトレーニングを記録"]}
        href="/report"
        mobileActionIcon={assets.play}
        mobileActionIconClassName="size-4"
        actionLabel="報告画面を開く"
      />
    </section>
    <section className="flex gap-6">
      <DesktopGoalPanel goal={goal} />
      <DesktopGrowthReport growthReport={growthReport} />
    </section>
  </main>
);

export const FitnessAppHome = ({
  goal = null,
  growthReport = null,
  userName,
}: FitnessAppHomeProps) => (
  <ResponsiveScreen
    userName={userName}
    mobile={<MobileHomeView goal={goal} growthReport={growthReport} />}
    desktop={<DesktopHomeView goal={goal} growthReport={growthReport} />}
  />
);
