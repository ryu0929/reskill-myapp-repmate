export const genderOptions = ["男性", "女性", "その他"] as const;

export type Gender = (typeof genderOptions)[number];

export type AuthInputProps = {
  label: string;
  type: "text" | "email" | "password";
  placeholder: string;
  icon: "user" | "mail" | "lock";
};
