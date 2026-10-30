import { z } from "zod";

// ユーザーとAIのメッセージに許可する役割・文字数を定義する。
const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4000),
});

// 画面で選択・保存する目標候補1件の形式。
export const goalProposalSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(500),
});

// GeminiにはIDを作らせず、文章部分だけを2〜3件返すよう検証する。
export const goalProposalListSchema = z.object({
  proposals: z
    .array(goalProposalSchema.omit({ id: true }))
    .min(2)
    .max(3),
});

// 目標候補の生成を依頼するときのリクエスト形式。
export const goalProposalRequestSchema = z.object({
  exercise: z.string().trim().min(1).max(100),
  messages: z.array(chatMessageSchema).min(3).max(50),
});

// 相談内容、候補一覧、選択した候補を保存するときのリクエスト形式。
export const saveGoalSchema = z
  .object({
    exercise: z.string().trim().min(1).max(100),
    proposals: z.array(goalProposalSchema).min(2).max(3),
    selectedProposalId: z.string().uuid(),
    messages: z.array(chatMessageSchema).min(3).max(50),
  })
  // refineで、選択IDが実際に候補一覧へ含まれることまで確認する。
  .refine(
    ({ proposals, selectedProposalId }) =>
      proposals.some(({ id }) => id === selectedProposalId),
    {
      message: "選択された目標候補が候補一覧に含まれていません",
      path: ["selectedProposalId"],
    },
  );

// 保存済み目標を別候補へ変更するときは、候補IDだけを受け取る。
export const changeGoalSchema = z.object({
  proposalId: z.string().uuid(),
});

// Zodの定義からTypeScript型を生成し、検証条件と型のずれを防ぐ。
export type GoalProposal = z.infer<typeof goalProposalSchema>;
