import type { Metadata } from "next";
import { Noto_Sans_JP, Urbanist } from "next/font/google";
import "./globals.css";

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "RepMate",
  description: "AIトレーナーと一緒にトレーニングを記録・最適化",
};

const RootLayout = ({ children }: LayoutProps<"/">) => (
  <html
    lang="ja"
    className={`${notoSansJp.variable} ${urbanist.variable} h-full antialiased`}
  >
    <body className="min-h-full font-[family-name:var(--font-noto-sans-jp)]">
      {children}
    </body>
  </html>
);

export default RootLayout;
