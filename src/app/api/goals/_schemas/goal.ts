import { z } from "zod";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4000),
});

export const goalProposalSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(500),
});

export const goalProposalListSchema = z.object({
  proposals: z.array(
    goalProposalSchema.omit({ id: true }),
  ).min(2).max(3),
});

export const goalProposalRequestSchema = z.object({
  exercise: z.string().trim().min(1).max(100),
  messages: z.array(chatMessageSchema).min(3).max(50),
});

export const saveGoalSchema = z.object({
  exercise: z.string().trim().min(1).max(100),
  proposals: z.array(goalProposalSchema).min(2).max(3),
  selectedProposalId: z.string().uuid(),
  messages: z.array(chatMessageSchema).min(3).max(50),
}).refine(
  ({ proposals, selectedProposalId }) => (
    proposals.some(({ id }) => id === selectedProposalId)
  ),
  {
    message: "選択された目標候補が候補一覧に含まれていません",
    path: ["selectedProposalId"],
  },
);

export const changeGoalSchema = z.object({
  proposalId: z.string().uuid(),
});

export type GoalProposal = z.infer<typeof goalProposalSchema>;
