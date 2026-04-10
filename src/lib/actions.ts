"use server";

import { prisma } from "./db";
import { createToken, getSession } from "./auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

async function setCookie(token: string) {
  (await cookies()).set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function register(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const name = formData.get("name") as string;
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name: name.trim(), email, password: hashedPassword },
  });

  const token = await createToken(user.id);
  await setCookie(token);
  redirect("/dashboard");
}

export async function login(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "All fields are required" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Invalid email or password" };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { error: "Invalid email or password" };
  }

  const token = await createToken(user.id);
  await setCookie(token);
  redirect("/dashboard");
}

export async function logout() {
  (await cookies()).delete("token");
  redirect("/login");
}

export async function addTodo(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const title = formData.get("title") as string;
  if (!title?.trim()) return;

  await prisma.todo.create({
    data: { title: title.trim(), userId: session.userId },
  });

  revalidatePath("/dashboard");
}

export async function toggleTodo(id: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  const todo = await prisma.todo.findUnique({ where: { id } });
  if (!todo || todo.userId !== session.userId) return;

  await prisma.todo.update({
    where: { id },
    data: { completed: !todo.completed },
  });

  revalidatePath("/dashboard");
}

export async function deleteTodo(id: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  const todo = await prisma.todo.findUnique({ where: { id } });
  if (!todo || todo.userId !== session.userId) return;

  await prisma.todo.delete({ where: { id } });

  revalidatePath("/dashboard");
}
