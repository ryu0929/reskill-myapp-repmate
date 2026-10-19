import { prisma } from "@/lib/prisma";
import { EXERCISES } from "../_types/progress";
import type { Exercise, ProgressData } from "../_types/progress";

const estimateOneRepMax = (weight: number, reps: number) => (
  weight * (1 + reps / 30)
);

const formatDate = (date: Date) => (
  new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Tokyo",
  }).format(date)
);

const formatChartLabel = (date: Date) => (
  new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    timeZone: "Asia/Tokyo",
  }).format(date)
);

export const getProgressDataByExercise = async (
  userId: string,
): Promise<Record<Exercise, ProgressData>> => {
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const records = await prisma.trainingRecord.findMany({
    where: { userId, recordedAt: { gte: since } },
    include: { exercise: { select: { name: true } } },
    orderBy: { recordedAt: "asc" },
  });

  return Object.fromEntries(EXERCISES.map((exercise) => {
    const exerciseRecords = records
      .filter((record) => record.exercise.name === exercise)
      .map((record) => ({
        weight: record.weight.toNumber(),
        reps: record.reps,
        recordedAt: record.recordedAt,
        estimatedOneRepMax: estimateOneRepMax(record.weight.toNumber(), record.reps),
      }));

    if (exerciseRecords.length === 0) {
      return [exercise, {
        exercise,
        estimatedOneRepMax: 0,
        trendRate: 0,
        chart: [{ label: "記録なし", value: 0 }],
        personalBests: [],
        aiComment: "トレーニングを報告すると、ここに進捗が表示されます。",
      } satisfies ProgressData];
    }

    const dailyBests = new Map<string, { date: Date; value: number }>();
    exerciseRecords.forEach((record) => {
      const key = record.recordedAt.toLocaleDateString("en-CA", { timeZone: "Asia/Tokyo" });
      const current = dailyBests.get(key);
      if (!current || record.estimatedOneRepMax > current.value) {
        dailyBests.set(key, { date: record.recordedAt, value: record.estimatedOneRepMax });
      }
    });

    const chart = [...dailyBests.values()].slice(-3).map(({ date, value }) => ({
      label: formatChartLabel(date),
      value,
    }));
    const estimatedOneRepMax = Math.max(...exerciseRecords.map((record) => record.estimatedOneRepMax));
    const firstValue = chart[0]?.value ?? estimatedOneRepMax;
    const latestValue = chart.at(-1)?.value ?? estimatedOneRepMax;
    const trendRate = firstValue > 0 ? ((latestValue - firstValue) / firstValue) * 100 : 0;
    const personalBests = [...exerciseRecords]
      .sort((a, b) => b.weight - a.weight)
      .filter((record, index, all) => (
        all.findIndex((candidate) => candidate.reps === record.reps) === index
      ))
      .slice(0, 3)
      .map((record, index) => ({
        label: `${record.reps}RM`,
        date: formatDate(record.recordedAt),
        value: record.weight,
        highlight: index === 0,
      }));

    return [exercise, {
      exercise,
      estimatedOneRepMax,
      trendRate,
      chart,
      personalBests,
      aiComment: `${exercise}の記録を${exerciseRecords.length}セット蓄積しました。継続して記録すると、推移をより正確に確認できます。`,
    } satisfies ProgressData];
  })) as Record<Exercise, ProgressData>;
};

export const getBestProgressData = (
  dataByExercise: Record<Exercise, ProgressData>,
): ProgressData | null => (
  Object.values(dataByExercise)
    .filter((data) => data.estimatedOneRepMax > 0)
    .sort((a, b) => (
      b.trendRate - a.trendRate
      || b.estimatedOneRepMax - a.estimatedOneRepMax
    ))[0] ?? null
);
