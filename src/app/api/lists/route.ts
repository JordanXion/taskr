import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getUserId(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  const session = await verifyToken(token);
  return session?.userId ?? null;
}

export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const list = await prisma.list.create({
    data: { name: name.trim(), userId },
  });

  return NextResponse.json(list);
}

// Rename list or set as default
export async function PATCH(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, isDefault } = await request.json();

  const list = await prisma.list.findUnique({ where: { id } });
  if (!list || list.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (isDefault === true) {
    // Flip default in a transaction: clear all, set this one
    const [, updated] = await prisma.$transaction([
      prisma.list.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      }),
      prisma.list.update({
        where: { id },
        data: { isDefault: true },
      }),
    ]);
    return NextResponse.json(updated);
  }

  if (name !== undefined) {
    if (!name.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const updated = await prisma.list.update({
      where: { id },
      data: { name: name.trim() },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
}

// Delete list — moveToListId moves tasks, otherwise deletes them
export async function DELETE(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, moveToListId } = await request.json();
  const list = await prisma.list.findUnique({ where: { id } });
  if (!list || list.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (moveToListId) {
    await prisma.todo.updateMany({
      where: { listId: id, userId },
      data: { listId: moveToListId },
    });
  } else {
    await prisma.todo.deleteMany({ where: { listId: id, userId } });
  }

  await prisma.list.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
