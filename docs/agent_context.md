# Agent Context

Read this file first, then `architecture.md`, `engineering_guidelines.md`, and `module_blueprint.md` before changing the project.

## Objective

Evaluate A2UI as the declarative protocol foundation for a larger governed UI system. The current implementation intentionally uses only the official v0.9 React renderer and basic catalog; it does not add a custom renderer or compatibility layer.

## Current behavior

- Dynamic order list built with A2UI `List` and `Row`
- Row-scoped View, Approve, and Delete actions
- Viewer, Editor, and Manager role behavior
- Host-side authorization for every action
- English and Spanish runtime localization
- Pickup/delivery conditional address field
- Quantity and unit-price dependent total
- Total-based approval guidance
- Form validation and order creation
- Host audit panel

## Commands

```bash
pnpm install
pnpm dev
pnpm build
```

The project path is `/home/mayank-ladva/Desktop/A2UI/a2ui-approval-prototype`.

## Important constraints

- Protocol target: A2UI `v0.9.1`
- Renderer imports: versioned `/v0_9` paths
- Code, docs, and product UI remain English-first; Spanish exists only to prove localization
- Do not treat hidden components as authorization
- Do not upgrade to v1.0 Candidate without an explicit migration decision
- Do not remove the preserved login experiment unless explicitly requested
- Do not introduce a custom catalog merely to imitate a visual HTML table
- Preserve semantic actions and stable machine values across localization

## Known prototype limits

- Roles are selected locally and are not authenticated identities
- Data is in memory and disappears on refresh
- Audit entries are not durable
- There is no transport, backend, database, AI generator, catalog negotiation, or production schema gateway
- The basic catalog has no native table or general conditional-visibility component in this installed version

## Definition of done for future changes

- `pnpm build` passes
- No A2UI validation errors appear
- Viewer cannot mutate data even if a hidden action is triggered manually
- Editor cannot delete
- Manager can view, approve, delete, and create
- Both locales keep stable action values
- Dependent totals update without loops
- Pickup and delivery render the correct fields
- Documentation reflects any changed module or trust boundary
