"use client";

import { useQuery } from "@tanstack/react-query";
import { getTodosAction } from "../actions/todo-actions";
import { TodoCard } from "@/components/todo-card";
import { authClient } from "@/lib/auth-client";
import { CreateTodoDialog } from "@/components/create-todo-dialog";
import Link from "next/link";

type ExtendedUser = {
  id: string;
  email: string;
  name: string;
  role: "user" | "manager" | "admin";
};

export default function Dashboard() {
  const { data: session, isPending } = authClient.useSession();

  const { data: todos, isLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: () => getTodosAction(),
    // Only run the query if we have a session
    enabled: !!session,
  });

  // Cast the user to our extended type
  const user = session?.user as ExtendedUser | undefined;

  if (isPending) return <div>Loading session...</div>;
  if (!user)
    return (
      <div className="flex justify-center h-screen items-center gap-x-2">
        Please login to continue.
        <Link
          href="/sign-in"
          className="px-6 py-2 text-primary hover:underline font-medium bg-blue-400 rounded-2xl"
        >
          Sign In
        </Link>
      </div>
    );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Tasks</h1>
          <p className="text-muted-foreground">Logged in as: {user.role}</p>
        </div>

        {/* ABAC Enforcement: Only 'user' can see the Create button  */}
        {user.role === "user" && <CreateTodoDialog />}
      </div>

      {isLoading ? (
        <div>Loading todos...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {todos?.map((todo) => (
            <TodoCard key={todo.id} todo={todo as any} currentUser={user} />
          ))}
          {todos?.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-10">
              No todos found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
