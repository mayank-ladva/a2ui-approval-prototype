# A2UI Login Page Prototype

This is a narrow A2UI research spike, not a production auth system. The login form is a fixed A2UI `v0.9.1` message stream rendered by the official `@a2ui/react` renderer.

## Run

```bash
pnpm dev
```

## Demo Credentials

```text
Email: demo@example.com
Password: password123
```

## What to Verify

1. The **Protocol parse** check passes and the login form appears.
2. Type in the email/password fields or toggle **Remember me**. The **Bound inputs** check should pass.
3. Click **Login** with empty or wrong credentials. The host receives the A2UI action and sends validation errors back through `updateComponents`.
4. Click **Login** with the demo credentials. The host accepts the action and sends a success message back through `updateDataModel`.
5. Click **Reset demo** to clear the A2UI data model and validation state.

## Explicitly Not Included

- No real authentication backend
- No token/session storage
- No AI-generated A2UI messages
- No custom component catalog or renderer
- No registry, version resolver, API gateway, or production security layer
