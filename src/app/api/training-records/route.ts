import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createTrainingRecordSchema } from "./_schemas/training-record";

// PrismaのDecimalやDateを、ブラウザへJSONで返せるnumber・文字列へ変換する。
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

// 日本時間の今日について、開始時刻以上・翌日開始時刻未満の検索範囲を作る。
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

// GET /api/training-records: ログインユーザーの今日の記録を取得する。
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

  // 報告画面には、選択種目かつ日本時間の当日分だけを返す。
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

// POST /api/training-records: 入力されたセット数分のトレーニング記録を保存する。
export const POST = async (request: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  // 重量・回数・セット数などをAPI側でも検証し、不正な値をDBへ渡さない。
  const result = createTrainingRecordSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "記録内容が正しくありません" },
      { status: 400 },
    );
  }

  const { exercise, weight, reps, sets, memo } = result.data;

  try {
    // プロフィール・種目・報告・セット記録を一つの取引として保存する。
    const records = await prisma.$transaction(async (transaction) => {
      await transaction.profile.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          name:
            typeof user.user_metadata?.name === "string"
              ? user.user_metadata.name
              : (user.email?.split("@")[0] ?? "ユーザー"),
          gender:
            typeof user.user_metadata?.gender === "string"
              ? user.user_metadata.gender
              : "無回答",
        },
      });

      const exerciseRecord =
        (await transaction.exercise.findFirst({
          where: { name: exercise },
        })) ??
        (await transaction.exercise.create({ data: { name: exercise } }));
      const report = await transaction.report.create({
        data: { userId: user.id, exerciseId: exerciseRecord.id },
      });
      const { start, end } = getTokyoDayRange();
      // 件数ではなく最大番号を見ることで、削除後でも番号の重複を防ぐ。
      const latestRecord = await transaction.trainingRecord.findFirst({
        where: {
          userId: user.id,
          exerciseId: exerciseRecord.id,
          recordedAt: { gte: start, lt: end },
        },
        orderBy: { setOrder: "desc" },
        select: { setOrder: true },
      });
      const nextSetOrder = (latestRecord?.setOrder ?? 0) + 1;

      // setsの数だけ配列を作り、同じ報告に属する各セットを一括登録する。
      await transaction.trainingRecord.createMany({
        data: Array.from({ length: sets }, (_, index) => ({
          userId: user.id,
          reportId: report.id,
          exerciseId: exerciseRecord.id,
          weight,
          reps,
          setOrder: nextSetOrder + index,
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
    return NextResponse.json(
      { error: "トレーニング記録を保存できませんでした" },
      { status: 500 },
    );
  }
};
