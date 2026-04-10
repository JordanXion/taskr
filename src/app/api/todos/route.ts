import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getUser(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  const session = await verifyToken(token);
  if (!session) return null;
  return session.userId;
}

// Add task
export async function POST(request: NextRequest) {
  const userId = await getUser(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, dueDate, listId } = await request.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const [todo] = await prisma.$transaction([
    prisma.todo.create({
      data: {
        title: title.trim(),
        userId,
        dueDate: dueDate ? new Date(dueDate) : null,
        listId: listId ?? null,
      },
    }),
    prisma.appStats.upsert({
      where: { id: 1 },
      create: { id: 1, totalTasksCreated: 1 },
      update: { totalTasksCreated: { increment: 1 } },
    }),
  ]);

  return NextResponse.json(todo);
}

// Edit task
export async function PATCH(request: NextRequest) {
  const userId = await getUser(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, title, dueDate, listId } = await request.json();
  const todo = await prisma.todo.findUnique({ where: { id } });
  if (!todo || todo.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.todo.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      dueDate: dueDate === null ? null : dueDate ? new Date(dueDate) : undefined,
      ...(listId !== undefined && { listId }),
    },
  });

  return NextResponse.json(updated);
}

// Toggle task
export async function PUT(request: NextRequest) {
  const userId = await getUser(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  const todo = await prisma.todo.findUnique({ where: { id } });
  if (!todo || todo.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.todo.update({
    where: { id },
    data: { completed: !todo.completed },
  });

  return NextResponse.json(updated);
}

// Delete task
export async function DELETE(request: NextRequest) {
  const userId = await getUser(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  const todo = await prisma.todo.findUnique({ where: { id } });
  if (!todo || todo.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.todo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
