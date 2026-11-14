import { GoalDeleteAction } from "@/components/GoalDeleteAction";
import GoalCard from "@/components/GoalCard";
import GoalChangeActions from "./GoalChangeActions";
import type { ConfiguredGoalViewProps } from "../_types/consult";

const ConfiguredGoalView = ({
  goal,
  isDeletingGoal,
  isGoalDeleteConfirming,
  onChangeGoal,
  onRestartConsultation,
  onRequestGoalDelete,
  onCancelGoalDelete,
  onDeleteGoal,
  desktop = false,
}: ConfiguredGoalViewProps) => (
  <section
    className={`flex min-h-0 flex-1 flex-col items-center justify-center ${
      desktop ? "px-10 py-8" : "overflow-y-auto px-5 pb-5 pt-1"
    }`}
  >
    <div className="flex w-full max-w-[640px] flex-col gap-5">
      <div>
        <p className="text-xs font-bold text-[#98a2b3]">設定中の目標</p>
        <h2 className="mt-1 text-xl font-bold text-[#f8fafc]">今日の目標</h2>
      </div>

      <GoalCard
        exercise={goal.exercise}
        description={goal.description}
        desktop={desktop}
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

      <GoalChangeActions
        onChangeGoal={onChangeGoal}
        onRestartConsultation={onRestartConsultation}
        compact={!desktop}
      />
    </div>
  </section>
);

export default ConfiguredGoalView;
