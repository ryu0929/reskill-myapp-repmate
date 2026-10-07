"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        // 初回に現在のユーザーを取得
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user ?? null);
            setIsLoading(false);
        });

        // ログイン・ログアウトが起きたら state を更新
        const { data: listner } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        ); 

        return () => {
            listner.subscription.unsubscribe();
        }
    },[]);

    return { user, isLoading };
}