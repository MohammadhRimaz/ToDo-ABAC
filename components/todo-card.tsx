"use client";

import { type InferSelectModel } from "drizzle-orm";
import { todo, user } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { checkPermission } from "@/lib/abac";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTodoAction } from "@/app/actions/todo-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { updateTodoAction } from "@/app/actions/todo-actions";
import { Trash2 } from "lucide-react";

export type User = InferSelectModel<typeof user>;
export type Todo = InferSelectModel<typeof todo>;

export function TodoCard({
  todo,
  currentUser,
}: {
  todo: Todo;
  currentUser: any;
}) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (newStatus: string) =>
      updateTodoAction(todo.id, { status: newStatus as any }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTodoAction(todo.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  // ABAC Check: Managers and Admins cannot update status
  const canUpdate =
    currentUser.role === "user" && todo.userId === currentUser.id;

  // ABAC Check for UI: Should we even show the delete button?
  const canDelete = checkPermission(currentUser, "delete", todo);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-bold">{todo.title}</CardTitle>
        <Badge variant={todo.status === "completed" ? "default" : "secondary"}>
          {todo.status.replace("_", " ")}
        </Badge>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{todo.description}</p>

        <div className="flex justify-between items-center">
          {/* Status Switcher (Only for the Owner) */}
          {canUpdate ? (
            <Select
              defaultValue={todo.status}
              onValueChange={(value) => updateMutation.mutate(value)}
              disabled={updateMutation.isPending}
            >
              <SelectTrigger className="w-35 h-8">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div /> // Empty div to keep layout consistent
          )}

          {canDelete && (
            // Delete Button
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
