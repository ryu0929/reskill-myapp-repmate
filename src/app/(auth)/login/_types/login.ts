import type { InputHTMLAttributes } from "react";

// 標準inputの属性を継承するため、registerが返す属性もそのまま受け取れる。
export type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  type: "email" | "password";
  placeholder: string;
  icon: "mail" | "lock";
  error?: string;
};
