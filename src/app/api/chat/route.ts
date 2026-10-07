import { NextResponse } from "next/server";
import type { ChatApiMessage } from "@/lib/chat-types";

const SYSTEM_PROMPT = `あなたはフィットネスアプリ「RepMate」のAIトレーナーです。
ユーザーとの相談では、安全で実行可能なトレーニング提案を日本語で簡潔に返してください。
医学的診断はせず、痛みや異常がある場合は専門家への相談を促してください。`;

type ChatRequestBody = {
  exercise?: string;
  messages?: ChatApiMessage[];
};

const fallbackReply = (exercise: string, latestUserMessage: string): string => {
  const snippet =
    latestUserMessage.length > 40
      ? `${latestUserMessage.slice(0, 40)}…`
      : latestUserMessage;

  return `${exercise}について「${snippet}」ですね。週2〜3回のペースで、重量・レップ数・セット数を段階的に上げるプランがおすすめです。今の最大重量と目標を教えてください。`;
};

const replyWithOpenAI = async (
  exercise: string,
  messages: ChatApiMessage[],
): Promise<string> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `${SYSTEM_PROMPT}\n現在の種目: ${exercise}`,
        },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  return content;
};

export const POST = async (request: Request) => {
  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const exercise = body.exercise?.trim() || "ベンチプレス";
  const messages = body.messages?.filter((m) => m.content.trim()) ?? [];

  if (messages.length === 0) {
    return NextResponse.json({ error: "messages is required" }, { status: 400 });
  }

  const latestUser = [...messages].reverse().find((m) => m.role === "user");
  if (!latestUser) {
    return NextResponse.json(
      { error: "At least one user message is required" },
      { status: 400 },
    );
  }

  try {
    const reply = await replyWithOpenAI(exercise, messages);
    return NextResponse.json({ reply, provider: "openai" as const });
  } catch (error) {
    console.error("[chat]", error);
    return NextResponse.json({
      reply: fallbackReply(exercise, latestUser.content),
      provider: "fallback" as const,
    });
  }
};
