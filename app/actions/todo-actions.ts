"use server";

import { db } from "@/lib/db";
import { todo } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkPermission, getTodoAccessFilter } from "@/lib/abac";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Helper to get the current authenticated user
async function getAuthenticatedUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

// 1. READ: Fetch todos based on role permissions
export async function getTodosAction() {
  const user = await getAuthenticatedUser();
  const filter = getTodoAccessFilter(user as any);

  // If filter is undefined (Admin/Manager), fetch all. Otherwise, fetch own.
  return await db.select().from(todo).where(filter);
}

// 2. CREATE: Only 'User' role can create
export async function createTodoAction(data: {
  title: string;
  description?: string;
}) {
  const user = await getAuthenticatedUser();

  if (!checkPermission(user as any, "create")) {
    throw new Error("Managers and Admins cannot create todos.");
  }

  await db.insert(todo).values({
    ...data,
    userId: user.id,
    status: "draft",
  });

  // Using revalidatePath tells Next.js to update the cache instantly
  revalidatePath("/");
}

// 3. UPDATE: Only 'User' can update their own
export async function updateTodoAction(
  todoId: string,
  updates: Partial<{
    title: string;
    description: string;
    status: "draft" | "in_progress" | "completed";
  }>
) {
  const user = await getAuthenticatedUser();
  const existingTodo = await db.query.todo.findFirst({
    where: eq(todo.id, todoId),
  });

  if (!existingTodo || !checkPermission(user as any, "update", existingTodo)) {
    throw new Error("You do not have permission to update this todo.");
  }

  await db.update(todo).set(updates).where(eq(todo.id, todoId));
  revalidatePath("/");
}

// 4. DELETE: Complex logic for User vs Admin
export async function deleteTodoAction(todoId: string) {
  const user = await getAuthenticatedUser();
  const existingTodo = await db.query.todo.findFirst({
    where: eq(todo.id, todoId),
  });

  if (!existingTodo || !checkPermission(user as any, "delete", existingTodo)) {
    // Users can only delete drafts; Admins can delete anything; Managers can't delete.
    throw new Error("Delete failed: Check your role or the todo status.");
  }

  await db.delete(todo).where(eq(todo.id, todoId));
  revalidatePath("/");
}
