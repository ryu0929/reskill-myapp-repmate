"use client";

import Link from "next/link";
import { useUser } from "../app/hooks/use-user";
import { LogoutButton } from "@/components/logout-button";

export function Header() {
    const {user, isLoading} = useUser();

    return (
        <header className="flex items-center justify-between border-b px-6 py-3">
            <Link href="/tasks" className="font-bold">
                task-app
            </Link>

            <nav>
                {isLoading ? (
                    <span>...</span>  
                ) : user ? (
                    <>
                        <span className="text-muted-foreground">{user.email}</span>
                        <LogoutButton />
                    </>
                ) : (
                    <>
                        <Link href="/login" className="アンダーライン">
                            ログイン
                        </Link>
                        <Link href="/signup" className="アンダーライン">
                            アカウント作成
                        </Link>
                    </>
                )
            }
            </nav>

        </header>
    );
}