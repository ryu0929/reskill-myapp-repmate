"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/chat-types";
import type {
  Exercise,
  TrainingRecordDraft,
  UseReportChatParams,
} from "../_types/report";

const createId = () => crypto.randomUUID();

const parseTrainingRecord = (message: string): TrainingRecordDraft | null => {
  // 「60kg 10回 3セット」のような文章から、確認カード用の数値を取り出す。
  const weight = message.match(/(\d+(?:\.\d+)?)\s*kg/i)?.[1];
  const reps = message.match(/(\d+)\s*(?:回|レップ(?:ス)?)/)?.[1];
  const sets = message.match(/(\d+)\s*セット(?!目)/)?.[1] ?? "1";

  return weight && reps ? { weight, reps, sets } : null;
};

const welcomeMessage = (exercise: string): ChatMessage => ({
  id: createId(),
  role: "assistant",
  content: `${exercise}のトレーニングを記録しましょう！セットごとに重量とレップス数を教えてください。`,
  createdAt: new Date().toISOString(),
});

const useReportChat = ({ exercise, onRecordParsed }: UseReportChatParams) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    welcomeMessage(exercise),
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const mobileChatAreaRef = useRef<HTMLDivElement>(null);
  const desktopChatAreaRef = useRef<HTMLDivElement>(null);

  const apiMessages = useMemo(
    () => messages.map(({ role, content }) => ({ role, content })),
    [messages],
  );

  useEffect(() => {
    const scrollChatToBottom = (element: HTMLDivElement | null) => {
      element?.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
    };

    scrollChatToBottom(mobileChatAreaRef.current);
    scrollChatToBottom(desktopChatAreaRef.current);
  }, [messages, isSending]);

  // AIへの報告と、正規表現による記録候補の作成を同時に行う。
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
      onRecordParsed(parsedRecord);
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise,
          mode: "report",
          messages: [
            ...apiMessages,
            { role: "user" as const, content: trimmed },
          ],
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

  const resetChat = (nextExercise: Exercise) => {
    setMessages([welcomeMessage(nextExercise)]);
    setInput("");
  };

  return {
    messages,
    input,
    isSending,
    mobileChatAreaRef,
    desktopChatAreaRef,
    setInput,
    sendMessage,
    resetChat,
  };
};

export default useReportChat;
