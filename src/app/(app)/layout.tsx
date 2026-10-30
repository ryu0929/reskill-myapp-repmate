import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { AppUserProvider } from "@/components/AppUserProvider";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const AppLayout = async ({ children }: { children: ReactNode }) => {
  // アプリ配下はサーバー側で認証し、未ログインなら描画前にログインへ戻す。
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { name: true },
  });
  const metadataName =
    typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name.trim()
      : "";
  // DB未作成時にも表示できるよう、プロフィール→メタデータ→メールの順で補完する。
  const userName =
    profile?.name.trim() ||
    metadataName ||
    user.email?.split("@")[0] ||
    "ユーザー";

  return (
    <AppUserProvider userName={userName}>
      <MobileShell>{children}</MobileShell>
    </AppUserProvider>
  );
};

export default AppLayout;
