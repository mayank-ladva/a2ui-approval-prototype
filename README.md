# A2UI Governed Workflow Prototype

This prototype demonstrates an A2UI `v0.9.1` surface with a dynamic order list, row actions, host-enforced role permissions, localization, conditional form fields, and interdependent form values.

## Run

```bash
pnpm install
pnpm dev
```

## Verify

1. Switch between Viewer, Editor, and Manager. Row actions and the create form change, while the host still authorizes every action.
2. Switch between English and Spanish. A2UI component labels and order status labels update without replacing the React host.
3. Select Delivery. The address field appears; select Pickup and it disappears.
4. Change Quantity or Unit price. Calculated total and approval guidance update immediately.
5. Create, approve, view, and delete orders. The host audit panel records allowed and denied operations.

## Documentation

- [Architecture](docs/architecture.md)
- [Engineering guidelines](docs/engineering_guidelines.md)
- [Module blueprint](docs/module_blueprint.md)
- [Agent context](docs/agent_context.md)

## Boundaries

This remains a local protocol prototype. It has no backend, database, authentication provider, durable audit store, or AI-generated message transport. The host-side policy checks model where production authorization belongs, but they are not a replacement for server authorization.
