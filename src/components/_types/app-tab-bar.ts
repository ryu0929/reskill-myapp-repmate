export type AppTabId = "home" | "consult" | "report" | "progress";

export type TabConfig = {
  id: AppTabId;
  href: string;
  label: string;
  icon: string;
};

export type AppTabBarProps = {
  active: AppTabId;
  variant?: "home" | "consult";
};
