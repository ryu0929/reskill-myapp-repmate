const AddRecordButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-dashed border-[#384255] bg-[#141822] px-4 py-2.5 text-sm font-bold text-[#5b8cff] transition-colors hover:border-[#5b8cff] hover:bg-[#17213a]"
  >
    <span className="text-lg leading-none" aria-hidden>
      ＋
    </span>
    セットを追加
  </button>
);

export default AddRecordButton;
