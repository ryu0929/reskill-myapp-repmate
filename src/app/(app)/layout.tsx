import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { createClient } from "@/lib/supabase/server";

const AppLayout = async ({ children }: { children: ReactNode }) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <MobileShell>{children}</MobileShell>;
};

export default AppLayout;
