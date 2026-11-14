import type { GoalProposalCardProps } from "../_types/consult";

const GoalProposalCard = ({
  proposal,
  selected,
  onSelect,
}: GoalProposalCardProps) => (
  <button
    type="button"
    onClick={onSelect}
    aria-pressed={selected}
    className={`w-full rounded-lg border p-4 text-left transition-colors duration-200 ${
      selected
        ? "border-[#2463eb] bg-[#17213a]"
        : "border-[#273142] bg-[#141822] hover:border-[#384866]"
    }`}
  >
    <span className="flex items-start gap-2">
      <span
        className={`mt-1 size-2 shrink-0 rounded-full transition-colors ${
          selected ? "bg-[#2463eb]" : "bg-[#667085]"
        }`}
        aria-hidden
      />

      <span className="min-w-0">
        <span className="block text-sm font-bold text-[#f8fafc]">
          {proposal.title}
        </span>

        <span className="mt-2 block text-[13px] leading-[1.5] text-[#98a2b3]">
          {proposal.description}
        </span>
      </span>
    </span>
  </button>
);

export default GoalProposalCard;
