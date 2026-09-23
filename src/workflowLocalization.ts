import type { Locale, OrderStatus, Role } from "./workflowTypes";

const translations = {
  en: {
    pageTitle: "Order Management",
    pageDescription:
      "A2UI table, localized form, role policies, and dependent values.",
    controlsTitle: "Runtime controls",
    roleLabel: "Role",
    localeLabel: "Language",
    roleViewer: "Viewer",
    roleEditor: "Editor",
    roleManager: "Manager",
    localeEnglish: "English",
    localeSpanish: "Spanish",
    ordersTitle: "Orders",
    orderId: "Order ID",
    customer: "Customer",
    total: "Total",
    status: "Status",
    actions: "Actions",
    view: "View",
    approve: "Approve",
    delete: "Delete",
    pending: "Pending",
    approved: "Approved",
    formTitle: "Create order",
    quantity: "Quantity",
    unitPrice: "Unit price",
    fulfillment: "Fulfillment",
    pickup: "Pickup",
    delivery: "Delivery",
    address: "Delivery address",
    calculatedTotal: "Calculated total",
    submit: "Create order",
    viewerFormMessage: "Viewer role cannot create or modify orders.",
    approvalRequired: "Manager approval is required because the total exceeds $1,000.",
    approvalNotRequired: "This order does not require manager approval.",
    ready: "Ready. Change a role, language, form value, or row action.",
    roleChanged: "Role changed. Visible actions and permissions were recalculated.",
    localeChanged: "Language changed. A2UI component labels were updated.",
    fulfillmentChanged: "Fulfillment changed. Conditional fields were recalculated.",
    orderViewed: "Opened order",
    orderApproved: "Approved order",
    orderDeleted: "Deleted order",
    actionDenied: "Action denied by the host authorization policy.",
    orderCreated: "Created order",
    customerRequired: "Customer name is required.",
    quantityInvalid: "Quantity must be greater than zero.",
    unitPriceInvalid: "Unit price must be greater than zero.",
    addressRequired: "Delivery address is required for delivery orders.",
  },
  es: {
    pageTitle: "Gestión de pedidos",
    pageDescription:
      "Tabla A2UI, formulario localizado, políticas de roles y valores dependientes.",
    controlsTitle: "Controles de ejecución",
    roleLabel: "Rol",
    localeLabel: "Idioma",
    roleViewer: "Lector",
    roleEditor: "Editor",
    roleManager: "Gerente",
    localeEnglish: "Inglés",
    localeSpanish: "Español",
    ordersTitle: "Pedidos",
    orderId: "ID del pedido",
    customer: "Cliente",
    total: "Total",
    status: "Estado",
    actions: "Acciones",
    view: "Ver",
    approve: "Aprobar",
    delete: "Eliminar",
    pending: "Pendiente",
    approved: "Aprobado",
    formTitle: "Crear pedido",
    quantity: "Cantidad",
    unitPrice: "Precio unitario",
    fulfillment: "Entrega",
    pickup: "Recogida",
    delivery: "Envío",
    address: "Dirección de entrega",
    calculatedTotal: "Total calculado",
    submit: "Crear pedido",
    viewerFormMessage: "El rol lector no puede crear ni modificar pedidos.",
    approvalRequired: "Se requiere aprobación porque el total supera los 1.000 $.",
    approvalNotRequired: "Este pedido no requiere aprobación del gerente.",
    ready: "Listo. Cambie un rol, idioma, valor del formulario o acción de fila.",
    roleChanged: "El rol cambió. Las acciones y permisos fueron recalculados.",
    localeChanged: "El idioma cambió. Las etiquetas A2UI fueron actualizadas.",
    fulfillmentChanged: "La entrega cambió. Los campos condicionales fueron recalculados.",
    orderViewed: "Pedido abierto",
    orderApproved: "Pedido aprobado",
    orderDeleted: "Pedido eliminado",
    actionDenied: "Acción denegada por la política de autorización del host.",
    orderCreated: "Pedido creado",
    customerRequired: "El nombre del cliente es obligatorio.",
    quantityInvalid: "La cantidad debe ser mayor que cero.",
    unitPriceInvalid: "El precio unitario debe ser mayor que cero.",
    addressRequired: "La dirección es obligatoria para pedidos con envío.",
  },
} as const;

export type WorkflowCopy = (typeof translations)[Locale];

export function getCopy(locale: Locale): WorkflowCopy {
  return translations[locale];
}

export function getRoleLabel(role: Role, locale: Locale): string {
  const copy = getCopy(locale);
  const labels: Record<Role, string> = {
    viewer: copy.roleViewer,
    editor: copy.roleEditor,
    manager: copy.roleManager,
  };

  return labels[role];
}

export function getStatusLabel(status: OrderStatus, locale: Locale): string {
  const copy = getCopy(locale);
  return status === "Approved" ? copy.approved : copy.pending;
}

export function formatMoney(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
