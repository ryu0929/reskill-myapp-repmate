import Link from "next/link";

const assets = {
  logo: "/assets/repmate-logo.svg",
  mail: "/assets/auth/mail.svg",
  lock: "/assets/auth/lock.svg",
} as const;


type AuthInputProps = {
  label: string;
  type: "email" | "password";
  placeholder: string;
  icon: "mail" | "lock";
};

const AuthInput = ({
  label,
  type,
  placeholder,
  icon,
}: AuthInputProps) => (
  <label className="flex w-full flex-col gap-2">
    <span className="text-xs font-medium text-[#9ca3af]">{label}</span>
    <span className="flex h-[50px] w-full items-center gap-3 overflow-hidden rounded-[14px] border border-[#242c3b] bg-[#141822] px-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="size-[19px] shrink-0" src={icon === "mail" ? assets.mail : assets.lock} />
      <input
        type={type}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-[#f9fafb] outline-none placeholder:text-[#9ca3af]"
      />
    </span>
  </label>
);

const LoginForm = () => (
  <form className="flex w-full flex-col gap-3">
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
    <Link
      href="#"
      className="text-right text-xs font-medium text-[#1856ed] transition-opacity hover:opacity-80"
    >
      パスワードを忘れた方
    </Link>
    <button
      type="submit"
      className="mt-0 flex h-[52px] w-full items-center justify-center rounded-[14px] bg-[#1856ed] text-[15px] font-medium text-[#f9fafb] shadow-[0px_10px_28px_rgba(24,86,237,0.2)] transition-opacity hover:opacity-95"
    >
      ログイン
    </button>
  </form>
);

export const LoginScreen = () => (
  <main className="flex min-h-screen items-center justify-center bg-[#050608] p-4">
    <section
      className="flex min-h-[812px] w-full max-w-[375px] flex-col items-center justify-center overflow-hidden rounded-2xl bg-[#0b0d12] px-5 min-[769px]:min-h-[calc(100vh-32px)] min-[769px]:max-w-[1440px]"
      data-name="/login"
    >
      <div className="flex w-full max-w-[420px] flex-col items-center gap-5 pb-8 pt-10">
        <div className="relative h-[52px] w-[120px] shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="RepMate" className="block size-full max-w-none" src={assets.logo} />
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

      <div className="flex w-full max-w-[335px] flex-col gap-[18px] pb-10 min-[769px]:max-w-[420px] min-[769px]:px-5">
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
