import type { RecordDraftCardProps } from "../_types/report";

const RecordDraftCard = ({
  draft,
  isSaving,
  onChange,
  onSave,
  onCancel,
}: RecordDraftCardProps) => (
  <section className="shrink-0 rounded-lg border border-[#2463eb] bg-[#111827] p-3.5">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-bold text-[#f8fafc]">記録内容を確認</h2>
      <span className="text-[11px] font-bold text-[#5b8cff]">保存前</span>
    </div>
    <div className="mt-3 grid grid-cols-3 gap-2">
      {(
        [
          ["weight", "重量", "kg"],
          ["reps", "回数", "回"],
          ["sets", "セット", "セット"],
        ] as const
      ).map(([field, label, unit]) => (
        <label key={field} className="min-w-0 text-[11px] text-[#98a2b3]">
          {label}
          <span className="mt-1 flex items-center gap-1 rounded-md border border-[#384255] bg-[#0b0d12] px-2 py-1.5 focus-within:border-[#2463eb]">
            <input
              type="number"
              min="1"
              step={field === "weight" ? "0.5" : "1"}
              value={draft[field]}
              onChange={(event) => onChange(field, event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#f8fafc] outline-none"
              aria-label={label}
            />
            <span className="shrink-0 text-[10px]">{unit}</span>
          </span>
        </label>
      ))}
    </div>
    <div className="mt-3 grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSaving}
        className="rounded-lg border border-[#384255] px-3 py-2 text-xs font-bold text-[#98a2b3] disabled:opacity-40"
      >
        キャンセル
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={isSaving || !draft.weight || !draft.reps || !draft.sets}
        className="rounded-lg bg-[#2463eb] px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
      >
        {isSaving ? "記録中…" : "記録する"}
      </button>
    </div>
  </section>
);

export default RecordDraftCard;
