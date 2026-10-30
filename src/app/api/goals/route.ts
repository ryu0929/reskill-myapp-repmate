import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { saveGoalSchema } from "./_schemas/goal";

// POST /api/goals: 選択した目標と、その元になった相談内容・候補をまとめて保存する。
export const POST = async (request: Request) => {
  // Cookieを使ってSupabaseのログインユーザーを確認する。
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  // safeParseは例外を投げず、successの真偽で検証結果を分岐できる。
  const result = saveGoalSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "目標の内容が正しくありません" },
      { status: 400 },
    );
  }

  const { exercise, proposals, selectedProposalId, messages } = result.data;
  const selectedProposal = proposals.find(
    ({ id }) => id === selectedProposalId,
  );

  if (!selectedProposal) {
    return NextResponse.json(
      { error: "選択された目標候補が見つかりません" },
      { status: 400 },
    );
  }

  try {
    // 会話・候補・選択した目標は、途中状態を残さないよう一つの取引で保存する。
    const savedGoal = await prisma.$transaction(async (transaction) => {
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
        (await transaction.exercise.create({
          data: { name: exercise },
        }));

      const consultation = await transaction.consultation.create({
        data: {
          userId: user.id,
          exerciseId: exerciseRecord.id,
          goalProposals: {
            create: proposals.map((proposal) => ({
              id: proposal.id,
              title: proposal.title,
              description: proposal.description,
              isSelected: proposal.id === selectedProposalId,
            })),
          },
          messages: {
            create: messages.map((message) => ({
              senderType: message.role === "user" ? 1 : 2,
              message: message.content,
            })),
          },
        },
      });

      await transaction.trainingGoal.updateMany({
        where: {
          userId: user.id,
          status: "active",
        },
        data: { status: "cancelled" },
      });

      // 既存の有効な目標を解除した後、今回選ばれた候補を新しい有効目標にする。
      return transaction.trainingGoal.create({
        data: {
          userId: user.id,
          consultationId: consultation.id,
          exerciseId: exerciseRecord.id,
          title: selectedProposal.title,
          description: selectedProposal.description,
          goalDate: new Date(),
          status: "active",
        },
      });
    });

    return NextResponse.json({
      goal: {
        id: savedGoal.id,
        title: savedGoal.title,
        description: savedGoal.description,
        statusLabel: "設定済み",
      },
    });
  } catch (error) {
    console.error("[goals]", error);
    return NextResponse.json(
      { error: "目標を保存できませんでした" },
      { status: 500 },
    );
  }
};
