"use client";

import { useCallback, useEffect, useState } from "react";

// Toastのメッセージを管理し、指定時間後に自動で非表示にする。
const useToast = (duration = 3000) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 画面側から受け取ったメッセージをToastに表示する。
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  // メッセージが表示されたら、指定時間後にnullへ戻す。
  useEffect(() => {
    if (!toastMessage) return;

    const timeoutId = window.setTimeout(() => {
      setToastMessage(null);
    }, duration);

    // メッセージの変更や画面遷移時に、古いタイマーを解除する。
    return () => window.clearTimeout(timeoutId);
  }, [duration, toastMessage]);

  //フック外で使いたいものを返す
  return {
    toastMessage,
    showToast,
  };
};

export default useToast;
