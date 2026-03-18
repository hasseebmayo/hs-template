# @repo/query-rpc

React Query integration layer for Hono RPC clients.

Wraps any `hc<T>(...)` client in a `Proxy` that adds `.queryOptions()` and
`.mutationOptions()` to every HTTP endpoint method (`$get`, `$post`, etc.).
The returned options objects are ready to be passed directly to `useQuery` /
`useMutation` with fully-inferred request and response types.

## Package layout

```
packages/query-rpc/
├── src/
│   ├── client.ts       # hcQuery proxy + QueryEndpoint type
│   ├── key.ts          # buildKey — deterministic React Query key builder
│   └── index.ts        # public barrel export
├── tests/
│   ├── key.test.ts
│   └── hcQuery.test.ts
├── vitest.config.ts
├── tsdown.config.ts
└── package.json
```

## Installation (workspace)

```json
// apps/admin/package.json
{
  "dependencies": {
    "@repo/query-rpc": "workspace:*",
    "@tanstack/react-query": "catalog:"
  }
}
```

## Usage

### Basic — wrap a client once at the module level

```ts
// src/lib/api.ts
import { createApiClient } from "@repo/rpc-client";
import { hcQuery } from "@repo/query-rpc";

const apiClient = createApiClient(import.meta.env.VITE_API_URL);
export const api = hcQuery(apiClient);
```

### Queries

```tsx
import { useQuery } from "@tanstack/react-query";
import { api } from "#/lib/api";

function UsersPage() {
  const { data, isLoading } = useQuery(api.users.$get.queryOptions({}));
  // data: { success: boolean; message: string; data: User[] } | undefined
}
```

### Queries with input

```tsx
const { data } = useQuery(
  api.users.$get.queryOptions({ input: { query: { page: "2" } } })
);
```

### Mutations

```tsx
import { useMutation } from "@tanstack/react-query";
import { api } from "#/lib/api";

function CreateUserForm() {
  const { mutate } = useMutation(
    api.users.$post.mutationOptions({
      onSuccess: (data) => console.log("Created:", data),
    })
  );

  return (
    <button
      onClick={() =>
        mutate({
          json: { email: "x@y.com", firstName: "X", lastName: "Y" },
        })
      }
    >
      Create
    </button>
  );
}
```

### Raw call (bypass React Query)

Every endpoint also exposes `.call` for imperative use:

```ts
const res = await api.users.$get.call({});
const data = await res.json();
```

## API

### `hcQuery<T>(client: T): QueryClient<T>`

Wraps a Hono `hc` client with React Query helpers. Returns a Proxy with the
same shape as the original client, but HTTP method properties (`$get`, `$post`,
`$put`, `$patch`, `$delete`) are replaced with `QueryEndpoint` objects.

### `QueryEndpoint<TEndpoint>`

| Property | Type | Description |
|---|---|---|
| `call` | `TEndpoint` | The original Hono client function |
| `queryOptions(args)` | `UseQueryOptions` | Options for `useQuery` |
| `mutationOptions(args)` | `UseMutationOptions` | Options for `useMutation` |

### `buildKey(path, opts): QueryKey`

Builds a stable, serializable React Query key from a path array and type
(`"query"` or `"mutation"`). Optional `input` is included for queries.

```ts
buildKey(["users", "$get"], { type: "query", input: { id: "1" } })
// => [["users", "$get"], { type: "query", input: { id: "1" } }]
```

## How query keys are structured

```
[
  ["resource", "$method"],       // path segments
  { type: "query", input: ... }  // options
]
```

This structure means:
- `["users", "$get"]` invalidates **all** user list queries regardless of input
- Adding `input` scope scopes invalidation to a specific set of params

## Testing

```bash
# from the repo root
bun run test --filter @repo/query-rpc

# or from the package directory
bun run test
```

## Developing

No build step is required during development — Vite's `resolve.alias` in `apps/admin`
points this package at its source for hot-reload. TypeScript uses the compiled
`dist/index.d.ts` (via the `exports.types` field) for type checking.

```bash
bun run check-types   # type-check only
bun run build         # compile with tsdown (for production / TypeScript dist)
bun run test          # run vitest unit tests
```
