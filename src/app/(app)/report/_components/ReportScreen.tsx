"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { AppTabBar } from "@/components/AppTabBar";
import { MobileAppHeader } from "@/components/MobileAppHeader";
import { ResponsiveScreen } from "@/components/ResponsiveScreen";
import type { ChatMessage } from "@/lib/chat-types";
import type { TrainingRecordItem } from "@/lib/_types/training-record";
import { EXERCISES } from "../_types/report";
import type {
  Exercise,
  GoalSummary,
  ReportScreenProps,
  ReportViewProps,
  TrainingRecordDraft,
} from "../_types/report";


const assets = {
  avatar: "/assets/avatarIcon.svg",
  aiAvatar: "/assets/consult/ai-avatar.png",
  logo: "/assets/repmate-logo.svg",
  chevronDown: "/assets/consult/chevron-down.svg",
  send: "/assets/consult/send.svg",
} as const;


const createId = () => crypto.randomUUID();

const parseTrainingRecord = (message: string): TrainingRecordDraft | null => {
  const weight = message.match(/(\d+(?:\.\d+)?)\s*kg/i)?.[1];
  const reps = message.match(/(\d+)\s*(?:回|レップ(?:ス)?)/)?.[1];
  const sets = message.match(/(\d+)\s*セット(?!目)/)?.[1] ?? "1";

  return weight && reps ? { weight, reps, sets } : null;
};

const formatTime = (iso: string) =>
  new Intl.DateTimeFormat("ja-JP", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));

const welcomeMessage = (exercise: string): ChatMessage => ({
  id: createId(),
  role: "assistant",
  content: `${exercise}のトレーニングを記録しましょう！セットごとに重量とレップス数を教えてください。`,
  createdAt: new Date().toISOString(),
});

const GoalSection = ({ goal }: { goal?: GoalSummary | null }) => {
  if (!goal) {
    return (
      <div className="flex w-full shrink-0 items-start py-2">
        <p className="text-xs text-[#6b7280]">目標は未設定です</p>
      </div>
    );
  }

  return (
    <section className="w-full shrink-0 rounded-lg border border-[#242c3b] bg-[linear-gradient(164deg,#141822_25%,#0b0d12_75%)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#10b981]" aria-hidden />
          <h2 className="text-sm font-bold text-[#f9fafb]">今日の目標</h2>
        </div>
        <span className="shrink-0 text-[11px] font-bold text-[#10b981]">
          設定済み
        </span>
      </div>
      <p className="mt-3 text-[13px] leading-[1.4] text-[#9ca3af]">
        {goal.title} — {goal.detail}
      </p>
    </section>
  );
};

const ExerciseSelector = ({
  exercise,
  isOpen,
  onToggle,
  onChange,
  desktop = false,
}: {
  exercise: Exercise;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (exercise: Exercise) => void;
  desktop?: boolean;
}) => (
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
        <img alt="" className="h-[5px] w-2" src={assets.chevronDown} />
      </span>
    </button>
    {isOpen && (
      <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-[#273142] bg-[#141822] shadow-lg">
        {EXERCISES.map((item) => (
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

const ChatBubble = ({
  message,
  desktop = false,
}: {
  message: ChatMessage;
  desktop?: boolean;
}) => {
  if (message.role === "user") {
    return (
      <div className="flex w-full justify-end">
        <div
          className={`flex flex-col gap-1 rounded-bl-[10px] rounded-br-[10px] rounded-tl-[10px] bg-[#222b3f] ${
            desktop ? "w-full max-w-[420px] p-3.5" : "w-[240px] p-3"
          }`}
        >
          <p className="whitespace-pre-wrap text-[13px] leading-[1.5] text-[#f9fafb]">
            {message.content}
          </p>
          <p className="text-right font-[family-name:var(--font-urbanist)] text-[10px] text-[#9ca3af]">
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-start gap-2.5 min-[769px]:gap-3">
      <div className="relative size-9 shrink-0 overflow-hidden rounded-[18px]">
        <Image src={assets.aiAvatar} alt="" fill className="object-cover" sizes="36px" />
      </div>
      <div
        className={`flex flex-col gap-1 rounded-bl-[10px] rounded-br-[10px] rounded-tr-[10px] border bg-[linear-gradient(90deg,#16223b_0%,#0f1420_100%)] ${
          desktop
            ? "w-full max-w-[420px] border-[#273142] p-3.5"
            : "w-[240px] border-[#242c3b] p-3"
        }`}
      >
        <p className="whitespace-pre-wrap text-[13px] leading-[1.5] text-[#f9fafb]">
          {message.content}
        </p>
        <p className="text-right font-[family-name:var(--font-urbanist)] text-[10px] text-[#9ca3af]">
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
};

const ChatArea = ({
  messages,
  isSending,
  chatEndRef,
  desktop = false,
}: {
  messages: ChatMessage[];
  isSending: boolean;
  chatEndRef: RefObject<HTMLDivElement | null>;
  desktop?: boolean;
}) => (
  <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-1">
    {messages.map((message) => (
      <ChatBubble key={message.id} message={message} desktop={desktop} />
    ))}
    {isSending && (
      <div className="flex w-full items-start gap-2.5 min-[769px]:gap-3">
        <div className="relative size-9 shrink-0 overflow-hidden rounded-[18px]">
          <Image src={assets.aiAvatar} alt="" fill className="object-cover" sizes="36px" />
        </div>
        <div className="rounded-bl-[10px] rounded-br-[10px] rounded-tr-[10px] border border-[#273142] bg-[linear-gradient(90deg,#16223b_0%,#0f1420_100%)] px-3 py-2.5">
          <p className="text-[13px] text-[#9ca3af]">入力中…</p>
        </div>
      </div>
    )}
    <div ref={chatEndRef} />
  </div>
);

const ChatInput = ({
  input,
  isSending,
  onChange,
  onSubmit,
  desktop = false,
}: {
  input: string;
  isSending: boolean;
  onChange: (value: string) => void;
  onSubmit: (event?: FormEvent) => void;
  desktop?: boolean;
}) => (
  <form
    onSubmit={onSubmit}
    className={`flex shrink-0 items-center gap-2 rounded-lg border bg-[#141822] ${
      desktop
        ? "border-[#273142] py-3 pl-4 pr-3"
        : "border-[#242c3b] py-2 pl-3 pr-2"
    }`}
  >
    <input
      value={input}
      onChange={(event) => onChange(event.target.value)}
      placeholder="メッセージを入力..."
      className="min-w-0 flex-1 bg-transparent text-[13px] text-[#f9fafb] outline-none placeholder:text-[#9ca3af]"
      disabled={isSending}
    />
    <button
      type="submit"
      disabled={!input.trim() || isSending}
      className={`flex shrink-0 items-center justify-center rounded-md bg-[#1856ed] disabled:opacity-50 ${
        desktop ? "size-8" : "size-7"
      }`}
      aria-label="送信"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="size-3.5" src={assets.send} />
    </button>
  </form>
);

const RecordDraftCard = ({
  draft,
  isSaving,
  onChange,
  onSave,
  onCancel,
}: {
  draft: TrainingRecordDraft;
  isSaving: boolean;
  onChange: (field: keyof TrainingRecordDraft, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) => (
  <section className="shrink-0 rounded-lg border border-[#2463eb] bg-[#111827] p-3.5">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-bold text-[#f8fafc]">記録内容を確認</h2>
      <span className="text-[11px] font-bold text-[#5b8cff]">保存前</span>
    </div>
    <div className="mt-3 grid grid-cols-3 gap-2">
      {([
        ["weight", "重量", "kg"],
        ["reps", "回数", "回"],
        ["sets", "セット", "セット"],
      ] as const).map(([field, label, unit]) => (
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

const TrainingRecordList = ({
  records,
  editingRecordId,
  editWeight,
  editReps,
  onStartEdit,
  onEditWeightChange,
  onEditRepsChange,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: Pick<
  ReportViewProps,
  | "records"
  | "editingRecordId"
  | "editWeight"
  | "editReps"
  | "onEditWeightChange"
  | "onEditRepsChange"
> & {
  onStartEdit: (record: TrainingRecordItem) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (recordId: string) => void;
}) => {
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
          <div key={record.id} className="rounded-lg border border-[#273142] bg-[#141822] p-3">
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

const ReportSidePanel = ({
  goal = null,
  records,
  editingRecordId,
  editWeight,
  editReps,
  onStartEditRecord,
  onEditWeightChange,
  onEditRepsChange,
  onSaveRecordEdit,
  onCancelRecordEdit,
  onDeleteRecord,
}: ReportViewProps) => (
  <aside className="flex h-full w-[380px] shrink-0 flex-col gap-5 border-l border-[#273142] bg-[#111620] p-6">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-bold text-[#f8fafc]">今日の目標</h2>
      <span
        className={`rounded-md px-2 py-1 text-[11px] font-bold ${
          goal ? "bg-[rgba(16,185,129,0.13)] text-[#10b981]" : "bg-[rgba(102,112,133,0.13)] text-[#98a2b3]"
        }`}
      >
        {goal ? "設定済み" : "未設定"}
      </span>
    </div>

    {goal ? (
      <div className="flex flex-col gap-2.5 rounded-lg border border-[#273142] bg-[#141822] p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#10b981]" aria-hidden />
          <p className="text-sm font-bold text-[#f8fafc]">{goal.title}</p>
        </div>
        <p className="text-[13px] leading-[1.4] text-[#98a2b3]">{goal.detail}</p>
      </div>
    ) : (
      <div className="rounded-lg border border-[#273142] bg-[#141822] p-4">
        <p className="text-sm leading-none text-[#98a2b3]">目標は未設定です</p>
      </div>
    )}

    <div className="flex min-h-0 flex-1 flex-col gap-3 border-t border-[#273142] pt-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-[#f8fafc]">本日の記録</h2>
        <span className="text-[11px] font-bold text-[#5b8cff]">{records.length}セット</span>
      </div>
      <TrainingRecordList
        records={records}
        editingRecordId={editingRecordId}
        editWeight={editWeight}
        editReps={editReps}
        onStartEdit={onStartEditRecord}
        onEditWeightChange={onEditWeightChange}
        onEditRepsChange={onEditRepsChange}
        onSaveEdit={onSaveRecordEdit}
        onCancelEdit={onCancelRecordEdit}
        onDelete={onDeleteRecord}
      />
    </div>
  </aside>
);

const MobileReportView = ({
  goal,
  exercise,
  messages,
  input,
  isSending,
  isSavingRecord,
  isRecordPanelOpen,
  showExercisePicker,
  records,
  recordDraft,
  editingRecordId,
  editWeight,
  editReps,
  chatEndRef,
  onExerciseToggle,
  onExerciseChange,
  onInputChange,
  onRecordDraftChange,
  onSaveRecord,
  onCancelRecord,
  onOpenRecordPanel,
  onCloseRecordPanel,
  onStartEditRecord,
  onEditWeightChange,
  onEditRepsChange,
  onSaveRecordEdit,
  onCancelRecordEdit,
  onDeleteRecord,
  onSubmit,
}: ReportViewProps) => (
  <div
    className="relative mx-auto flex min-h-[812px] w-full max-w-[375px] flex-col overflow-hidden rounded-2xl bg-[#0b0d12] shadow-2xl"
    data-name="/report"
  >
    <MobileAppHeader />

    <main className="flex min-h-0 flex-1 flex-col gap-4 px-5 pb-4">
      <GoalSection goal={goal} />
      <ExerciseSelector
        exercise={exercise}
        isOpen={showExercisePicker}
        onToggle={onExerciseToggle}
        onChange={onExerciseChange}
      />
      <button
        type="button"
        onClick={onOpenRecordPanel}
        className="flex shrink-0 items-center justify-between rounded-lg border border-[#242c3b] bg-[#141822] px-3 py-2.5 text-left"
      >
        <span className="text-xs font-bold text-[#f8fafc]">本日の記録</span>
        <span className="text-[11px] font-bold text-[#5b8cff]">{records.length}セット</span>
      </button>
      <ChatArea messages={messages} isSending={isSending} chatEndRef={chatEndRef} />
      {recordDraft && (
        <RecordDraftCard
          draft={recordDraft}
          isSaving={isSavingRecord}
          onChange={onRecordDraftChange}
          onSave={onSaveRecord}
          onCancel={onCancelRecord}
        />
      )}
      <ChatInput input={input} isSending={isSending} onChange={onInputChange} onSubmit={onSubmit} />
    </main>

    <div
      className={`absolute inset-0 z-20 bg-black/40 transition-opacity duration-200 ${
        isRecordPanelOpen ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onCloseRecordPanel}
      aria-hidden
    />
    <aside
      aria-label="本日のトレーニング記録"
      className={`absolute inset-x-0 bottom-20 z-30 flex max-h-[65%] flex-col gap-4 rounded-t-2xl border-t border-[#242c3b] bg-[#111620] px-5 pb-5 pt-2 transition-transform duration-200 ease-out ${
        isRecordPanelOpen ? "translate-y-0" : "translate-y-[110%]"
      }`}
    >
      <div className="relative flex justify-center">
        <span className="h-1 w-10 rounded-full bg-[#384255]" aria-hidden />
        <button
          type="button"
          onClick={onCloseRecordPanel}
          className="absolute right-0 top-0 flex size-7 items-center justify-center text-lg text-[#98a2b3]"
          aria-label="記録一覧を閉じる"
        >
          ×
        </button>
      </div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#f8fafc]">本日の記録</h2>
        <span className="text-[11px] font-bold text-[#5b8cff]">{records.length}セット</span>
      </div>
      <TrainingRecordList
        records={records}
        editingRecordId={editingRecordId}
        editWeight={editWeight}
        editReps={editReps}
        onStartEdit={onStartEditRecord}
        onEditWeightChange={onEditWeightChange}
        onEditRepsChange={onEditRepsChange}
        onSaveEdit={onSaveRecordEdit}
        onCancelEdit={onCancelRecordEdit}
        onDelete={onDeleteRecord}
      />
    </aside>

    <AppTabBar active="report" variant="consult" />
  </div>
);

const DesktopReportView = ({
  goal,
  exercise,
  messages,
  input,
  isSending,
  isSavingRecord,
  showExercisePicker,
  records,
  recordDraft,
  editingRecordId,
  editWeight,
  editReps,
  chatEndRef,
  onExerciseToggle,
  onExerciseChange,
  onInputChange,
  onRecordDraftChange,
  onSaveRecord,
  onCancelRecord,
  onStartEditRecord,
  onEditWeightChange,
  onEditRepsChange,
  onSaveRecordEdit,
  onCancelRecordEdit,
  onDeleteRecord,
  onSubmit,
}: ReportViewProps) => (
  <main className="flex min-h-0 flex-1">
      <section className="flex min-w-0 flex-1 flex-col items-center justify-between px-10 py-6">
        <div className="flex min-h-0 w-full max-w-[720px] flex-1 flex-col gap-5">
          <ExerciseSelector
            exercise={exercise}
            isOpen={showExercisePicker}
            onToggle={onExerciseToggle}
            onChange={onExerciseChange}
            desktop
          />
          <ChatArea messages={messages} isSending={isSending} chatEndRef={chatEndRef} desktop />
        </div>
        <div className="flex w-full max-w-[720px] flex-col gap-3">
          {recordDraft && (
            <RecordDraftCard
              draft={recordDraft}
              isSaving={isSavingRecord}
              onChange={onRecordDraftChange}
              onSave={onSaveRecord}
              onCancel={onCancelRecord}
            />
          )}
          <ChatInput input={input} isSending={isSending} onChange={onInputChange} onSubmit={onSubmit} desktop />
        </div>
      </section>
      <ReportSidePanel
        goal={goal}
        exercise={exercise}
        messages={messages}
        input={input}
        isSending={isSending}
        isSavingRecord={isSavingRecord}
        isRecordPanelOpen={false}
        showExercisePicker={showExercisePicker}
        records={records}
        recordDraft={recordDraft}
        editingRecordId={editingRecordId}
        editWeight={editWeight}
        editReps={editReps}
        chatEndRef={chatEndRef}
        onExerciseToggle={onExerciseToggle}
        onExerciseChange={onExerciseChange}
        onInputChange={onInputChange}
        onRecordDraftChange={onRecordDraftChange}
        onSaveRecord={onSaveRecord}
        onCancelRecord={onCancelRecord}
        onOpenRecordPanel={() => undefined}
        onCloseRecordPanel={() => undefined}
        onStartEditRecord={onStartEditRecord}
        onEditWeightChange={onEditWeightChange}
        onEditRepsChange={onEditRepsChange}
        onSaveRecordEdit={onSaveRecordEdit}
        onCancelRecordEdit={onCancelRecordEdit}
        onDeleteRecord={onDeleteRecord}
        onSubmit={onSubmit}
      />
    </main>
);

const ReportScreen = ({ goal = null, userName }: ReportScreenProps) => {
  const router = useRouter();
  const defaultExercise: Exercise = goal ? "ベンチプレス" : "スクワット";
  const [exercise, setExercise] = useState<Exercise>(defaultExercise);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    welcomeMessage(defaultExercise),
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const [isRecordPanelOpen, setIsRecordPanelOpen] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [records, setRecords] = useState<TrainingRecordItem[]>([]);
  const [recordDraft, setRecordDraft] = useState<TrainingRecordDraft | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState("");
  const [editReps, setEditReps] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const mobileChatEndRef = useRef<HTMLDivElement>(null);
  const desktopChatEndRef = useRef<HTMLDivElement>(null);

  const apiMessages = useMemo(
    () => messages.map(({ role, content }) => ({ role, content })),
    [messages],
  );

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

  const loadRecords = useCallback(async (targetExercise: Exercise) => {
    const nextRecords = await fetchRecords(targetExercise);
    setRecords(nextRecords);
  }, [fetchRecords]);

  useEffect(() => {
    mobileChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    desktopChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    let ignore = false;

    void fetchRecords(exercise)
      .then((nextRecords) => {
        if (!ignore) setRecords(nextRecords);
      })
      .catch((error: unknown) => {
        if (!ignore) {
          setToastMessage(
            error instanceof Error ? error.message : "記録を取得できませんでした",
          );
        }
      });

    return () => {
      ignore = true;
    };
  }, [exercise, fetchRecords]);

  useEffect(() => {
    if (!toastMessage) return;

    const timeoutId = window.setTimeout(() => setToastMessage(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  const sendMessage = async (event?: FormEvent) => {
    event?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    const parsedRecord = parseTrainingRecord(trimmed);
    if (parsedRecord) {
      setRecordDraft(parsedRecord);
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise,
          mode: "report",
          messages: [...apiMessages, { role: "user" as const, content: trimmed }],
        }),
      });

      if (!response.ok) {
        throw new Error("Chat API failed");
      }

      const data = (await response.json()) as { reply: string };
      const assistantMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        content: data.reply,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const assistantMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        content:
          "申し訳ありません。応答の取得に失敗しました。しばらくしてからもう一度お試しください。",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleExerciseChange = (next: Exercise) => {
    setExercise(next);
    setShowExercisePicker(false);
    setMessages([welcomeMessage(next)]);
    setInput("");
    setRecordDraft(null);
    setEditingRecordId(null);
  };

  const handleRecordDraftChange = (
    field: keyof TrainingRecordDraft,
    value: string,
  ) => {
    setRecordDraft((current) => current ? { ...current, [field]: value } : current);
  };

  const saveRecord = async () => {
    if (!recordDraft || isSavingRecord) return;

    const weight = Number(recordDraft.weight);
    const reps = Number(recordDraft.reps);
    const sets = Number(recordDraft.sets);
    if (!weight || !reps || !sets) {
      setToastMessage("重量・回数・セット数を確認してください");
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
      setToastMessage("トレーニングを記録しました");
      router.refresh();
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : "記録を保存できませんでした");
    } finally {
      setIsSavingRecord(false);
    }
  };

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

  const saveRecordEdit = async () => {
    if (!editingRecordId) return;

    const weight = Number(editWeight);
    const reps = Number(editReps);
    if (!weight || !reps) {
      setToastMessage("重量と回数を確認してください");
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
      setToastMessage("記録を更新しました");
      router.refresh();
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : "記録を更新できませんでした");
    }
  };

  const deleteRecord = async (recordId: string) => {
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
      setToastMessage("記録を削除しました");
      router.refresh();
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : "記録を削除できませんでした");
    }
  };

  const viewProps: Omit<ReportViewProps, "chatEndRef"> = {
    goal,
    exercise,
    messages,
    input,
    isSending,
    isSavingRecord,
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
    onCancelRecord: () => setRecordDraft(null),
    onOpenRecordPanel: () => setIsRecordPanelOpen(true),
    onCloseRecordPanel: () => setIsRecordPanelOpen(false),
    onStartEditRecord: startEditRecord,
    onEditWeightChange: setEditWeight,
    onEditRepsChange: setEditReps,
    onSaveRecordEdit: saveRecordEdit,
    onCancelRecordEdit: cancelRecordEdit,
    onDeleteRecord: deleteRecord,
    onSubmit: sendMessage,
  };

  return (
    <>
      <ResponsiveScreen
        userName={userName}
        mobile={<MobileReportView {...viewProps} chatEndRef={mobileChatEndRef} />}
        desktop={<DesktopReportView {...viewProps} chatEndRef={desktopChatEndRef} />}
      />
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 z-50 max-w-[calc(100%-32px)] -translate-x-1/2 rounded-lg border border-[#273142] bg-[#17213a] px-5 py-3 text-center text-sm font-bold text-[#f8fafc] shadow-xl transition-all duration-200 ${
          toastMessage
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        {toastMessage}
      </div>
    </>
  );
};

export default ReportScreen;
