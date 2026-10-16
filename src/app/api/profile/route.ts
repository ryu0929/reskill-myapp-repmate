import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/app/(app)/mypage/_schemas/profile";
import { prisma } from "@/lib/prisma";
import next from "next";

export const PATCH = async (request: Request) => {
    const supabase = await createClient();

    //ログイン中のユーザーを取得
    const {
        data: { user },
        error: authEroor
    } = await supabase.auth.getUser();

    if (authEroor || !user) {
        return NextResponse.json(
            { error: "ログインが必要です" },
            { status: 401 },
        );
    }

    //フォームから送られてきたJSONを取得
    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "リクエストの形式が正しくありません" },
            { status: 400 }
        );
    }

    //zodで再バリデーション
    const result = profileSchema.safeParse(body);

    if(!result.success) {
        return NextResponse.json(
            { error: "入力内容に誤りがあります" },
            { status: 400 }
        );
    }

    //検証済みのデータを取り出す
    const { name, gender, password} = result.data;

    if(password) {
        const { error: passwordError } = await supabase.auth.updateUser({
            password,
        });

        if(passwordError) {
            console.error("パスワード変更エラー:", passwordError.message);

            return NextResponse.json(
                { error: "パスワードの変更に失敗しました。再認証が必要な場合があります。" },
                { status: 400 }
            );
        }
    }

    try {
        //prismaでプロフィールを更新、作成
        const profile = await prisma.profile.upsert({
            where: {
                id: user.id
            },
            update: {
                name,
                gender,
            },
            create: {
                id: user.id,
                name,
                gender,
            }
        });

        //更新結果を返す
        return NextResponse.json({
            message: "プロフィールを保存しました",
            profile: {
                name: profile.name,
                gender: profile.gender,
            },
            passwordUpdated: Boolean(password),
        });
    } catch(error) {
        console.error("プロフィール更新エラー:", error);

        return NextResponse.json(
            { error: "プロフィールの保存に失敗しました" },
            { status: 500 }
        );
    }

}
