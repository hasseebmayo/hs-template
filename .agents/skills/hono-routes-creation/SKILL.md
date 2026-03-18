---
name: hono-routes-creation
description: Guidelines for creating API routes in Hono using the shared `@repo/core` utilities. Use `jsonContent` and `jsonContentRequired` for request bodies and params, always providing both a schema and a description. This skill should be used when adding new API routes or modifying existing ones in Hono-based apps within this monorepo. It covers best practices for route definition, request/response handling, error management, and OpenAPI documentation integration.
---

> **Companion rule:** [REST API Design Guidelines](rules/rest-api-design.md) — resource naming, HTTP methods, status codes, request/response formats, pagination, and versioning conventions that every route must follow.

---

## Architecture Overview

The API layer (`apps/api`) is built on **Hono** with **@hono/zod-openapi** for type-safe, OpenAPI-documented routes. Shared utilities live in `@repo/core` and are consumed via subpath exports.

### Key Imports

| Import | Source | Purpose |
|--------|--------|---------|
| `createApiRoute` | `@repo/core/routing` | Wraps `createRoute` from `@hono/zod-openapi` with automatic default error responses |
| `jsonContentRequired` | `@repo/core/utils` | Creates a **required** JSON request body descriptor (all fields required). Use for POST/PUT/PATCH requests where all fields must be present. |
| `jsonContent` | `@repo/core/utils` | Creates an **optional** JSON request body descriptor (fields optional). Use for PATCH requests or flexible payloads. |
| `createApp` / `createRouter` | `@repo/core/lib` | Creates an `OpenAPIHono` instance with default hooks, logger, `onError`, and `notFound` |
| `httpStatusCodes` | `@repo/core/status` | Numeric HTTP status code constants (e.g. `OK = 200`, `CREATED = 201`) |
| `httpPhrases` | `@repo/core/phrases` | Human-readable phrases keyed the same way (e.g. `OK = "OK"`) |
---

## Module Strategy

Every feature area is a **module** inside `src/routes/`. A module is a folder that co-locates everything it needs:

```
src/
  config/
    tags.ts              # Global OpenAPI tags (one per module)
  modules/
    users/
      users.schema.ts    # Zod schemas for request/response bodies
      users.routes.ts    # Route definitions (createApiRoute calls)
      users.handlers.ts  # Handler implementations
      users.router.ts    # Hono router that wires routes → handlers
      users.services.ts  # Business logic (DB calls, etc.)
      users.types.ts     # Module-specific TypeScript types
      users.utils.ts     # Module-specific helpers
      index.ts           # Barrel export (re-exports the router)
```

Create only the files you need — not every module requires all of them. When a module grows large or contains sub-resources, nest a sub-folder that mirrors the same structure.

---

## Tags

Define tags globally in `src/config/tags.ts` and import them in route files:

```ts
// src/config/tags.ts
export const ROUTE_TAGS = {
  users: "users",
  products: "products",
} as const;
```

---

## Defining Routes — `users.routes.ts`

Route definitions are **data-only** — no handler logic. Export a **named** route object so it can be consumed by handlers and routers with full type inference:

```ts
import { createApiRoute } from "@repo/core/routing";
import { jsonContent, jsonContentRequired } from "@repo/core/utils";
import HTTP_STATUS_CODES from "~/lib/status";
import { ROUTE_TAGS } from "~/config/tags";
import { CreateUserSchema, UserResponseSchema } from "./users.schema";

export const USER_ROUTES = {
  list: createApiRoute({
    method: "get",
    path: "/",
    tags: [ROUTE_TAGS.users],
    responses: {
      [HTTP_STATUS_CODES.OK]: jsonContent(
        UserResponseSchema.array(),
        "List of users",
      ),
    },
  }),

  getById: createApiRoute({
    method: "get",
    path: "/{id}",
    tags: [ROUTE_TAGS.users],
    request: {
      params: jsonContentRequired(z.object({ id: z.string().uuid() }), "User ID param (UUID)"),
    },
    responses: {
      [HTTP_STATUS_CODES.OK]: jsonContent(UserResponseSchema, "Single user"),
    },
  }),

  create: createApiRoute({
    method: "post",
    path: "/",
    tags: [ROUTE_TAGS.users],
    request: {
      body: jsonContentRequired(CreateUserSchema, "New user payload"),
    },
    responses: {
      [HTTP_STATUS_CODES.CREATED]: jsonContent(
        UserResponseSchema,
        "Created user",
      ),
    },
  }),
} as const;
```

General module pattern:

```ts
export const MODULE_ROUTES = {
  add: createApiRoute({
    // route definition
  }),
} as const;
```

### How `createApiRoute` Merges Responses

You only provide the **success** responses. `createApiRoute` automatically injects these defaults:

| Status | Default |
|--------|---------|
| `422 Unprocessable Entity` | { message: "Validation error", code: "VALIDATION_ERROR" } (overridden with a typed `ZodError` schema when `request.body` has a JSON schema) |
| `500 Internal Server Error` | { message: "Internal error", code: "INTERNAL_ERROR" } |
| `400 Bad Request` | { message: "Bad request", code: "BAD_REQUEST" } |
| `401 Unauthorized` | { message: "Authentication required", code: "AUTHN_ERROR" } |

Your explicit `responses` are spread **on top** of the defaults, so you can override any of them. The only response that `createApiRoute` conditionally overwrites **after** the merge is `422` — and only when the request body carries a Zod schema (to produce a typed validation error).

---

## Schemas — `users.schema.ts`

Keep Zod schemas in a dedicated file per module:

```ts
import { z } from "@hono/zod-openapi";

export const CreateUserSchema = z
  .object({
    email: z.string().email().openapi({ example: "john@example.com" }),
    firstName: z.string().min(1).openapi({ example: "John" }),
    lastName: z.string().min(1).openapi({ example: "Doe" }),
    role: z.enum(["admin", "user"]).default("user"),
  })
  .openapi("CreateUser");

export const UserResponseSchema = z
  .object({
    id: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    role: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi("User");
```

> Always call `.openapi("ComponentName")` on top-level schemas so they appear as named components in the generated OpenAPI spec.

---

## Handlers — `users.handlers.ts`

Handlers should be created as a **typed handler map** from the route object. This gives automatic handler signature inference per route key:

```ts
import { USER_ROUTES } from "./users.routes";
import type { HandlerMapFromRoutes } from "~/types";
import HTTP_STATUS_CODES from "~/lib/status";

export const USER_HANDLERS: HandlerMapFromRoutes<typeof USER_ROUTES> = {
  list: async (c) => {
    const users = await usersService.findAll();
    return c.json(
      { success: true, message: "Users retrieved", data: users },
      HTTP_STATUS_CODES.OK,
    );
  },

  create: async (c) => {
    const body = c.req.valid("json");
    const user = await usersService.create(body);
    return c.json(
      { success: true, message: "User created", data: user },
      HTTP_STATUS_CODES.CREATED,
    );
  },
};
```

General module pattern:

```ts
import { MODULE_ROUTES } from "./module.routes";
import type { HandlerMapFromRoutes } from "~/types";

export const MODULE_HANDLERS: HandlerMapFromRoutes<typeof MODULE_ROUTES> = {
  add: async (c) => {
    // implementation
  },
};
```

---

## Router — `users.router.ts`

Wire routes to handlers using **proper openapi chaining** so route and handler types stay aligned at each step:

```ts
import { createHonoRouter } from "~/lib/router";
import { USER_ROUTES } from "./users.routes";
import { USER_HANDLERS } from "./users.handlers";

const usersRouter = createHonoRouter()
  .openapi(USER_ROUTES.list, USER_HANDLERS.list)
  .openapi(USER_ROUTES.create, USER_HANDLERS.create);

export default usersRouter;
```

General module pattern:

```ts
import { MODULE_ROUTES } from "./module.routes";
import { MODULE_HANDLERS } from "./module.handlers";

const router = createHonoRouter()
  .openapi(MODULE_ROUTES.add, MODULE_HANDLERS.add)
  .openapi(/* next route */, /* next handler */);
```

Then mount in the main app with **route chaining**:

```ts
import usersRouter from "~/routes/users/users.router";
import productsRouter from "~/routes/products/products.router";

app
  .route("/users", usersRouter)
  .route("/products", productsRouter);
```

You can keep this registration in `apps/api/src/app.ts`, for example:

```ts
import usersRouter from "~/routes/users/users.router";
import productsRouter from "~/routes/products/products.router";
import type { AppOpenAPI } from "~/types";

export function registerRoutes(app: AppOpenAPI) {
  return app
    .route("/users", usersRouter)
    .route("/products", productsRouter);
}
```

---

## Response Format and Helpers

All API responses must follow this structure:

```json
{
  "message": "",
  "data": <any>,
  "meta": {
    "request_id": "<uuid>",
    "time": "<ISODateString>"
  }
}
```

Error responses must follow:

```json
{
  "message": "",
  "code": "<ERROR_CODE>"
}
```

Common error codes:
- `VALIDATION_ERROR`: Input validation failed
- `AUTHN_ERROR`: Authentication required or failed
- `AUTHZ_ERROR`: Authorization failed
- `IDENTIFICATION_ERROR`: Identification failed (e.g., invalid token, missing credentials)
- `NOT_FOUND`: Resource not found
- `INTERNAL_ERROR`: Unexpected server error
- Add module-specific codes as needed (e.g., `USER_NOT_FOUND`, `PRODUCT_EXISTS`)

### Response Helpers Quick Reference

```ts
import { jsonResponse, jsonResponseOptional } from "@repo/core/utils";
import { successResponse, jsonSuccess, jsonError } from "@repo/core/lib";

// --- In route definitions ---
// Required request body (all fields required)
jsonContentRequired(UserSchema, "Description")

// Optional request body (fields optional)
jsonContent(UserSchema, "Description")

// --- In handlers ---
// Build a response object (does not send)
successResponse({ user }) // → { message: "", data: { user }, meta: { ... } }
errorResponse("Not found", "USER_NOT_FOUND") // → { message: "Not found", code: "USER_NOT_FOUND" }

// Send a response directly from context
jsonSuccess(c, { user }, 201)
jsonError(c, "Not found", 404, "USER_NOT_FOUND")
```

---

## App & Router Setup — `~/lib/router.ts`

```ts
import { createApp } from "@repo/core/lib";
import type { AppBinding } from "~/types";

export function createHonoRouter() {
  return createApp<AppBinding>();
}
```

`createApp` provides:
- `OpenAPIHono` instance with `strict: false`
- Default validation hook that returns `400` with Zod issues on invalid input
- Coloured request logger middleware
- `onError` handler (returns JSON error with stack in non-production)
- `notFound` handler (returns `404` JSON)

---

## Checklist — Adding a New Module

1. Create module folder: `src/modules/<module>/`
2. Add tag in `src/config/tags.ts`
3. Define Zod schemas in `<module>.schema.ts`
4. Define `MODULE_ROUTES` in `<module>.routes.ts` using `createApiRoute`
5. Implement `MODULE_HANDLERS` in `<module>.handlers.ts` typed with `HandlerMapFromRoutes<typeof MODULE_ROUTES>`
6. Wire route → handler in `<module>.router.ts` via chained `.openapi(...)`
7. Register routers in `app.ts` with chained `.route("/<module>", router)` calls
8. Add service layer in `<module>.services.ts` if business logic is non-trivial
