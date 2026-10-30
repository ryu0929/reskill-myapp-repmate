"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import type { AuthInputProps } from "../_types/login";

const assets = {
  logo: "/assets/repmate-logo.svg",
  mail: "/assets/auth/mail.svg",
  lock: "/assets/auth/lock.svg",
} as const;

// Zodで、送信を許可するメールアドレスとパスワードの条件を定義する。
const loginSchema = z.object({
  email: z.email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

// スキーマからフォーム値のTypeScript型を作り、定義の重複を防ぐ。
type LoginFormValues = z.infer<typeof loginSchema>;

// ラベル・アイコン・エラー表示を共通化した認証画面用の入力部品。
const AuthInput = ({
  label,
  type,
  placeholder,
  icon,
  error,
  ...inputProps
}: AuthInputProps) => (
  <label className="flex w-full flex-col gap-2">
    <span className="text-xs font-medium text-[#9ca3af]">{label}</span>

    <span className="flex h-[50px] w-full items-center gap-3 overflow-hidden rounded-[14px] border border-[#242c3b] bg-[#141822] px-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="size-[19px] shrink-0" src={assets[icon]} />

      {/* registerが返すname・onChange・onBlur・refをinputへ渡し、フォーム管理の対象にする。 */}
      <input
        type={type}
        placeholder={placeholder}
        {...inputProps}
        className="min-w-0 flex-1 bg-transparent text-sm text-[#f9fafb] outline-none placeholder:text-[#9ca3af]"
      />
    </span>

    {error && <p className="text-xs text-red-400">{error}</p>}
  </label>
);

const LoginForm = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  // useFormが入力値、バリデーションエラー、送信状態をまとめて管理する。
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    // React Hook Formの送信時にloginSchemaで入力値を検証する。
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // handleSubmitの検証を通過した値だけが、この関数へ渡される。
  const onSubmit = async (values: LoginFormValues) => {
    setServerError("");

    const supabase = createClient();

    // Supabase Authへメールアドレスとパスワードを送り、ログインする。
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setServerError("メールアドレスまたはパスワードが正しくありません");
      return;
    }

    // ログイン後はホームへ移動し、Server Componentの認証情報も再取得する。
    router.push("/");
    router.refresh();
  };

  return (
    // handleSubmitが検証・送信中管理を行い、成功時だけonSubmitを呼ぶ。
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-3"
    >
      {/* registerの引数が、フォーム値のどの項目として管理するかを表す。 */}
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

      {/* Zodでは検出できない認証失敗は、サーバー側のエラーとして表示する。 */}
      {serverError && (
        <p role="alert" className="text-sm text-red-400">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-0 flex h-[52px] w-full items-center justify-center rounded-[14px] bg-[#1856ed] text-[15px] font-medium text-[#f9fafb] shadow-[0px_10px_28px_rgba(24,86,237,0.2)] transition-opacity hover:opacity-95 disabled:opacity-50"
      >
        {isSubmitting ? "ログイン中..." : "ログイン"}
      </button>
    </form>
  );
};

export const LoginScreen = () => (
  // LoginFormの周囲にロゴ、説明文、新規登録への導線を配置する画面コンポーネント。
  <main className="flex min-h-screen items-center justify-center bg-[#050608] p-4">
    <section
      className="flex min-h-[812px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-[#0b0d12] px-5 min-[769px]:min-h-[calc(100vh-32px)] min-[769px]:max-w-[1440px]"
      data-name="/login"
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
            SIGN IN
          </p>
          <p className="text-[13px] leading-[1.5] text-[#9ca3af]">
            ログインして、今日の記録と成長を確認しましょう。
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-[18px] pb-10 min-[769px]:max-w-[420px] min-[769px]:px-5">
        <LoginForm />
        <p className="text-center text-[13px] text-[#9ca3af]">
          アカウントをお持ちでないですか？
          <Link
            href="/signup"
            className="ml-1 font-medium text-[#1856ed] transition-opacity hover:opacity-80"
          >
            新規登録
          </Link>
        </p>
      </div>
    </section>
  </main>
);
