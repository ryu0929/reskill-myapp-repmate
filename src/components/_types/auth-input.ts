import type { InputHTMLAttributes } from "react";

export type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  type: "text" | "email" | "password";
  placeholder: string;
  icon: "user" | "mail" | "lock";
  error?: string;
};
