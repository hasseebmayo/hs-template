# @repo/core

Shared backend core utilities for Hono/OpenAPI apps in this monorepo.

This package provides a stable public API organized by domain entrypoints:

- `@repo/core` (root barrel)
- `@repo/core/lib`
- `@repo/core/routing`
- `@repo/core/http`
- `@repo/core/utils`
- `@repo/core/openapi`
- `@repo/core/middleware`
- `@repo/core/status`
- `@repo/core/phrases`

## What this package includes

- App + router setup (`createApp`, `createRouter`)
- OpenAPI/Scalar docs setup (`configureOpenAPI`)
- Route helpers with schema-aware defaults (`createApiRoute`)
- Consistent response helpers (`successResponse`, `errorResponse`, `jsonSuccess`, `jsonError`)
- HTTP status/phrase primitives (`httpStatusCodes`, `httpPhrases`)
- OpenAPI schemas + middleware exports

## Quick usage

### Create app and configure docs

```ts
import { createApp, configureOpenAPI } from "@repo/core/lib";

const app = createApp();

configureOpenAPI(app, {
  title: "My API",
  version: "1.0.0",
});
```

### Create routes

```ts
import { createApiRoute } from "@repo/core/routing";

const getUsersRoute = createApiRoute({
  method: "get",
  path: "/users",
  tags: ["Users"],
  responses: {
    200: {
      description: "Users list",
    },
  },
});
```

## Route default error schema behavior

`createApiRoute` now applies default 400/403/500 error response schemas **only when a JSON request body schema exists**.

- If no request body schema is provided, no default error schemas are injected.
- If a request body schema exists, it is passed to `createErrorSchema(schema)` so generated examples align with that schema.

This keeps OpenAPI output accurate and avoids noisy generic error schemas on schema-less routes.

## HTTP status and phrase APIs

Status and phrases use map-first, precompiled constants for predictable runtime performance and cleaner type inference.

### Preferred APIs

```ts
import { httpStatusCodes } from "@repo/core/status";
import { httpPhrases, getHttpPhrase } from "@repo/core/phrases";

const code = httpStatusCodes.BAD_REQUEST; // 400
const phraseByName = httpPhrases.BAD_REQUEST; // "Bad Request"
const phraseByCode = getHttpPhrase(code); // "Bad Request"
```

### Compatibility exports

Legacy named constants are still exported for backward compatibility (for example `BAD_REQUEST`, `INTERNAL_SERVER_ERROR`, etc.).

## Naming conventions

Canonical names are now aligned around `Api*` semantics and explicit helpers:

- `createApiRoute` (canonical)
- `createRouteApi` (compat alias)
- `createApiResponseSchema` (canonical)
- `createResponseSchema` (compat alias)
- `jsonOptionalResponse` (canonical)
- `jsonResponseOptional` (compat alias)

Prefer canonical names in new code.

## Entrypoints

### `@repo/core` (root)

Re-exports domain barrels:

- `http`
- `lib`
- `middleware`
- `openapi`
- `utils`

### `@repo/core/lib`

- `createApp`
- `createRouter`
- `configureOpenAPI`
- `createApiRoute` / `createRouteApi`
- Response helpers (`successResponse`, `errorResponse`, `jsonSuccess`, `jsonError`)

### `@repo/core/routing`

- Route helpers from `lib/route`

### `@repo/core/http`

- `httpStatusCodes`
- `httpPhrases`

### `@repo/core/middleware`

- `logger`
- `notFound`
- `onError`

### `@repo/core/openapi`

- OpenAPI helpers and schemas from:
  - `src/openapi/helpers`
  - `src/openapi/schemas`

### `@repo/core/utils`

Utility schema builders and helper types.

## Migration notes

- Prefer domain imports over deep file imports.
- Use `@repo/core/routing` for route helper imports.
- Use `@repo/core/status` and `@repo/core/phrases` map APIs in new code.
- Keep compatibility aliases only for incremental migration; avoid introducing new usage of old names.

## Build and typecheck

From repo root:

```bash
bun --bun run --filter @repo/core build
bun --bun run --filter @repo/core check-types
```
