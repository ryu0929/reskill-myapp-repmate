import Link from "next/link";

const assets = {
  logo: "/assets/repmate-logo.svg",
  user: "/assets/auth/user.svg",
  mail: "/assets/auth/mail.svg",
  lock: "/assets/auth/lock.svg",
} as const;

type AuthInputProps = {
  label: string;
  type: "text" | "email" | "password";
  placeholder: string;
  icon: "user" | "mail" | "lock";
};

const genderOptions = ["男性", "女性", "その他"] as const;

const AuthInput = ({ label, type, placeholder, icon }: AuthInputProps) => (
  <label className="flex w-full flex-col gap-2">
    <span className="text-xs font-medium text-[#9ca3af] min-[769px]:text-sm">{label}</span>
    <span className="flex h-[50px] w-full items-center gap-3 rounded-[14px] border border-[#242c3b] bg-[#141822] px-4 min-[769px]:h-[54px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="size-[19px] shrink-0 min-[769px]:size-5" src={assets[icon]} />
      <input
        type={type}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-[#f9fafb] outline-none placeholder:text-[#9ca3af] min-[769px]:text-[15px]"
      />
    </span>
  </label>
);

const GenderSelector = () => (
  <div className="flex w-full flex-col gap-2">
    <p className="text-xs font-medium text-[#9ca3af] min-[769px]:text-sm">性別</p>
    <div className="flex h-11 w-full gap-1 rounded-[14px] border border-[#242c3b] bg-[#141822] p-1 min-[769px]:h-12">
      {genderOptions.map((option, index) => {
        const active = index === 0;
        return (
          <button
            key={option}
            type="button"
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

const SignupForm = () => (
  <form className="flex w-full flex-col gap-3 min-[769px]:gap-4">
    <AuthInput label="名前" type="text" placeholder="山田 太郎" icon="user" />
    <GenderSelector />
    <AuthInput
      label="メールアドレス"
      type="email"
      placeholder="you@example.com"
      icon="mail"
    />
    <AuthInput
      label="パスワード"
      type="password"
      placeholder="8文字以上"
      icon="lock"
    />
    <button
      type="submit"
      className="mt-0 flex h-[52px] w-full items-center justify-center rounded-[14px] bg-[#1856ed] text-[15px] font-medium text-[#f9fafb] shadow-[0px_10px_28px_rgba(24,86,237,0.2)] transition-opacity hover:opacity-95 min-[769px]:mt-3 min-[769px]:h-[54px] min-[769px]:text-base min-[769px]:font-bold"
    >
      アカウントを作成
    </button>
  </form>
);

export const SignupScreen = () => (
  <main className="flex min-h-screen items-center justify-center bg-[#050608] p-4">
    <section
      className="flex min-h-[812px] w-full max-w-[375px] flex-col items-center justify-center overflow-hidden rounded-2xl bg-[#0b0d12] px-10 min-[769px]:min-h-[calc(100vh-32px)] min-[769px]:max-w-[1440px] min-[769px]:px-5"
      data-name="/signup"
    >
      <div className="flex w-full max-w-[420px] flex-col items-center gap-5 pb-8 pt-10">
        <div className="relative h-[52px] w-[120px] shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="RepMate" className="block size-full max-w-none" src={assets.logo} />
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

      <div className="flex w-full max-w-[295px] flex-col gap-[18px] pb-10 min-[769px]:max-w-[420px] min-[769px]:gap-7">
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
