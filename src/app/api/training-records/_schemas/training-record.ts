import { z } from "zod";

export const createTrainingRecordSchema = z.object({
  exercise: z.string().trim().min(1).max(100),
  weight: z.number().positive().max(2000),
  reps: z.number().int().min(1).max(1000),
  sets: z.number().int().min(1).max(20),
  memo: z.string().trim().max(500).optional(),
});

export const updateTrainingRecordSchema = z.object({
  weight: z.number().positive().max(2000),
  reps: z.number().int().min(1).max(1000),
  memo: z.string().trim().max(500).nullable().optional(),
});
