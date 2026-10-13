import type { InputHTMLAttributes } from "react";

export type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  type: "email" | "password";
  placeholder: string;
  icon: "mail" | "lock";
  error?: string;
};
