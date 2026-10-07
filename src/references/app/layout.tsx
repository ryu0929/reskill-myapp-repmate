import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Toaster } from '@/components/ui/sonner';
import "./globals.css";


export const metadata: Metadata = {
  title: "task-app",
  description: "task-app",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja">
      <body>
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
