// app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-2xl font-bold">ページが見つかりません</h2>
      <p className="text-muted-foreground">
        URLを確認するか、タスク一覧から移動してください。
      </p>
      <Button asChild>
        <Link href="/tasks">タスク一覧へ戻る</Link>
      </Button>
    </div>
  );
}