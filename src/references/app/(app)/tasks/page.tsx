import type { Task } from '@/lib/types'
import { cookies } from "next/headers";
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog'
import { TaskTable } from '@/components/tasks/task-table'
import { redirect } from "next/navigation";
import { createClient } from '@/lib/supabase/server';
import { prisma } from "@/lib/prisma";

async function getTasks(): Promise<Task[]> {
  const cookieStore = await cookies();

  const res = await fetch('http://localhost:3000/api/tasks', {
    cache: 'no-store',
    headers: {
      Cookie: cookieStore.toString(),
    },
  })

  if (!res.ok) {
    throw new Error('タスクの取得に失敗しました')
  }

  return res.json()
}

export default async function TasksPage() {

  // await new Promise((r) => setTimeout(r, 1500));

  const supabase = await createClient();
  const { data: { user }, error} = await supabase.auth.getUser(); 

  if (!user) {
    redirect('/login');
  }

  const tasks = await prisma.task.findMany({
    where: {userId: user.id},
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">タスク一覧</h1>
        <CreateTaskDialog />
      </div>

      {tasks.length === 0 ? (
        <p className="text-gray-500">タスクがありません</p>
      ) : (
        <TaskTable tasks={tasks} />
      )}
    </main>
  )
}