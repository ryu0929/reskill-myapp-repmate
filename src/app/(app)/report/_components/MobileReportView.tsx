"use client";

import { AppTabBar } from "@/components/AppTabBar";
import BottomSheet from "@/components/BottomSheet";
import ExerciseSelector from "@/components/ExerciseSelector";
import { MobileAppHeader } from "@/components/MobileAppHeader";
import { TrainerChatArea, TrainerChatInput } from "@/components/TrainerChat";
import { EXERCISES } from "../_types/report";
import type { ReportViewProps } from "../_types/report";
import AddRecordButton from "./AddRecordButton";
import RecordDraftCard from "./RecordDraftCard";
import ReportGoalSection from "./ReportGoalSection";
import TrainingRecordList from "./TrainingRecordList";

const MobileReportView = ({
  goal,
  exercise,
  messages,
  input,
  isSending,
  isSavingRecord,
  isDeletingGoal,
  isGoalDeleteConfirming,
  isLoadingRecords,
  isRecordPanelOpen,
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
  onOpenRecordPanel,
  onCloseRecordPanel,
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
  // SPはヘッダー・本文・ボトムナビを縦に並べ、記録一覧を下部シートで開く。
  <div
    className="relative mx-auto flex h-full w-full flex-col overflow-hidden bg-[#0b0d12] shadow-2xl"
    data-name="/report"
  >
    <MobileAppHeader />

    {/* mainだけをスクロール対象にして、固定ヘッダーとナビを常に表示する。 */}
    <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-5 pb-4">
      <ReportGoalSection
        goal={goal}
        isDeletingGoal={isDeletingGoal}
        isGoalDeleteConfirming={isGoalDeleteConfirming}
        onRequestGoalDelete={onRequestGoalDelete}
        onCancelGoalDelete={onCancelGoalDelete}
        onDeleteGoal={onDeleteGoal}
      />
      <ExerciseSelector
        exercise={exercise}
        options={EXERCISES}
        isOpen={showExercisePicker}
        onToggle={onExerciseToggle}
        onChange={onExerciseChange}
      />
      <button
        type="button"
        onClick={onOpenRecordPanel}
        className="flex shrink-0 items-center justify-between rounded-lg border border-[#242c3b] bg-[#141822] px-3 py-2.5 text-left"
      >
        <span className="text-xs font-bold text-[#f8fafc]">本日の記録</span>
        <span className="text-[11px] font-bold text-[#5b8cff]">
          {records.length}セット
        </span>
      </button>
      <TrainerChatArea
        messages={messages}
        isSending={isSending}
        chatAreaRef={chatAreaRef}
      />
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
      />
    </main>

    <BottomSheet
      isOpen={isRecordPanelOpen}
      onClose={onCloseRecordPanel}
      ariaLabel="本日のトレーニング記録"
      closeLabel="記録一覧を閉じる"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#f8fafc]">本日の記録</h2>
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
    </BottomSheet>
    <AppTabBar active="report" />
  </div>
);

export default MobileReportView;
