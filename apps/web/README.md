# Web App (`apps/web`)

Public-facing Next.js App Router frontend.

## Run Locally

From repo root:

```bash
bun run dev --filter web
```

Or from this folder:

```bash
bun run dev
```

## Scripts

```bash
bun run dev
bun run build
bun run start
bun run lint
bun run check-types
```

## Styling

- App styles are in `src/app/globals.css`.
- Shared UI styles/components are imported from `@repo/ui`.

## Notes

- Keep page/layout components in `src/app`.
- Use shared components from `@repo/ui` for consistent design between apps.
