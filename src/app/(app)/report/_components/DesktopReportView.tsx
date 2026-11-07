"use client";

import ExerciseSelector from "@/components/ExerciseSelector";
import { TrainerChatArea, TrainerChatInput } from "@/components/TrainerChat";
import { EXERCISES } from "../_types/report";
import type { ReportViewProps } from "../_types/report";
import RecordDraftCard from "./RecordDraftCard";
import ReportSidePanel from "./ReportSidePanel";

const DesktopReportView = ({
  goal,
  exercise,
  messages,
  input,
  isSending,
  isSavingRecord,
  isDeletingGoal,
  isGoalDeleteConfirming,
  isLoadingRecords,
  showExercisePicker,
  records,
  recordDraft,
  editingRecordId,
  editWeight,
  editReps,
  chatAreaRef,
  onExerciseToggle,
  onExerciseChange,
  onInputChange,
  onRecordDraftChange,
  onSaveRecord,
  onCancelRecord,
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
  onSubmit,
}: ReportViewProps) => (
  // PCは左側をチャットと入力、右側を目標と本日の記録に分割する。
  <main className="flex min-h-0 flex-1">
    <section className="flex min-w-0 flex-1 flex-col items-center justify-between px-10 py-6">
      <div className="flex min-h-0 w-full max-w-[720px] flex-1 flex-col gap-5">
        <ExerciseSelector
          exercise={exercise}
          options={EXERCISES}
          isOpen={showExercisePicker}
          onToggle={onExerciseToggle}
          onChange={onExerciseChange}
          desktop
        />
        <TrainerChatArea
          messages={messages}
          isSending={isSending}
          chatAreaRef={chatAreaRef}
          desktop
        />
      </div>
      <div className="flex w-full max-w-[720px] flex-col gap-3">
        {recordDraft && (
          <RecordDraftCard
            draft={recordDraft}
            isSaving={isSavingRecord}
            onChange={onRecordDraftChange}
            onSave={onSaveRecord}
            onCancel={onCancelRecord}
          />
        )}
        <TrainerChatInput
          input={input}
          isSending={isSending}
          placeholder="60kg 10回 3セット行いました"
          onChange={onInputChange}
          onSubmit={onSubmit}
          desktop
        />
      </div>
    </section>
    <ReportSidePanel
      goal={goal}
      records={records}
      isDeletingGoal={isDeletingGoal}
      isGoalDeleteConfirming={isGoalDeleteConfirming}
      isLoadingRecords={isLoadingRecords}
      editingRecordId={editingRecordId}
      editWeight={editWeight}
      editReps={editReps}
      onStartEditRecord={onStartEditRecord}
      onEditWeightChange={onEditWeightChange}
      onEditRepsChange={onEditRepsChange}
      onSaveRecordEdit={onSaveRecordEdit}
      onCancelRecordEdit={onCancelRecordEdit}
      onDeleteRecord={onDeleteRecord}
      onAddRecord={onAddRecord}
      onRequestGoalDelete={onRequestGoalDelete}
      onCancelGoalDelete={onCancelGoalDelete}
      onDeleteGoal={onDeleteGoal}
    />
  </main>
);

export default DesktopReportView;
