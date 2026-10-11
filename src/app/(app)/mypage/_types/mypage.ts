export type ProfileDetail = {
  label: string;
  value: string;
  action: string;
};

export type UserProfile = {
  name: string;
  gender: string;
  email: string;
  trainingHistory: string;
  streakLabel: string;
  initials: string;
};

export type MypageScreenProps = {
  user?: UserProfile;
};
