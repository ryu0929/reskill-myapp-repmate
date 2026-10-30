import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ChatApiMessage } from "@/lib/chat-types";
import type { ChatRequestBody, GeminiResponseBody } from "./_types/chat";

const SYSTEM_PROMPT = `あなたはフィットネスアプリ「RepMate」のAIトレーナーです。
ユーザーとの相談では、安全で実行可能なトレーニング提案を日本語で簡潔に返してください。
医学的診断はせず、痛みや異常がある場合は専門家への相談を促してください。`;

const REPORT_SYSTEM_PROMPT = `あなたはフィットネスアプリ「RepMate」の記録アシスタントです。
ユーザーが報告した重量・回数・セット数を簡潔に確認し、記録内容の確認を促してください。
医学的診断はせず、痛みや異常がある場合は専門家への相談を促してください。`;

// 開発中やデモ時に、外部APIを呼ばず固定の返答を作る。
const createMockReply = (exercise: string, mode: "consult" | "report") =>
  mode === "report"
    ? `${exercise}の内容を確認しました。表示された記録内容を確認して「記録する」を押してください。`
    : `${exercise}ですね。現在の体調を優先しながら、無理のない重量でフォームを確認しましょう。` +
      "今日は回数とセット数を具体的に決めると、取り組みやすい目標になります。";

const shouldUseMockAi = process.env.USE_MOCK_AI === "true";

// 外部から届くJSONはunknownとして受け取り、必要な形か実行時に検証する。
const isChatRequestBody = (value: unknown): value is ChatRequestBody => {
  if (!value || typeof value !== "object") return false;

  const body = value as Record<string, unknown>;
  if (body.exercise !== undefined && typeof body.exercise !== "string") {
    return false;
  }
  if (
    body.mode !== undefined &&
    body.mode !== "consult" &&
    body.mode !== "report"
  ) {
    return false;
  }

  return (
    Array.isArray(body.messages) &&
    body.messages.every(
      (message) =>
        !!message &&
        typeof message === "object" &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string",
    )
  );
};

// Geminiの候補内に分かれているtextを、一つの返答文字列へ結合する。
const getOutputText = (data: GeminiResponseBody): string =>
  data.candidates
    ?.flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim() ?? "";

// 画面の会話形式をGemini APIのrole・parts形式へ変換して送信する。
const replyWithGemini = async (
  exercise: string,
  messages: ChatApiMessage[],
  mode: "consult" | "report",
): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";
  // fetchでGeminiのREST APIを呼び、画面から受け取った会話履歴をまとめて渡す。
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: `${mode === "report" ? REPORT_SYSTEM_PROMPT : SYSTEM_PROMPT}\n現在の種目: ${exercise}`,
            },
          ],
        },
        contents: messages.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as GeminiResponseBody;
  const content = getOutputText(data);
  if (!content) {
    throw new Error("Empty response from Gemini");
  }

  return content;
};

// POST /api/chat: 会話履歴を検証し、モックまたはGeminiの返答を返す。
export const POST = async (request: Request) => {
  // APIを直接呼ばれても、ログイン済みユーザー以外は処理しない。
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isChatRequestBody(body)) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const exercise = body.exercise?.trim() || "ベンチプレス";
  const mode = body.mode ?? "consult";
  // 空文字のメッセージはAIへ送らず、有効な会話だけを残す。
  const messages = body.messages?.filter((m) => m.content.trim()) ?? [];

  if (messages.length === 0) {
    return NextResponse.json(
      { error: "messages is required" },
      { status: 400 },
    );
  }

  if (!messages.some((message) => message.role === "user")) {
    return NextResponse.json(
      { error: "At least one user message is required" },
      { status: 400 },
    );
  }

  try {
    // モックは明示的にtrueの場合だけ使い、本番の設定漏れを見つけやすくする。
    if (shouldUseMockAi) {
      return NextResponse.json({
        reply: createMockReply(exercise, mode),
        provider: "mock" as const,
      });
    }

    const reply = await replyWithGemini(exercise, messages, mode);
    return NextResponse.json({ reply, provider: "gemini" as const });
  } catch (error) {
    console.error("[chat]", error);
    return NextResponse.json(
      { error: "AIからの応答を取得できませんでした" },
      { status: 502 },
    );
  }
};
