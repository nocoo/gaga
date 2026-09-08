<p align="center">
  <img src="../assets/brand/icon-rounded.png" alt="Gaga" width="128" height="128" />
</p>

<h1 align="center">Gaga</h1>

<p align="center">Watch Taotao explore freely, or choose a toy and join him in a 3D playroom.</p>

<p align="center">
  <a href="https://gaga.hexly.ai">Website</a> ·
  <a href="../README.md">简体中文</a>
</p>

<p align="center">
  <img src="../preview.jpg" width="720" alt="Gaga — Taotao's little world" />
</p>

## What it does

Gaga is a browser 3D playroom. Its virtual character, Taotao, chooses toys, walks around obstacles, reaches an interaction point, and performs the corresponding action. You can also click a toy to guide him. There are no scores or completion objectives.

Code generates the room, character, toys, and picture-book illustrations. Local rules, animation clips, and A* navigation control behavior. Three.js handles the scene, while plain DOM and CSS provide the interface without remote model services or server-side computation.

## Features

- Let Taotao explore or choose his next stop among blocks, picture books, a toy train, a cloth ball, a climbing castle, a rocking horse, a xylophone, and stacking rings.
- Watch toys respond to character actions: turning pages, stacking blocks, playing the xylophone, rocking, climbing the castle, crossing its rope net, and sliding down.
- Orbit manually or automatically, zoom, and follow Taotao closely, with rear walls hidden according to the camera angle.
- Switch day and night lighting and opt into ambient music and toy sounds, which are muted by default.
- View the virtual character's visits in a daily discovery journal and filter the toy box by activity category.
- Use touch orbit and pinch zoom. When the system requests reduced motion, the first visit starts paused.

The daily journal uses the current browser's localStorage, so today's discoveries survive a reload. It does not save Taotao's position or an active animation, and there are no accounts or cloud synchronization. Entries from older dates are filtered when loading and as play continues.

## Usage

Open the [site](https://gaga.hexly.ai) in a modern WebGL 2 browser with hardware acceleration enabled. Taotao explores on his own, or you can click a toy in the room or open the toy box.

| Action | Effect |
| --- | --- |
| Drag / one-finger drag | Orbit the camera |
| Wheel / pinch / zoom buttons | Zoom in or out |
| Click a toy / choose from the toy box | Guide Taotao to play |
| Click Taotao's avatar | Toggle close follow and the wide view |
| Space | Pause or resume |
| R | Reset the camera |
| T | Open the toy box |
| M | Toggle ambient music |
| N | Switch day and night |

Choosing another toy during a castle or rocking-horse interaction queues the next stop. Taotao finishes the current action and returns to the floor before leaving. Selecting a toy also resumes activity when paused.

## Development

Use Node.js 20.19+ or 22.12+ and npm, with a WebGL 2 browser.

```bash
git clone https://github.com/nocoo/gaga.git
cd gaga
npm ci
npm run dev
```

Development defaults to `http://localhost:5177`, and preview uses 4177. If a port is occupied, follow the terminal output. The app needs no environment variables or database. Fonts and site images ship with the static assets.

```bash
npm run typecheck
npm run build
npm run preview
```

Build output goes to `dist/`, currently hosted on Cloudflare Workers Static Assets. The Worker is named `gagaya`; see [wrangler.jsonc](../wrangler.jsonc) for domain and asset settings. The repository's `npm run deploy` requires a separately available Wrangler CLI and Cloudflare permissions; Wrangler is not currently a project dependency.

Development exposes the `window.__TAOTAO__` diagnostic interface. Production builds do not export it.

| Path | Contents |
| --- | --- |
| `src/main.ts`, `src/ui`, `src/style.css` | Startup, error messages, interface, and journal |
| `src/world` | Rendering, camera, room, picking, and navigation |
| `src/world/toys` | Toy models, interaction paths, and registry |
| `src/character` | Character, exploration logic, and animation clips |
| `src/audio/Soundscape.ts` | Synthesized music and toy sounds |
| `scripts/smoke.mjs` | Browser journey checks |

## Tests

```bash
npx playwright install chromium
npm run test:e2e
```

The script starts a temporary Vite server listening only on `127.0.0.1`, using an automatically assigned port. It prefers a locally installed Chrome / Chromium and falls back to Playwright Chromium. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to choose a browser executable.

Screenshots go to `artifacts/`. Use `PLAYWRIGHT_BASE_URL` only for an existing development server: the test depends on development diagnostics, cannot target a production preview, and does not check hot replacement with an external server.

There are no separate unit or API test commands. Current CI runs type checking and builds; run browser journeys separately.

## Stack

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?logo=threedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?logo=cloudflare&logoColor=white)

| Area | Implementation |
| --- | --- |
| Scene and character | TypeScript, Three.js, WebGL 2, Canvas textures |
| Interface | DOM, CSS, SVG |
| Audio and journal | Web Audio, localStorage |
| Build and hosting | Vite, Cloudflare Workers Static Assets |
| Browser tests | Playwright |

## Documentation

- [Brand assets](../assets/brand/README.md)
- [Identity study](https://hexly.ai/logos/gaga)
- [Toy registry](../src/world/toys/index.ts) and [action definitions](../src/character/actions.ts)

## License

[MIT](../LICENSE) © 2026 Zheng Li. DM Sans uses the [SIL Open Font License](../public/fonts/OFL.txt).
