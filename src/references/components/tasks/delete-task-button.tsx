'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

type Props = {
    taskId: string;
    taskTitle: string
}

export function DeleteTaskButton({taskId, taskTitle}: Props) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] =  useState(false);

    async function handleDelete() {
        const ok = window.confirm(`「${taskTitle}」を削除しますか？`);
        if (!ok) return

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE'
            })

            if (!res.ok) {
                throw new Error('削除に失敗しました')
              }
        
            router.refresh()

        } catch(err) {
            alert(err instanceof Error ? err.message : 'エラーが発生しました')
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <Button 
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
        >
            {isDeleting ? '削除中...': '削除'}
        </Button>
    );
}