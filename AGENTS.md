# Gaga

In-browser 3D play space: Taotao explores toys in a generated room (no scores).
Profile: ts-worker-web
Human overview: [README.md](README.md). Frameworks must not rewrite this file. Maintain this root `AGENTS.md` as the only project handbook; do not create a `CLAUDE.md` alias, copy or import.

## Sources of Truth

This file is the **contract**. Hooks, CI, and config are **enforcement**. If they disagree, that is a failure — raise enforcement to match this file; never lower the contract to a weaker hook.

| Fact | Where |
|---|---|
| Agent handbook | this file |
| Human docs | README.md, `docs/README.en.md` |
| Version | `package.json` `"version"` as `1.2.3`, display `v1.2.3` |
| Enforcement | `.github/workflows/ci.yml` |
| Machine rules | global `AGENTS.md`, `rules/git-commit.md` |
| Accidents | [Retrospective.md](Retrospective.md) |
| Env files | none required |

## Project Invariants

- All behavior is local (rules, A*, generated art). No remote models or server-side simulation.
- Worker (`worker.js`) only serves assets and `/api/live`. Do not add D1 or remote `-test` resources.
- Daily footprints live in localStorage; position/in-progress actions are not persisted. No accounts.
- Audio is muted until the user enables it. Honor `prefers-reduced-motion` on first visit.
- Wrangler Worker name is `gagaya`; public host is `gaga.hexly.ai`.

## Stack / Layout

| Component | Choice |
|---|---|
| Language | TypeScript (`tsc --noEmit`) |
| Package manager | npm (`package-lock.json`) plus `bun.lock` |
| Runtime | Vite :5177; Cloudflare Worker + assets |
| Lint | none |
| Tests | none (no Vitest; L3 browser E2E removed — repo not actively maintained) |
| Data | none (browser localStorage) |

```
src/  public/  scripts/resize-logos.py
worker.js  wrangler.jsonc
```

## Commands

```bash
npm install   # or bun install
npm run dev                 # Vite --host, port 5177
npm run typecheck           # tsc --noEmit
npm run build               # tsc --noEmit && vite build
npm run deploy              # build + wrangler deploy (owner only)
```

No `lint`, unit-test, or browser E2E script.

## Verification

Quality follows System1 v1.3.0 Native Mode (`nocoo/base-ci v2026.15`) in `.github/workflows/quality-slots.yml` and `.github/workflows/ci.yml`. Status: `enforced` | `planned` | `manual` | `N/A`.

| Slot | Status | Evidence |
| --- | --- | --- |
| `S1` Types | enforced | `bun run typecheck` in CI |
| `S2` Lint | N/A | No lint script configured |
| `S3` Workflow | enforced | SHA-pinned workflow action check in CI |
| `G1` Secrets | enforced | `gitleaks` scan in CI |
| `G2` Dependencies | enforced | `osv-scanner` scan (`bun.lock`, `package-lock.json`) in CI |
| `B1` Build | enforced | `bun run build` in CI |
| `L1` Unit | planned | No unit suite wired |
| `L2` Runtime | N/A | Static site; `/api/live` served via `worker.js` asset rewrite |
| `L3` Integration | N/A | Static site without application API |
| `L4` E2E | N/A | No Playwright suite in repo |
| `P1` Package | N/A | Deployed as Cloudflare Worker, not an npm package |
| `Z1` Gate | enforced | `quality / Z1: Gate` required status check on `main` |

Docs remain `manual` review; release runs `release.yml` (`deploy-worker.yml`) and verifies live `https://gaga.hexly.ai/`. No husky hooks installed; `--no-verify` forbidden.

## Resources / Isolation

| Purpose | Port / resource | Isolation |
|---|---|---|
| Dev | 5177 Vite | local |
| Preview | 4177 | local |

Do not deploy remote `-test` Workers.

## Operations / Release

- Entry: `npm run deploy` or tag `v*.*.*`
- Auth: Cloudflare account owner
- Before ship: CI typecheck+build; live HTTP 200
- Runbook: README + `release.yml` `verify-command`

## Retrospective

| Kind | Where |
|---|---|
| Accident narrative | [Retrospective.md](Retrospective.md) |
| Project-specific rule that will recur | one line here (cap ~10) |
| Cross-project lesson | nmem / global `AGENTS.md` / `rules/` |
| Deterministically checkable rule | hook or test, not prose |
