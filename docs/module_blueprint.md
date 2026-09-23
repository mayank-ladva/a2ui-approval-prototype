# Module Blueprint

## Current modules

### `src/workflowTypes.ts`

Owns shared domain types: locale, role, permissions, fulfillment, orders, form errors, and audit entries. It must not import React or A2UI.

### `src/workflowLocalization.ts`

Owns translation dictionaries and formatting helpers. Stable business values are inputs; localized labels are outputs.

### `src/workflowPolicy.ts`

Owns the role-to-permission matrix and helpers that derive visible row actions. It contains no UI rendering and no translations.

### `src/workflowMessage.ts`

Owns protocol-specific component trees and data messages. This is the primary A2UI boundary and the expected focus of a future v1.0 migration.

Exports:

- Surface and default constants
- Initial A2UI message stream
- Full UI update message builder
- Data update message builder
- Order localization and construction helpers

### `src/WorkflowDemo.tsx`

Owns the trusted runtime controller:

- Creates and disposes `MessageProcessor`
- Subscribes to relevant data paths
- Applies dependent-field rules
- Handles and authorizes actions
- Sends A2UI component/data updates
- Displays host-side audit evidence

### `src/main.tsx`

Mounts the active workflow application and global stylesheet.

### `src/App.tsx` and `src/loginMessages.ts`

Preserved earlier login experiment. They are not the current entry point and should not be mixed into workflow logic.

## Adding a role

1. Add the role to `Role` in `workflowTypes.ts`.
2. Add its permission set in `workflowPolicy.ts`.
3. Add localized labels in every translation dictionary.
4. Add the stable option value to the role picker.
5. Test visible actions and host-side denial independently.

## Adding an action

1. Add a semantic permission if the action changes state.
2. Add the A2UI button/action definition with minimal context.
3. Add the action to the role-derived child list.
4. Handle it in `WorkflowDemo.tsx`.
5. Authorize before mutation and write an audit result.

## Adding a locale

1. Extend `Locale`.
2. Add a complete dictionary.
3. Add a locale picker option with a stable value.
4. Update `Intl` locale mapping.
5. Test headings, row data, validation, status messages, and currency formatting.

## Adding a dependent field

1. Add its canonical data-model path.
2. Bind its A2UI component to that path.
3. Subscribe only to source paths.
4. Calculate derived values in one function.
5. Update derived paths without writing back to source paths.

## Moving to a backend

Replace local mutations with API calls while keeping A2UI event names and message builders stable. The backend should return authoritative data and permissions; the host should convert the result into `updateDataModel` or `updateComponents` messages.
