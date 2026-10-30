import type { InputHTMLAttributes } from "react";

export const genderOptions = ["男性", "女性", "無回答"] as const;

// 配列の値から「男性 | 女性 | 無回答」というUnion型を生成する。
export type Gender = (typeof genderOptions)[number];

// 標準inputの属性と、画面固有のラベル・アイコン・エラーを組み合わせる。
export type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  type: "text" | "email" | "password";
  placeholder: string;
  icon: "user" | "mail" | "lock";
  error?: string;
};
