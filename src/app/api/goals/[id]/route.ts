import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { changeGoalSchema } from "../_schemas/goal";

type GoalRouteContext = {
  // Next.jsの動的ルート[id]から受け取る目標ID。
  params: Promise<{ id: string }>;
};

// GET・PATCH・DELETEで共通する認証処理を関数にまとめる。
const getAuthenticatedUser = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
};

// GET /api/goals/:id: 有効な目標に紐づく候補一覧を取得する。
export const GET = async (_request: Request, context: GoalRouteContext) => {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { id } = await context.params;
  // userIdも条件に含め、別ユーザーの目標をIDだけで取得できないようにする。
  const goal = await prisma.trainingGoal.findFirst({
    where: { id, userId: user.id, status: "active" },
    include: {
      consultation: {
        select: {
          goalProposals: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              title: true,
              description: true,
              isSelected: true,
            },
          },
        },
      },
    },
  });

  if (!goal) {
    return NextResponse.json(
      { error: "目標が見つかりません" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    proposals: goal.consultation.goalProposals,
  });
};

// PATCH /api/goals/:id: 保存済みの候補から選択対象を変更する。
export const PATCH = async (request: Request, context: GoalRouteContext) => {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const result = changeGoalSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "目標候補の指定が正しくありません" },
      { status: 400 },
    );
  }

  const { id } = await context.params;

  try {
    // 候補の選択状態と目標本文が食い違わないよう、同じトランザクション内で更新する。
    const updatedGoal = await prisma.$transaction(async (transaction) => {
      const goal = await transaction.trainingGoal.findFirst({
        where: { id, userId: user.id, status: "active" },
      });
      if (!goal) throw new Error("GOAL_NOT_FOUND");

      const proposal = await transaction.goalProposal.findFirst({
        where: {
          id: result.data.proposalId,
          consultationId: goal.consultationId,
        },
      });
      if (!proposal) throw new Error("PROPOSAL_NOT_FOUND");

      await transaction.goalProposal.updateMany({
        where: { consultationId: goal.consultationId },
        data: { isSelected: false },
      });
      // 全候補を未選択にしてから、指定された1件だけを選択済みにする。
      await transaction.goalProposal.update({
        where: { id: proposal.id },
        data: { isSelected: true },
      });

      return transaction.trainingGoal.update({
        where: { id: goal.id },
        data: {
          title: proposal.title,
          description: proposal.description,
        },
      });
    });

    return NextResponse.json({
      goal: {
        id: updatedGoal.id,
        title: updatedGoal.title,
        description: updatedGoal.description,
        statusLabel: "設定済み",
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "GOAL_NOT_FOUND" ||
        error.message === "PROPOSAL_NOT_FOUND")
    ) {
      return NextResponse.json(
        { error: "目標または候補が見つかりません" },
        { status: 404 },
      );
    }

    console.error("[goals:patch]", error);
    return NextResponse.json(
      { error: "目標を変更できませんでした" },
      { status: 500 },
    );
  }
};

// DELETE /api/goals/:id: レコード自体は消さず、状態をcancelledへ変える論理削除を行う。
export const DELETE = async (_request: Request, context: GoalRouteContext) => {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { id } = await context.params;
  // updateManyなら対象がなくても例外にならず、countで404を判断できる。
  const result = await prisma.trainingGoal.updateMany({
    where: { id, userId: user.id, status: "active" },
    data: { status: "cancelled" },
  });

  if (result.count === 0) {
    return NextResponse.json(
      { error: "目標が見つかりません" },
      { status: 404 },
    );
  }

  return new NextResponse(null, { status: 204 });
};
