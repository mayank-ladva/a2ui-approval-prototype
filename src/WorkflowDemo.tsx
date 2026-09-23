import { useEffect, useState } from "react";
import {
  A2uiSurface,
  basicCatalog,
  type ReactComponentImplementation,
} from "@a2ui/react/v0_9";
import {
  MessageProcessor,
  type A2uiClientAction,
  type SurfaceModel,
} from "@a2ui/web_core/v0_9";
import {
  DEFAULT_FULFILLMENT,
  DEFAULT_LOCALE,
  DEFAULT_ROLE,
  WORKFLOW_SURFACE_ID,
  createOrderRecord,
  initialWorkflowMessages,
  localizeOrders,
  workflowDataMessage,
  workflowUiMessage,
} from "./workflowMessage";
import { formatMoney, getCopy, getRoleLabel } from "./workflowLocalization";
import { accessSummary, can } from "./workflowPolicy";
import type {
  AuditEntry,
  FormErrors,
  Fulfillment,
  Locale,
  OrderRecord,
  Role,
  WorkflowPermission,
} from "./workflowTypes";

function cloneMessages<T>(messages: T): T {
  return JSON.parse(JSON.stringify(messages)) as T;
}

function selectedValue<T extends string>(value: unknown, fallback: T): T {
  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0] as T;
  }

  return fallback;
}

function positiveNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

export default function WorkflowDemo() {
  const [surface, setSurface] =
    useState<SurfaceModel<ReactComponentImplementation> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);

  useEffect(() => {
    setAuditEntries([]);
    let activeSurface: SurfaceModel<ReactComponentImplementation> | null = null;
    let currentRole: Role = DEFAULT_ROLE;
    let currentLocale: Locale = DEFAULT_LOCALE;
    let currentFulfillment: Fulfillment = DEFAULT_FULFILLMENT;
    let auditId = 0;

    const addAudit = (
      action: string,
      outcome: AuditEntry["outcome"],
      detail: string,
    ) => {
      auditId += 1;
      const entry: AuditEntry = {
        id: auditId,
        timestamp: new Date().toLocaleTimeString(),
        action,
        outcome,
        detail,
      };
      setAuditEntries((entries) => [entry, ...entries].slice(0, 10));
    };

    const processor = new MessageProcessor<ReactComponentImplementation>(
      [basicCatalog],
      (action) => {
        if (activeSurface) {
          handleAction(processor, activeSurface, action);
        }
      },
      { version: "v0.9.1" },
    );

    const process = (...messages: ReturnType<typeof workflowDataMessage>[]) => {
      processor.processMessages(messages);
    };

    const renderUi = (errors: FormErrors = {}) => {
      processor.processMessages([
        workflowUiMessage(
          currentLocale,
          currentRole,
          currentFulfillment,
          errors,
        ),
      ]);
    };

    const updateDerivedForm = (
      model: SurfaceModel<ReactComponentImplementation>["dataModel"],
    ) => {
      const quantity = positiveNumber(model.get("/form/quantity"));
      const unitPrice = positiveNumber(model.get("/form/unitPrice"));
      const total = quantity * unitPrice;
      const approvalRequired = total > 1000;
      const copy = getCopy(currentLocale);

      process(
        workflowDataMessage("/form/total", total),
        workflowDataMessage("/form/totalLabel", formatMoney(total, currentLocale)),
        workflowDataMessage("/form/approvalRequired", approvalRequired),
        workflowDataMessage(
          "/form/approvalMessage",
          approvalRequired ? copy.approvalRequired : copy.approvalNotRequired,
        ),
      );
    };

    const deny = (
      permission: WorkflowPermission,
      orderId: string | undefined,
    ) => {
      const copy = getCopy(currentLocale);
      process(workflowDataMessage("/ui/statusMessage", copy.actionDenied));
      addAudit(
        permission,
        "denied",
        `${currentRole} cannot act on ${orderId ?? "the form"}`,
      );
    };

    const isAllowed = (
      permission: WorkflowPermission,
      orderId?: string,
    ): boolean => {
      const roleFromModel = activeSurface?.dataModel.get("/session/role");
      const trustedRole: Role =
        roleFromModel === "viewer" ||
        roleFromModel === "editor" ||
        roleFromModel === "manager"
          ? roleFromModel
          : "viewer";

      if (!can(trustedRole, permission)) {
        deny(permission, orderId);
        return false;
      }

      return true;
    };

    const updateOrders = (orders: OrderRecord[]) => {
      processor.processMessages([
        workflowDataMessage("/orders", localizeOrders(orders, currentLocale)),
      ]);
    };

    const validateForm = (
      model: SurfaceModel<ReactComponentImplementation>["dataModel"],
    ): FormErrors => {
      const copy = getCopy(currentLocale);
      const errors: FormErrors = {};
      const customer = String(model.get("/form/customer") ?? "").trim();
      const quantity = positiveNumber(model.get("/form/quantity"));
      const unitPrice = positiveNumber(model.get("/form/unitPrice"));
      const address = String(model.get("/form/address") ?? "").trim();

      if (!customer) errors.customer = copy.customerRequired;
      if (!quantity) errors.quantity = copy.quantityInvalid;
      if (!unitPrice) errors.unitPrice = copy.unitPriceInvalid;
      if (currentFulfillment === "delivery" && !address) {
        errors.address = copy.addressRequired;
      }

      return errors;
    };

    function handleAction(
      currentProcessor: MessageProcessor<ReactComponentImplementation>,
      currentSurface: SurfaceModel<ReactComponentImplementation>,
      action: A2uiClientAction,
    ) {
      const model = currentSurface.dataModel;
      const copy = getCopy(currentLocale);
      const orderId =
        typeof action.context?.orderId === "string"
          ? action.context.orderId
          : undefined;

      if (action.name === "view_order") {
        if (!isAllowed("view_order", orderId)) return;
        const customer = String(action.context?.customer ?? "");
        process(
          workflowDataMessage(
            "/ui/statusMessage",
            `${copy.orderViewed} ${orderId}: ${customer}`,
          ),
        );
        addAudit("view_order", "allowed", orderId ?? "unknown order");
        return;
      }

      if (action.name === "approve_order") {
        if (!isAllowed("approve_order", orderId)) return;
        const orders = (model.get("/orders") ?? []) as OrderRecord[];
        const nextOrders = orders.map((order) =>
          order.id === orderId ? { ...order, status: "Approved" as const } : order,
        );
        updateOrders(nextOrders);
        process(
          workflowDataMessage(
            "/ui/statusMessage",
            `${copy.orderApproved} ${orderId}`,
          ),
        );
        addAudit("approve_order", "allowed", orderId ?? "unknown order");
        return;
      }

      if (action.name === "delete_order") {
        if (!isAllowed("delete_order", orderId)) return;
        const orders = (model.get("/orders") ?? []) as OrderRecord[];
        updateOrders(orders.filter((order) => order.id !== orderId));
        process(
          workflowDataMessage(
            "/ui/statusMessage",
            `${copy.orderDeleted} ${orderId}`,
          ),
        );
        addAudit("delete_order", "allowed", orderId ?? "unknown order");
        return;
      }

      if (action.name === "submit_order") {
        if (!isAllowed("submit_order")) return;
        const errors = validateForm(model);
        renderUi(errors);

        if (Object.keys(errors).length > 0) {
          addAudit("submit_order", "denied", "Form validation failed");
          return;
        }

        const orders = (model.get("/orders") ?? []) as OrderRecord[];
        const customer = String(model.get("/form/customer")).trim();
        const total = Number(model.get("/form/total"));
        const nextNumber =
          orders.reduce((largest, order) => {
            const number = Number(order.id.replace("ORD-", ""));
            return Number.isFinite(number) ? Math.max(largest, number) : largest;
          }, 1000) + 1;
        const createdOrder = createOrderRecord(
          `ORD-${nextNumber}`,
          customer,
          total,
          "Pending",
          currentLocale,
        );

        updateOrders([...orders, createdOrder]);
        currentProcessor.processMessages([
          workflowDataMessage("/form/customer", ""),
          workflowDataMessage("/form/address", ""),
          workflowDataMessage(
            "/ui/statusMessage",
            `${copy.orderCreated} ${createdOrder.id}`,
          ),
        ]);
        addAudit("submit_order", "allowed", createdOrder.id);
      }
    }

    const surfaceSubscription = processor.onSurfaceCreated((createdSurface) => {
      if (createdSurface.id === WORKFLOW_SURFACE_ID) {
        activeSurface = createdSurface;
        setSurface(createdSurface);
      }
    });

    const dataSubscriptions: Array<{ unsubscribe: () => void }> = [];

    try {
      processor.processMessages(cloneMessages(initialWorkflowMessages));

      const createdSurface = processor.model.surfacesMap.get(
        WORKFLOW_SURFACE_ID,
      );

      if (!createdSurface) {
        throw new Error("The workflow surface was not created.");
      }

      activeSurface = createdSurface;
      const model = createdSurface.dataModel;

      dataSubscriptions.push(
        model.subscribe("/session/roleSelection", (value) => {
          currentRole = selectedValue<Role>(value, "viewer");
          process(
            workflowDataMessage("/session/role", currentRole),
            workflowDataMessage(
              "/session/roleLabel",
              getRoleLabel(currentRole, currentLocale),
            ),
            workflowDataMessage(
              "/session/accessSummary",
              accessSummary(currentRole),
            ),
            workflowDataMessage(
              "/ui/statusMessage",
              getCopy(currentLocale).roleChanged,
            ),
          );
          renderUi();
          addAudit("role_changed", "info", currentRole);
        }),
        model.subscribe("/session/localeSelection", (value) => {
          currentLocale = selectedValue<Locale>(value, "en");
          const copy = getCopy(currentLocale);
          const orders = (model.get("/orders") ?? []) as OrderRecord[];
          process(
            workflowDataMessage("/session/locale", currentLocale),
            workflowDataMessage(
              "/session/roleLabel",
              getRoleLabel(currentRole, currentLocale),
            ),
            workflowDataMessage("/orders", localizeOrders(orders, currentLocale)),
            workflowDataMessage("/ui/statusMessage", copy.localeChanged),
          );
          updateDerivedForm(model);
          renderUi();
          addAudit("locale_changed", "info", currentLocale);
        }),
        model.subscribe("/form/fulfillmentSelection", (value) => {
          currentFulfillment = selectedValue<Fulfillment>(value, "pickup");
          process(
            workflowDataMessage("/form/fulfillment", currentFulfillment),
            workflowDataMessage(
              "/ui/statusMessage",
              getCopy(currentLocale).fulfillmentChanged,
            ),
          );
          renderUi();
          addAudit("fulfillment_changed", "info", currentFulfillment);
        }),
        model.subscribe("/form/quantity", () => updateDerivedForm(model)),
        model.subscribe("/form/unitPrice", () => updateDerivedForm(model)),
      );

      updateDerivedForm(model);
      addAudit("surface_ready", "info", "A2UI workflow initialized");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }

    return () => {
      surfaceSubscription.unsubscribe();
      for (const subscription of dataSubscriptions) {
        subscription.unsubscribe();
      }
      processor.model.dispose();
      activeSurface = null;
    };
  }, []);

  return (
    <main className="app-shell workflow-shell">
      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">A2UI v0.9.1 workflow prototype</p>
        <h1 id="page-title">Governed Dynamic UI</h1>
        <p>
          The main surface is declarative A2UI. The React host owns policy,
          localization orchestration, dependent rules, and action execution.
        </p>
      </section>

      <section className="workspace workflow-workspace">
        <div className="renderer-panel">
          {error ? <pre className="error">{error}</pre> : null}
          <div className="a2ui-renderer workflow-renderer">
            {surface ? (
              <A2uiSurface surface={surface} />
            ) : (
              <p>Loading A2UI workflow surface...</p>
            )}
          </div>
        </div>

        <aside className="debug-panel workflow-audit" aria-label="Host policy audit">
          <p className="eyebrow">Trusted host boundary</p>
          <h2>Policy audit</h2>
          <p>
            Hidden buttons improve the UI, but every action is authorized again
            here before data changes.
          </p>
          <ol className="audit-list">
            {auditEntries.map((entry) => (
              <li className={`audit-entry ${entry.outcome}`} key={entry.id}>
                <strong>{entry.action}</strong>
                <span>{entry.detail}</span>
                <small>{entry.timestamp}</small>
              </li>
            ))}
          </ol>
        </aside>
      </section>
    </main>
  );
}
