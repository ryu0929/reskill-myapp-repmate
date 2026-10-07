// app/api/tasks/route.ts
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createClient } from "@/lib/supabase/server";
import { create } from 'domain';

type CreateTaskBody = {
  title: string
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(tasks)
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: {user}, error} = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = (await request.json()) as CreateTaskBody

  if (typeof body.title !== 'string' || body.title.trim() === '') {
    return NextResponse.json(
      { error: 'titleは必須です' },
      { status: 400 },
    )
  }

  try {
    const task = await prisma.task.create({
      data: { 
        title: body.title,
        userId: user.id,
      },
    })

    revalidatePath('/tasks')
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('failed to create task:', error)
    return NextResponse.json(
      { error: '保存に失敗しました。しばらくしてから再度お試しください。' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _: Request,
  { params }: {params: Promise<{id: string}>}
) {
  const supabase = await createClient();
  const {data: { user }, error} = await supabase.auth.getUser();
  if(!user) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    );
  }

  const { id } = await params;

  const task = await prisma.task.findUnique({ where: {id} });
  if(!task) {
    return NextResponse.json(
      {error: "Not Found"},
      {status: 404}
    );
  }
  if(task.userId !== user.id) {
    return NextResponse.json(
      { error: 'Forbidden' }, 
      { status: 403 }
    );
  }

  await prisma.task.delete({where: {id}});
  return NextResponse.json(
    {ok: true}
  );
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const result = await prisma.task.updateMany({
    where: { id, userId: user.id },
    data: {
      title: body.title,
      description: body.description,
      status: body.status,
    },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  // 更新後の行を返したいなら改めてfindUniqueで取得
  const task = await prisma.task.findUnique({ where: { id } });
  return NextResponse.json(task);
}