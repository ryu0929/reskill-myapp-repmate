"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { genderOptions } from "../_types/signup";
import type { AuthInputProps, Gender } from "../_types/signup";

const assets = {
  logo: "/assets/repmate-logo.svg",
  user: "/assets/auth/user.svg",
  mail: "/assets/auth/mail.svg",
  lock: "/assets/auth/lock.svg",
} as const;

// アカウント作成前に必要な名前・性別・メール・パスワードを検証する。
const signupSchema = z.object({
  name: z.string().min(1, "名前を入力してください"),
  gender: z.enum(genderOptions),
  email: z.email("メールアドレスの形式が正しくありません"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
});

// Zodスキーマを元に、フォーム全体の値の型を自動生成する。
type SignupFormValues = z.infer<typeof signupSchema>;

// registerから渡される入力属性も受け取れる、サインアップ用の共通入力部品。
const AuthInput = ({
  label,
  type,
  placeholder,
  icon,
  error,
  ...inputProps
}: AuthInputProps) => (
  <label className="flex w-full flex-col gap-2">
    <span className="text-xs font-medium text-[#9ca3af] min-[769px]:text-sm">
      {label}
    </span>
    <span className="flex h-[50px] w-full items-center gap-3 rounded-[14px] border border-[#242c3b] bg-[#141822] px-4 min-[769px]:h-[54px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        className="size-[19px] shrink-0 min-[769px]:size-5"
        src={assets[icon]}
      />
      {/* name・onChange・onBlur・refを渡し、React Hook Formとinputを接続する。 */}
      <input
        type={type}
        placeholder={placeholder}
        {...inputProps}
        className="auth-input min-w-0 flex-1 bg-transparent text-sm text-[#f9fafb] outline-none placeholder:text-[#9ca3af] min-[769px]:text-[15px]"
      />
    </span>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </label>
);

const GenderSelector = ({
  value,
  onChange,
}: {
  value: Gender;
  onChange: (value: Gender) => void;
}) => {
  // input要素ではない独自ボタンUIなので、現在値と変更関数をPropsで受け取る。
  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-xs font-medium text-[#9ca3af] min-[769px]:text-sm">
        性別
      </p>

      <div className="flex h-11 w-full gap-1 rounded-[14px] border border-[#242c3b] bg-[#141822] p-1 min-[769px]:h-12">
        {genderOptions.map((option) => {
          const active = value === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              aria-pressed={active}
              className={`flex min-w-0 flex-1 items-center justify-center rounded-[10px] text-[13px] transition-colors ${
                active
                  ? "bg-[#1856ed] font-bold text-[#f9fafb]"
                  : "font-normal text-[#9ca3af] hover:text-[#f9fafb]"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const SignupForm = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  // registerは通常のinput、controlはControllerを使う独自UIの管理に使用する。
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    // Zodの検証結果をReact Hook Formのerrorsへ連携する。
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      gender: "男性",
      email: "",
      password: "",
    },
  });

  // 全フィールドが検証を通過した場合だけSupabaseへ登録情報を送る。
  const onSubmit = async (values: SignupFormValues) => {
    setServerError("");

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        // nameとgenderはAuthのユーザーメタデータとして保存し、プロフィール作成時に利用する。
        data: {
          name: values.name,
          gender: values.gender,
        },
      },
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    // 登録後はホームへ移動し、最新の認証状態でServer Componentを再描画する。
    router.push("/");
    router.refresh();
  };

  return (
    // handleSubmitがZod検証後にonSubmitを呼び、二重送信状態も管理する。
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-3 min-[769px]:gap-4"
    >
      {/* registerの引数が、フォーム値のどの項目として管理するかを表す。 */}
      <AuthInput
        label="名前"
        type="text"
        placeholder="名前を入力してください"
        icon="user"
        {...register("name")}
        error={errors.name?.message}
      />

      {/* ボタンで構成した性別UIは、Controllerでgenderフィールドへ接続する。 */}
      <Controller
        name="gender"
        control={control}
        render={({ field }) => (
          <GenderSelector value={field.value} onChange={field.onChange} />
        )}
      />

      <AuthInput
        label="メールアドレス"
        type="email"
        placeholder="you@example.com"
        icon="mail"
        {...register("email")}
        error={errors.email?.message}
      />

      <AuthInput
        label="パスワード"
        type="password"
        placeholder="8文字以上"
        icon="lock"
        {...register("password")}
        error={errors.password?.message}
      />

      {/* Supabaseから返った登録エラーはフォーム共通のエラーとして表示する。 */}
      {serverError && (
        <p role="alert" className="text-sm text-red-400">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-0 flex h-[52px] w-full items-center justify-center rounded-[14px] bg-[#1856ed] text-[15px] font-medium text-[#f9fafb] shadow-[0px_10px_28px_rgba(24,86,237,0.2)] transition-opacity hover:opacity-95 min-[769px]:mt-3 min-[769px]:h-[54px] min-[769px]:text-base min-[769px]:font-bold"
      >
        {isSubmitting ? "登録中..." : "アカウントを作成"}
      </button>
    </form>
  );
};

export const SignupScreen = () => (
  // SignupFormにロゴ、説明、ログイン画面への導線を組み合わせる。
  <main className="flex min-h-screen items-center justify-center bg-[#050608] p-4">
    <section
      className="flex min-h-[812px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-[#0b0d12] px-10 min-[769px]:min-h-[calc(100vh-32px)] min-[769px]:max-w-[1440px] min-[769px]:px-5"
      data-name="/signup"
    >
      <div className="flex w-full min-[769px]:max-w-[420px] flex-col items-center gap-5 pb-8 pt-10">
        <div className="relative h-[52px] w-[120px] shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="RepMate"
            className="block size-full max-w-none"
            src={assets.logo}
          />
        </div>
        <div className="flex w-full flex-col items-center gap-2 text-center">
          <p className="font-[family-name:var(--font-urbanist)] text-[11px] font-bold uppercase tracking-[0.88px] text-[#1856ed]">
            JOIN REPMATE
          </p>
          <p className="text-[13px] leading-[1.5] text-[#9ca3af]">
            基本情報を入力して、あなた専用のトレーニングを始めましょう。
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-[18px] pb-10 min-[769px]:max-w-[420px] min-[769px]:gap-7">
        <SignupForm />
        <p className="text-center text-[13px] text-[#9ca3af] min-[769px]:text-sm">
          すでにアカウントをお持ちですか？
          <Link
            href="/login"
            className="ml-1 font-medium text-[#1856ed] transition-opacity hover:opacity-80 min-[769px]:font-bold"
          >
            ログイン
          </Link>
        </p>
      </div>
    </section>
  </main>
);
