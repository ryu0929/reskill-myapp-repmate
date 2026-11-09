"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  TrainingRecordDraft,
  UseRecordDraftParams,
} from "../_types/report";

const useRecordDraft = ({
  exercise,
  records,
  loadRecords,
  cancelRecordEdit,
  showToast,
}: UseRecordDraftParams) => {
  const router = useRouter();

  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const [isRecordPanelOpen, setIsRecordPanelOpen] = useState(false);
  const [recordDraft, setRecordDraft] = useState<TrainingRecordDraft | null>(
    null,
  );

  const handleRecordDraftChange = (
    field: keyof TrainingRecordDraft,
    value: string,
  ) => {
    setRecordDraft((current) =>
      current ? { ...current, [field]: value } : current,
    );
  };

  const clearRecordDraft = () => {
    setRecordDraft(null);
  };

  const openRecordPanel = () => {
    setIsRecordPanelOpen(true);
  };

  const closeRecordPanel = () => {
    setIsRecordPanelOpen(false);
  };

  // 確認カードの文字列を数値へ変換してから保存APIへ送る。
  const saveRecord = async () => {
    if (!recordDraft || isSavingRecord) return;

    const weight = Number(recordDraft.weight);
    const reps = Number(recordDraft.reps);
    const sets = Number(recordDraft.sets);
    if (!weight || !reps || !sets) {
      showToast("重量・回数・セット数を確認してください");
      return;
    }

    setIsSavingRecord(true);
    try {
      const response = await fetch("/api/training-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercise, weight, reps, sets }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "記録を保存できませんでした");
      }

      setRecordDraft(null);
      await loadRecords(exercise);
      setIsRecordPanelOpen(true);
      showToast("トレーニングを記録しました");
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "記録を保存できませんでした",
      );
    } finally {
      setIsSavingRecord(false);
    }
  };

  // 直前セットの値を引き継ぎ、1セット分の確認カードを開く。
  const addRecord = () => {
    const latestRecord = records[records.length - 1];
    if (!latestRecord) return;

    cancelRecordEdit();
    
    setRecordDraft({
      weight: String(latestRecord.weight),
      reps: String(latestRecord.reps),
      sets: "1",
    });
    setIsRecordPanelOpen(false);
  };

  return {
    recordDraft,
    isSavingRecord,
    isRecordPanelOpen,
    setRecordDraft,
    handleRecordDraftChange,
    clearRecordDraft,
    openRecordPanel,
    closeRecordPanel,
    saveRecord,
    addRecord,
  };
};

export default useRecordDraft;
