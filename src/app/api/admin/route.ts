import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  const session = await verifyToken(token);
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  return user?.role === "admin" ? session.userId : null;
}

export async function GET(request: NextRequest) {
  const adminId = await requireAdmin(request);
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "stats") {
    const [users, lists, tasks, appStats] = await Promise.all([
      prisma.user.count(),
      prisma.list.count(),
      prisma.todo.count(),
      prisma.appStats.findUnique({ where: { id: 1 } }),
    ]);
    return NextResponse.json({
      users,
      lists,
      tasks,
      totalTasksCreated: appStats?.totalTasksCreated ?? 0,
    });
  }

  if (type === "users") {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        signupIp: true,
        lastAccessAt: true,
        lastAccessIp: true,
        _count: { select: { todos: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  }

  if (type === "user-tasks") {
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const tasks = await prisma.todo.findMany({
      where: { userId },
      include: { list: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(tasks);
  }

  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}
