# Admin App (`apps/admin`)

Admin frontend powered by Vite + React + TanStack Router with file-based routes.

## Run Locally

From repo root:

```bash
bun run dev --filter admin
```

Or from this folder:

```bash
bun --bun run dev
```

## Scripts

```bash
bun --bun run dev
bun --bun run build
bun --bun run preview
bun --bun run lint
bun --bun run check
bun --bun run check-types
bun --bun run test
```

## Routing

- Routes live in `src/routes`.
- Router tree is generated in `src/routeTree.gen.ts` (do not edit manually).
- Root route shell is in `src/routes/__root.tsx`.

## Styling

- Tailwind CSS is configured through Vite.
- Shared styles/components come from `@repo/ui`.

## Notes

- Keep route loaders/search params type-safe with TanStack Router patterns.
- Prefer shared components from `@repo/ui` over app-local duplicates.
