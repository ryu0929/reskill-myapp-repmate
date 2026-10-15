"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function DebugSupabase() {
  useEffect(() => {
    const supabase = createClient();
    console.log("supabase client:", supabase);
  }, []);

  return null;
}