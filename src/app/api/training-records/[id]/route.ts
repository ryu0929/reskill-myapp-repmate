import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { updateTrainingRecordSchema } from "../_schemas/training-record";

type TrainingRecordRouteContext = {
  // Next.jsの動的ルート[id]から受け取るトレーニング記録ID。
  params: Promise<{ id: string }>;
};

// 更新・削除で共通するSupabaseの認証処理。
const getAuthenticatedUser = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
};

// 指定された日時が属する日本時間の日付範囲を作る。
const getTokyoDayRange = (date: Date) => {
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  const start = new Date(`${day}T00:00:00+09:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return { start, end };
};

// PATCH /api/training-records/:id: 1セット分の重量・回数・メモを更新する。
export const PATCH = async (
  request: Request,
  context: TrainingRecordRouteContext,
) => {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const result = updateTrainingRecordSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "記録内容が正しくありません" },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  // userIdも条件に含め、他のユーザーの記録を更新できないようにする。
  const record = await prisma.trainingRecord.findFirst({
    where: { id, userId: user.id },
  });
  if (!record) {
    return NextResponse.json(
      { error: "記録が見つかりません" },
      { status: 404 },
    );
  }

  const updated = await prisma.trainingRecord.update({
    where: { id: record.id },
    data: result.data,
  });

  return NextResponse.json({
    record: {
      id: updated.id,
      weight: updated.weight.toNumber(),
      reps: updated.reps,
      memo: updated.memo,
    },
  });
};

// DELETE /api/training-records/:id: 1セットを削除し、残りのセット番号を詰め直す。
export const DELETE = async (
  _request: Request,
  context: TrainingRecordRouteContext,
) => {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { id } = await context.params;
  const record = await prisma.trainingRecord.findFirst({
    where: { id, userId: user.id },
    select: { id: true, exerciseId: true, recordedAt: true },
  });
  if (!record) {
    return NextResponse.json(
      { error: "記録が見つかりません" },
      { status: 404 },
    );
  }

  const { start, end } = getTokyoDayRange(record.recordedAt);

  // 削除後に残った記録を時系列で並べ、セット番号を1から振り直す。
  await prisma.$transaction(async (transaction) => {
    await transaction.trainingRecord.delete({ where: { id: record.id } });
    const remainingRecords = await transaction.trainingRecord.findMany({
      where: {
        userId: user.id,
        exerciseId: record.exerciseId,
        recordedAt: { gte: start, lt: end },
      },
      orderBy: [{ recordedAt: "asc" }, { createdAt: "asc" }, { id: "asc" }],
      select: { id: true },
    });

    for (const [index, remainingRecord] of remainingRecords.entries()) {
      await transaction.trainingRecord.update({
        where: { id: remainingRecord.id },
        data: { setOrder: index + 1 },
      });
    }
  });

  return new NextResponse(null, { status: 204 });
};
