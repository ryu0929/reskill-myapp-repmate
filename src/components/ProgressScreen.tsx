"use client";

import Image from "next/image";
import { useState } from "react";
import { AppTabBar } from "@/components/AppTabBar";
import { ResponsiveScreen } from "@/components/ResponsiveScreen";

type PersonalBest = {
  label: string;
  date: string;
  value: number;
  highlight?: boolean;
};

type ChartPoint = {
  label: string;
  value: number;
};

type ProgressData = {
  exercise: (typeof EXERCISES)[number];
  estimatedOneRepMax: number;
  trendRate: number;
  chart: ChartPoint[];
  personalBests: PersonalBest[];
  aiComment: string;
};

type ProgressScreenProps = {
  data?: ProgressData;
  userName?: string;
};

const EXERCISES = ["ベンチプレス", "スクワット", "デッドリフト", "ショルダープレス"] as const;

type Exercise = (typeof EXERCISES)[number];

const assets = {
  avatar: "/assets/consult/avatar.png",
  aiAvatar: "/assets/consult/ai-avatar.png",
  logo: "/assets/repmate-logo.svg",
  chevronDown: "/assets/consult/chevron-down.svg",
  trendingUp: "/assets/trending-up.svg",
} as const;

const defaultProgressData: ProgressData = {
  exercise: "ベンチプレス",
  estimatedOneRepMax: 92.5,
  trendRate: 4.2,
  chart: [
    { label: "6月", value: 82 },
    { label: "7月", value: 87.5 },
    { label: "8月", value: 92.5 },
  ],
  personalBests: [
    { label: "1RM", date: "2024年7月15日", value: 95, highlight: true },
    { label: "5RM", date: "2024年8月10日", value: 82.5 },
    { label: "10RM", date: "2024年8月20日", value: 70 },
  ],
  aiComment:
    "順調に伸びています！特に8月に入ってからの成長が著しいです。このペースなら来月には95kgの壁を突破できるでしょう。フォームの安定性も向上しているので、自信を持って取り組んでください。",
};

const formatWeight = (value: number) => value.toFixed(1);

const ProgressHeader = () => (
  <header className="flex w-full shrink-0 items-center justify-between px-5 pb-3 pt-5">
    <div className="flex items-center gap-2">
      <div className="relative h-9 w-[84px] shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="RepMate" className="block size-full max-w-none" src={assets.logo} />
      </div>
      <span className="rounded bg-[#1856ed] px-1.5 py-0.5 font-[family-name:var(--font-urbanist)] text-[9px] font-bold text-[#0b0d12]">
        AI
      </span>
    </div>
    <button
      type="button"
      className="relative size-8 shrink-0 overflow-hidden rounded-2xl transition-opacity hover:opacity-90"
      aria-label="プロフィール"
    >
      <Image src={assets.avatar} alt="" fill className="object-cover" sizes="32px" />
    </button>
  </header>
);

const ExerciseSelector = ({
  exercise,
  isOpen,
  onToggle,
  onChange,
  desktop = false,
}: {
  exercise: Exercise;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (exercise: Exercise) => void;
  desktop?: boolean;
}) => (
  <div className="relative w-full shrink-0">
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-center justify-between rounded-lg border bg-[#141822] text-left ${
        desktop ? "border-[#273142] p-3.5" : "border-[#242c3b] p-3.5"
      }`}
    >
      <span className="text-[15px] font-bold text-[#f9fafb]">{exercise}</span>
      <span className="flex items-center gap-1 text-xs font-bold text-[#9ca3af] min-[769px]:text-[13px]">
        種目を変更
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" className="size-3.5" src={assets.chevronDown} />
      </span>
    </button>
    {isOpen && (
      <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-[#273142] bg-[#141822] shadow-lg">
        {EXERCISES.map((item) => (
          <li key={item}>
            <button
              type="button"
              onClick={() => onChange(item)}
              className="w-full px-3 py-2.5 text-left text-sm text-[#f9fafb] hover:bg-[#1d2432]"
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const OneRepMaxCard = ({
  estimatedOneRepMax,
  trendRate,
  desktop = false,
}: {
  estimatedOneRepMax: number;
  trendRate: number;
  desktop?: boolean;
}) => (
  <section
    className={`w-full shrink-0 border bg-gradient-to-r from-[#141822] to-[#0b0d12] ${
      desktop
        ? "min-h-[216px] rounded-xl border-[#273142] bg-[#161c27] p-6"
        : "rounded-[10px] border-[#242c3b] p-4"
    }`}
  >
    <div className="flex items-center justify-between">
      <h2 className={`${desktop ? "text-sm" : "text-xs"} font-bold text-[#9ca3af]`}>
        推定 1RM
      </h2>
      <div className="flex items-center gap-1 rounded-md bg-[rgba(16,185,129,0.13)] px-2 py-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" className="size-3" src={assets.trendingUp} />
        <span className="font-[family-name:var(--font-urbanist)] text-xs font-bold text-[#10b981]">
          +{trendRate.toFixed(1)}%
        </span>
      </div>
    </div>
    <p className={`font-[family-name:var(--font-urbanist)] font-bold text-[#f9fafb] ${desktop ? "mt-4" : "mt-3"}`}>
      <span className={desktop ? "text-5xl" : "text-4xl"}>{formatWeight(estimatedOneRepMax)} </span>
      <span className={`${desktop ? "text-xl" : "text-lg"} text-[#9ca3af]`}>kg</span>
    </p>
    <p className={`font-bold text-[#6b7280] ${desktop ? "mt-4 text-xs" : "mt-2 text-[11px]"}`}>
      過去30日間の推移
    </p>
  </section>
);

const ProgressChart = ({
  points,
  desktop = false,
}: {
  points: ChartPoint[];
  desktop?: boolean;
}) => {
  const values = points.map((point) => point.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(max - min, 1);
  const viewWidth = desktop ? 470 : 303;
  const plotWidth = desktop ? 360 : 250;
  const startX = desktop ? 40 : 10;
  const topY = desktop ? 17 : 17;
  const bottomY = desktop ? 88 : 88;
  const plotPoints = points.map((point, index) => {
    const x = startX + index * (plotWidth / Math.max(points.length - 1, 1));
    const y = bottomY - ((point.value - min) / range) * (bottomY - topY);
    return { ...point, x, y };
  });
  const polyline = plotPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const labelX = desktop ? 425 : 228;

  return (
    <section
      className={`w-full shrink-0 border bg-[linear-gradient(147deg,#141822_25%,#0b0d12_75%)] ${
        desktop
          ? "min-h-[216px] rounded-xl border-[#273142] bg-[#161c27] p-6"
          : "rounded-[10px] border-[#242c3b] p-4"
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#f9fafb]">1RM 推移グラフ</h2>
        <span className={`${desktop ? "text-xs" : "text-[11px]"} font-bold text-[#9ca3af]`}>
          過去3ヶ月
        </span>
      </div>
      <div className={`${desktop ? "mt-4 h-[135px]" : "mt-4 h-[150px]"} w-full`}>
        <svg aria-hidden className={`${desktop ? "h-[110px]" : "h-[122px]"} w-full`} viewBox={`0 0 ${viewWidth} 122`} preserveAspectRatio="none">
          <line x1="0" x2={desktop ? 420 : 263} y1="17" y2="17" stroke="#273142" strokeDasharray="4 4" />
          <line x1="0" x2={desktop ? 420 : 263} y1="50" y2="50" stroke="#273142" strokeDasharray="4 4" />
          <line x1="0" x2={desktop ? 420 : 263} y1="88" y2="88" stroke="#273142" strokeDasharray="4 4" />
          <text x={labelX} y="17" fill="#6b7280" fontSize="10" fontWeight="700">
            {formatWeight(max)}kg
          </text>
          <text x={labelX} y="50" fill="#6b7280" fontSize="10" fontWeight="700">
            {formatWeight((max + min) / 2)}kg
          </text>
          <text x={labelX} y="88" fill="#6b7280" fontSize="10" fontWeight="700">
            {formatWeight(min)}kg
          </text>
          <polyline
            points={polyline}
            fill="none"
            stroke="#00e5ff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
          {plotPoints.map((point, index) => (
            <g key={point.label}>
              <circle cx={point.x} cy={point.y} fill="#00e5ff" r="4" />
              {index === plotPoints.length - 1 && (
                <circle cx={point.x} cy={point.y} fill="none" r="7" stroke="#1856ed" strokeWidth="3" />
              )}
            </g>
          ))}
        </svg>
        <div className={`${desktop ? "px-8 pr-[60px]" : "px-2"} flex justify-between text-[11px] font-bold text-[#9ca3af]`}>
          {points.map((point) => (
            <span key={point.label}>{point.label}</span>
          ))}
        </div>
      </div>
    </section>
  );
};

const PersonalBestsCard = ({
  records,
  desktop = false,
}: {
  records: PersonalBest[];
  desktop?: boolean;
}) => (
  <section
    className={`w-full shrink-0 border bg-gradient-to-r from-[#141822] to-[#0b0d12] ${
      desktop
        ? "min-h-[217px] rounded-xl border-[#273142] bg-[#161c27] p-6"
        : "rounded-[10px] border-[#242c3b] p-4"
    }`}
  >
    <h2 className="text-sm font-bold text-[#f9fafb]">自己ベスト</h2>
    <div className={`${desktop ? "mt-4 gap-3" : "mt-4"} flex flex-col`}>
      {records.map((record, index) => (
        <div
          key={record.label}
          className={`flex items-center justify-between ${
            index < records.length - 1 ? "border-b border-[#273142] pb-2" : ""
          } ${!desktop && index > 0 ? "pt-3" : ""}`}
        >
          <div>
            <p className="font-[family-name:var(--font-urbanist)] text-sm font-bold text-[#f9fafb]">
              {record.label}
            </p>
            <p className="text-[11px] font-bold text-[#6b7280]">{record.date}</p>
          </div>
          <p
            className={`font-[family-name:var(--font-urbanist)] text-lg font-bold ${
              record.highlight ? "text-[#00e5ff]" : "text-[#f9fafb]"
            }`}
          >
            {formatWeight(record.value)} kg
          </p>
        </div>
      ))}
    </div>
  </section>
);

const AiAnalysisCard = ({
  comment,
  desktop = false,
}: {
  comment: string;
  desktop?: boolean;
}) => (
  <section
    className={`w-full shrink-0 border ${
      desktop
        ? "min-h-[217px] rounded-xl border-[#273142] bg-[#0f1420] p-6"
        : "rounded-[10px] border-[#242c3b] bg-gradient-to-r from-[#16223b] to-[#0f1420] p-4"
    }`}
  >
    <div className="flex items-center gap-2.5">
      <div className="relative size-8 shrink-0 overflow-hidden rounded-2xl">
        <Image src={assets.aiAvatar} alt="" fill className="object-cover" sizes="32px" />
      </div>
      <h2 className="text-sm font-bold text-[#f9fafb]">AIトレーナーの分析</h2>
    </div>
    <p className={`${desktop ? "mt-5" : "mt-3"} text-[13px] leading-[1.6] text-[#9ca3af]`}>
      {comment}
    </p>
  </section>
);

const MobileProgressView = ({
  data,
  exercise,
  showExercisePicker,
  onExerciseToggle,
  onExerciseChange,
}: {
  data: ProgressData;
  exercise: Exercise;
  showExercisePicker: boolean;
  onExerciseToggle: () => void;
  onExerciseChange: (exercise: Exercise) => void;
}) => (
  <div
    className="mx-auto flex min-h-[1004px] w-full max-w-[375px] flex-col overflow-hidden rounded-2xl bg-[#0b0d12] shadow-2xl"
    data-name="/progress"
  >
    <ProgressHeader />
    <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-5">
      <ExerciseSelector
        exercise={exercise}
        isOpen={showExercisePicker}
        onToggle={onExerciseToggle}
        onChange={onExerciseChange}
      />
      <OneRepMaxCard estimatedOneRepMax={data.estimatedOneRepMax} trendRate={data.trendRate} />
      <ProgressChart points={data.chart} />
      <PersonalBestsCard records={data.personalBests} />
      <AiAnalysisCard comment={data.aiComment} />
    </main>
    <AppTabBar active="progress" variant="home" />
  </div>
);

const DesktopProgressView = ({
  data,
  exercise,
  showExercisePicker,
  onExerciseToggle,
  onExerciseChange,
}: {
  data: ProgressData;
  exercise: Exercise;
  showExercisePicker: boolean;
  onExerciseToggle: () => void;
  onExerciseChange: (exercise: Exercise) => void;
}) => (
  <main className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-10">
      <ExerciseSelector
        exercise={exercise}
        isOpen={showExercisePicker}
        onToggle={onExerciseToggle}
        onChange={onExerciseChange}
        desktop
      />
      <section className="grid grid-cols-2 gap-6">
        <OneRepMaxCard estimatedOneRepMax={data.estimatedOneRepMax} trendRate={data.trendRate} desktop />
        <ProgressChart points={data.chart} desktop />
        <PersonalBestsCard records={data.personalBests} desktop />
        <AiAnalysisCard comment={data.aiComment} desktop />
      </section>
    </main>
);

const ProgressScreen = ({ data = defaultProgressData, userName }: ProgressScreenProps) => {
  const [exercise, setExercise] = useState<Exercise>(data.exercise);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  const handleExerciseChange = (next: Exercise) => {
    setExercise(next);
    setShowExercisePicker(false);
  };

  const viewProps = {
    data,
    exercise,
    showExercisePicker,
    onExerciseToggle: () => setShowExercisePicker((open) => !open),
    onExerciseChange: handleExerciseChange,
  };

  return (
    <ResponsiveScreen
    userName={userName}
      mobile={<MobileProgressView {...viewProps} />}
      desktop={<DesktopProgressView {...viewProps} />}
    />
  );
};

export default ProgressScreen;
