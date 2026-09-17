# Gaga

In-browser 3D play space: Taotao explores toys in a generated room (no scores).
Profile: ts-worker-web
Direction: [README.md](README.md). Frameworks must not rewrite this file.

## Sources of Truth

This file is the **contract**. Hooks, CI, and config are **enforcement**. If they disagree, that is a failure — raise enforcement to match this file; never lower the contract to a weaker hook.

| Fact | Where |
|---|---|
| Agent handbook | this file |
| Human docs | README.md, `docs/README.en.md` |
| Version | `package.json` `"version"` as `1.2.3`, display `v1.2.3` |
| Enforcement | `.github/workflows/ci.yml`, `scripts/smoke.mjs` |
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
| Tests | `scripts/smoke.mjs` Playwright chromium (not Vitest) |
| Data | none (browser localStorage) |

```
src/  public/  scripts/smoke.mjs
worker.js  wrangler.jsonc
```

## Commands

```bash
npm install   # or bun install
npm run dev                 # Vite --host, port 5177
npm run typecheck           # tsc --noEmit
npm run build               # tsc --noEmit && vite build
npm run test:e2e            # node scripts/smoke.mjs (local Vite port 0, or PLAYWRIGHT_BASE_URL)
npm run deploy              # build + wrangler deploy (owner only)
```

No `lint` or unit-test script.

## Verification

Status: `enforced` | `planned` | `manual` | `N/A`.
6DQ = L1/L2/L3 + G1/G2 + D1. Required L1 bar is four metrics each ≥ 95%.

| Change | Proof | Status | Evidence |
|---|---|---|---|
| Logic | L1 coverage ≥ 95% four metrics | planned | CI `unit: false` ("no unit suite is wired"); no vitest |
| API / schema | L2 real HTTP 100% | N/A | no application API beyond static `/api/live` |
| UI path | L3 Playwright smoke | planned | `test:e2e` exists; **not** in CI |
| Types / lint | G1 0 error, 0 warning | planned | CI runs `typecheck`; `lint: false`; no husky |
| Deps / secrets | G2 osv-scanner + gitleaks | enforced | quality.yml default `security: true` |
| Test isolation | D1 local smoke, never prod | planned | smoke uses ephemeral Vite unless `PLAYWRIGHT_BASE_URL` is set — do not point that at production |
| Bundler output | `bun run build` | enforced | CI `prepare-command` |
| Docs | README if behavior changed | manual | human review |
| Release | version + Worker deploy | enforced | `release.yml` + curl live `https://gaga.hexly.ai/` |

## Resources / Isolation

| Purpose | Port / resource | Isolation |
|---|---|---|
| Dev | 5177 Vite | local |
| Preview | 4177 | local |
| L3 smoke | random Vite port | local; no persist-to |

E2E never touches prod data stores. Do not deploy remote `-test` Workers.

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

- Do not set `PLAYWRIGHT_BASE_URL` to the production host for smoke.
