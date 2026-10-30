import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  goalProposalListSchema,
  goalProposalRequestSchema,
} from "../_schemas/goal";

type GeminiJsonResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

// Geminiのレスポンスから、JSONとして解析する文字列部分だけを取り出す。
const extractText = (data: GeminiJsonResponse) =>
  data.candidates
    ?.flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim() ?? "";

// USE_MOCK_AI=trueのときに返す、外部APIに依存しない目標候補。
const createMockProposals = (exercise: string) => [
  {
    id: crypto.randomUUID(),
    title: `${exercise}を3セット完遂する`,
    description: "フォームを崩さない重量で10回を3セット行いましょう。",
  },
  {
    id: crypto.randomUUID(),
    title: "前回より少しだけ負荷を上げる",
    description: "前回の重量から2.5kg増やし、無理のない回数で挑戦しましょう。",
  },
  {
    id: crypto.randomUUID(),
    title: "フォームを優先して丁寧に行う",
    description: "軽めの重量で8回を4セット行い、動作を安定させましょう。",
  },
];

const shouldUseMockAi = process.env.USE_MOCK_AI === "true";

// POST /api/goals/proposals: AIとの会話を基に、今日の目標候補を2〜3件作る。
export const POST = async (request: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  // 種目と一定数以上の会話が揃っているか、Geminiを呼ぶ前に検証する。
  const result = goalProposalRequestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "目標を提案するには、AIと1往復以上会話してください" },
      { status: 400 },
    );
  }

  // モックは明示的にtrueの場合だけ使い、本番ではGeminiを呼び出す。
  if (shouldUseMockAi) {
    return NextResponse.json({
      proposals: createMockProposals(result.data.exercise),
      provider: "mock" as const,
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini APIが設定されていません" },
      { status: 500 },
    );
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";
  // 画面のメッセージ配列を、プロンプトへ埋め込める会話文へ変換する。
  const conversation = result.data.messages
    .map(
      (message) =>
        `${message.role === "user" ? "ユーザー" : "AI"}: ${message.content}`,
    )
    .join("\n");

  try {
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
                text: "あなたはフィットネスアプリRepMateのAIトレーナーです。会話内容に基づき、安全で具体的な今日のトレーニング目標を3件提案してください。titleは短く、descriptionには重量・回数・セット数など実行内容を簡潔に含めてください。必ず指定のJSON形式だけを返してください。",
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `種目: ${result.data.exercise}\n会話:\n${conversation}`,
                },
              ],
            },
          ],
          // JSONの構造を指定し、候補を安全にZodで検証できる形に制限する。
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                proposals: {
                  type: "ARRAY",
                  minItems: 2,
                  maxItems: 3,
                  items: {
                    type: "OBJECT",
                    properties: {
                      title: { type: "STRING" },
                      description: { type: "STRING" },
                    },
                    required: ["title", "description"],
                  },
                },
              },
              required: ["proposals"],
            },
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = (await response.json()) as GeminiJsonResponse;
    // GeminiがJSONを返しても信用せず、JSON.parse後にZodでもう一度構造を検証する。
    const parsed = goalProposalListSchema.safeParse(
      JSON.parse(extractText(data)),
    );

    if (!parsed.success) {
      throw new Error("Gemini returned an invalid goal proposal");
    }

    return NextResponse.json({
      proposals: parsed.data.proposals.map((proposal) => ({
        id: crypto.randomUUID(),
        ...proposal,
      })),
      provider: "gemini" as const,
    });
  } catch (error) {
    console.error("[goal-proposals]", error);
    return NextResponse.json(
      { error: "目標候補を作成できませんでした" },
      { status: 502 },
    );
  }
};
