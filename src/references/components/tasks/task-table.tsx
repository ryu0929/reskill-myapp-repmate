// app/tasks/task-table.tsx（一部抜粋）
import { EditTaskDialog } from './edit-task-dialog'
import { DeleteTaskButton } from './delete-task-button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Task = {
  id: string
  title: string
  status: string
}

export function TaskTable({ tasks }: { tasks: Task[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>タイトル</TableHead>
          <TableHead>状態</TableHead>
          <TableHead className="w-40">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell>{task.title}</TableCell>
            <TableCell>{task.status === 'DONE' ? '完了' : '未完了'}</TableCell>
            <TableCell className="flex gap-2">
              <EditTaskDialog task={task} />
              <DeleteTaskButton taskId={task.id} taskTitle={task.title} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}