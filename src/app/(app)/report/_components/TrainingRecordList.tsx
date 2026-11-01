import type { TrainingRecordListProps } from "../_types/report";

const TrainingRecordList = ({
  records,
  isLoadingRecords,
  editingRecordId,
  editWeight,
  editReps,
  onStartEdit,
  onEditWeightChange,
  onEditRepsChange,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: TrainingRecordListProps) => {
  // 読み込み中・0件・編集・通常表示を一つの一覧で切り替える。
  if (isLoadingRecords) {
    return (
      <div
        className="rounded-lg border border-[#273142] bg-[#141822] p-4"
        role="status"
      >
        <p className="text-[13px] text-[#98a2b3]">本日の記録を読み込み中…</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="rounded-lg border border-[#273142] bg-[#141822] p-4">
        <p className="text-[13px] text-[#98a2b3]">本日の記録はまだありません</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-col gap-2 overflow-y-auto">
      {records.map((record) => {
        const isEditing = editingRecordId === record.id;

        return (
          <div
            key={record.id}
            className="rounded-lg border border-[#273142] bg-[#141822] p-3"
          >
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[10px] text-[#98a2b3]">
                  重量
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={editWeight}
                    onChange={(event) => onEditWeightChange(event.target.value)}
                    className="mt-1 w-full rounded-md border border-[#384255] bg-[#0b0d12] px-2 py-1.5 text-sm text-[#f8fafc] outline-none focus:border-[#2463eb]"
                  />
                </label>
                <label className="text-[10px] text-[#98a2b3]">
                  回数
                  <input
                    type="number"
                    min="1"
                    value={editReps}
                    onChange={(event) => onEditRepsChange(event.target.value)}
                    className="mt-1 w-full rounded-md border border-[#384255] bg-[#0b0d12] px-2 py-1.5 text-sm text-[#f8fafc] outline-none focus:border-[#2463eb]"
                  />
                </label>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="rounded-md border border-[#384255] py-1.5 text-[11px] font-bold text-[#98a2b3]"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={onSaveEdit}
                  className="rounded-md bg-[#2463eb] py-1.5 text-[11px] font-bold text-white"
                >
                  保存
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-[#f8fafc]">
                    {record.weight}kg × {record.reps}回
                  </p>
                  <span className="text-[11px] font-bold text-[#5b8cff]">
                    {record.setOrder}セット目
                  </span>
                </div>
                <div className="mt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => onStartEdit(record)}
                    className="text-[11px] font-bold text-[#98a2b3] hover:text-[#f8fafc]"
                  >
                    編集
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(record.id)}
                    className="text-[11px] font-bold text-[#ef6b73] hover:text-[#ff8a91]"
                  >
                    削除
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TrainingRecordList;
