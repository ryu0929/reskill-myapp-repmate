"use client";

import { MobileAppHeader } from "@/components/MobileAppHeader";
import type { MypageScreenProps, ProfileDetail, UserProfile } from "../_types/mypage";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";


const defaultUser: UserProfile = {
  name: "山田 太郎",
  gender: "男性",
  email: "taro.yamada@example.com",
  trainingHistory: "トレーニング歴 8ヶ月",
  streakLabel: "継続 12週間",
  initials: "RM",
};

const ProfileSummary = ({ user }: { user: typeof defaultUser }) => (
  <section className="flex w-full items-center gap-4 rounded-[14px] border border-[#293142] bg-[#141822] p-4 shadow-[0px_10px_28px_rgba(0,0,0,0.2)] min-[769px]:gap-5 min-[769px]:border-[#273142] min-[769px]:p-5 min-[769px]:shadow-none">
    <div className="flex size-[72px] shrink-0 items-center justify-center rounded-full border border-[#f9fafb] bg-[#1856ed] min-[769px]:border-0">
      <span className="text-[30px] font-bold text-[#f9fafb] min-[769px]:text-2xl">
        {user.initials}
      </span>
    </div>
    <div className="min-w-0 flex-1">
      <h1 className="truncate text-2xl font-bold text-[#f9fafb] min-[769px]:text-[22px]">
        {user.name}
      </h1>
      <p className="mt-1.5 text-[13px] text-[#9ca3af]">{user.trainingHistory}</p>
      <span className="mt-1.5 inline-flex rounded-full bg-[#1856ed] px-2 py-1 text-[10px] font-bold text-[#f9fafb] min-[769px]:hidden">
        {user.streakLabel}
      </span>
    </div>
  </section>
);

const ProfileDetailRow = ({ detail }: { detail: ProfileDetail }) => (
  <div className="flex w-full items-center justify-between gap-3 border-b border-[#242c3b] py-3.5 last:border-b min-[769px]:border-[#273142] min-[769px]:py-4">
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-semibold text-[#9ca3af] min-[769px]:text-xs min-[769px]:font-medium">
        {detail.label}
      </p>
      <p className="mt-1 truncate text-[15px] font-semibold text-[#f9fafb] min-[769px]:text-base min-[769px]:font-medium">
        {detail.value}
      </p>
    </div>
    <button
      type="button"
      className="shrink-0 rounded-[10px] bg-[#141822] px-2.5 py-[7px] text-[11px] font-bold text-[#1856ed] transition-opacity hover:opacity-80 min-[769px]:bg-[#111620] min-[769px]:px-3 min-[769px]:py-2 min-[769px]:text-xs"
    >
      {detail.action}
    </button>
  </div>
);

const AccountSettings = ({ details }: { details: ProfileDetail[] }) => (
  <section className="w-full rounded-[14px] border border-[#242c3b] bg-[#141822] px-4 pt-1.5 min-[769px]:border-[#273142] min-[769px]:px-5 min-[769px]:py-2">
    {details.map((detail) => (
      <ProfileDetailRow key={detail.label} detail={detail} />
    ))}
  </section>
);

const LogoutButton = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("ログアウトに失敗しました", error.message);
      setIsLoggingOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <button
        type="button"
        className="flex w-full items-center justify-center rounded-[14px] border border-[#242c3b] py-[13px] text-[13px] font-semibold text-[#9ca3af] transition-colors hover:border-[#384255] hover:text-[#f9fafb] min-[769px]:border-[#273142] min-[769px]:bg-[#141822] min-[769px]:py-3.5 min-[769px]:text-sm"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? "ログアウト中..." : "ログアウト"}
      </button>
  );
};

const MypageScreen = ({ user = defaultUser }: MypageScreenProps) => {
  const details: ProfileDetail[] = [
    { label: "名前", value: user.name, action: "編集" },
    { label: "性別", value: user.gender, action: "編集" },
    { label: "メールアドレス", value: user.email, action: "編集" },
    { label: "パスワード", value: "••••••••••", action: "変更" },
  ];

  return (
    <section className="flex min-h-[812px] w-full max-w-[375px] flex-col overflow-hidden rounded-[20px] bg-[#0b0d12] min-[769px]:min-h-[calc(100vh-32px)] min-[769px]:max-w-[1440px] min-[769px]:rounded-none min-[769px]:bg-[#080b10]">
      <MobileAppHeader />
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-5 pb-4 pt-6 min-[769px]:px-5 min-[769px]:py-0">
        <div className="flex w-full max-w-[335px] flex-col gap-5 min-[769px]:max-w-[420px] min-[769px]:gap-6">
          <ProfileSummary user={user} />
          <AccountSettings details={details} />
          <LogoutButton />
        </div>
      </main>
    </section>
  );
};

export default MypageScreen;
