# Query Abstractions

Type-safe query abstraction utilities following the [TkDodo blog pattern](https://tkdodo.eu/blog/creating-query-abstractions).

## Philosophy

Instead of custom hooks, we use **queryOptions as the base abstraction** and compose them at usage sites. This provides:

- ✅ Full type inference
- ✅ Works anywhere (not just components)
- ✅ Interoperable with all query hooks (`useQuery`, `useSuspenseQuery`, `useQueries`)
- ✅ Simple composition pattern

## Components

### `<Fetcher>`

Standard query fetcher with manual loading/error handling.

```tsx
import { api } from "#/lib/api";
import { Fetcher } from "@repo/ui/query";

function UserList() {
  return (
    <Fetcher
      queryOptions={api.users.$get.queryOptions({})}
      fallback={<Spinner />}
      renderError={(error) => <ErrorMessage>{error.message}</ErrorMessage>}
    >
      {(users) => (
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.email}</li>
          ))}
        </ul>
      )}
    </Fetcher>
  );
}
```

### `<SuspenseFetcher>`

Suspense-enabled fetcher for use with React Suspense boundaries.

```tsx
import { api } from "#/lib/api";
import { SuspenseFetcher } from "@repo/ui/query";
import { Suspense } from "react";

function UserList() {
  return (
    <Suspense fallback={<Spinner />}>
      <SuspenseFetcher queryOptions={api.users.$get.queryOptions({})}>
        {(users) => (
          <ul>
            {users.map((user) => (
              <li key={user.id}>{user.email}</li>
            ))}
          </ul>
        )}
      </SuspenseFetcher>
    </Suspense>
  );
}
```

## Composing Options

You can compose additional options on top of the base queryOptions:

```tsx
<Fetcher
  queryOptions={api.users.$get.queryOptions({})}
  options={{
    staleTime: 60_000, // 1 minute
    retry: 3,
    refetchOnWindowFocus: false,
  }}
>
  {(users) => <UserList users={users} />}
</Fetcher>
```

## Advanced Patterns

### With `select` for data transformation

```tsx
<Fetcher
  queryOptions={api.users.$get.queryOptions({})}
  options={{
    select: (users) => users.filter((u) => u.isActive),
  }}
>
  {(activeUsers) => <ActiveUserList users={activeUsers} />}
</Fetcher>
```

### Accessing the full query result

The second argument provides the full query result:

```tsx
<Fetcher queryOptions={api.users.$get.queryOptions({})}>
  {(users, query) => (
    <div>
      <UserList users={users} />
      {query.isFetching && <InlineSpinner />}
      <p>Last updated: {query.dataUpdatedAt}</p>
    </div>
  )}
</Fetcher>
```

### Parallel queries with multiple Fetchers

```tsx
function Dashboard() {
  return (
    <div>
      <Fetcher queryOptions={api.users.$get.queryOptions({})}>
        {(users) => <UserStats count={users.length} />}
      </Fetcher>

      <Fetcher queryOptions={api.posts.$get.queryOptions({})}>
        {(posts) => <PostStats count={posts.length} />}
      </Fetcher>
    </div>
  );
}
```

## Why Not Custom Hooks?

Custom hooks have limitations:

1. **Only work in components/hooks** - Can't use in route loaders, event handlers, server code
2. **Share logic, not configuration** - We're sharing query config, not behavior
3. **Implementation lock-in** - Hard to switch between `useQuery`, `useSuspenseQuery`, etc.
4. **Type inference issues** - Complex generics required to maintain type safety

The queryOptions pattern solves all these issues while being simpler and more type-safe.

## Type Safety

All types are fully inferred:

```tsx
// ✅ TypeScript knows users is User[]
<Fetcher queryOptions={api.users.$get.queryOptions({})}>
  {(users) => {
    // users: User[]
    users.map(u => u.email) // ✅ TypeScript knows about .email
  }}
</Fetcher>

// ✅ select transforms types correctly
<Fetcher
  queryOptions={api.users.$get.queryOptions({})}
  options={{
    select: (users) => users.map(u => u.email)
  }}
>
  {(emails) => {
    // emails: string[]
    emails.join(', ') // ✅
  }}
</Fetcher>
```

## Error Handling

### Option 1: renderError prop

```tsx
<Fetcher
  queryOptions={api.users.$get.queryOptions({})}
  renderError={(error, query) => (
    <Alert variant="destructive">
      <AlertTitle>Error loading users</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
      <Button onClick={() => query.refetch()}>Retry</Button>
    </Alert>
  )}
>
  {(users) => <UserList users={users} />}
</Fetcher>
```

### Option 2: Error Boundary

If `renderError` is omitted, errors are thrown to the nearest Error Boundary:

```tsx
import { ErrorBoundary } from "react-error-boundary";

<ErrorBoundary fallback={<ErrorPage />}>
  <Fetcher queryOptions={api.users.$get.queryOptions({})}>
    {(users) => <UserList users={users} />}
  </Fetcher>
</ErrorBoundary>
```

---

**Reference:** [Creating Query Abstractions - TkDodo](https://tkdodo.eu/blog/creating-query-abstractions)
