
## Routing and content-management notes

The frontend now uses React Router with URL routes and lazy-loaded page modules. Legacy `?screen=...` URLs are redirected to their equivalent route for compatibility. User and admin route guards are enforced through the existing authentication context.

The Help Center is database-backed. Staff can manage help articles through the Admin Help Center. Public help content is served only when published.

Career, resource, and multimedia records use explicit publication states (`draft`, `published`, `archived`) with server-enforced transitions and audit logs.

Quiz publishing creates immutable `QuizVersion` snapshots. User attempts capture the published quiz version and question snapshot so later builder edits do not alter historical results.

## Routing and content-management notes

The frontend now uses React Router with URL routes and lazy-loaded page modules. Legacy `?screen=...` URLs are redirected to their equivalent route for compatibility. User and admin route guards are enforced through the existing authentication context.

The Help Center is database-backed. Staff can manage help articles through the Admin Help Center. Public help content is served only when published.

Career, resource, and multimedia records use explicit publication states (`draft`, `published`, `archived`) with server-enforced transitions and audit logs.

Quiz publishing creates immutable `QuizVersion` snapshots. User attempts capture the published quiz version and question snapshot so later builder edits do not alter historical results.
