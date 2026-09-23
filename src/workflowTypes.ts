export type Locale = "en" | "es";

export type Role = "viewer" | "editor" | "manager";

export type Fulfillment = "pickup" | "delivery";

export type OrderStatus = "Pending" | "Approved";

export type WorkflowPermission =
  | "view_order"
  | "approve_order"
  | "delete_order"
  | "submit_order";

export interface OrderRecord {
  id: string;
  customer: string;
  total: number;
  totalLabel: string;
  status: OrderStatus;
  statusLabel: string;
}

export interface FormErrors {
  customer?: string;
  quantity?: string;
  unitPrice?: string;
  address?: string;
}

export interface AuditEntry {
  id: number;
  timestamp: string;
  action: string;
  outcome: "allowed" | "denied" | "info";
  detail: string;
}
