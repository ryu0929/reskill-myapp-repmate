import type { ExerciseSelectorProps } from "./_types/exercise-selector";

const chevronDown = "/assets/consult/chevron-down.svg";

const ExerciseSelector = <T extends string>({
  exercise,
  options,
  isOpen,
  onToggle,
  onChange,
  desktop = false,
}: ExerciseSelectorProps<T>) => (
  <div className="relative w-full shrink-0">
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-center justify-between rounded-lg border bg-[#141822] text-left ${
        desktop ? "border-[#273142] p-4" : "border-[#242c3b] p-3"
      }`}
    >
      <span className="text-sm font-bold text-[#f9fafb]">{exercise}</span>

      <span className="flex items-center gap-1 text-xs text-[#9ca3af] min-[769px]:text-[13px]">
        種目を変更
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={chevronDown}
          alt=""
          className="size-[11px] min-[769px]:h-[5px] min-[769px]:w-2"
        />
      </span>
    </button>

    {isOpen && (
      <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-[#273142] bg-[#141822] shadow-lg">
        {options.map((item) => (
          <li key={item}>
            <button
              type="button"
              onClick={() => onChange(item)}
              className="w-full px-3 py-2.5 text-left text-sm text-[#f9fafb] hover:bg-[#1d2432]"
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default ExerciseSelector;
