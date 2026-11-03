import type { GoalCardProps } from "./_types/goal-card";

const GoalCard = ({
  exercise,
  description,
  action,
  desktop = false,
}: GoalCardProps) => (
  <section
    className={`flex flex-col border bg-[linear-gradient(164deg,#141822_25%,#0b0d12_75%)] ${
      desktop
        ? "min-h-[180px] gap-4 rounded-xl border-[#273142] p-6"
        : "gap-2.5 rounded-lg border-[#242c3b] p-4"
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="size-2 shrink-0 rounded-full bg-[#10b981]"
          aria-hidden
        />
        <p className="text-sm font-bold text-[#f8fafc]">{exercise}</p>
      </div>

      {action}
    </div>

    <p className="text-[13px] leading-[1.5] text-[#98a2b3]">{description}</p>
  </section>
);

export default GoalCard;
