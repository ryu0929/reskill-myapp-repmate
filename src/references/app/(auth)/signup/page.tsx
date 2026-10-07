import Link from "next/link";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
    return(
        <div className="flex min-h-screen items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-6">
                <h1 className="text-2xl font-bold">アカウント作成</h1>
                <SignupForm />
                <p className="text-sm text-center text-muted-foreground">
                    すでにアカウントをお持ちの方は
                    <Link href="/login" className="underline ml-1">
                        ログイン
                    </Link>
                </p>
            </div>
        </div>
    );
}