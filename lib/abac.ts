import { type InferSelectModel } from "drizzle-orm";
import { user, todo } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { todo as todoTable } from "@/lib/db/schema";

// 1. Define Types based on your Schema
// We infer types directly from the DB schema to keep things synced
export type User = InferSelectModel<typeof user>;
export type Todo = InferSelectModel<typeof todo>;
export type Action = "create" | "view" | "update" | "delete";

/**
 * THE PERMISSION MATRIX
 * * USER:
 * - View: Own todos only.
 * - Create: Yes.
 * - Update: Yes (Own todos).
 * - Delete: Own todos in 'draft' only.
 * * MANAGER:
 * - View: All todos.
 * - Create: No.
 * - Update: No.
 * - Delete: No.
 * * ADMIN:
 * - View: All todos.
 * - Create: No.
 * - Update: No.
 * - Delete: Any todo (regardless of status).
 */

export function checkPermission(
  currentUser: User,
  action: Action,
  resource?: Todo
): boolean {
  switch (currentUser.role) {
    case "admin":
      // Admin: "Can see all todos... Can delete any todo"
      if (action === "view") return true;
      if (action === "delete") return true;
      // Admin cannot create or update
      return false;

    case "manager":
      // Manager: "Can see all todos from all users"
      if (action === "view") return true;
      // Manager cannot create, update, or delete
      return false;

    case "user":
      // User: "Can only see their own todos"
      // User: "Create Todos: Yes"
      if (action === "create") return true;

      // For View/Update/Delete, we generally need the resource to check ownership
      if (!resource) return false;

      // Ownership Check: Users can only act on their OWN todos
      if (resource.userId !== currentUser.id) return false;

      if (action === "view") return true;
      if (action === "update") return true;

      // ABAC Twist: "Can only delete their own todos in draft state"
      if (action === "delete") {
        return resource.status === "draft";
      }

      return false;

    default:
      return false;
  }
}

export function getTodoAccessFilter(currentUser: User) {
  if (currentUser.role === "admin" || currentUser.role === "manager") {
    // They can see everything, so no filter is needed (undefined)
    return undefined;
  }

  // Regular users can only see their own rows
  return eq(todoTable.userId, currentUser.id);
}
