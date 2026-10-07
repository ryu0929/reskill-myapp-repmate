"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Props = {
    error: Error & { digest?: string};
    reset: () => void;
}

export default function TasksError({error, reset}: Props) {
    useEffect(() => {
        console.log(error);
    }, [error]);

    return (
        <div className="space-y-4 p-6">
          <h2 className="text-xl font-semibold">タスクの読み込みに失敗しました</h2>
          <p className="text-muted-foreground">
            一時的な問題の可能性があります。ネットワーク接続を確認して、もう一度お試しください。
          </p>
          <div className="flex gap-2">
            <Button onClick={() => reset()}>もう一度読み込む</Button>
            <Button asChild variant="secondary">
              <Link href="/">トップへ戻る</Link>
            </Button>
          </div>
          {error.digest && (
            <p className="text-xs text-muted-foreground">
              お問い合わせの際はこのID をお伝えください：{error.digest}
            </p>
          )}
        </div>
      );
}