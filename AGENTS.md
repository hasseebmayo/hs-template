# Copilot Instructions

## Big picture
- Monorepo managed by Turborepo; apps live in `apps/*` and shared packages in `packages/*`.
- Primary apps: `apps/admin` (TanStack Router + Vite) and `apps/web` (Next.js App Router).
- Shared UI components are in `packages/ui` (shadcn-style components and Tailwind styles).
- Shared backend utilities include `packages/idempotency` (Hono middleware) and `packages/redis` (ioredis helpers).

## Key conventions
- **TanStack Router** in `apps/admin` uses file-based routes in `apps/admin/src/routes` and generated route tree in `apps/admin/src/routeTree.gen.ts` (do not edit generated files).
- Follow `.agents/skills/tanstack-router-best-practices` when adding routes, loaders, or search params.
- UI components should be sourced from `@repo/ui` and live under `packages/ui/src/components`.
- `packages/ui/package.json` uses an export map; only exported subpaths are valid import targets.

## Workflows
- Root scripts (run from repo root): `bun run dev`, `bun run build`, `bun run lint`, `bun run check-types` (Turborepo tasks).
- `apps/admin` local dev: `bun --bun run dev`; build: `bun --bun run build`; tests: `bun --bun run test`.
- Formatting/linting uses Biome (`bun run format-and-lint`, `bun run format-and-lint:fix`).

## Shared packages usage
- **Idempotency middleware** (Hono): import from `@repo/idempotency` and pair with `@repo/redis` for Redis storage.
- **Redis client**: prefer `getRedisClient` singleton and use `keyPrefix` to isolate app keys.

## Styling
- `apps/admin/src/styles.css` imports Tailwind and UI globals; ensure CSS imports match `packages/ui` export map.

## When in doubt
- Check `packages/*/README.md` for package-specific usage examples.
- Consult `.agents/skills/*` for component and routing best practices before making changes.

---

## RPC integration (`apps/api` → `@repo/rpc-client` → `@repo/query-rpc` → `apps/admin`)

### Overview

The monorepo uses Hono's built-in RPC type inference to provide end-to-end type safety between the API and the admin frontend. No code generation or manual type copying is required.

```
apps/api  ──exports──▶  @repo/rpc-client  ──wraps──▶  @repo/query-rpc  ──used by──▶  apps/admin
AppType                  createApiClient()             hcQuery()                       api.users.$get
```

### What changed (PR: feat/add-hono-rpc-integration)

| File / Package | Change |
|---|---|
| `apps/api/src/routes/users/` | Added full users module: `users.schema.ts`, `users.routes.ts`, `users.handlers.ts`, `users.services.ts`, `users.router.ts` |
| `apps/api/src/app.ts` | Registers `usersRouter` at `/users` |
| `apps/api/src/index.ts` | Exports `AppType` for downstream RPC type inference; binds CORS; port 4000 |
| `apps/api/package.json` | Added `"exports": { ".": "./src/index.ts" }` and `"test": "bun test"` script |
| `packages/core/src/lib/route.ts` | Made `createApiRoute` generic `<const R extends RouteConfig>` — preserves route-specific type info through the handler type system |
| `packages/rpc-client/src/index.ts` | Replaced placeholder with `createApiClient(baseUrl?)` factory using `hc<AppType>` |
| `packages/rpc-client/package.json` | Now built with **tsdown** — exports `dist/index.d.ts` (bundled declarations) so TypeScript/LSP reads a single compiled file instead of traversing the full source chain |
| `packages/rpc-client/tsdown.config.ts` | New: tsdown build config with `dts: true` |
| `packages/query-rpc/package.json` | Added `"test": "vitest run"` script; exports updated to `dist/` |
| `packages/query-rpc/tsdown.config.ts` | Existing: tsdown build config with `dts: true` |
| `apps/admin/src/routes/__root.tsx` | Added `QueryClientProvider` wrapping `<Outlet>` |
| `apps/admin/src/lib/api.ts` | New file: exports fully-typed `api` singleton (`hcQuery(createApiClient(...))`) |
| `apps/admin/src/routes/users.tsx` | New route: lists users from the API using `useQuery` |
| `apps/admin/tsconfig.json` | Path aliases for `@repo/core/*` only — `@repo/rpc-client`, `@repo/query-rpc`, `@repo/api`, `~/*` removed (TypeScript now reads compiled `.d.ts` from dist) |
| `apps/admin/vite.config.ts` | Vite `resolve.alias` for `@repo/rpc-client`/`@repo/query-rpc` → source (dev ergonomics; TypeScript still uses dist) |
| `apps/admin/src/env.d.ts` | Declares `VITE_API_URL` as optional |

### Adding a new API endpoint

1. **Define the route** in `apps/api/src/routes/<resource>/<resource>.routes.ts` using `createApiRoute` from `@repo/core/routing`. Use `jsonContentRequired` for POST/PUT/PATCH request bodies; use `jsonResponse` for responses.

2. **Define schemas** in `<resource>.schema.ts` using `z` from `@hono/zod-openapi`.

3. **Implement the service** in `<resource>.services.ts` — pure functions, no framework coupling.

4. **Implement handlers** in `<resource>.handlers.ts` typed with `HandlerMapFromRoutes<typeof ROUTES>`.

5. **Wire the router** in `<resource>.router.ts` — call `createHonoRouter().openapi(ROUTE, HANDLER)` for each route.

6. **Register** the router in `apps/api/src/app.ts` via `app.route("/path", router)`.

7. **The admin client picks up the new route automatically** — no changes needed in `@repo/rpc-client` or `@repo/query-rpc`. Just use `api.<resource>.$get.queryOptions({})` etc.

### Using the API client in admin

```ts
// src/lib/api.ts (already set up — do not recreate)
import { createApiClient } from "@repo/rpc-client";
import { hcQuery } from "@repo/query-rpc";
export const api = hcQuery(createApiClient(import.meta.env.VITE_API_URL));
```

```tsx
// In any route component:
import { api } from "#/lib/api";
import { useQuery, useMutation } from "@tanstack/react-query";

// Query
const { data } = useQuery(api.users.$get.queryOptions({}));

// Mutation
const { mutate } = useMutation(api.users.$post.mutationOptions({}));
mutate({ json: { email: "x@y.com", firstName: "X", lastName: "Y" } });
```

### Running the API

```bash
# Start the API dev server (port 4000, hot reload)
bun run dev --filter @repo/api

# Or from apps/api:
bun run dev
```

### Verify with curl

```bash
# List users
curl http://localhost:4000/users

# Get user by ID
curl http://localhost:4000/users/550e8400-e29b-41d4-a716-446655440000

# Create a user
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","firstName":"New","lastName":"User"}'
```

### Running tests

```bash
# API (bun:test — no server needed, uses Hono's app.request() helper)
bun run test --filter @repo/api

# query-rpc (vitest)
bun run test --filter @repo/query-rpc

# admin component tests (vitest + jsdom)
bun run test --filter admin
```

### TypeScript / LSP performance

`@repo/rpc-client` and `@repo/query-rpc` are **built packages** (compiled with `tsdown`). Their `exports` maps point to `dist/index.d.ts` (bundled declarations) and `dist/index.js`. TypeScript reads a single pre-compiled file instead of traversing the `@repo/api → ~/lib/router → @repo/core/*` source chain — significantly faster LSP response.

```
Without build: apps/admin → @repo/rpc-client/src → @repo/api/src → 200+ source files
With build:    apps/admin → @repo/rpc-client/dist/index.d.ts → done
```

**Rule:** Always run `bun run build` (or `turbo build`) before starting the dev server or running type checks so that `@repo/rpc-client` and `@repo/query-rpc` have their `dist/` available.

```bash
# One-time setup (or after changing rpc-client/query-rpc source):
bun run build --filter @repo/rpc-client --filter @repo/query-rpc

# Then start the admin dev server:
bun run dev --filter admin
```

Vite's dev server is configured with `resolve.alias` to point `@repo/rpc-client` and `@repo/query-rpc` directly at their source — so hot-reload works and a pre-build is only needed for TypeScript type checking, not for the runtime dev server.

### TypeScript path aliases

| tsconfig | Aliases declared | Why |
|---|---|---|
| `apps/admin/tsconfig.json` | `@repo/core/*` only | TS reads `@repo/rpc-client` / `@repo/query-rpc` via their `exports.types` (dist) |
| `packages/rpc-client/tsconfig.json` | `@repo/api`, `~/*`, `@repo/core/*` | Needed for tsdown to resolve imports when **building** the package |
| `apps/api/tsconfig.json` | `~/*`, `@repo/core/*` | Internal `~/` imports within the API app |

