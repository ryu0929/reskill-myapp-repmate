import type { ChatApiMessage } from "@/lib/chat-types";

// チャット画面からPOST /api/chatへ送られるJSONの形。
export type ChatRequestBody = {
  exercise?: string;
  mode?: "consult" | "report";
  messages?: ChatApiMessage[];
};

// Gemini APIは候補ごとに文章のpartsを返すため、利用する範囲だけを型にする。
export type GeminiResponseBody = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};
