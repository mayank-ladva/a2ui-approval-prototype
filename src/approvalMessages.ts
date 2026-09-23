import type { A2uiMessage } from "@a2ui/web_core/v0_9";

export const APPROVAL_SURFACE_ID = "approval-form";

const submitAction = {
  event: {
    name: "approval_submitted",
    context: {
      requestId: { path: "/approval/id" },
      decisionNote: { path: "/approval/decisionNote" },
      reviewed: { path: "/approval/reviewed" },
      riskScore: { path: "/approval/riskScore" },
      tags: { path: "/approval/tags" },
      routing: { path: "/approval/routing" },
    },
  },
};

export function reviewFieldComponents(isInvalid = false) {
  return [
    {
      id: "reason-field",
      component: "TextField",
      label: "Decision note",
      variant: "longText",
      value: { path: "/approval/decisionNote" },
      isValid: !isInvalid,
      validationErrors: isInvalid ? ["A decision note is required before submitting."] : [],
    },
    {
      id: "submit-button",
      component: "Button",
      child: "submit-label",
      variant: "primary",
      isValid: !isInvalid,
      validationErrors: isInvalid ? ["Submission is disabled while validation fails."] : [],
      action: submitAction,
    },
  ];
}

export function validationStateMessage(isInvalid: boolean): A2uiMessage {
  return {
    version: "v0.9.1",
    updateComponents: {
      surfaceId: APPROVAL_SURFACE_ID,
      components: reviewFieldComponents(isInvalid),
    },
  };
}

export function serverRefreshMessages(refreshCount: number): A2uiMessage[] {
  return [
    {
      version: "v0.9.1",
      updateDataModel: {
        surfaceId: APPROVAL_SURFACE_ID,
        path: "/approval/status",
        value: `Server refresh received (${refreshCount})`,
      },
    },
    {
      version: "v0.9.1",
      updateDataModel: {
        surfaceId: APPROVAL_SURFACE_ID,
        path: "/approval/riskScore",
        value: Math.min(95, 55 + refreshCount * 10),
      },
    },
    {
      version: "v0.9.1",
      updateDataModel: {
        surfaceId: APPROVAL_SURFACE_ID,
        path: "/approval/riskLabel",
        value: refreshCount > 1 ? "Elevated" : "Moderate",
      },
    },
  ];
}

export const initialApprovalMessages: A2uiMessage[] = [
  {
    version: "v0.9.1",
    createSurface: {
      surfaceId: APPROVAL_SURFACE_ID,
      catalogId: "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json",
      sendDataModel: true,
    },
  },
  {
    version: "v0.9.1",
    updateComponents: {
      surfaceId: APPROVAL_SURFACE_ID,
      components: [
        { id: "root", component: "Card", child: "workflow" },
        {
          id: "workflow", 
          component: "Column",
          align: "stretch",
          children: ["title", "subtitle", "summary-row", "divider-top", "workflow-tabs"],
        },
        { id: "title", component: "Text", text: "Purchase approval stress test", variant: "h2" },
        {
          id: "subtitle",
          component: "Text",
          text: "A richer A2UI surface using tabs, list content, choice pickers, slider binding, validation state, and action context.",
          variant: "body",
        },
        {
          id: "summary-row",
          component: "Row",
          justify: "spaceBetween",
          children: ["request-id-block", "status-block", "risk-block"],
        },
        {
          id: "request-id-block",
          component: "Column",
          align: "start",
          children: ["request-id-label", "request-id-value"],
        },
        { id: "request-id-label", component: "Text", text: "Request ID", variant: "caption" },
        { id: "request-id-value", component: "Text", text: { path: "/approval/id" }, variant: "body" },
        {
          id: "status-block",
          component: "Column",
          align: "start",
          children: ["status-label", "status-value"],
        },
        { id: "status-label", component: "Text", text: "Status", variant: "caption" },
        { id: "status-value", component: "Text", text: { path: "/approval/status" }, variant: "body" },
        {
          id: "risk-block",
          component: "Column",
          align: "start",
          children: ["risk-label", "risk-value"],
        },
        { id: "risk-label", component: "Text", text: "Risk", variant: "caption" },
        { id: "risk-value", component: "Text", text: { path: "/approval/riskLabel" }, variant: "body" },
        { id: "divider-top", component: "Divider" },
        {
          id: "workflow-tabs",
          component: "Tabs",
          tabs: [
            { title: "Summary", child: "summary-tab" },
            { title: "Review", child: "review-tab" },
            { title: "Evidence", child: "evidence-tab" },
          ],
        },
        {
          id: "summary-tab",
          component: "Column",
          align: "stretch",
          children: [
            "requester-row",
            "amount-row",
            "vendor-row",
            "risk-slider",
            "routing-picker",
            "tag-picker",
            "policy-modal",
          ],
        },
        {
          id: "requester-row",
          component: "Row",
          justify: "spaceBetween",
          children: ["requester-label", "requester-value"],
        },
        { id: "requester-label", component: "Text", text: "Requested by", variant: "caption" },
        { id: "requester-value", component: "Text", text: { path: "/approval/requester" }, variant: "body" },
        {
          id: "amount-row",
          component: "Row",
          justify: "spaceBetween",
          children: ["amount-label", "amount-value"],
        },
        { id: "amount-label", component: "Text", text: "Amount", variant: "caption" },
        { id: "amount-value", component: "Text", text: { path: "/approval/amount" }, variant: "body" },
        {
          id: "vendor-row",
          component: "Row",
          justify: "spaceBetween",
          children: ["vendor-label", "vendor-value"],
        },
        { id: "vendor-label", component: "Text", text: "Vendor", variant: "caption" },
        { id: "vendor-value", component: "Text", text: { path: "/approval/vendor" }, variant: "body" },
        {
          id: "risk-slider",
          component: "Slider",
          label: "Risk score",
          min: 0,
          max: 100,
          value: { path: "/approval/riskScore" },
        },
        {
          id: "routing-picker",
          component: "ChoicePicker",
          label: "Routing decision",
          variant: "mutuallyExclusive",
          displayStyle: "chips",
          value: { path: "/approval/routing" },
          options: [
            { label: "Approve", value: "approve" },
            { label: "Escalate", value: "escalate" },
            { label: "Reject", value: "reject" },
          ],
        },
        {
          id: "tag-picker",
          component: "ChoicePicker",
          label: "Review tags",
          variant: "multipleSelection",
          displayStyle: "chips",
          filterable: true,
          value: { path: "/approval/tags" },
          options: [
            { label: "Budget", value: "budget" },
            { label: "Security", value: "security" },
            { label: "Urgent", value: "urgent" },
            { label: "Legal", value: "legal" },
          ],
        },
        {
          id: "policy-modal",
          component: "Modal",
          trigger: "policy-trigger",
          content: "policy-content",
        },
        { id: "policy-trigger", component: "Button", child: "policy-trigger-label", variant: "borderless" },
        { id: "policy-trigger-label", component: "Text", text: "Open policy notes" },
        {
          id: "policy-content",
          component: "Column",
          align: "stretch",
          children: ["policy-title", "policy-list"],
        },
        { id: "policy-title", component: "Text", text: "Policy notes", variant: "h3" },
        {
          id: "policy-list",
          component: "List",
          listStyle: "unordered",
          children: ["policy-1", "policy-2", "policy-3"],
        },
        { id: "policy-1", component: "Text", text: "Amount above INR 25,000 needs explicit reviewer note." },
        { id: "policy-2", component: "Text", text: "Security-tagged requests should be escalated if risk is above 70." },
        { id: "policy-3", component: "Text", text: "Action context must include routing, tags, and risk score." },
        {
          id: "review-tab",
          component: "Column",
          align: "stretch",
          children: ["reason-field", "acknowledgement", "submit-button"],
        },
        {
          id: "acknowledgement",
          component: "CheckBox",
          label: "I have reviewed the request and policy notes.",
          value: { path: "/approval/reviewed" },
        },
        { id: "submit-label", component: "Text", text: "Submit approval" },
        ...reviewFieldComponents(false),
        {
          id: "evidence-tab",
          component: "Column",
          align: "stretch",
          children: ["evidence-title", "evidence-list"],
        },
        { id: "evidence-title", component: "Text", text: "Evidence checklist", variant: "h3" },
        {
          id: "evidence-list",
          component: "List",
          listStyle: "ordered",
          children: ["evidence-1", "evidence-2", "evidence-3", "evidence-4"],
        },
        { id: "evidence-1", component: "Text", text: "Purchase order attached" },
        { id: "evidence-2", component: "Text", text: "Budget owner approved" },
        { id: "evidence-3", component: "Text", text: "Risk score bound to data model" },
        { id: "evidence-4", component: "Text", text: "Reviewer action emitted to host" },
      ],
    },
  },
  {
    version: "v0.9.1",
    updateDataModel: {
      surfaceId: APPROVAL_SURFACE_ID,
      value: {
        approval: {
          id: "APR-2026-0042",
          requester: "Nisha Patel",
          amount: "INR 48,500",
          vendor: "CloudOps India",
          status: "Pending review",
          riskLabel: "Moderate",
          riskScore: 55,
          routing: ["approve"],
          tags: ["budget"],
          decisionNote: "",
          reviewed: false,
        },
      },
    },
  },
];
