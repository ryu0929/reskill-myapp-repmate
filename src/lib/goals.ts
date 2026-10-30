import { prisma } from "@/lib/prisma";
import type { ActiveGoal } from "@/lib/_types/goal";

export const getActiveGoal = async (
  userId: string,
): Promise<ActiveGoal | null> => {
  const goal = await prisma.trainingGoal.findFirst({
    where: {
      userId,
      status: "active",
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      exercise: {
        select: { name: true },
      },
    },
  });

  if (!goal) return null;

  return {
    id: goal.id,
    title: goal.title,
    description: goal.description,
    status: goal.status,
    exerciseName: goal.exercise.name,
  };
};
