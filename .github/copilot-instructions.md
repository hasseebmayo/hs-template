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
- When adding UI components, agents can use the shadcn MCP server to pull components into `packages/ui`.

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
