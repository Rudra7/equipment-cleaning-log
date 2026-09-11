# Notes

## Key decisions

* **Equipment retirement instead of physical deletion:** `DELETE /api/equipment/:id` changes an equipment item’s status from `active` to `retired`. This preserves related cleaning records and audit history while providing the expected delete operation.

* **Separate, field-level audit table:** Cleaning records store only their current state. Each tracked field change creates an immutable audit row containing the previous value, new value, actor, and timestamp. This makes audit history straightforward to query and display.

* **Atomic record and audit updates:** Cleaning-record mutations and their audit entries are written in one database transaction. This prevents a record change from being persisted without its matching audit trail.

* **Consistent cleaning-record routes:** All cleaning-record endpoints begin with `/api/cleaning-records`. Equipment scope is provided through `equipmentId`.

* **Offset pagination with stable ordering:** Records use `cleanedAt DESC, id DESC` ordering and support page number, page size, and status filtering. The secondary ID sort makes the result order deterministic when timestamps are the same.

* **Retired equipment behavior:** Retired equipment and its historical records remain viewable, but no new cleaning records can be created for it.

* **Development actor:** The audit actor is taken from the `X-User-Id` request header, with a local development fallback. This keeps actor attribution explicit without adding a full authentication flow.

## Trade-offs

* **Offset rather than cursor pagination:** Offset pagination provides total counts and simple numbered-page navigation, which suits this application’s expected scale. Cursor pagination would be more efficient for very large or frequently changing datasets.

* **One audit row per changed field:** This produces more rows than storing one JSON change object per update, but makes field-level traceability and the audit-history UI simpler and clearer.

* **Soft equipment deletion:** Retired equipment remains in the database and list view, which adds a little UI handling but preserves cleaning and audit history.

* **React-Bootstrap over custom UI components:** React-Bootstrap was chosen to provide accessible tables, forms, modals, pagination, badges, and drawers quickly. This prioritizes core application behavior over a bespoke visual design system.

## Deliberately left out

To keep the implementation focused on the required data, audit, API, and user flows, the following were deliberately left out:

* Authentication and role-based authorization.
* Equipment reactivation workflow.
* Cleaning-record deletion or correction workflow.
* Cursor/keyset pagination.
* Advanced regulatory controls such as approval signatures, role-restricted verification, and retention policies.
* End-to-end browser tests.

## With more time

* Expand test coverage with more API integration tests for validation and error paths, transaction behavior, and retired-equipment rules; frontend tests for forms, filters, pagination, and audit-drawer interaction; and a small end-to-end happy-path test.
* Containerize the frontend and backend, and extend Docker Compose so `docker compose up --build` brings up PostgreSQL, applies migrations, starts the API, and serves the frontend in one command.
* Replace header-based identity with real authentication and authorization.
* Add optimistic concurrency control to prevent a user from silently overwriting another user’s changes.
* Consider cursor pagination for large or frequently changing cleaning-record histories.
* Add structured logging, metrics, CI, and audit export functionality.
