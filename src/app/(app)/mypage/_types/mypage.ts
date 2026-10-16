import type { ReactNode } from "react";

export const genderOptions = ["男性", "女性", "無回答"] as const;

export type Gender = (typeof genderOptions)[number];

export type ProfileFieldProps = {
  id: string;
  label: string;
  value: string;
  editing: boolean;
  children?: ReactNode;
};

export type ProfileSummaryProps = {
  user: UserProfile;
};

export type UserProfile = {
  name: string;
  gender: Gender;
  email: string;
  trainingHistory: string;
  streakLabel: string;
  initials: string;
};

export type MypageScreenProps = {
  user: UserProfile;
};
