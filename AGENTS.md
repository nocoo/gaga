# Gaga

In-browser 3D play space (Three.js, Vite, TypeScript) where Taotao explores toys in a generated room (no scores), deployed via Cloudflare Workers Static Assets.
Docs: [README.md](README.md) · [English README](docs/README.en.md) · [Retrospective](Retrospective.md)

## Commands

Run from root with Bun or Node/npm (CI pins Bun/Node in [quality-slots.yml](.github/workflows/quality-slots.yml)). No `.env` file or database is required. Layout: `src/`, `public/`, `scripts/resize-logos.py`, `worker.js`, `wrangler.jsonc`.

```sh
bun install --frozen-lockfile   # or npm ci
npm run dev                     # Vite --host, port 5177
npm run preview                 # Vite preview --host, port 4177
npm run typecheck               # S1: tsc --noEmit
npm run lint                    # S2: Biome lint and format check
npm run build                   # B1: tsc --noEmit && vite build
npm run deploy                  # build + wrangler deploy (owner only)
```

No unit-test or browser E2E script is configured.

## Invariants

- All behavior is local (rules, A* pathfinding, generated art); never add remote models or server-side simulation.
- `worker.js` only serves static assets and rewrites `/api/live` to `/api/live.json` (emitted by `vite.config.ts`). Do not add D1 or remote `-test` Workers/resources.
- Daily footprints live in browser `localStorage`; character position and in-progress actions are not persisted, and there are no accounts.
- Audio stays muted until the user enables it; honor `prefers-reduced-motion` on first visit (start paused).
- Version source of truth is `package.json` `"version"` (`1.2.3`, displayed as `v1.2.3`); `window.__TAOTAO__` is dev-only.
- Keep `bun.lock` and `package-lock.json` in sync when updating dependencies; CI `G2` scans both lockfiles.
- Wrangler Worker name is `gagaya` ([wrangler.jsonc](wrangler.jsonc)); public custom domain is `gaga.hexly.ai` (`workers_dev` and `preview_urls` disabled).
- Production deploy requires Cloudflare owner authorization via `npm run deploy`, tag `v*.*.*`, or [release.yml](.github/workflows/release.yml) (verifies live HTTP 200 on `https://gaga.hexly.ai/`).

## Quality & Local Gates

Follows `system1-quality`; CI slot definitions and pinned `base-ci` revision live in [.github/workflows/quality-slots.yml](.github/workflows/quality-slots.yml) (`quality / Z1: Gate` required on `main`, called by [.github/workflows/ci.yml](.github/workflows/ci.yml)). Status vocabulary: `enforced`, `planned`, `manual`, `N/A`.

- **Enforced in CI**: `S1` (`bun run typecheck`), `S2` (`bun run lint` via Biome), `S3` (SHA-pinned actions), `G1` (`gitleaks`), `G2` (`osv-scanner` on `bun.lock` + `package-lock.json`), `B1` (`bun run build`), `Z1` gate.
- **Planned / manual**: `L1` Unit is `planned` (no unit suite wired); docs review is `manual`.
- **N/A slots**: `L2`/`L3` (static asset app; `/api/live` is a Worker rewrite), `L4` (Playwright E2E removed; low-maintenance repo), `P1` (Cloudflare Worker, not an npm package).
- **Local hooks**: none installed (no `.husky/` or `.githooks/`); run `npm run typecheck` and `npm run build` before committing, and never use `--no-verify`.

## Resources & Isolation

| Lane    | Endpoint / State                                | Boundary                                                                |
| ------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| Dev     | `127.0.0.1:5177` (Vite), browser `localStorage` | Local only; no remote services                                          |
| Preview | `127.0.0.1:4177` (Vite preview), `dist/`        | Local built-bundle verification                                         |
| Prod    | `https://gaga.hexly.ai` (Worker `gagaya`)       | Read-only checks unless deploy is authorized; no remote `-test` Workers |

## Retrospective

Record incident narratives in [Retrospective.md](Retrospective.md); promote recurring project constraints to `Invariants` above and deterministically checkable safeguards to tests or hooks.
