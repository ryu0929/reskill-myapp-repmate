import type { ReactNode } from "react";

// 認証画面共通のルート。現在は各画面がレイアウトを持つためchildrenをそのまま返す。
const AuthLayout = ({ children }: { children: ReactNode }) => children;

export default AuthLayout;
