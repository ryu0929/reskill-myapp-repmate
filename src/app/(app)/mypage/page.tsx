import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import MypageScreen from "./_components/MypageScreen";
import { genderOptions } from "./_types/mypage";
import type { Gender, UserProfile } from "./_types/mypage";

const Mypage = async () => {
    const supabase = await createClient();

    //ログイン中のユーザーを取得
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/login");
    }

    //  Prismaでプロフィールを取得
    const dbProfile = await prisma.profile.findUnique({
        where: {
            id: user.id,
        }
    });

    //  DBから取得した性別をGender型として検証
    const gender: Gender = 
        genderOptions.find(
            (option) => option === dbProfile?. gender
        ) ?? "無回答";
    
    //  画面表示用のデータを作成
    const profile: UserProfile = {
        name: dbProfile?.name ?? "未設定",
        gender,
        email: user.email ?? "",
        trainingHistory: "トレーニング歴 未設定",
        streakLabel: "継続 0週間",
        initials: "RM",
    };

    return <MypageScreen user={profile} />;
};

export default Mypage;
