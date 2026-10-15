'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'



type Task = {
    id: string;
    title: string;
    status: string;
}

type Props = {
    task: Task
}

export function EditTaskDialog({ task } : Props) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState(task.title);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSave() {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/tasks/${task.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title }),
            })

            if (!res.ok) {
                throw new Error('更新に失敗しました')
            }

            setOpen(false);
            router.refresh() // サーバー側データを再取得して反映
        } catch(err) {
            alert(err instanceof Error ? err.message : 'エラーが発生しました')
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              編集
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>タスクを編集</DialogTitle>
            </DialogHeader>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タイトル"
            />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleSave} disabled={isSubmitting || !title.trim()}>
                {isSubmitting ? '保存中...' : '保存'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
}   