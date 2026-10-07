"use client";

import Image from "next/image";
import { FormEvent, RefObject, useEffect, useMemo, useRef, useState } from "react";
import { AppTabBar } from "@/components/AppTabBar";
import { ResponsiveScreen } from "@/components/ResponsiveScreen";
import type { ChatMessage } from "@/lib/chat-types";

const assets = {
  avatar: "/assets/consult/avatar.png",
  aiAvatar: "/assets/consult/ai-avatar.png",
  aiAvatarAlt: "/assets/consult/ai-avatar-alt.png",
  logo: "/assets/repmate-logo.svg",
  chevronDown: "/assets/consult/chevron-down.svg",
  send: "/assets/consult/send.svg",
  plusCircle: "/assets/consult/plus-circle.svg",
} as const;

const EXERCISES = ["ベンチプレス", "スクワット", "デッドリフト", "ショルダープレス"] as const;

type Exercise = (typeof EXERCISES)[number];

type GoalSummary = {
  name: string;
  statusLabel: string;
  description: string;
};

type ConsultScreenProps = {
  goal?: GoalSummary | null;
  userName?: string;
};

type ConsultViewProps = {
  exercise: Exercise;
  messages: ChatMessage[];
  input: string;
  isSending: boolean;
  showExercisePicker: boolean;
  chatEndRef: RefObject<HTMLDivElement | null>;
  goal?: GoalSummary | null;
  onExerciseToggle: () => void;
  onExerciseChange: (exercise: Exercise) => void;
  onInputChange: (value: string) => void;
  onSubmit: (event?: FormEvent) => void;
};

const createId = () => crypto.randomUUID();

const formatTime = (iso: string) =>
  new Intl.DateTimeFormat("ja-JP", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));

const welcomeMessage = (exercise: string): ChatMessage => ({
  id: createId(),
  role: "assistant",
  content: `こんにちは！今日は${exercise}について相談ですね。現在の記録と目標を教えてください。`,
  createdAt: new Date().toISOString(),
});

const HeaderLogo = () => (
  <div className="flex items-center gap-2">
    <div className="relative h-9 w-[84px] shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="RepMate" className="block size-full max-w-none" src={assets.logo} />
    </div>
    <span className="rounded bg-[#1856ed] px-1.5 py-0.5 font-[family-name:var(--font-urbanist)] text-[10px] font-extrabold text-[#0b0d12]">
      AI
    </span>
  </div>
);

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
  <div className="relative shrink-0">
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-center justify-between rounded-lg border text-left ${
        desktop
          ? "border-[#273142] bg-[#141822] p-4"
          : "border-[#242c3b] bg-[#141822] p-3"
      }`}
    >
      <span className="text-sm font-bold text-[#f9fafb]">{exercise}</span>
      <span className="flex items-center gap-1 text-xs text-[#9ca3af] min-[769px]:text-[13px]">
        種目を変更
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" className="size-[11px] min-[769px]:h-[5px] min-[769px]:w-2" src={assets.chevronDown} />
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
  index,
  desktop = false,
}: {
  message: ChatMessage;
  index: number;
  desktop?: boolean;
}) => {
  if (message.role === "user") {
    return (
      <div className="flex w-full justify-end">
        <div
          className={`rounded-bl-[10px] rounded-br-[10px] rounded-tl-[10px] bg-[#222b3f] ${
            desktop ? "w-full max-w-[420px] p-3.5" : "w-[230px] p-3"
          }`}
        >
          <p className="whitespace-pre-wrap text-[13px] leading-[1.5] text-[#f9fafb]">
            {message.content}
          </p>
          <p className="mt-1 text-right font-[family-name:var(--font-urbanist)] text-[10px] text-[#9ca3af]">
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    );
  }

  const avatar = index % 2 === 0 ? assets.aiAvatar : assets.aiAvatarAlt;

  return (
    <div className="flex w-full gap-2.5 min-[769px]:gap-3">
      <div className="relative size-9 shrink-0 overflow-hidden rounded-[18px]">
        <Image src={avatar} alt="" fill className="object-cover" sizes="36px" />
      </div>
      <div
        className={`rounded-bl-[10px] rounded-br-[10px] rounded-tr-[10px] border bg-gradient-to-r from-[#16223b] to-[#0f1420] ${
          desktop
            ? "w-full max-w-[420px] border-[#273142] p-3.5"
            : "w-[245px] border-[#242c3b] p-3"
        }`}
      >
        <p className="whitespace-pre-wrap text-[13px] leading-[1.5] text-[#f9fafb]">
          {message.content}
        </p>
        <p className="mt-1 text-right font-[family-name:var(--font-urbanist)] text-[10px] text-[#9ca3af]">
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
  <div
    className={`flex min-h-0 flex-1 flex-col overflow-y-auto ${
      desktop ? "gap-4 py-1" : "gap-4 py-1"
    }`}
  >
    {messages.map((message, index) => (
      <ChatBubble key={message.id} message={message} index={index} desktop={desktop} />
    ))}
    {isSending && (
      <div className="flex gap-2.5 min-[769px]:gap-3">
        <div className="relative size-9 shrink-0 overflow-hidden rounded-[18px]">
          <Image src={assets.aiAvatarAlt} alt="" fill className="object-cover" sizes="36px" />
        </div>
        <div className="rounded-bl-[10px] rounded-br-[10px] rounded-tr-[10px] border border-[#273142] bg-gradient-to-r from-[#16223b] to-[#0f1420] px-3 py-2.5">
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

const GoalPanel = ({ goal = null }: { goal?: GoalSummary | null }) => (
  <aside className="flex h-full w-[380px] shrink-0 flex-col gap-5 border-l border-[#273142] bg-[#111620] p-6">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-bold text-[#f8fafc]">今日の目標</h2>
      <span
        className={`rounded-md px-2 py-1 text-[11px] font-bold ${
          goal ? "bg-[rgba(16,185,129,0.13)] text-[#10b981]" : "bg-[rgba(152,162,179,0.13)] text-[#98a2b3]"
        }`}
      >
        {goal?.statusLabel ?? "未設定"}
      </span>
    </div>

    {goal ? (
      <div className="flex flex-col gap-2.5 rounded-lg border border-[#273142] bg-[#141822] p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#1856ed]" aria-hidden />
          <p className="text-sm font-bold text-[#f8fafc]">{goal.name}</p>
        </div>
        <p className="text-[13px] leading-[1.4] text-[#98a2b3]">{goal.description}</p>
      </div>
    ) : (
      <div className="rounded-lg border border-[#273142] bg-[#141822] p-4">
        <p className="text-[13px] leading-[1.5] text-[#98a2b3]">
          目標はまだ設定されていません。ワークアウトの計画を作成しましょう。
        </p>
      </div>
    )}

    <button
      type="button"
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2463eb] p-3.5 text-sm font-bold text-[#f8fafc] transition-opacity hover:opacity-95"
    >
      {!goal && (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="size-4" src={assets.plusCircle} />
      )}
      <span>{goal ? "目標を設定する" : "今日の目標を決める"}</span>
    </button>
  </aside>
);

const MobileConsultView = ({
  exercise,
  messages,
  input,
  isSending,
  showExercisePicker,
  chatEndRef,
  onExerciseToggle,
  onExerciseChange,
  onInputChange,
  onSubmit,
}: ConsultViewProps) => (
  <div
    className="mx-auto flex min-h-[812px] w-full max-w-[375px] flex-col overflow-hidden rounded-2xl border border-[#242c3b] bg-[#0b0d12] shadow-2xl"
    data-name="/consult"
  >
    <header className="flex shrink-0 items-center justify-between px-5 py-4">
      <HeaderLogo />
      <div className="relative size-8 overflow-hidden rounded-2xl">
        <Image src={assets.avatar} alt="" fill className="object-cover" sizes="32px" />
      </div>
    </header>

    <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-3 pt-1">
      <ExerciseSelector
        exercise={exercise}
        isOpen={showExercisePicker}
        onToggle={onExerciseToggle}
        onChange={onExerciseChange}
      />
      <ChatArea messages={messages} isSending={isSending} chatEndRef={chatEndRef} />
      <ChatInput input={input} isSending={isSending} onChange={onInputChange} onSubmit={onSubmit} />
      <button
        type="button"
        className="flex shrink-0 items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#2a52a0] to-[#1e418c] p-3.5 shadow-[0px_4px_6px_rgba(24,86,237,0.2)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" className="size-3.5" src={assets.plusCircle} />
        <span className="text-[15px] font-bold text-white">今日の目標を決める</span>
      </button>
    </div>

    <AppTabBar active="consult" variant="consult" />
  </div>
);

const DesktopConsultView = ({
  exercise,
  messages,
  input,
  isSending,
  showExercisePicker,
  chatEndRef,
  goal,
  onExerciseToggle,
  onExerciseChange,
  onInputChange,
  onSubmit,
}: ConsultViewProps) => (
  <main className="flex min-h-0 flex-1">
      <section className="flex min-w-0 flex-1 flex-col justify-between px-10 py-6">
        <div className="flex min-h-0 flex-1 flex-col gap-5">
          <ExerciseSelector
            exercise={exercise}
            isOpen={showExercisePicker}
            onToggle={onExerciseToggle}
            onChange={onExerciseChange}
            desktop
          />
          <ChatArea messages={messages} isSending={isSending} chatEndRef={chatEndRef} desktop />
        </div>
        <ChatInput input={input} isSending={isSending} onChange={onInputChange} onSubmit={onSubmit} desktop />
      </section>
      <GoalPanel goal={goal} />
    </main>
);

export const ConsultScreen = ({ goal = null, userName }: ConsultScreenProps) => {
  const [exercise, setExercise] = useState<Exercise>("ベンチプレス");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [welcomeMessage("ベンチプレス")]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const mobileChatEndRef = useRef<HTMLDivElement>(null);
  const desktopChatEndRef = useRef<HTMLDivElement>(null);

  const apiMessages = useMemo(
    () => messages.map(({ role, content }) => ({ role, content })),
    [messages],
  );

  useEffect(() => {
    mobileChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    desktopChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

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
  };

  const viewProps = {
    exercise,
    messages,
    input,
    isSending,
    showExercisePicker,
    goal,
    onExerciseToggle: () => setShowExercisePicker((open) => !open),
    onExerciseChange: handleExerciseChange,
    onInputChange: setInput,
    onSubmit: sendMessage,
  };

  return (
    <ResponsiveScreen
    userName={userName}
      mobile={<MobileConsultView {...viewProps} chatEndRef={mobileChatEndRef} />}
      desktop={<DesktopConsultView {...viewProps} chatEndRef={desktopChatEndRef} />}
    />
  );
};
