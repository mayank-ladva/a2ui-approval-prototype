import type { Role, WorkflowPermission } from "./workflowTypes";

const rolePermissions: Record<Role, ReadonlySet<WorkflowPermission>> = {
  viewer: new Set(["view_order"]),
  editor: new Set(["view_order", "approve_order", "submit_order"]),
  manager: new Set([
    "view_order",
    "approve_order",
    "delete_order",
    "submit_order",
  ]),
};

export function can(role: Role, permission: WorkflowPermission): boolean {
  return rolePermissions[role].has(permission);
}

export function orderActionChildren(role: Role): string[] {
  const children = ["view-button"];

  if (can(role, "approve_order")) {
    children.push("approve-button");
  }

  if (can(role, "delete_order")) {
    children.push("delete-button");
  }

  return children;
}

export function accessSummary(role: Role): string {
  const permissions = [...rolePermissions[role]].map((permission) =>
    permission.replaceAll("_", " "),
  );

  return `Host permissions: ${permissions.join(", ")}`;
}
