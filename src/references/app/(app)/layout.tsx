// app/(app)/layout.tsx
import { Header } from "@/components/header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="p-6">{children}</main>
    </>
  );
}