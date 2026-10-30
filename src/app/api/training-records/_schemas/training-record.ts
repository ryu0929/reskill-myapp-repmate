import { z } from "zod";

// 新規報告で受け取る値。DBへ保存できる現実的な範囲に数値を制限する。
export const createTrainingRecordSchema = z.object({
  exercise: z.string().trim().min(1).max(100),
  weight: z.number().positive().max(2000),
  reps: z.number().int().min(1).max(1000),
  sets: z.number().int().min(1).max(20),
  memo: z.string().trim().max(500).optional(),
});

// 既存の1セットを編集するときは、種目やセット番号を変更対象に含めない。
export const updateTrainingRecordSchema = z.object({
  weight: z.number().positive().max(2000),
  reps: z.number().int().min(1).max(1000),
  memo: z.string().trim().max(500).nullable().optional(),
});
