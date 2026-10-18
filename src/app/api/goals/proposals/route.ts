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

const extractText = (data: GeminiJsonResponse) =>
  data.candidates
    ?.flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim() ?? "";

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

export const POST = async (request: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const result = goalProposalRequestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "目標を提案するには、AIと1往復以上会話してください" },
      { status: 400 },
    );
  }

  if (process.env.USE_MOCK_AI !== "false") {
    return NextResponse.json({
      proposals: createMockProposals(result.data.exercise),
      provider: "mock" as const,
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini APIが設定されていません" }, { status: 500 });
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";
  const conversation = result.data.messages
    .map((message) => `${message.role === "user" ? "ユーザー" : "AI"}: ${message.content}`)
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
            parts: [{
              text: "あなたはフィットネスアプリRepMateのAIトレーナーです。会話内容に基づき、安全で具体的な今日のトレーニング目標を3件提案してください。titleは短く、descriptionには重量・回数・セット数など実行内容を簡潔に含めてください。必ず指定のJSON形式だけを返してください。",
            }],
          },
          contents: [{
            role: "user",
            parts: [{
              text: `種目: ${result.data.exercise}\n会話:\n${conversation}`,
            }],
          }],
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
    const parsed = goalProposalListSchema.safeParse(JSON.parse(extractText(data)));

    if (!parsed.success) {
      throw new Error("Gemini returned an invalid goal proposal");
    }

    return NextResponse.json({
      proposals: parsed.data.proposals.map((proposal) => ({
        id: crypto.randomUUID(),
        ...proposal,
      })),
    });
  } catch (error) {
    console.error("[goal-proposals]", error);
    return NextResponse.json(
      { error: "目標候補を作成できませんでした" },
      { status: 502 },
    );
  }
};
