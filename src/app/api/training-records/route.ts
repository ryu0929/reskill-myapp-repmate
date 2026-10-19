import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createTrainingRecordSchema } from "./_schemas/training-record";

const toResponseRecord = (record: {
  id: string;
  weight: { toNumber: () => number };
  reps: number;
  setOrder: number;
  memo: string | null;
  recordedAt: Date;
  exercise: { name: string };
}) => ({
  id: record.id,
  exercise: record.exercise.name,
  weight: record.weight.toNumber(),
  reps: record.reps,
  setOrder: record.setOrder,
  memo: record.memo,
  recordedAt: record.recordedAt.toISOString(),
});

const getTokyoDayRange = () => {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const start = new Date(`${date}T00:00:00+09:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return { start, end };
};

export const GET = async (request: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const exercise = new URL(request.url).searchParams.get("exercise")?.trim();
  const { start, end } = getTokyoDayRange();
  const records = await prisma.trainingRecord.findMany({
    where: {
      userId: user.id,
      recordedAt: { gte: start, lt: end },
      ...(exercise ? { exercise: { name: exercise } } : {}),
    },
    include: { exercise: { select: { name: true } } },
    orderBy: [{ recordedAt: "asc" }, { setOrder: "asc" }],
  });

  return NextResponse.json({ records: records.map(toResponseRecord) });
};

export const POST = async (request: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const result = createTrainingRecordSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "記録内容が正しくありません" }, { status: 400 });
  }

  const { exercise, weight, reps, sets, memo } = result.data;

  try {
    const records = await prisma.$transaction(async (transaction) => {
      await transaction.profile.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          name: typeof user.user_metadata?.name === "string"
            ? user.user_metadata.name
            : user.email?.split("@")[0] ?? "ユーザー",
          gender: "無回答",
        },
      });

      const exerciseRecord = await transaction.exercise.findFirst({
        where: { name: exercise },
      }) ?? await transaction.exercise.create({ data: { name: exercise } });
      const report = await transaction.report.create({
        data: { userId: user.id, exerciseId: exerciseRecord.id },
      });
      const { start, end } = getTokyoDayRange();
      const existingSetCount = await transaction.trainingRecord.count({
        where: {
          userId: user.id,
          exerciseId: exerciseRecord.id,
          recordedAt: { gte: start, lt: end },
        },
      });

      await transaction.trainingRecord.createMany({
        data: Array.from({ length: sets }, (_, index) => ({
          userId: user.id,
          reportId: report.id,
          exerciseId: exerciseRecord.id,
          weight,
          reps,
          setOrder: existingSetCount + index + 1,
          memo: memo || null,
          recordedAt: new Date(),
        })),
      });

      return transaction.trainingRecord.findMany({
        where: { reportId: report.id },
        include: { exercise: { select: { name: true } } },
        orderBy: { setOrder: "asc" },
      });
    });

    return NextResponse.json(
      { records: records.map(toResponseRecord) },
      { status: 201 },
    );
  } catch (error) {
    console.error("[training-records:post]", error);
    return NextResponse.json({ error: "トレーニング記録を保存できませんでした" }, { status: 500 });
  }
};
