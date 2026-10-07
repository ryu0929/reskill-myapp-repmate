import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-sm space-y-6">
            <h1 className="text-2xl font-bold">ログイン</h1>
            <LoginForm />
            <p className="text-sm text-center text-muted-foreground">
              アカウントをお持ちでない方は
              <Link href="/signup" className="underline ml-1">
                こちらから登録
              </Link>
            </p>
          </div>
        </div>
      );
}

