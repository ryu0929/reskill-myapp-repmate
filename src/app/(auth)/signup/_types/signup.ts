import type { InputHTMLAttributes } from "react";

export const genderOptions = ["男性", "女性", "無回答"] as const;

export type Gender = (typeof genderOptions)[number];

export type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  type: "text" | "email" | "password";
  placeholder: string;
  icon: "user" | "mail" | "lock";
  error?: string;
};
