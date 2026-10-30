import type { GoalDeleteActionProps } from "./_types/goal-delete-action";

// ブラウザ標準アラートを使わず、目標カード内で削除確認を完結させる。
export const GoalDeleteAction = ({
  isConfirming,
  isDeleting,
  onRequest,
  onCancel,
  onConfirm,
}: GoalDeleteActionProps) => {
  if (!isConfirming) {
    return (
      <button
        type="button"
        onClick={onRequest}
        className="shrink-0 text-[11px] font-bold text-[#ef6b73] transition-colors hover:text-[#ff8a91]"
      >
        削除
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span className="text-[11px] font-bold text-[#98a2b3]">
        削除しますか？
      </span>
      <button
        type="button"
        onClick={onCancel}
        disabled={isDeleting}
        className="rounded-md border border-[#384255] px-2 py-1 text-[11px] font-bold text-[#98a2b3] disabled:opacity-40"
      >
        キャンセル
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isDeleting}
        className="rounded-md bg-[#ef6b73] px-2 py-1 text-[11px] font-bold text-white disabled:opacity-40"
      >
        {isDeleting ? "削除中…" : "削除する"}
      </button>
    </div>
  );
};
