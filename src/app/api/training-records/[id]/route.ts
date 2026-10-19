import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { updateTrainingRecordSchema } from "../_schemas/training-record";

type TrainingRecordRouteContext = {
  params: Promise<{ id: string }>;
};

const getAuthenticatedUser = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
};

export const PATCH = async (request: Request, context: TrainingRecordRouteContext) => {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const result = updateTrainingRecordSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "記録内容が正しくありません" }, { status: 400 });
  }

  const { id } = await context.params;
  const record = await prisma.trainingRecord.findFirst({
    where: { id, userId: user.id },
  });
  if (!record) {
    return NextResponse.json({ error: "記録が見つかりません" }, { status: 404 });
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

export const DELETE = async (_request: Request, context: TrainingRecordRouteContext) => {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await prisma.trainingRecord.deleteMany({
    where: { id, userId: user.id },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "記録が見つかりません" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
};
