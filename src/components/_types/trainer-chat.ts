import type { FormEvent, RefObject } from "react";
import type { ChatMessage } from "@/lib/chat-types";

export type TrainerChatAreaProps = {
  messages: ChatMessage[];
  isSending: boolean;
  chatAreaRef: RefObject<HTMLDivElement | null>;
  desktop?: boolean;
};

export type TrainerChatInputProps = {
  input: string;
  isSending: boolean;
  onChange: (value: string) => void;
  onSubmit: (event?: FormEvent) => void;
  desktop?: boolean;
};
