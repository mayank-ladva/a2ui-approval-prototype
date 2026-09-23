import type { A2uiMessage } from "@a2ui/web_core/v0_9";

export const LOGIN_SURFACE_ID = "login-page";

const loginAction = {
  event: {
    name: "login_submitted",
    context: {
      username: { path: "/login/username" },
      password: { path: "/login/password" },
      rememberMe: { path: "/login/rememberMe" },
    },
  },
};

export function loginFieldComponents(options: { usernameError?: string; passwordError?: string } = {}) {
  const usernameInvalid = Boolean(options.usernameError);
  const passwordInvalid = Boolean(options.passwordError);

  return [
    {
      id: "username-field",
      component: "TextField",
      label: "Email",
      variant: "shortText",
      value: { path: "/login/username" },
      isValid: !usernameInvalid,
      validationErrors: usernameInvalid ? [options.usernameError] : [],
    },
    {
      id: "password-field",
      component: "TextField",
      label: "Password",
      variant: "obscured",
      value: { path: "/login/password" },
      isValid: !passwordInvalid,
      validationErrors: passwordInvalid ? [options.passwordError] : [],
    },
  ];
}

export function loginValidationMessage(options: { usernameError?: string; passwordError?: string }): A2uiMessage {
  return {
    version: "v0.9.1",
    updateComponents: {
      surfaceId: LOGIN_SURFACE_ID,
      components: loginFieldComponents(options),
    },
  };
}

export function loginStatusMessage(message: string): A2uiMessage {
  return {
    version: "v0.9.1",
    updateDataModel: {
      surfaceId: LOGIN_SURFACE_ID,
      path: "/login/statusMessage",
      value: message,
    },
  };
}

export function resetLoginMessages(): A2uiMessage[] {
  return [
    loginValidationMessage({}),
    {
      version: "v0.9.1",
      updateDataModel: {
        surfaceId: LOGIN_SURFACE_ID,
        path: "/login",
        value: {
          username: "",
          password: "",
          rememberMe: false,
          statusMessage: "Use the demo credentials to test the complete login flow.",
        },
      },
    },
  ];
}

export const initialLoginMessages: A2uiMessage[] = [
  {
    version: "v0.9.1",
    createSurface: {
      surfaceId: LOGIN_SURFACE_ID,
      catalogId: "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json",
      sendDataModel: true,
    },
  },
  {
    version: "v0.9.1",
    updateComponents: {
      surfaceId: LOGIN_SURFACE_ID,
      components: [
        { id: "root", component: "Card", child: "login-form" },
        {
          id: "login-form",
          component: "Column",
          align: "stretch",
          children: [
            "title",
            "subtitle",
            "demo-credentials",
            "divider",
            "username-field",
            "password-field",
            "remember-me",
            "submit-button",
            "status-message",
          ],
        },
        { id: "title", component: "Text", text: "Sign in", variant: "h2" },
        {
          id: "subtitle",
          component: "Text",
          text: "A normal login page rendered from A2UI messages.",
          variant: "body",
        },
        {
          id: "demo-credentials",
          component: "Text",
          text: "Demo: demo@example.com / password123",
          variant: "caption",
        },
        { id: "divider", component: "Divider" },
        ...loginFieldComponents(),
        {
          id: "remember-me",
          component: "CheckBox",
          label: "Remember me",
          value: { path: "/login/rememberMe" },
        },
        { id: "submit-label", component: "Text", text: "Login" },
        {
          id: "submit-button",
          component: "Button",
          child: "submit-label",
          variant: "primary",
          action: loginAction,
        },
        {
          id: "status-message",
          component: "Text",
          text: { path: "/login/statusMessage" },
          variant: "body",
        },
      ],
    },
  },
  {
    version: "v0.9.1",
    updateDataModel: {
      surfaceId: LOGIN_SURFACE_ID,
      value: {
        login: {
          username: "",
          password: "",
          rememberMe: false,
          statusMessage: "Use the demo credentials to test the complete login flow.",
        },
      },
    },
  },
];
