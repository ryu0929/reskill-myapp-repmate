import type { ChatApiMessage } from "@/lib/chat-types";

export type ChatRequestBody = {
  exercise?: string;
  messages?: ChatApiMessage[];
};
