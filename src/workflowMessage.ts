import type { A2uiMessage } from "@a2ui/web_core/v0_9";

export const WORKFLOW_SURFACE_ID = "workflow-demo";

export const initialWorkflowMessages: A2uiMessage[] = [
  {
    version: "v0.9.1",
    createSurface: {
      surfaceId: WORKFLOW_SURFACE_ID,
      catalogId:
        "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json",
      sendDataModel: true,
    },
  },
  {
    version: "v0.9.1",
    updateComponents: {
      surfaceId: WORKFLOW_SURFACE_ID,
      components: [
        {
          id: "root",
          component: "Card",
          child: "page-content",
        },
        {
          id: "page-content",
          component: "Column",
          align: "stretch",
          children: [
            "page-title",
            "page-description",
            "role-label",
            "role-value",
          ],
        },
        {
          id: "page-title",
          component: "Text",
          text: "Order Management",
          variant: "h2",
        },
        {
          id: "page-description",
          component: "Text",
          text: "A2UI table, form, roles, and dependent values demo.",
          variant: "body",
        },
        {
          id: "role-label",
          component: "Text",
          text: "Current role:",
          variant: "caption",
        },
        {
          id: "role-value",
          component: "Text",
          text: {
            path: "/session/role",
          },
          variant: "body",
        },
      ],
    },
  },
  {
    version: "v0.9.1",
    updateDataModel: {
      surfaceId: WORKFLOW_SURFACE_ID,
      value: {
        session: {
          role: "manager",
          locale: "en",
        },
        orders: [
          {
            id: "ORD-1001",
            customer: "Asha Patel",
            status: "Pending",
          },
          {
            id: "ORD-1002",
            customer: "Rahul Shah",
            status: "Approved",
          },
        ],
        form: {
          quantity: 1,
          unitPrice: 250,
          total: 250,
        },
      },
    },
  },
];