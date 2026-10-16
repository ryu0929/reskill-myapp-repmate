import type { ChatApiMessage } from "@/lib/chat-types";

export type ChatRequestBody = {
  exercise?: string;
  messages?: ChatApiMessage[];
};

export type GeminiResponseBody = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};
