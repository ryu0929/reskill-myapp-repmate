import { createClient } from "@/utils/supabase/server";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  userId: string;
  createdAt: string;
};

const SupabaseTestPage = async () => {
  const supabase = await createClient();
  const { data: tasks, error } = await supabase
    .from("Task")
    .select("id,title,description,status,userId,createdAt")
    .order("createdAt", { ascending: false })
    .limit(20)
    .returns<Task[]>();

  return (
    <main className="min-h-[812px] w-full max-w-[375px] overflow-hidden rounded-[20px] bg-[#0b0d12] p-6 text-[#f9fafb] min-[769px]:min-h-[calc(100vh-32px)] min-[769px]:max-w-[960px] min-[769px]:rounded-2xl min-[769px]:p-10">
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#1856ed]">
            Supabase connection test
          </p>
          <h1 className="mt-2 text-2xl font-bold">Taskデータ確認</h1>
          <p className="mt-2 text-sm leading-6 text-[#9ca3af]">
            Supabaseの <code className="rounded bg-[#141822] px-1.5 py-0.5">Task</code> テーブルから最新20件を取得しています。
          </p>
        </div>

        {error ? (
          <section className="rounded-[14px] border border-red-500/40 bg-red-500/10 p-4">
            <h2 className="text-sm font-bold text-red-200">取得エラー</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-100">
              {error.message}
            </p>
            <p className="mt-3 text-xs leading-5 text-red-100/70">
              テーブル名、RLS、環境変数、Supabaseの接続情報を確認してください。
            </p>
          </section>
        ) : (
          <section className="rounded-[14px] border border-[#273142] bg-[#141822] p-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-bold">取得結果</h2>
              <span className="rounded-full bg-[#1856ed] px-3 py-1 text-xs font-bold">
                {tasks?.length ?? 0}件
              </span>
            </div>

            {tasks && tasks.length > 0 ? (
              <ul className="mt-4 flex flex-col gap-3">
                {tasks.map((task) => (
                  <li key={task.id} className="rounded-xl border border-[#273142] bg-[#0b0d12] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold">{task.title}</p>
                        {task.description && (
                          <p className="mt-1 text-sm leading-6 text-[#9ca3af]">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 rounded-full border border-[#273142] px-2.5 py-1 text-xs text-[#9ca3af]">
                        {task.status}
                      </span>
                    </div>
                    <dl className="mt-3 grid gap-1 text-xs text-[#6b7280] min-[769px]:grid-cols-2">
                      <div className="min-w-0">
                        <dt className="font-bold">userId</dt>
                        <dd className="truncate">{task.userId}</dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="font-bold">createdAt</dt>
                        <dd className="truncate">{task.createdAt}</dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-[#273142] p-4 text-sm text-[#9ca3af]">
                接続は成功していますが、Taskテーブルに表示できるデータがありません。
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
};

export default SupabaseTestPage;
