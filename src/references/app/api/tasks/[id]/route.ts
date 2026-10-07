// app/api/tasks/[id]/route.ts
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params
  const body = await request.json()

  const data: { title?: string; status?: string } = {}
  if (typeof body.title === 'string') data.title = body.title
  if (typeof body.status === 'string') data.status = body.status

  try {
    const task = await prisma.task.update({
      where: { id },
      data,
    })
    return NextResponse.json(task)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2025'
    ) {
      return NextResponse.json(
        { error: 'タスクが見つかりません' },
        { status: 404 },
      )
    }
    throw err
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params

  try {
    await prisma.task.delete({
      where: { id },
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2025'
    ) {
      return NextResponse.json(
        { error: 'タスクが見つかりません' },
        { status: 404 },
      )
    }
    throw err
  }
}