import './style.css';
import { AppUI } from './ui/AppUI';
import { Playroom } from './world/Playroom';

declare global {
  interface Window { __TAOTAO__?: ReturnType<Playroom['diagnostics']> }
}

const ui = new AppUI(document.querySelector<HTMLElement>('#app')!);
let world: Playroom | undefined;
let cancelled = false;

async function start() {
  try {
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (cancelled) return;
    world = new Playroom(ui);
    await world.init();
    if (cancelled) return;
    ui.connect({
      pause: () => world!.togglePause(),
      zoom: direction => world!.zoom(direction),
      rotate: () => world!.rotate(),
      reset: () => world!.reset(),
      focus: () => world!.focus(),
      night: () => world!.toggleNight(),
      sound: () => world!.sound.toggle(),
      select: id => world!.selectToy(id),
    });
    if (import.meta.env.DEV) window.__TAOTAO__ = world.diagnostics();
  } catch (error) {
    console.error('The playroom could not start:', error);
    ui.error(error instanceof Error && /WebGL|context/i.test(error.message)
      ? '这间小屋需要支持 WebGL 2 的浏览器。请试试新版 Chrome、Edge 或 Safari，并开启硬件加速。'
      : '小屋的布置遇到了一点问题，请刷新页面再试一次。');
  }
}

void start();

if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    cancelled = true;
    world?.dispose(); ui.dispose(); delete window.__TAOTAO__;
  });
}
