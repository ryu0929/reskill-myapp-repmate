"use client";
import { useState } from "react";

import { ResponsiveScreen } from "@/components/ResponsiveScreen";
import MobileReportView from "./MobileReportView";
import DesktopReportView from "./DesktopReportView";
import Toast from "@/components/Toast";
import useToast from "@/hooks/useToast";
import useReportGoal from "../_hooks/useReportGoal";
import useTrainingRecords from "../_hooks/useTrainingRecords";
import useRecordDraft from "../_hooks/useRecordDraft";
import useReportChat from "../_hooks/useReportChat";
import { EXERCISES } from "../_types/report";
import type {
  Exercise,
  ReportScreenProps,
  ReportViewProps,
} from "../_types/report";

const ReportScreen = ({ goal = null, userName }: ReportScreenProps) => {
  // チャットや画面表示の状態を管理し、モバイル・PCへ共通データを渡す。
  const defaultExercise =
    EXERCISES.find((item) => item === goal?.exercise) ?? "スクワット";
  const [exercise, setExercise] = useState<Exercise>(defaultExercise);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  const { toastMessage, showToast } = useToast();

  const {
    selectedExerciseGoal,
    isDeletingGoal,
    isGoalDeleteConfirming,
    requestGoalDelete,
    cancelGoalDelete,
    deleteGoal,
  } = useReportGoal({
    initialGoal: goal,
    exercise,
    showToast,
  });

  const {
    records,
    isLoadingRecords,
    editingRecordId,
    editWeight,
    editReps,
    beginLoadingRecords,
    loadRecords,
    startEditRecord,
    setEditWeight,
    setEditReps,
    saveRecordEdit,
    cancelRecordEdit,
    deleteRecord,
  } = useTrainingRecords({
    exercise,
    showToast,
  });

  const {
    recordDraft,
    isSavingRecord,
    isRecordPanelOpen,
    setRecordDraft,
    clearRecordDraft,
    handleRecordDraftChange,
    openRecordPanel,
    closeRecordPanel,
    saveRecord,
    addRecord,
  } = useRecordDraft({
    exercise,
    records,
    loadRecords,
    cancelRecordEdit,
    showToast,
  });

  const {
    messages,
    input,
    isSending,
    mobileChatAreaRef,
    desktopChatAreaRef,
    setInput,
    sendMessage,
    resetChat,
  } = useReportChat({
    exercise,
    onRecordParsed: setRecordDraft,
  });

  const handleExerciseChange = (next: Exercise) => {
    beginLoadingRecords();
    setExercise(next);
    setShowExercisePicker(false);
    resetChat(next);
    clearRecordDraft();
    cancelRecordEdit();
    cancelGoalDelete();
  };

  // refだけは画面ごとに異なるため、それ以外を共通Propsとしてまとめる。
  const viewProps: Omit<ReportViewProps, "chatAreaRef"> = {
    goal: selectedExerciseGoal,
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
    onExerciseToggle: () => setShowExercisePicker((open) => !open),
    onExerciseChange: handleExerciseChange,
    onInputChange: setInput,
    onRecordDraftChange: handleRecordDraftChange,
    onSaveRecord: saveRecord,
    onCancelRecord: clearRecordDraft,
    onOpenRecordPanel: openRecordPanel,
    onCloseRecordPanel: closeRecordPanel,
    onStartEditRecord: startEditRecord,
    onEditWeightChange: setEditWeight,
    onEditRepsChange: setEditReps,
    onSaveRecordEdit: saveRecordEdit,
    onCancelRecordEdit: cancelRecordEdit,
    onDeleteRecord: deleteRecord,
    onAddRecord: addRecord,
    onRequestGoalDelete: requestGoalDelete,
    onCancelGoalDelete: cancelGoalDelete,
    onDeleteGoal: deleteGoal,
    onSubmit: sendMessage,
  };

  return (
    <>
      <ResponsiveScreen
        userName={userName}
        mobile={
          <MobileReportView {...viewProps} chatAreaRef={mobileChatAreaRef} />
        }
        desktop={
          <DesktopReportView {...viewProps} chatAreaRef={desktopChatAreaRef} />
        }
      />
      <Toast message={toastMessage} />
    </>
  );
};

export default ReportScreen;
