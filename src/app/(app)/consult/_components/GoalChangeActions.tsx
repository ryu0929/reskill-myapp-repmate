import type { GoalChangeActionsProps } from "../_types/consult";

const GoalChangeActions = ({
  onChangeGoal,
  onRestartConsultation,
  compact = false,
}: GoalChangeActionsProps) => (
  <div
    className={
      compact ? "grid shrink-0 grid-cols-2 gap-2" : "flex flex-col gap-2"
    }
  >
    <button
      type="button"
      onClick={onChangeGoal}
      className="flex min-h-11 items-center justify-center rounded-lg border border-[#2463eb] px-3 py-2.5 text-[13px] font-bold text-[#5b8cff] transition-colors hover:bg-[#17213a]"
    >
      候補から選びなおす
    </button>

    <button
      type="button"
      onClick={onRestartConsultation}
      className="flex min-h-11 items-center justify-center rounded-lg bg-[#2463eb] px-3 py-2.5 text-[13px] font-bold text-[#f8fafc] transition-opacity hover:opacity-90"
    >
      もう一度相談する
    </button>
  </div>
);

export default GoalChangeActions;
