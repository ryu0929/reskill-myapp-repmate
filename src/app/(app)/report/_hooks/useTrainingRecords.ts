"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { TrainingRecordItem } from "@/lib/_types/training-record";
import type { Exercise, UseTrainingRecordsParams } from "../_types/report";

const useTrainingRecords = ({
  exercise,
  showToast,
}: UseTrainingRecordsParams) => {
  const router = useRouter();
  const [records, setRecords] = useState<TrainingRecordItem[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState("");
  const [editReps, setEditReps] = useState("");

  const startEditRecord = (record: TrainingRecordItem) => {
    setEditingRecordId(record.id);
    setEditWeight(String(record.weight));
    setEditReps(String(record.reps));
  };

  const cancelRecordEdit = () => {
    setEditingRecordId(null);
    setEditWeight("");
    setEditReps("");
  };

  // 編集対象のidをURLへ含め、変更した重量と回数だけを更新する。
  const saveRecordEdit = async () => {
    if (!editingRecordId) return;

    const weight = Number(editWeight);
    const reps = Number(editReps);
    if (!weight || !reps) {
      showToast("重量と回数を確認してください");
      return;
    }

    try {
      const response = await fetch(`/api/training-records/${editingRecordId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight, reps }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "記録を更新できませんでした");
      }

      cancelRecordEdit();
      await loadRecords(exercise);
      showToast("記録を更新しました");
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "記録を更新できませんでした",
      );
    }
  };

  // 誤操作を防ぐため、確認後に削除して一覧を読み直す。
  const deleteRecord = async (recordId: string) => {
    if (!window.confirm("このトレーニング記録を削除しますか？")) return;

    try {
      const response = await fetch(`/api/training-records/${recordId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "記録を削除できませんでした");
      }

      if (editingRecordId === recordId) cancelRecordEdit();
      await loadRecords(exercise);
      showToast("記録を削除しました");
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "記録を削除できませんでした",
      );
    }
  };

  // 種目を変更した直後から読み込み表示へ切り替える。
  const beginLoadingRecords = useCallback(() => {
    setIsLoadingRecords(true);
  }, []);

  // 指定した種目の今日の記録をAPIから取得する。
  const fetchRecords = useCallback(async (targetExercise: Exercise) => {
    const response = await fetch(
      `/api/training-records?exercise=${encodeURIComponent(targetExercise)}`,
    );

    const data = (await response.json()) as {
      records?: TrainingRecordItem[];
      error?: string;
    };

    if (!response.ok || !data.records) {
      throw new Error(data.error ?? "記録を取得できませんでした");
    }

    return data.records;
  }, []);

  // 登録・更新・削除後に一覧を再取得する。
  const loadRecords = useCallback(
    async (targetExercise: Exercise) => {
      setIsLoadingRecords(true);

      try {
        const nextRecords = await fetchRecords(targetExercise);
        setRecords(nextRecords);
      } finally {
        setIsLoadingRecords(false);
      }
    },
    [fetchRecords],
  );

  // 表示中の種目が変わるたびに、その種目の記録を取得する。
  useEffect(() => {
    // 種目変更や画面移動後に、古い通信結果で状態を更新しないためのフラグ。
    let ignore = false;

    // Promiseの戻り値は使わず、結果はthen・catch・finallyで処理する。
    void fetchRecords(exercise)
      .then((nextRecords) => {
        if (!ignore) {
          setRecords(nextRecords);
        }
      })
      .catch((error: unknown) => {
        if (!ignore) {
          showToast(
            error instanceof Error
              ? error.message
              : "記録を取得できませんでした",
          );
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoadingRecords(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [exercise, fetchRecords, showToast]);

  return {
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
  };
};

export default useTrainingRecords;
