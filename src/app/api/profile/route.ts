import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/app/(app)/mypage/_schemas/profile";
import { prisma } from "@/lib/prisma";

// PATCH /api/profile: 名前・性別を保存し、指定された場合はパスワードも更新する。
export const PATCH = async (request: Request) => {
  const supabase = await createClient();

  // ログイン中のユーザーを取得し、未認証の更新を防ぐ。
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  // フォームから送られてきたJSONをunknownとして受け取る。
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストの形式が正しくありません" },
      { status: 400 },
    );
  }

  // 画面側の検証だけに頼らず、API側でもZodで再検証する。
  const result = profileSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "入力内容に誤りがあります" },
      { status: 400 },
    );
  }

  // 検証済みの値だけを取り出す。passwordは未入力なら更新しない。
  const { name, gender, password } = result.data;

  if (password) {
    // パスワードはプロフィールDBではなくSupabase Auth側で管理する。
    const { error: passwordError } = await supabase.auth.updateUser({
      password,
    });

    if (passwordError) {
      console.error("パスワード変更エラー:", passwordError.message);

      return NextResponse.json(
        {
          error:
            "パスワードの変更に失敗しました。再認証が必要な場合があります。",
        },
        { status: 400 },
      );
    }
  }

  try {
    // upsertはプロフィールがあれば更新し、なければ新規作成する。
    const profile = await prisma.profile.upsert({
      where: {
        id: user.id,
      },
      update: {
        name,
        gender,
      },
      create: {
        id: user.id,
        name,
        gender,
      },
    });

    // パスワード自体は返さず、更新したかどうかだけをBooleanで返す。
    return NextResponse.json({
      message: "プロフィールを保存しました",
      profile: {
        name: profile.name,
        gender: profile.gender,
      },
      passwordUpdated: Boolean(password),
    });
  } catch (error) {
    console.error("プロフィール更新エラー:", error);

    return NextResponse.json(
      { error: "プロフィールの保存に失敗しました" },
      { status: 500 },
    );
  }
};
