"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AppTabBar } from "@/components/AppTabBar";
import { GoalDeleteAction } from "@/components/GoalDeleteAction";
import { MobileAppHeader } from "@/components/MobileAppHeader";
import { ResponsiveScreen } from "@/components/ResponsiveScreen";
import GoalCard from "@/components/GoalCard";
import ExerciseSelector from "@/components/ExerciseSelector";
import BottomSheet from "@/components/BottomSheet";
import Toast from "@/components/Toast";
import useToast from "@/hooks/useToast";
import { TrainerChatArea, TrainerChatInput } from "@/components/TrainerChat";
import type { ChatMessage } from "@/lib/chat-types";
import { EXERCISES } from "../_types/consult";
import type {
  ConfiguredGoalViewProps,
  ConsultScreenProps,
  ConsultViewProps,
  Exercise,
  GoalChangeActionsProps,
  GoalComposerContentProps,
  GoalProposal,
  GoalProposalCardProps,
  GoalSummary,
} from "../_types/consult";

const assets = {
  plusCircle: "/assets/consult/plus-circle.svg",
} as const;

const createId = () => crypto.randomUUID();

const wait = (duration: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, duration));

const welcomeMessage = (exercise: string): ChatMessage => ({
  id: createId(),
  role: "assistant",
  content: `こんにちは！今日は${exercise}について相談ですね。現在の記録と目標を教えてください。`,
  createdAt: new Date().toISOString(),
});

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

const GoalChangeActions = ({
  onChangeGoal,
  onRestartConsultation,
  compact = false,
}: GoalChangeActionsProps) => (
  <div
    className={
      compact ? "grid shrink-0 grid-cols-2 gap-2" : "flex flex-col gap-2"
    }
  >
    <button
      type="button"
      onClick={onChangeGoal}
      className="flex min-h-11 items-center justify-center rounded-lg border border-[#2463eb] px-3 py-2.5 text-[13px] font-bold text-[#5b8cff] transition-colors hover:bg-[#17213a]"
    >
      候補から選びなおす
    </button>
    <button
      type="button"
      onClick={onRestartConsultation}
      className="flex min-h-11 items-center justify-center rounded-lg bg-[#2463eb] px-3 py-2.5 text-[13px] font-bold text-[#f8fafc] transition-opacity hover:opacity-90"
    >
      もう一度相談する
    </button>
  </div>
);

const ConfiguredGoalView = ({
  goal,
  isDeletingGoal,
  isGoalDeleteConfirming,
  onChangeGoal,
  onRestartConsultation,
  onRequestGoalDelete,
  onCancelGoalDelete,
  onDeleteGoal,
  desktop = false,
}: ConfiguredGoalViewProps) => (
  <section
    className={`flex min-h-0 flex-1 flex-col items-center justify-center ${
      desktop ? "px-10 py-8" : "overflow-y-auto px-5 pb-5 pt-1"
    }`}
  >
    <div className="flex w-full max-w-[640px] flex-col gap-5">
      <div>
        <p className="text-xs font-bold text-[#98a2b3]">設定中の目標</p>
        <h2 className="mt-1 text-xl font-bold text-[#f8fafc]">今日の目標</h2>
      </div>

      <GoalCard
        exercise={goal.exercise}
        description={goal.description}
        desktop={desktop}
        action={
          <GoalDeleteAction
            isConfirming={isGoalDeleteConfirming}
            isDeleting={isDeletingGoal}
            onRequest={onRequestGoalDelete}
            onCancel={onCancelGoalDelete}
            onConfirm={onDeleteGoal}
          />
        }
      />

      <GoalChangeActions
        onChangeGoal={onChangeGoal}
        onRestartConsultation={onRestartConsultation}
        compact={!desktop}
      />
    </div>
  </section>
);

const GoalComposerContent = ({
  goal,
  proposals,
  selectedProposalId,
  isGeneratingGoals,
  isSavingGoal,
  isDeletingGoal,
  isGoalDeleteConfirming,
  isChangingGoal,
  isReconsulting,
  canGenerateGoals,
  onGenerateGoals,
  onSelectGoal,
  onSaveGoal,
  onChangeGoal,
  onRestartConsultation,
  onRequestGoalDelete,
  onCancelGoalDelete,
  onDeleteGoal,
}: GoalComposerContentProps) => {
  // 現在の目標と新しい候補を同じ領域で切り替えて表示する。
  const hasProposals = proposals.length > 0;

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#f8fafc]">今日の目標</h2>
        <span
          className={`rounded-md px-2 py-1 text-[11px] font-bold ${
            hasProposals || isGeneratingGoals
              ? "bg-[rgba(16,185,129,0.13)] text-[#10b981]"
              : goal
                ? "bg-[rgba(16,185,129,0.13)] text-[#10b981]"
                : "bg-[rgba(152,162,179,0.13)] text-[#98a2b3]"
          }`}
        >
          {hasProposals || isGeneratingGoals
            ? isChangingGoal
              ? "変更中"
              : "作成中"
            : (goal?.statusLabel ?? "未設定")}
        </span>
      </div>

      <div className="flex min-h-0 flex-col gap-3 overflow-y-auto">
        {isGeneratingGoals && (
          <div
            className="flex items-center gap-3 rounded-lg border border-[#273142] bg-[#141822] p-4"
            role="status"
            aria-live="polite"
          >
            <span
              className="size-4 shrink-0 animate-spin rounded-full border-2 border-[#384866] border-t-[#5b8cff]"
              aria-hidden
            />
            <p className="animate-pulse text-[13px] text-[#98a2b3]">
              AIが目標を作成中です…
            </p>
          </div>
        )}

        {!isGeneratingGoals &&
          hasProposals &&
          proposals.map((proposal) => (
            <GoalProposalCard
              key={proposal.id}
              proposal={proposal}
              selected={selectedProposalId === proposal.id}
              onSelect={() => onSelectGoal(proposal.id)}
            />
          ))}

        {!isGeneratingGoals && !hasProposals && goal && (
          <GoalCard
            exercise={goal.exercise}
            description={goal.description}
            action={
              <GoalDeleteAction
                isConfirming={isGoalDeleteConfirming}
                isDeleting={isDeletingGoal}
                onRequest={onRequestGoalDelete}
                onCancel={onCancelGoalDelete}
                onConfirm={onDeleteGoal}
              />
            }
          />
        )}

        {!isGeneratingGoals && !hasProposals && !goal && (
          <div className="rounded-lg border border-[#273142] bg-[#141822] p-4">
            <p className="text-[13px] leading-[1.5] text-[#98a2b3]">
              目標はまだ設定されていません。AIと相談してワークアウトの計画を作成しましょう。
            </p>
          </div>
        )}
      </div>

      {hasProposals ? (
        <button
          type="button"
          onClick={onSaveGoal}
          disabled={!selectedProposalId || isSavingGoal}
          className="flex w-full items-center justify-center rounded-lg bg-[#2463eb] p-3.5 text-sm font-bold text-[#f8fafc] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSavingGoal
            ? isChangingGoal
              ? "変更を保存中です…"
              : "目標を設定中です…"
            : isChangingGoal
              ? "変更を保存する"
              : "目標を設定する"}
        </button>
      ) : goal && !isReconsulting ? (
        <GoalChangeActions
          onChangeGoal={onChangeGoal}
          onRestartConsultation={onRestartConsultation}
        />
      ) : (
        <button
          type="button"
          onClick={onGenerateGoals}
          disabled={!canGenerateGoals || isGeneratingGoals}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2463eb] p-3.5 text-sm font-bold text-[#f8fafc] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" className="size-4" src={assets.plusCircle} />
          <span>
            {isGeneratingGoals
              ? "作成中です…"
              : canGenerateGoals
                ? isReconsulting
                  ? "新しい目標を決める"
                  : "今日の目標を決める"
                : "AIと1往復以上相談してください"}
          </span>
        </button>
      )}
    </>
  );
};

const GoalPanel = (props: ConsultViewProps) => (
  <aside className="flex h-full w-[380px] shrink-0 flex-col gap-5 border-l border-[#273142] bg-[#111620] p-6">
    <GoalComposerContent {...props} />
  </aside>
);

const MobileConsultView = ({
  exercise,
  messages,
  input,
  isSending,
  showExercisePicker,
  goal,
  proposals,
  selectedProposalId,
  isGeneratingGoals,
  isSavingGoal,
  isDeletingGoal,
  isGoalDeleteConfirming,
  isChangingGoal,
  isReconsulting,
  isGoalComposerOpen,
  canGenerateGoals,
  chatAreaRef,
  onExerciseToggle,
  onExerciseChange,
  onInputChange,
  onSubmit,
  onGenerateGoals,
  onSelectGoal,
  onSaveGoal,
  onChangeGoal,
  onRestartConsultation,
  onRequestGoalDelete,
  onCancelGoalDelete,
  onDeleteGoal,
  onCloseGoalComposer,
}: ConsultViewProps) => (
  // SPは1画面内を縦に分割し、目標候補は下から重なるシートとして表示する。
  <div
    className="relative mx-auto flex h-full w-full flex-col overflow-hidden bg-[#0b0d12] shadow-2xl"
    data-name="/consult"
  >
    <MobileAppHeader />

    {goal && !isReconsulting && proposals.length === 0 && !isGeneratingGoals ? (
      <ConfiguredGoalView
        goal={goal}
        isDeletingGoal={isDeletingGoal}
        isGoalDeleteConfirming={isGoalDeleteConfirming}
        onChangeGoal={onChangeGoal}
        onRestartConsultation={onRestartConsultation}
        onRequestGoalDelete={onRequestGoalDelete}
        onCancelGoalDelete={onCancelGoalDelete}
        onDeleteGoal={onDeleteGoal}
      />
    ) : (
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-5 pb-3 pt-1">
        {/* チャット領域へ残りの高さを渡すため、外側ではスクロールを増やさない。 */}
        {goal && isReconsulting && (
          <section className="flex w-full shrink-0 flex-col gap-2">
            <h2 className="text-sm font-bold text-[#f9fafb]">今日の目標</h2>

            <GoalCard
              exercise={goal.exercise}
              description={goal.description}
              action={
                <GoalDeleteAction
                  isConfirming={isGoalDeleteConfirming}
                  isDeleting={isDeletingGoal}
                  onRequest={onRequestGoalDelete}
                  onCancel={onCancelGoalDelete}
                  onConfirm={onDeleteGoal}
                />
              }
            />
          </section>
        )}
        <ExerciseSelector
          exercise={exercise}
          options={EXERCISES}
          isOpen={showExercisePicker}
          onToggle={onExerciseToggle}
          onChange={onExerciseChange}
        />
        <TrainerChatArea
          messages={messages}
          isSending={isSending}
          chatAreaRef={chatAreaRef}
        />
        <TrainerChatInput
          input={input}
          isSending={isSending}
          onChange={onInputChange}
          onSubmit={onSubmit}
        />
        <button
          type="button"
          onClick={onGenerateGoals}
          disabled={!canGenerateGoals || isGeneratingGoals}
          className="flex shrink-0 items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#2a52a0] to-[#1e418c] p-3.5 shadow-[0px_4px_6px_rgba(24,86,237,0.2)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" className="size-3.5" src={assets.plusCircle} />
          <span className="text-[15px] font-bold text-white">
            {isGeneratingGoals
              ? "候補を読み込み中…"
              : canGenerateGoals
                ? isReconsulting
                  ? "新しい目標を決める"
                  : "今日の目標を決める"
                : "AIと1往復以上相談してください"}
          </span>
        </button>
      </div>
    )}

    <BottomSheet
      isOpen={isGoalComposerOpen}
      onClose={onCloseGoalComposer}
      ariaLabel="今日の目標候補"
      closeLabel="目標候補を閉じる"
      size="large"
      variant="accent"
    >
      <GoalComposerContent
        goal={goal}
        proposals={proposals}
        selectedProposalId={selectedProposalId}
        isGeneratingGoals={isGeneratingGoals}
        isSavingGoal={isSavingGoal}
        isDeletingGoal={isDeletingGoal}
        isGoalDeleteConfirming={isGoalDeleteConfirming}
        isChangingGoal={isChangingGoal}
        isReconsulting={isReconsulting}
        canGenerateGoals={canGenerateGoals}
        onGenerateGoals={onGenerateGoals}
        onSelectGoal={onSelectGoal}
        onSaveGoal={onSaveGoal}
        onChangeGoal={onChangeGoal}
        onRestartConsultation={onRestartConsultation}
        onRequestGoalDelete={onRequestGoalDelete}
        onCancelGoalDelete={onCancelGoalDelete}
        onDeleteGoal={onDeleteGoal}
      />
    </BottomSheet>

    <AppTabBar active="consult" />
  </div>
);

const DesktopConsultView = ({
  exercise,
  messages,
  input,
  isSending,
  showExercisePicker,
  chatAreaRef,
  goal,
  proposals,
  selectedProposalId,
  isGeneratingGoals,
  isSavingGoal,
  isDeletingGoal,
  isGoalDeleteConfirming,
  isChangingGoal,
  isReconsulting,
  isGoalComposerOpen,
  canGenerateGoals,
  onExerciseToggle,
  onExerciseChange,
  onInputChange,
  onSubmit,
  onGenerateGoals,
  onSelectGoal,
  onSaveGoal,
  onChangeGoal,
  onRestartConsultation,
  onRequestGoalDelete,
  onCancelGoalDelete,
  onDeleteGoal,
  onCloseGoalComposer,
}: ConsultViewProps) => {
  // PCは左に会話、右に目標パネルを並べ、設定済みの場合は概要画面へ切り替える。
  const showGoalOverview =
    Boolean(goal) &&
    !isReconsulting &&
    proposals.length === 0 &&
    !isGeneratingGoals;

  if (goal && showGoalOverview) {
    return (
      <main className="flex min-h-0 flex-1">
        <ConfiguredGoalView
          goal={goal}
          isDeletingGoal={isDeletingGoal}
          isGoalDeleteConfirming={isGoalDeleteConfirming}
          onChangeGoal={onChangeGoal}
          onRestartConsultation={onRestartConsultation}
          onRequestGoalDelete={onRequestGoalDelete}
          onCancelGoalDelete={onCancelGoalDelete}
          onDeleteGoal={onDeleteGoal}
          desktop
        />
      </main>
    );
  }

  return (
    <main className="flex min-h-0 flex-1">
      <section className="flex min-w-0 flex-1 flex-col justify-between px-10 py-6">
        <div className="flex min-h-0 flex-1 flex-col gap-5">
          <ExerciseSelector
            exercise={exercise}
            options={EXERCISES}
            isOpen={showExercisePicker}
            onToggle={onExerciseToggle}
            onChange={onExerciseChange}
            desktop
          />
          <TrainerChatArea
            messages={messages}
            isSending={isSending}
            chatAreaRef={chatAreaRef}
            desktop
          />
        </div>
        <TrainerChatInput
          input={input}
          isSending={isSending}
          onChange={onInputChange}
          onSubmit={onSubmit}
          desktop
        />
      </section>
      <GoalPanel
        exercise={exercise}
        messages={messages}
        input={input}
        isSending={isSending}
        showExercisePicker={showExercisePicker}
        chatAreaRef={chatAreaRef}
        goal={goal}
        proposals={proposals}
        selectedProposalId={selectedProposalId}
        isGeneratingGoals={isGeneratingGoals}
        isSavingGoal={isSavingGoal}
        isDeletingGoal={isDeletingGoal}
        isGoalDeleteConfirming={isGoalDeleteConfirming}
        isChangingGoal={isChangingGoal}
        isReconsulting={isReconsulting}
        isGoalComposerOpen={isGoalComposerOpen}
        canGenerateGoals={canGenerateGoals}
        onExerciseToggle={onExerciseToggle}
        onExerciseChange={onExerciseChange}
        onInputChange={onInputChange}
        onSubmit={onSubmit}
        onGenerateGoals={onGenerateGoals}
        onSelectGoal={onSelectGoal}
        onSaveGoal={onSaveGoal}
        onChangeGoal={onChangeGoal}
        onRestartConsultation={onRestartConsultation}
        onRequestGoalDelete={onRequestGoalDelete}
        onCancelGoalDelete={onCancelGoalDelete}
        onDeleteGoal={onDeleteGoal}
        onCloseGoalComposer={onCloseGoalComposer}
      />
    </main>
  );
};

export const ConsultScreen = ({
  goal = null,
  userName,
}: ConsultScreenProps) => {
  // 会話と目標設定の状態はここで管理し、モバイル・PCには同じ値を渡す。
  const router = useRouter();
  const defaultExercise =
    EXERCISES.find((item) => item === goal?.exercise) ?? "ベンチプレス";
  const [exercise, setExercise] = useState<Exercise>(defaultExercise);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    welcomeMessage(defaultExercise),
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [activeGoal, setActiveGoal] = useState<GoalSummary | null>(goal);
  const [proposals, setProposals] = useState<GoalProposal[]>([]);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(
    null,
  );
  const [isGeneratingGoals, setIsGeneratingGoals] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [isDeletingGoal, setIsDeletingGoal] = useState(false);
  const [isGoalDeleteConfirming, setIsGoalDeleteConfirming] = useState(false);
  const [isChangingGoal, setIsChangingGoal] = useState(false);
  const [isReconsulting, setIsReconsulting] = useState(false);
  const [isGoalComposerOpen, setIsGoalComposerOpen] = useState(false);
  const [completedTurns, setCompletedTurns] = useState(0);
  const { toastMessage, showToast } = useToast();
  const mobileChatAreaRef = useRef<HTMLDivElement>(null);
  const desktopChatAreaRef = useRef<HTMLDivElement>(null);

  // APIには画面表示用のidや日時が不要なので、roleとcontentだけへ変換する。
  const apiMessages = useMemo(
    () => messages.map(({ role, content }) => ({ role, content })),
    [messages],
  );

  // 新しいメッセージが追加されたら、両レイアウトのチャット末尾へ移動する。
  useEffect(() => {
    const scrollChatToBottom = (element: HTMLDivElement | null) => {
      element?.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
    };

    scrollChatToBottom(mobileChatAreaRef.current);
    scrollChatToBottom(desktopChatAreaRef.current);
  }, [messages, isSending]);

  // ユーザーの入力を先に画面へ追加し、APIの返答を後から会話へ追加する。
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

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise,
          messages: [...apiMessages, { role: "user", content: trimmed }],
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
      setCompletedTurns((turns) => turns + 1);
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
    setProposals([]);
    setSelectedProposalId(null);
    setIsChangingGoal(false);
    setIsReconsulting(Boolean(activeGoal));
    setIsGoalDeleteConfirming(false);
    setIsGoalComposerOpen(false);
    setCompletedTurns(0);
  };

  // 1往復以上の会話をGeminiへ渡し、今日の目標候補を生成する。
  const generateGoals = async () => {
    if (completedTurns < 1 || isGeneratingGoals) return;

    setIsGoalComposerOpen(true);
    setIsGeneratingGoals(true);
    setProposals([]);
    setSelectedProposalId(null);
    setIsChangingGoal(false);

    try {
      // 最低1秒表示することで、生成中の表示が一瞬で消えるのを防ぐ。
      const [response] = await Promise.all([
        fetch("/api/goals/proposals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exercise, messages: apiMessages }),
        }),
        wait(1000),
      ]);
      const data = (await response.json()) as {
        proposals?: GoalProposal[];
        error?: string;
      };

      if (!response.ok || !data.proposals) {
        throw new Error(data.error ?? "目標候補を作成できませんでした");
      }

      setProposals(data.proposals);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "目標候補を作成できませんでした",
      );
    } finally {
      setIsGeneratingGoals(false);
    }
  };

  // 保存済みの候補を取得し、現在選択中の候補を初期選択にする。
  const changeGoal = async () => {
    if (!activeGoal || isGeneratingGoals) return;

    setIsGoalComposerOpen(true);
    setIsGeneratingGoals(true);
    setIsChangingGoal(true);
    setIsReconsulting(false);

    try {
      const response = await fetch(`/api/goals/${activeGoal.id}`);
      const data = (await response.json()) as {
        proposals?: Array<GoalProposal & { isSelected: boolean }>;
        error?: string;
      };

      if (!response.ok || !data.proposals) {
        throw new Error(
          data.error ?? "保存済みの目標候補を取得できませんでした",
        );
      }

      setProposals(data.proposals);
      setSelectedProposalId(
        data.proposals.find(({ isSelected }) => isSelected)?.id ?? null,
      );
    } catch (error) {
      setIsChangingGoal(false);
      showToast(
        error instanceof Error
          ? error.message
          : "保存済みの目標候補を取得できませんでした",
      );
    } finally {
      setIsGeneratingGoals(false);
    }
  };

  // 設定済みの目標は残したまま、会話と候補だけを初期状態へ戻す。
  const restartConsultation = () => {
    setMessages([welcomeMessage(exercise)]);
    setInput("");
    setProposals([]);
    setSelectedProposalId(null);
    setIsChangingGoal(false);
    setIsReconsulting(true);
    setIsGoalComposerOpen(false);
    setCompletedTurns(0);
    showToast("新しい相談を開始しました");
  };

  // 新規設定はPOST、候補の選び直しはPATCHへ振り分ける。
  const saveGoal = async () => {
    const selectedGoal = proposals.find(({ id }) => id === selectedProposalId);
    if (!selectedGoal || isSavingGoal) return;

    setIsSavingGoal(true);

    try {
      const response = await fetch(
        isChangingGoal && activeGoal
          ? `/api/goals/${activeGoal.id}`
          : "/api/goals",
        {
          method: isChangingGoal ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isChangingGoal
              ? { proposalId: selectedGoal.id }
              : {
                  exercise,
                  proposals,
                  selectedProposalId: selectedGoal.id,
                  messages: apiMessages,
                },
          ),
        },
      );
      const data = (await response.json()) as {
        goal?: {
          id: string;
          description: string;
          statusLabel: string;
        };
        error?: string;
      };

      if (!response.ok || !data.goal) {
        throw new Error(data.error ?? "目標を保存できませんでした");
      }

      const successMessage = isChangingGoal
        ? "目標を変更しました"
        : "目標を設定しました";

      setActiveGoal({
        id: data.goal.id,
        exercise,
        statusLabel: data.goal.statusLabel,
        description: data.goal.description,
      });
      setProposals([]);
      setSelectedProposalId(null);
      setIsChangingGoal(false);
      setIsReconsulting(false);
      setIsGoalComposerOpen(false);
      setIsGoalDeleteConfirming(false);
      showToast(successMessage);
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "目標を保存できませんでした",
      );
    } finally {
      setIsSavingGoal(false);
    }
  };

  // 設定済み目標を論理削除し、相談画面を未設定状態へ戻す。
  const deleteGoal = async () => {
    if (!activeGoal || isDeletingGoal) return;

    setIsDeletingGoal(true);
    try {
      const response = await fetch(`/api/goals/${activeGoal.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "目標を削除できませんでした");
      }

      setActiveGoal(null);
      setProposals([]);
      setSelectedProposalId(null);
      setIsChangingGoal(false);
      setIsReconsulting(false);
      setIsGoalComposerOpen(false);
      setIsGoalDeleteConfirming(false);
      showToast("目標を削除しました");
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "目標を削除できませんでした",
      );
    } finally {
      setIsDeletingGoal(false);
    }
  };

  const canGenerateGoals = completedTurns >= 1 && !isSending;

  // スクロール対象のrefだけはSP・PCで分け、それ以外の状態と操作を共通化する。
  const viewProps: Omit<ConsultViewProps, "chatAreaRef"> = {
    exercise,
    messages,
    input,
    isSending,
    showExercisePicker,
    goal: activeGoal,
    proposals,
    selectedProposalId,
    isGeneratingGoals,
    isSavingGoal,
    isDeletingGoal,
    isGoalDeleteConfirming,
    isChangingGoal,
    isReconsulting,
    isGoalComposerOpen,
    canGenerateGoals,
    onExerciseToggle: () => setShowExercisePicker((open) => !open),
    onExerciseChange: handleExerciseChange,
    onInputChange: setInput,
    onSubmit: sendMessage,
    onGenerateGoals: generateGoals,
    onSelectGoal: setSelectedProposalId,
    onSaveGoal: saveGoal,
    onChangeGoal: changeGoal,
    onRestartConsultation: restartConsultation,
    onRequestGoalDelete: () => setIsGoalDeleteConfirming(true),
    onCancelGoalDelete: () => setIsGoalDeleteConfirming(false),
    onDeleteGoal: deleteGoal,
    onCloseGoalComposer: () => setIsGoalComposerOpen(false),
  };

  return (
    <>
      <ResponsiveScreen
        userName={userName}
        mobile={
          <MobileConsultView {...viewProps} chatAreaRef={mobileChatAreaRef} />
        }
        desktop={
          <DesktopConsultView {...viewProps} chatAreaRef={desktopChatAreaRef} />
        }
      />
      <Toast message={toastMessage} />
    </>
  );
};
