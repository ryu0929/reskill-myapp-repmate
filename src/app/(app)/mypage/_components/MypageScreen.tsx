"use client";

import { MobileAppHeader } from "@/components/MobileAppHeader";
import { genderOptions } from "../_types/mypage";
import type { MypageScreenProps, ProfileFieldProps, ProfileSummaryProps } from "../_types/mypage";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "../_schemas/profile";
import type { ProfileFormValues } from "../_schemas/profile";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NextResponse } from "next/server";


// const defaultUser: UserProfile = {
//   name: "山田 太郎",
//   gender: "男性",
//   email: "taro.yamada@example.com",
//   trainingHistory: "トレーニング歴 8ヶ月",
//   streakLabel: "継続 12週間",
//   initials: "RM",
// };

const ProfileSummary = ({ user }: ProfileSummaryProps) => (
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

const ProfileField = ({ id, label, value, editing, children }: ProfileFieldProps) => (
  <div className="min-w-0 border-b border-[#242c3b] py-3.5 min-[769px]:py-4">
    <label htmlFor={editing ? id : undefined} className="block text-[11px] font-semibold text-[#9ca3af] min-[769px]:text-xs">{label}</label>
    {editing ? children : <p className="mt-1 break-words text-[15px] font-semibold text-[#f9fafb] min-[769px]:text-base">{value}</p>}
  </div>
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

const MypageScreen = ({ user }: MypageScreenProps) => {
  const [profile, setProfile] = useState(user);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      gender: user.gender,
      email: user.email,
      password: "",
      confirmation: "",
    },
  });
  const router = useRouter();

  const completeEditing = async (values: ProfileFormValues) => {
      if(!editing) return;

      try {
        const response = await fetch("api/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        const result = await response.json();

        if(!response.ok) {
          console.error("APIエラー:", result.error);
          setNotice("送信に失敗しました。");
          return;
        }

        setProfile((current) => ({
          ...current,
          name: result.profile.name,
          gender: result.profile.gender,
        }));

        reset({
          name: result.profile.name,
          gender: result.profile.gender,
          email: profile.email,
          password: "",
          confirmation: "",
        });

        // 今回は通信確認のみ。DBにはまだ保存されない
        setNotice("名前と性別を保存しました。メールアドレスとパスワードの変更はまだ未対応です。");

        // 編集モードを終了
        setEditing(false);
        editButtonRef.current?.focus();

        // Server Componentのデータを再取得
        router.refresh();
        
      } catch(error) {
        console.error("通信エラー:", error);
        setNotice("通信エラーが発生しました。");
      }
  };

  const inputClassName = "mt-2 w-full min-w-0 rounded-lg border border-[#384255] bg-[#0f131c] px-3 py-2 text-base text-[#f9fafb] outline-none focus:border-[#1856ed] focus:ring-2 focus:ring-[#1856ed]";

  return (
    <section className="flex min-h-[812px] w-full max-w-[375px] flex-col overflow-hidden rounded-[20px] bg-[#0b0d12] min-[769px]:min-h-[calc(100vh-32px)] min-[769px]:max-w-[1440px] min-[769px]:rounded-none min-[769px]:bg-[#080b10]">
      <MobileAppHeader />
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-5 pb-4 pt-6 min-[769px]:px-5 min-[769px]:py-0">
        <div className="flex w-full max-w-[335px] flex-col gap-5 min-[769px]:max-w-[420px] min-[769px]:gap-6">
          <ProfileSummary user={profile} />
          <form noValidate className="flex w-full flex-col gap-5 min-[769px]:gap-6" onSubmit={(event) => { void handleSubmit(completeEditing)(event); }}>
            <section aria-label="プロフィール情報" className="w-full rounded-[14px] border border-[#242c3b] bg-[#141822] px-4 pt-1.5 min-[769px]:border-[#273142] min-[769px]:px-5 min-[769px]:py-2">
              <ProfileField id="profile-name" label="名前" value={profile.name} editing={editing}>
                <input {...register("name")} id="profile-name" autoFocus autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} className={inputClassName} />
                {errors.name && <p id="name-error" role="alert" className="mt-2 text-xs text-red-400">{errors.name.message}</p>}
              </ProfileField>
              <ProfileField id="profile-gender" label="性別" value={profile.gender} editing={editing}>
                <Controller name="gender" control={control} render={({ field }) => (
                  <div id="profile-gender" role="group" aria-label="性別" aria-describedby={errors.gender ? "gender-error" : undefined} className="mt-3 grid h-11 grid-cols-3 gap-1 rounded-[14px] border border-[#242c3b] bg-[#0f131c] p-1 min-[769px]:h-12">
                    {genderOptions.map((option, index) => (
                      <button ref={index === 0 ? field.ref : undefined} key={option} type="button" onBlur={field.onBlur} aria-pressed={field.value === option} onClick={() => field.onChange(option)} className={"min-w-0 rounded-[10px] text-[13px] transition-colors " + (field.value === option ? "bg-[#1856ed] font-bold text-[#f9fafb]" : "text-[#9ca3af] hover:text-[#f9fafb]")}>{option}</button>
                    ))}
                  </div>
                )} />
                {errors.gender && <p id="gender-error" role="alert" className="mt-2 text-xs text-red-400">{errors.gender.message}</p>}
              </ProfileField>
              <ProfileField id="profile-email" label="メールアドレス" value={profile.email} editing={editing}>
                <input {...register("email")} id="profile-email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} className={inputClassName} />
                {errors.email && <p id="email-error" role="alert" className="mt-2 text-xs text-red-400">{errors.email.message}</p>}
              </ProfileField>
              <ProfileField id="profile-password" label={editing ? "新しいパスワード" : "パスワード"} value="••••••••••" editing={editing}>
                <input {...register("password")} id="profile-password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-hint password-error" : "password-hint"} className={inputClassName} />
                {errors.password && <p id="password-error" role="alert" className="mt-2 text-xs text-red-400">{errors.password.message}</p>}
                <p id="password-hint" className="mt-2 text-xs text-[#9ca3af]">変更しない場合は空欄のままにしてください。</p>
                <label htmlFor="profile-password-confirmation" className="mt-3 block text-xs text-[#9ca3af]">新しいパスワード（確認）</label>
                <input {...register("confirmation")} id="profile-password-confirmation" type="password" autoComplete="new-password" aria-invalid={!!errors.confirmation} aria-describedby={errors.confirmation ? "confirmation-error" : undefined} className={inputClassName} />
                {errors.confirmation && <p id="confirmation-error" role="alert" className="mt-2 text-xs text-red-400">{errors.confirmation.message}</p>}
              </ProfileField>
            </section>
            {notice && <p role="status" className="text-xs text-[#9ca3af]">{notice}</p>}
            <button ref={editButtonRef} disabled={isSubmitting} type={editing ? "submit" : "button"} onClick={(event) => {
              if (editing) return;
              event.preventDefault();
              reset({ name: profile.name, gender: profile.gender, email: profile.email, password: "", confirmation: "" });
              setNotice("");
              setEditing(true);
            }} className="flex w-full items-center justify-center rounded-[14px] bg-[#1856ed] py-[13px] text-[13px] font-bold text-[#f9fafb] transition-opacity hover:opacity-90 min-[769px]:py-3.5 min-[769px]:text-sm">
              {editing ? "編集を完了する" : "プロフィールを編集"}
            </button>
          </form>
          <LogoutButton />
        </div>
      </main>
    </section>
  );
};

export default MypageScreen;
