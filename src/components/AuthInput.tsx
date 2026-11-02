import type { AuthInputProps } from "./_types/auth-input";

const icons = {
  user: "/assets/auth/user.svg",
  mail: "/assets/auth/mail.svg",
  lock: "/assets/auth/lock.svg",
} as const;

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

    <span className="flex h-[50px] w-full items-center gap-3 overflow-hidden rounded-[14px] border border-[#242c3b] bg-[#141822] px-4 min-[769px]:h-[54px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        className="size-[19px] shrink-0 min-[769px]:size-5"
        src={icons[icon]}
      />

      <input
        type={type}
        placeholder={placeholder}
        {...inputProps}
        className="auth-input min-w-0 flex-1 bg-transparent text-sm text-[#f9fafb] outline-none placeholder:text-[#9ca3af] min-[769px]:text-[15px]"
      />
    </span>

    {error && (
      <p role="alert" className="text-xs text-red-400">
        {error}
      </p>
    )}
  </label>
);

export default AuthInput;
