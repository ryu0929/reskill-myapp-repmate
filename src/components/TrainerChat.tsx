import Image from "next/image";
import type { ChatMessage } from "@/lib/chat-types";
import type {
  TrainerChatAreaProps,
  TrainerChatInputProps,
} from "@/components/_types/trainer-chat";

const assets = {
  trainerAvatar: "/assets/trainer-avatar.png",
  send: "/assets/consult/send.svg",
} as const;

const formatTime = (iso: string) =>
  new Intl.DateTimeFormat("ja-JP", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));

const TrainerChatBubble = ({
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
            desktop
              ? "w-full max-w-[420px] p-3.5"
              : "w-[75%] min-w-0 wrap-anywhere p-3"
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
        <Image
          src={assets.trainerAvatar}
          alt=""
          fill
          className="object-cover"
          sizes="36px"
        />
      </div>
      <div
        className={`flex flex-col gap-1 rounded-bl-[10px] rounded-br-[10px] rounded-tr-[10px] border bg-[linear-gradient(90deg,#16223b_0%,#0f1420_100%)] ${
          desktop
            ? "w-full max-w-[420px] border-[#273142] p-3.5"
            : "w-[75%] min-w-0 wrap-anywhere border-[#242c3b] p-3"
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

export const TrainerChatArea = ({
  messages,
  isSending,
  chatAreaRef,
  desktop = false,
}: TrainerChatAreaProps) => (
  // min-h-0で親より縮められるようにし、画面全体ではなく会話領域だけをスクロールする。
  <div
    ref={chatAreaRef}
    className={`flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-1 ${
      desktop ? "" : "min-h-32"
    }`}
  >
    {messages.map((message) => (
      <TrainerChatBubble key={message.id} message={message} desktop={desktop} />
    ))}
    {isSending && (
      <div className="flex w-full items-start gap-2.5 min-[769px]:gap-3">
        <div className="relative size-9 shrink-0 overflow-hidden rounded-[18px]">
          <Image
            src={assets.trainerAvatar}
            alt=""
            fill
            className="object-cover"
            sizes="36px"
          />
        </div>
        <div className="rounded-bl-[10px] rounded-br-[10px] rounded-tr-[10px] border border-[#273142] bg-[linear-gradient(90deg,#16223b_0%,#0f1420_100%)] px-3 py-2.5">
          <p className="text-[13px] text-[#9ca3af]">入力中…</p>
        </div>
      </div>
    )}
  </div>
);

export const TrainerChatInput = ({
  input,
  isSending,
  onChange,
  onSubmit,
  desktop = false,
}: TrainerChatInputProps) => (
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
