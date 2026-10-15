import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MypageScreen from "./_components/MypageScreen";
import { genderOptions } from "./_types/mypage";
import type { Gender, UserProfile } from "./_types/mypage";

const Mypage = async () => {
    const supabase = await createClient();

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/login");
    }

    const metadata = user.user_metadata;

    const gender: Gender = 
        genderOptions.find(
            (option) => option === metadata?. genader
        ) ?? "無回答";
    
    const profile: UserProfile = {
        name: metadata?.name ?? "未設定",
        gender,
        email: user.email ?? "",
        trainingHistory: "トレーニング歴 未設定",
        streakLabel: "継続 0週間",
        initials: "RM",
    };

    return <MypageScreen user={profile} />;
};

export default Mypage;
