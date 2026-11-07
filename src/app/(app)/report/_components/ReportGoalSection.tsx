import { GoalDeleteAction } from "@/components/GoalDeleteAction";
import GoalCard from "@/components/GoalCard";
import type { ReportGoalSectionProps } from "../_types/report";

const ReportGoalSection = ({
  goal,
  isDeletingGoal,
  isGoalDeleteConfirming,
  onRequestGoalDelete,
  onCancelGoalDelete,
  onDeleteGoal,
}: ReportGoalSectionProps) => {
  if (!goal) {
    return (
      <div className="flex w-full shrink-0 items-start py-2">
        <p className="text-xs text-[#6b7280]">目標は未設定です</p>
      </div>
    );
  }

  return (
    <section className="flex w-full shrink-0 flex-col gap-2">
      <h2 className="text-sm font-bold text-[#f9fafb]">今日の目標</h2>

      <GoalCard
        exercise={goal.exercise}
        description={goal.detail}
        action={
          <GoalDeleteAction
            isConfirming={isGoalDeleteConfirming}
            isDeleting={isDeletingGoal}
            onRequest={onRequestGoalDelete}
            onCancel={onCancelGoalDelete}
            onConfirm={onDeleteGoal}
          />
        }
      />
    </section>
  );
};

export default ReportGoalSection;
