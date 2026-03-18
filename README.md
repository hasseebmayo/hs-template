# Monorepo Template

Production-oriented Turborepo template using Bun workspaces with frontend apps, backend APIs, and shared packages.

## Stack

- Monorepo: Turborepo
- Package manager/runtime: Bun
- Frontend: Next.js (`apps/web`), TanStack Router + Vite (`apps/admin`)
- Backend: Hono (`apps/api`)
- Shared packages: `@repo/ui`, `@repo/core`, `@repo/redis`, `@repo/idempotency`, `@repo/prisma`
- Lint/format: Biome

## Workspace Layout

- `apps/admin` — admin frontend (TanStack Router)
- `apps/web` — web frontend (Next.js App Router)
- `apps/api` — API server (Hono)
- `packages/core` — shared backend HTTP/OpenAPI helpers
- `packages/ui` — shared UI components and styles
- `packages/redis` — Redis client/cache helpers
- `packages/idempotency` — idempotency middleware
- `packages/prisma` — Prisma client package
- `tooling/typscript` — shared TypeScript configs

## Getting Started

```bash
bun install
```

Run everything in dev mode:

```bash
bun run dev
```

Run a single workspace:

```bash
bun run dev --filter admin
bun run dev --filter web
bun run dev --filter @repo/api
```

## Quality Commands

From repo root:

```bash
bun run lint
bun run check-types
bun run build
bun run format-and-lint
bun run format-and-lint:fix
```

## Git Hooks

- Pre-commit: `lint-staged`
- Commit message: `commitlint` conventional commits

## Notes

- Do not edit generated route files such as `apps/admin/src/routeTree.gen.ts`.
- Prefer importing UI from `@repo/ui` and backend helpers from `@repo/core` domain exports.
