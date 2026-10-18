import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { saveGoalSchema } from "./_schemas/goal";

export const POST = async (request: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const result = saveGoalSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "目標の内容が正しくありません" }, { status: 400 });
  }

  const { exercise, proposals, selectedProposalId, messages } = result.data;
  const selectedProposal = proposals.find(({ id }) => id === selectedProposalId);

  if (!selectedProposal) {
    return NextResponse.json({ error: "選択された目標候補が見つかりません" }, { status: 400 });
  }

  try {
    const savedGoal = await prisma.$transaction(async (transaction) => {
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
      }) ?? await transaction.exercise.create({
        data: { name: exercise },
      });

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
    return NextResponse.json({ error: "目標を保存できませんでした" }, { status: 500 });
  }
};
