import type { A2uiMessage } from "@a2ui/web_core/v0_9";
import { formatMoney, getCopy, getRoleLabel, getStatusLabel } from "./workflowLocalization";
import { accessSummary, can, orderActionChildren } from "./workflowPolicy";
import type {
  FormErrors,
  Fulfillment,
  Locale,
  OrderRecord,
  OrderStatus,
  Role,
} from "./workflowTypes";

export const WORKFLOW_SURFACE_ID = "workflow-demo";

export const DEFAULT_ROLE: Role = "manager";
export const DEFAULT_LOCALE: Locale = "en";
export const DEFAULT_FULFILLMENT: Fulfillment = "pickup";

const CATALOG_ID =
  "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json";

function action(name: string, context: Record<string, unknown> = {}) {
  return {
    event: {
      name,
      context,
    },
  };
}

export function workflowUiMessage(
  locale: Locale,
  role: Role,
  fulfillment: Fulfillment,
  errors: FormErrors = {},
): A2uiMessage {
  const copy = getCopy(locale);
  const showForm = can(role, "submit_order");
  const formChildren = [
    "customer-field",
    "quantity-price-row",
    "fulfillment-picker",
  ];

  if (fulfillment === "delivery") {
    formChildren.push("address-field");
  }

  formChildren.push(
    "calculated-total-label",
    "calculated-total-value",
    "approval-message",
    "submit-button",
  );

  const pageChildren = [
    "surface-title",
    "surface-description",
    "top-divider",
    "controls-title",
    "runtime-controls",
    "access-summary",
    "orders-divider",
    "orders-title",
    "orders-header",
    "orders-header-divider",
    "orders-list",
    "status-message",
    "form-divider",
  ];

  pageChildren.push(showForm ? "form-section" : "form-readonly-message");

  return {
    version: "v0.9.1",
    updateComponents: {
      surfaceId: WORKFLOW_SURFACE_ID,
      components: [
        { id: "root", component: "Card", child: "page-content" },
        {
          id: "page-content",
          component: "Column",
          align: "stretch",
          children: pageChildren,
        },
        {
          id: "surface-title",
          component: "Text",
          text: copy.pageTitle,
          variant: "h2",
        },
        {
          id: "surface-description",
          component: "Text",
          text: copy.pageDescription,
          variant: "body",
        },
        { id: "top-divider", component: "Divider" },
        {
          id: "controls-title",
          component: "Text",
          text: copy.controlsTitle,
          variant: "h3",
        },
        {
          id: "runtime-controls",
          component: "Row",
          align: "start",
          children: ["role-picker", "locale-picker"],
        },
        {
          id: "role-picker",
          component: "ChoicePicker",
          label: copy.roleLabel,
          variant: "mutuallyExclusive",
          displayStyle: "chips",
          weight: 1,
          options: [
            { label: copy.roleViewer, value: "viewer" },
            { label: copy.roleEditor, value: "editor" },
            { label: copy.roleManager, value: "manager" },
          ],
          value: { path: "/session/roleSelection" },
        },
        {
          id: "locale-picker",
          component: "ChoicePicker",
          label: copy.localeLabel,
          variant: "mutuallyExclusive",
          displayStyle: "chips",
          weight: 1,
          options: [
            { label: copy.localeEnglish, value: "en" },
            { label: copy.localeSpanish, value: "es" },
          ],
          value: { path: "/session/localeSelection" },
        },
        {
          id: "access-summary",
          component: "Text",
          text: { path: "/session/accessSummary" },
          variant: "caption",
        },
        { id: "orders-divider", component: "Divider" },
        {
          id: "orders-title",
          component: "Text",
          text: copy.ordersTitle,
          variant: "h3",
        },
        {
          id: "orders-header",
          component: "Row",
          align: "center",
          children: [
            "order-id-header",
            "customer-header",
            "total-header",
            "status-header",
            "actions-header",
          ],
        },
        {
          id: "order-id-header",
          component: "Text",
          text: copy.orderId,
          variant: "caption",
          weight: 1,
        },
        {
          id: "customer-header",
          component: "Text",
          text: copy.customer,
          variant: "caption",
          weight: 1.5,
        },
        {
          id: "total-header",
          component: "Text",
          text: copy.total,
          variant: "caption",
          weight: 1,
        },
        {
          id: "status-header",
          component: "Text",
          text: copy.status,
          variant: "caption",
          weight: 1,
        },
        {
          id: "actions-header",
          component: "Text",
          text: copy.actions,
          variant: "caption",
          weight: 2.5,
        },
        { id: "orders-header-divider", component: "Divider" },
        {
          id: "orders-list",
          component: "List",
          direction: "vertical",
          align: "stretch",
          listStyle: "none",
          children: { componentId: "order-entry", path: "/orders" },
        },
        {
          id: "order-entry",
          component: "Column",
          align: "stretch",
          children: ["order-row", "order-row-divider"],
        },
        {
          id: "order-row",
          component: "Row",
          align: "center",
          children: [
            "order-id",
            "order-customer",
            "order-total",
            "order-status",
            "order-actions",
          ],
        },
        {
          id: "order-id",
          component: "Text",
          text: { path: "id" },
          weight: 1,
        },
        {
          id: "order-customer",
          component: "Text",
          text: { path: "customer" },
          weight: 1.5,
        },
        {
          id: "order-total",
          component: "Text",
          text: { path: "totalLabel" },
          weight: 1,
        },
        {
          id: "order-status",
          component: "Text",
          text: { path: "statusLabel" },
          weight: 1,
        },
        {
          id: "order-actions",
          component: "Row",
          align: "center",
          weight: 2.5,
          children: orderActionChildren(role),
        },
        {
          id: "view-label",
          component: "Text",
          text: copy.view,
          variant: "caption",
        },
        {
          id: "view-button",
          component: "Button",
          child: "view-label",
          variant: "borderless",
          action: action("view_order", {
            orderId: { path: "id" },
            customer: { path: "customer" },
          }),
        },
        {
          id: "approve-label",
          component: "Text",
          text: copy.approve,
          variant: "caption",
        },
        {
          id: "approve-button",
          component: "Button",
          child: "approve-label",
          action: action("approve_order", { orderId: { path: "id" } }),
        },
        {
          id: "delete-label",
          component: "Text",
          text: copy.delete,
          variant: "caption",
        },
        {
          id: "delete-button",
          component: "Button",
          child: "delete-label",
          action: action("delete_order", { orderId: { path: "id" } }),
        },
        { id: "order-row-divider", component: "Divider" },
        {
          id: "status-message",
          component: "Text",
          text: { path: "/ui/statusMessage" },
          variant: "caption",
        },
        { id: "form-divider", component: "Divider" },
        {
          id: "form-section",
          component: "Column",
          align: "stretch",
          children: ["form-title", "form-fields"],
        },
        {
          id: "form-title",
          component: "Text",
          text: copy.formTitle,
          variant: "h3",
        },
        {
          id: "form-fields",
          component: "Column",
          align: "stretch",
          children: formChildren,
        },
        {
          id: "customer-field",
          component: "TextField",
          label: copy.customer,
          value: { path: "/form/customer" },
          variant: "shortText",
          isValid: !errors.customer,
          validationErrors: errors.customer ? [errors.customer] : [],
        },
        {
          id: "quantity-price-row",
          component: "Row",
          align: "start",
          children: ["quantity-field", "unit-price-field"],
        },
        {
          id: "quantity-field",
          component: "TextField",
          label: copy.quantity,
          value: { path: "/form/quantity" },
          variant: "number",
          weight: 1,
          isValid: !errors.quantity,
          validationErrors: errors.quantity ? [errors.quantity] : [],
        },
        {
          id: "unit-price-field",
          component: "TextField",
          label: copy.unitPrice,
          value: { path: "/form/unitPrice" },
          variant: "number",
          weight: 1,
          isValid: !errors.unitPrice,
          validationErrors: errors.unitPrice ? [errors.unitPrice] : [],
        },
        {
          id: "fulfillment-picker",
          component: "ChoicePicker",
          label: copy.fulfillment,
          variant: "mutuallyExclusive",
          displayStyle: "chips",
          options: [
            { label: copy.pickup, value: "pickup" },
            { label: copy.delivery, value: "delivery" },
          ],
          value: { path: "/form/fulfillmentSelection" },
        },
        {
          id: "address-field",
          component: "TextField",
          label: copy.address,
          value: { path: "/form/address" },
          variant: "longText",
          isValid: !errors.address,
          validationErrors: errors.address ? [errors.address] : [],
        },
        {
          id: "calculated-total-label",
          component: "Text",
          text: copy.calculatedTotal,
          variant: "caption",
        },
        {
          id: "calculated-total-value",
          component: "Text",
          text: { path: "/form/totalLabel" },
          variant: "h3",
        },
        {
          id: "approval-message",
          component: "Text",
          text: { path: "/form/approvalMessage" },
          variant: "body",
        },
        { id: "submit-label", component: "Text", text: copy.submit },
        {
          id: "submit-button",
          component: "Button",
          child: "submit-label",
          variant: "primary",
          action: action("submit_order"),
        },
        {
          id: "form-readonly-message",
          component: "Text",
          text: copy.viewerFormMessage,
          variant: "body",
        },
      ],
    },
  };
}

export function workflowDataMessage(path: string, value: unknown): A2uiMessage {
  return {
    version: "v0.9.1",
    updateDataModel: {
      surfaceId: WORKFLOW_SURFACE_ID,
      path,
      value,
    },
  };
}

export function localizeOrders(
  orders: OrderRecord[],
  locale: Locale,
): OrderRecord[] {
  return orders.map((order) => ({
    ...order,
    totalLabel: formatMoney(order.total, locale),
    statusLabel: getStatusLabel(order.status, locale),
  }));
}

export function createOrderRecord(
  id: string,
  customer: string,
  total: number,
  status: OrderStatus,
  locale: Locale,
): OrderRecord {
  return {
    id,
    customer,
    total,
    totalLabel: formatMoney(total, locale),
    status,
    statusLabel: getStatusLabel(status, locale),
  };
}

const initialOrders = [
  createOrderRecord("ORD-1001", "Asha Patel", 750, "Pending", DEFAULT_LOCALE),
  createOrderRecord("ORD-1002", "Rahul Shah", 1250, "Approved", DEFAULT_LOCALE),
  createOrderRecord("ORD-1003", "Marta Ruiz", 420, "Pending", DEFAULT_LOCALE),
];

const initialCopy = getCopy(DEFAULT_LOCALE);
const initialTotal = 500;

export const initialWorkflowMessages: A2uiMessage[] = [
  {
    version: "v0.9.1",
    createSurface: {
      surfaceId: WORKFLOW_SURFACE_ID,
      catalogId: CATALOG_ID,
      sendDataModel: true,
    },
  },
  workflowUiMessage(DEFAULT_LOCALE, DEFAULT_ROLE, DEFAULT_FULFILLMENT),
  {
    version: "v0.9.1",
    updateDataModel: {
      surfaceId: WORKFLOW_SURFACE_ID,
      value: {
        session: {
          role: DEFAULT_ROLE,
          roleSelection: [DEFAULT_ROLE],
          roleLabel: getRoleLabel(DEFAULT_ROLE, DEFAULT_LOCALE),
          locale: DEFAULT_LOCALE,
          localeSelection: [DEFAULT_LOCALE],
          accessSummary: accessSummary(DEFAULT_ROLE),
        },
        orders: initialOrders,
        form: {
          customer: "",
          quantity: "2",
          unitPrice: "250",
          fulfillment: DEFAULT_FULFILLMENT,
          fulfillmentSelection: [DEFAULT_FULFILLMENT],
          address: "",
          total: initialTotal,
          totalLabel: formatMoney(initialTotal, DEFAULT_LOCALE),
          approvalRequired: false,
          approvalMessage: initialCopy.approvalNotRequired,
        },
        ui: {
          statusMessage: initialCopy.ready,
        },
      },
    },
  },
];
