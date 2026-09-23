# Engineering Guidelines

## Language and naming

- Keep source code, identifiers, comments, documentation, and default UI copy in English.
- Discussions may use Gujarati, but do not add Gujarati strings to the product unless localization requirements explicitly change.
- Use stable English machine values for roles, permissions, statuses, events, and data paths.
- Localize display labels, never protocol identifiers.

## A2UI boundaries

- Keep A2UI payloads JSON-serializable. Do not place functions, dates, class instances, or secrets in messages.
- Use the versioned imports `@a2ui/react/v0_9` and `@a2ui/web_core/v0_9`.
- Every surface must have one `root` component.
- Reuse stable component IDs when sending `updateComponents`.
- Treat all future agent-produced messages as untrusted input and validate them against the negotiated catalog.
- Do not create custom catalog components until the basic catalog is proven insufficient for a specific requirement.

## Security and governance

- UI visibility is not authorization.
- Recheck every state-changing action in the trusted host and again on the future backend.
- Resolve roles from trusted session/backend state in production, not from editable A2UI data.
- Allow-list action names and reject unknown actions.
- Never send credentials, tokens, or unnecessary personal data in action context or debug output.
- Add payload size, component count, list length, and recursion limits before accepting remote A2UI streams.

## Data and business rules

- Maintain one canonical machine value and separate display labels.
- Put simple display-only formatting in A2UI functions when practical.
- Put permission decisions, multi-field business rules, persistence, and side effects in the host/backend.
- Avoid storing duplicate derived data unless the UI or protocol needs it. When duplicated, update all derived fields in one controlled function.
- Subscribe narrowly to the paths that trigger a rule.
- Ensure subscription callbacks cannot create update loops.

## Localization

- Add locales through `workflowLocalization.ts`.
- Every locale must implement the same translation keys.
- Keep option values stable while translating option labels.
- Use `Intl` for currency, number, and date formatting.
- Re-run validation after a locale change if validation messages are visible.

## Actions and audit

- Use semantic event names such as `approve_order`, not presentation names such as `green_button_clicked`.
- Include only the minimum stable context needed to identify a target.
- Re-read mutable data from the trusted model/backend before applying an action.
- Record action, outcome, actor/role, target, and timestamp in production audit logs.

## Verification

Before handing off a change:

```bash
pnpm build
```

Manually test all roles, both locales, pickup/delivery switching, invalid form submission, total recalculation, and every row action. A production version should add unit tests for policy and localization modules plus integration tests for message processing and action denial.
