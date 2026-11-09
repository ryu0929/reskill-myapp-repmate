"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GoalSummary, UseReportGoalParams } from "../_types/report";

const useReportGoal = ({
  initialGoal = null,
  exercise,
  showToast,
}: UseReportGoalParams) => {
  const router = useRouter();

  const [activeGoal, setActiveGoal] = useState<GoalSummary | null>(initialGoal);
  const [isDeletingGoal, setIsDeletingGoal] = useState(false);
  const [isGoalDeleteConfirming, setIsGoalDeleteConfirming] = useState(false);

  // 現在選択中の種目に設定された目標だけを表示する。
  const selectedExerciseGoal =
    activeGoal?.exercise === exercise ? activeGoal : null;

  const requestGoalDelete = () => {
    setIsGoalDeleteConfirming(true);
  };

  const cancelGoalDelete = () => {
    setIsGoalDeleteConfirming(false);
  };

  // 表示中の目標を論理削除し、画面からも取り除く。
  const deleteGoal = async () => {
    if (!activeGoal || isDeletingGoal) return;

    setIsDeletingGoal(true);
    try {
      const response = await fetch(`/api/goals/${activeGoal.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "目標を削除できませんでした");
      }

      setActiveGoal(null);
      setIsGoalDeleteConfirming(false);
      showToast("目標を削除しました");
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "目標を削除できませんでした",
      );
    } finally {
      setIsDeletingGoal(false);
    }
  };

  return {
    selectedExerciseGoal,
    isDeletingGoal,
    isGoalDeleteConfirming,
    requestGoalDelete,
    cancelGoalDelete,
    deleteGoal,
  };
};

export default useReportGoal;
