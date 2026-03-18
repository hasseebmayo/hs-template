# @repo/rpc-client

Typed Hono RPC client factory for the monorepo.

Provides `createApiClient()` — a thin wrapper around [Hono's `hc` client](https://hono.dev/docs/guides/rpc) that bakes in the `AppType` from `apps/api` so every call is fully type-safe.

## Package layout

```
packages/rpc-client/
├── src/
│   └── index.ts        # createApiClient factory + AppType re-export
├── package.json
└── tsconfig.json
```

## Installation (workspace)

The package is a private workspace package — it is available to all apps via the `@repo/rpc-client` alias:

```json
// apps/admin/package.json
{
  "dependencies": {
    "@repo/rpc-client": "workspace:*"
  }
}
```

## Usage

```ts
import { createApiClient } from "@repo/rpc-client";

// Defaults to http://localhost:4000 when no URL is provided
const apiClient = createApiClient(import.meta.env.VITE_API_URL);

// apiClient is typed as hc<AppType> — every route is inferred
const res = await apiClient.users.$get({});
const data = await res.json(); // { success: true, message: string, data: User[] }
```

### With React Query (`@repo/query-rpc`)

```ts
import { createApiClient } from "@repo/rpc-client";
import { hcQuery } from "@repo/query-rpc";

const apiClient = createApiClient(import.meta.env.VITE_API_URL);
export const api = hcQuery(apiClient);

// In a component:
const { data } = useQuery(api.users.$get.queryOptions({}));
// data is fully typed — { success: true, message: string, data: User[] }
```

## Environment variable

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL of `apps/api` | `http://localhost:4000` |

Declare the type in your Vite app:

```ts
// env.d.ts
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}
```

## How type inference works

`createApiClient` calls `hc<AppType>(baseUrl)` where `AppType` is imported from
`apps/api/src/index.ts` (resolved via the `paths` alias in `tsconfig.json`).
Hono's RPC type inference then walks the router tree so:

- `apiClient.users.$get` is typed as the exact handler function
- `InferRequestType` / `InferResponseType` both resolve to the Zod-validated shapes
- No manual `as` casts are required at the call site

## Developing

```bash
bun run check-types   # type-check only
bun run build         # compile with tsdown (produces dist/index.js + dist/index.d.ts)
```

The compiled `dist/index.d.ts` is a **bundled declaration** — all types (including `AppType` from `@repo/api`) are inlined into a single file. This means TypeScript/LSP reads one compiled file rather than traversing the full `@repo/api` source tree, keeping IDE response times fast.
