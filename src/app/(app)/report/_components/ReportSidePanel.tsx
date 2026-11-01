import { GoalDeleteAction } from "@/components/GoalDeleteAction";
import type { ReportSidePanelProps } from "../_types/report";
import AddRecordButton from "./AddRecordButton";
import TrainingRecordList from "./TrainingRecordList";

const ReportSidePanel = ({
  goal = null,
  records,
  isDeletingGoal,
  isGoalDeleteConfirming,
  isLoadingRecords,
  editingRecordId,
  editWeight,
  editReps,
  onStartEditRecord,
  onEditWeightChange,
  onEditRepsChange,
  onSaveRecordEdit,
  onCancelRecordEdit,
  onDeleteRecord,
  onAddRecord,
  onRequestGoalDelete,
  onCancelGoalDelete,
  onDeleteGoal,
}: ReportSidePanelProps) => (
  <aside className="flex h-full w-[380px] shrink-0 flex-col gap-5 border-l border-[#273142] bg-[#111620] p-6">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-bold text-[#f8fafc]">今日の目標</h2>
      {!goal && (
        <span className="rounded-md bg-[rgba(102,112,133,0.13)] px-2 py-1 text-[11px] font-bold text-[#98a2b3]">
          未設定
        </span>
      )}
    </div>

    {goal ? (
      <div className="flex flex-col gap-2.5 rounded-lg border border-[#273142] bg-[#141822] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#10b981]" aria-hidden />
            <p className="text-sm font-bold text-[#f8fafc]">{goal.exercise}</p>
          </div>
          <GoalDeleteAction
            isConfirming={isGoalDeleteConfirming}
            isDeleting={isDeletingGoal}
            onRequest={onRequestGoalDelete}
            onCancel={onCancelGoalDelete}
            onConfirm={onDeleteGoal}
          />
        </div>
        <p className="text-[13px] leading-[1.4] text-[#98a2b3]">
          {goal.detail}
        </p>
      </div>
    ) : (
      <div className="rounded-lg border border-[#273142] bg-[#141822] p-4">
        <p className="text-sm leading-none text-[#98a2b3]">目標は未設定です</p>
      </div>
    )}

    <div className="flex min-h-0 flex-1 flex-col gap-3 border-t border-[#273142] pt-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-[#f8fafc]">本日の記録</h2>
        <span className="text-[11px] font-bold text-[#5b8cff]">
          {records.length}セット
        </span>
      </div>
      <TrainingRecordList
        records={records}
        isLoadingRecords={isLoadingRecords}
        editingRecordId={editingRecordId}
        editWeight={editWeight}
        editReps={editReps}
        onStartEdit={onStartEditRecord}
        onEditWeightChange={onEditWeightChange}
        onEditRepsChange={onEditRepsChange}
        onSaveEdit={onSaveRecordEdit}
        onCancelEdit={onCancelRecordEdit}
        onDelete={onDeleteRecord}
      />
      {records.length > 0 && <AddRecordButton onClick={onAddRecord} />}
    </div>
  </aside>
);

export default ReportSidePanel;
