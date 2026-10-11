import type { ReactNode } from "react";
import type { AppTabId } from "./app-tab-bar";

export type DesktopNavigationItem = {
  label: string;
  href: string;
  icon: string;
  id: AppTabId;
};

export type DesktopPageMeta = {
  active: AppTabId;
  title: string;
  subtitle: string;
};

export type DesktopNavItemProps = Omit<DesktopNavigationItem, "id"> & {
  active: boolean;
};

export type DesktopSidebarProps = {
  active: AppTabId;
  userName: string;
};

export type DesktopHeaderProps = DesktopPageMeta & {
  userName: string;
};

export type AppDesktopLayoutProps = {
  children: ReactNode;
  userName?: string;
};
