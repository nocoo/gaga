import { avatar, bunnyLogo, icon } from './icons';
import { toyDefinitions } from '../world/toys';
import type { ToyId, ToyInstance } from '../world/toys/types';
import type { ExplorerState } from '../character/Explorer';

export interface JournalEntry { toyId: ToyId; time: number }
export interface UIHandlers {
  pause: () => void;
  zoom: (direction: number) => void;
  rotate: () => boolean;
  reset: () => void;
  focus: () => boolean;
  night: () => boolean;
  sound: () => Promise<boolean>;
  select: (id: ToyId) => 'queued' | 'selected' | 'unreachable';
}

function localDay(time: number) { const d = new Date(time); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }

export class AppUI {
  readonly viewport: HTMLElement;
  readonly journal: JournalEntry[] = [];
  private handlers: UIHandlers | null = null;
  private abort = new AbortController();
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private loadingTimer: ReturnType<typeof setTimeout> | null = null;
  private filter = '全部';
  private currentToy: ToyId | undefined;
  private lastMode = '';
  private lastLabel = '';
  private lastThought = '';
  private nightMode = false;
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(private readonly root: HTMLElement) {
    root.className = '';
    for (const key of ['mode', 'running', 'toy']) delete root.dataset[key];
    this.loadJournal();
    root.innerHTML = `
      <a class="skip-link" href="#toy-box">跳到玩具百宝箱</a>
      <header class="site-header">
        <a href="./" class="brand" aria-label="陶陶的小小世界，首页">
          <span class="brand-mark">${bunnyLogo}</span>
          <span class="brand-name">陶陶的小小世界<span>A LITTLE WORLD OF WONDER</span></span>
        </a>
        <nav class="header-nav" aria-label="主导航">
          <button class="nav-link current" id="room-tab" aria-current="page"><span class="tiny-dot"></span> 玩耍空间</button>
          <button class="nav-link" id="journal-open">探索足迹 <span class="new-dot" id="journal-dot" hidden></span></button>
        </nav>
        <div class="header-actions">
          <button class="weather-button" id="weather" aria-label="切换到夜晚">${icon('sun', 17)}<span>阳光正好</span></button>
          <span class="header-separator"></span>
          <button class="icon-button" id="sound" aria-label="开启环境音乐" aria-pressed="false" title="环境音乐 · M">${icon('muted', 19)}</button>
          <button class="icon-button help-button" id="help-open" aria-label="查看操作指南" title="操作指南">${icon('help', 19)}</button>
        </div>
      </header>

      <main class="playroom">
        <div class="intro-panel">
          <div class="eyebrow"><span></span> LITTLE DAYS, BIG DISCOVERIES</div>
          <h1>小小世界，<br />大大<span class="wonder-word">好奇心<svg class="title-spark" viewBox="0 0 36 40" aria-hidden="true"><path d="m6 24 10-3M19 13l2-10M28 20l6-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span>。</h1>
          <p class="intro-copy">在有阳光的地方，<br />把每一天，玩成喜欢的模样。</p>
          <div class="profile">
            <button class="avatar" id="character-focus" aria-label="近距离跟随陶陶" aria-pressed="false" title="点头像，近距离看看陶陶">${avatar}<span class="profile-online"></span></button>
            <div><div class="profile-name">陶陶 <span>TAOTAO</span></div><p>2 岁 <span>·</span> 小小探险家</p></div>
          </div>
          <div class="room-facts"><span>约 <b>60</b> m² 的快乐</span><i></i><span><b>${toyDefinitions.length}</b> 件心爱玩具</span></div>
          <div class="intro-doodle" aria-hidden="true"><svg viewBox="0 0 160 64"><path d="M4 42c35 16 64-20 86-8s-14 22-14 7 24-26 57-18" fill="none" stroke="#bdbda1" stroke-width="1.25" stroke-dasharray="3 5" stroke-linecap="round"/><path d="M134 21c-8-14 2-17 3-3 8-10 15-2 2 3 14 5 7 12 0 4 0 14-10 10-5-1-12 4-14-7 0-3Z" fill="#dfc282"/><circle cx="136" cy="22" r="3.3" fill="#a8ad80"/></svg></div>
        </div>

        <div class="world-viewport" id="world-viewport" role="region" aria-label="陶陶的三维玩耍空间：拖动旋转，滚轮或双指缩放，点击玩具互动" tabindex="0"></div>
        <div class="scene-corner-note" aria-hidden="true"><span class="note-line"></span><span id="room-note">午后的小小乐园</span><span class="room-coordinate">ROOM 01</span></div>
        <div class="character-label" id="character-label" hidden><span class="character-dot"></span><span>陶陶</span><span class="character-thought" id="character-thought">你好呀</span></div>
        <div class="scene-tooltip" id="scene-tooltip" role="tooltip" hidden></div>

        <aside class="activity-card" aria-label="陶陶当前的活动" aria-live="polite">
          <div class="activity-eyebrow"><span>此刻的小快乐</span><span class="live-indicator"><i></i> LIVE</span></div>
          <div class="activity-main"><div class="activity-icon" id="activity-icon">${icon('sparkle', 23)}</div><div><div class="activity-label" id="activity-label">看看，接下来玩什么呢</div><div class="activity-subtitle" id="activity-subtitle">跟着好奇心，自由探索</div></div></div>
          <div class="activity-progress" role="progressbar" aria-label="当前活动进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="activity-progress"></span></div>
          <div class="activity-bottom"><span id="activity-mode">自在玩耍中</span><span><b id="discovery-count">0</b> / ${toyDefinitions.length} 个小发现</span></div>
        </aside>

        <div class="control-dock" role="toolbar" aria-label="场景控制">
          <button class="play-button" id="pause" aria-label="暂停陶陶的活动" aria-pressed="false">${icon('pause', 17)}<span>暂停</span></button>
          <div class="dock-divider"></div>
          <div class="zoom-controls"><button class="icon-button" id="zoom-out" aria-label="缩小视角" title="缩小">${icon('minus', 17)}</button><output id="zoom-value" aria-label="缩放比例">100%</output><button class="icon-button" id="zoom-in" aria-label="放大视角" title="放大">${icon('plus', 17)}</button></div>
          <div class="dock-divider"></div>
          <button class="icon-button" id="rotate" aria-label="开启自动旋转" aria-pressed="false" title="自动旋转">${icon('rotate', 19)}</button>
          <button class="icon-button" id="reset" aria-label="恢复初始视角" title="恢复视角 · R">${icon('home', 19)}</button>
          <button class="icon-button night-button" id="night" aria-label="切换到夜晚" aria-pressed="false" title="昼夜切换 · N">${icon('sun', 19)}</button>
          <button class="icon-button fullscreen-button" id="fullscreen" aria-label="进入全屏" title="全屏">${icon('expand', 18)}</button>
        </div>
        <p class="control-hint"><span class="desktop-hint">拖动旋转<span>·</span>滚轮缩放</span><span class="touch-hint">单指旋转<span>·</span>双指缩放</span><span>·</span>点击玩具，一起玩</p>
        <button class="toy-box-button" id="toy-box" aria-haspopup="dialog">${icon('box', 20)}<span>玩具百宝箱</span><span class="toy-count">${toyDefinitions.length}</span></button>
        <div class="bottom-note">MADE OF SUNSHINE & LITTLE THINGS<span>${icon('heart', 11)}</span></div>
      </main>

      <div class="loading-screen" id="loading-screen"><div class="loading-mark">${bunnyLogo}</div><div class="loading-title">小小世界，正在醒来</div><p id="loading-message">铺好爬爬垫，等陶陶来玩。</p><div class="loading-track"><span id="loading-progress"></span></div><span class="loading-caption">A LITTLE PATIENCE, A LOT OF WONDER.</span></div>
      <div class="toast" id="toast" role="status" hidden></div>

      <dialog class="toy-dialog" id="toy-dialog" aria-labelledby="toy-dialog-title">
        <div class="dialog-header"><div><span class="eyebrow">A BOX FULL OF WONDER</span><h2 id="toy-dialog-title">玩具百宝箱</h2></div><button class="icon-button dialog-close" aria-label="关闭玩具百宝箱">${icon('close')}</button></div>
        <p class="dialog-description">每一件玩具，都是一个新世界。</p>
        <div class="toy-filters" role="group" aria-label="按玩具类型筛选">${['全部', '想象力', '动起来', '慢时光'].map((filter, i) => `<button data-filter="${filter}" class="filter-button ${i === 0 ? 'selected' : ''}" aria-pressed="${i === 0}">${filter}${i === 0 ? ` <span>${toyDefinitions.length}</span>` : ''}</button>`).join('')}</div>
        <div class="toy-grid" id="toy-grid"></div><p class="dialog-footnote">${icon('sparkle', 14)} 选一个，陶陶就会去找它。</p>
      </dialog>

      <dialog class="journal-dialog" id="journal-dialog" aria-labelledby="journal-title">
        <div class="dialog-header"><div><span class="eyebrow">TODAY'S LITTLE ADVENTURES</span><h2 id="journal-title">今天的小小发现</h2></div><button class="icon-button dialog-close" aria-label="关闭探索足迹">${icon('close')}</button></div>
        <p class="dialog-description">长大的每一步，都藏在玩耍里。</p><div id="journal-content"></div><p class="dialog-footnote">${icon('heart', 14)} 足迹保存在这台设备，只记录今天的小冒险。</p>
      </dialog>

      <dialog class="help-dialog" id="help-dialog" aria-labelledby="help-title">
        <div class="dialog-header"><div><span class="eyebrow">MAKE YOURSELF AT HOME</span><h2 id="help-title">慢慢看，自在玩</h2></div><button class="icon-button dialog-close" aria-label="关闭操作指南">${icon('close')}</button></div>
        <p class="dialog-description">陶陶会自己寻找喜欢的玩具，<br />你也可以陪他，发现新的小快乐。</p>
        <div class="help-row">${icon('mouse', 25)}<div><b>换个角度看世界</b><p>拖动画面旋转，滚动鼠标或双指捏合缩放。<br />点陶陶的头像，可以近距离跟随他。</p></div></div>
        <div class="help-row">${icon('blocks', 25)}<div><b>一起选个玩具</b><p>点击场景中的玩具，或打开玩具百宝箱。</p></div></div>
        <div class="help-row">${icon('sun', 25)}<div><b>白天与晚安时光</b><p>点小太阳切换昼夜，点扬声器听环境音乐。</p></div></div>
        <div class="shortcut-list"><span><kbd>Space</kbd> 暂停 / 继续</span><span><kbd>R</kbd> 恢复视角</span><span><kbd>T</kbd> 玩具箱</span><span><kbd>M</kbd> 声音</span><span><kbd>N</kbd> 昼夜</span></div>
        <p class="help-ending">这里没有任务，只有慢慢长大的快乐。${icon('leaf', 17)}</p>
      </dialog>
    `;
    this.viewport = root.querySelector('#world-viewport')!;
    this.renderToys(); this.renderJournal();
    this.bind();
    if (this.reducedMotion) root.classList.add('reduced-motion');
  }

  connect(handlers: UIHandlers) { this.handlers = handlers; }
  private element<T extends HTMLElement = HTMLElement>(id: string) { return this.root.querySelector<T>(`#${id}`)!; }
  private listen(id: string, callback: () => void) { this.element(id).addEventListener('click', callback, { signal: this.abort.signal }); }

  private bind() {
    this.listen('pause', () => this.handlers?.pause());
    this.listen('zoom-in', () => this.handlers?.zoom(1)); this.listen('zoom-out', () => this.handlers?.zoom(-1));
    this.listen('rotate', () => {
      const active = this.handlers?.rotate() ?? false;
      this.element('rotate').setAttribute('aria-pressed', String(active));
      this.element('rotate').setAttribute('aria-label', active ? '停止自动旋转' : '开启自动旋转');
    });
    this.listen('reset', () => { this.handlers?.reset(); this.setRotating(false); this.setFollowing(false); this.toast('回到最舒服的角度'); });
    this.listen('character-focus', () => { const active = this.handlers?.focus() ?? false; this.setFollowing(active); this.setRotating(false); this.toast(active ? '靠近一点，看看陶陶的小发现' : '回到小小世界的全景'); });
    this.listen('night', () => this.toggleNight()); this.listen('weather', () => this.toggleNight());
    this.listen('sound', () => void this.toggleSound());
    this.listen('toy-box', () => this.openDialog('toy-dialog'));
    this.listen('journal-open', () => { this.renderJournal(); this.openDialog('journal-dialog'); this.element('journal-dot').hidden = true; });
    this.listen('help-open', () => this.openDialog('help-dialog'));
    this.listen('room-tab', () => { this.closeDialogs(); this.handlers?.reset(); this.setRotating(false); this.setFollowing(false); });
    this.root.querySelector('.skip-link')!.addEventListener('click', event => { event.preventDefault(); this.openDialog('toy-dialog'); }, { signal: this.abort.signal });
    this.listen('fullscreen', () => {
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => this.toast('当前浏览器暂不支持全屏'));
      else if (document.documentElement.requestFullscreen) void document.documentElement.requestFullscreen().catch(() => this.toast('当前浏览器暂不支持全屏'));
      else this.toast('可以使用浏览器菜单进入全屏');
    });
    document.addEventListener('fullscreenchange', () => {
      this.element('fullscreen').setAttribute('aria-label', document.fullscreenElement ? '退出全屏' : '进入全屏');
    }, { signal: this.abort.signal });
    this.root.querySelectorAll<HTMLDialogElement>('dialog').forEach(dialog => {
      dialog.querySelector('.dialog-close')!.addEventListener('click', () => dialog.close(), { signal: this.abort.signal });
      dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } }, { signal: this.abort.signal });
    });
    this.root.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(button => {
      button.addEventListener('click', () => {
        this.filter = button.dataset.filter!;
        this.root.querySelectorAll('[data-filter]').forEach(item => { const selected = (item as HTMLElement).dataset.filter === this.filter; item.classList.toggle('selected', selected); item.setAttribute('aria-pressed', String(selected)); });
        this.renderToys();
      }, { signal: this.abort.signal });
    });
    this.element('toy-grid').addEventListener('click', event => {
      const card = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-toy]');
      if (card) { this.selectToy(card.dataset.toy as ToyId); this.element<HTMLDialogElement>('toy-dialog').close(); }
    }, { signal: this.abort.signal });
    window.addEventListener('keydown', event => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || this.root.querySelector('dialog[open]')) return;
      if ((event.target as HTMLElement).matches('input, textarea, select, [contenteditable="true"]')) return;
      if (event.code === 'Space' && !(event.target as HTMLElement).closest('button, a')) { event.preventDefault(); this.handlers?.pause(); }
      else if (event.key.toLowerCase() === 'r') this.element('reset').click();
      else if (event.key.toLowerCase() === 't') this.openDialog('toy-dialog');
      else if (event.key.toLowerCase() === 'm') void this.toggleSound();
      else if (event.key.toLowerCase() === 'n') this.toggleNight();
    }, { signal: this.abort.signal });
  }

  private openDialog(id: string) { this.closeDialogs(); this.element<HTMLDialogElement>(id).showModal(); }
  private closeDialogs() { this.root.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach(dialog => dialog.close()); }

  selectToy(id: ToyId) {
    const result = this.handlers?.select(id);
    const name = toyDefinitions.find(toy => toy.id === id)?.name;
    this.toast(result === 'queued' ? `下一站：${name}，先玩完这一小段` : result === 'unreachable' ? '这条路有点挤，换个玩具试试吧' : `走吧，去找${name}`);
  }

  private toggleNight() {
    this.nightMode = this.handlers?.night() ?? false;
    this.root.classList.toggle('is-night', this.nightMode);
    this.element('night').innerHTML = icon(this.nightMode ? 'moon' : 'sun', 19);
    this.element('night').setAttribute('aria-pressed', String(this.nightMode));
    this.element('night').setAttribute('aria-label', this.nightMode ? '切换到白天' : '切换到夜晚');
    this.element('weather').innerHTML = `${icon(this.nightMode ? 'moon' : 'sun', 17)}<span>${this.nightMode ? '温柔晚安' : '阳光正好'}</span>`;
    this.element('weather').setAttribute('aria-label', this.nightMode ? '切换到白天' : '切换到夜晚');
    this.element('room-note').textContent = this.nightMode ? '留一盏温柔的小灯' : '午后的小小乐园';
  }

  private async toggleSound() {
    try {
      const enabled = await this.handlers?.sound() ?? false;
      this.element('sound').innerHTML = icon(enabled ? 'volume' : 'muted', 19);
      this.element('sound').setAttribute('aria-pressed', String(enabled));
      this.element('sound').setAttribute('aria-label', enabled ? '关闭环境音乐' : '开启环境音乐');
      this.toast(enabled ? '给小小世界，加一点轻轻的音乐' : '安安静静，也很好');
    } catch { this.toast('声音暂时无法开启，请再试一次'); }
  }

  setRotating(value: boolean) { this.element('rotate').setAttribute('aria-pressed', String(value)); this.element('rotate').setAttribute('aria-label', value ? '停止自动旋转' : '开启自动旋转'); }
  private setFollowing(value: boolean) { this.element('character-focus').setAttribute('aria-pressed', String(value)); this.element('character-focus').setAttribute('aria-label', value ? '退出跟随，返回全景' : '近距离跟随陶陶'); }
  setZoom(value: number) {
    const text = `${Math.round(value * 100)}%`, output = this.element('zoom-value');
    if (output.textContent !== text) output.textContent = text;
  }

  update(state: ExplorerState) {
    const modeKey = `${state.mode}-${state.running}`;
    if (modeKey !== this.lastMode) {
      this.lastMode = modeKey;
      this.root.classList.toggle('is-paused', !state.running);
      this.root.dataset.mode = state.mode; this.root.dataset.running = String(state.running);
      this.element('pause').innerHTML = `${icon(state.running ? 'pause' : 'play', 17)}<span>${state.running ? '暂停' : '继续'}</span>`;
      this.element('pause').setAttribute('aria-pressed', String(!state.running));
      this.element('pause').setAttribute('aria-label', state.running ? '暂停陶陶的活动' : '继续陶陶的活动');
      this.element('activity-mode').textContent = !state.running ? '休息一下下' : state.mode === 'walking' ? '迈着小步子出发' : '自在玩耍中';
    }
    if (state.label !== this.lastLabel) { this.lastLabel = state.label; this.element('activity-label').textContent = state.label; }
    if (state.thought !== this.lastThought) { this.lastThought = state.thought; this.element('character-thought').textContent = state.thought; }
    if (state.toy?.id !== this.currentToy) {
      this.currentToy = state.toy?.id;
      this.root.dataset.toy = this.currentToy ?? '';
      this.element('activity-icon').innerHTML = icon(state.toy?.icon ?? 'sparkle', 24);
      this.element('activity-icon').style.setProperty('--toy-color', state.toy?.color ?? '#c8d2b5');
      this.element('activity-subtitle').textContent = state.toy?.subtitle ?? '跟着好奇心，自由探索';
      this.renderToys();
    }
    this.element('activity-progress').style.transform = `scaleX(${Math.max(.015, state.progress)})`;
    this.root.querySelector('.activity-progress')!.setAttribute('aria-valuenow', String(Math.round(state.progress * 100)));
    const count = String(new Set(this.journal.map(entry => entry.toyId)).size), countElement = this.element('discovery-count');
    if (countElement.textContent !== count) countElement.textContent = count;
  }

  setCharacterPosition(x: number, y: number, visible: boolean) {
    const label = this.element('character-label'); label.hidden = !visible;
    label.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`;
  }

  tooltip(toy: ToyInstance | null, x = 0, y = 0) {
    const element = this.element('scene-tooltip'); element.hidden = !toy;
    if (!toy) return;
    element.innerHTML = `<span class="tooltip-icon" style="color:${toy.color}">${icon(toy.icon, 19)}</span><span>${toy.name}<small>点击，和陶陶一起玩</small></span>${icon('arrow', 15)}`;
    element.style.left = `${Math.min(window.innerWidth - 230, Math.max(12, x + 18))}px`;
    element.style.top = `${Math.min(window.innerHeight - 90, Math.max(12, y - 30))}px`;
  }

  private renderToys() {
    const toys = toyDefinitions.filter(toy => this.filter === '全部' || toy.category === this.filter);
    this.element('toy-grid').innerHTML = toys.map(toy => `<button class="toy-card ${toy.id === this.currentToy ? 'active' : ''}" data-toy="${toy.id}" aria-label="和陶陶一起玩${toy.name}" style="--toy-color:${toy.color}"><span class="toy-illustration">${icon(toy.icon, 38)}<span class="toy-card-check">${icon('check', 12)}</span></span><span class="toy-card-name">${toy.name}</span><span class="toy-card-category">${toy.category}</span></button>`).join('');
  }

  private loadJournal() {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem('taotao-journal-v1') ?? '[]');
      if (!Array.isArray(saved)) return;
      const ids = new Set(toyDefinitions.map(toy => toy.id));
      for (const entry of saved.slice(-80)) if (entry && typeof entry.time === 'number' && ids.has(entry.toyId) && localDay(entry.time) === localDay(Date.now())) this.journal.push({ toyId: entry.toyId, time: entry.time });
    } catch { /* Private browsing or full storage must not prevent play. */ }
  }

  visit(toy: ToyInstance) {
    const today = localDay(Date.now());
    for (let i = this.journal.length - 1; i >= 0; i--) if (localDay(this.journal[i].time) !== today) this.journal.splice(i, 1);
    this.journal.push({ toyId: toy.id, time: Date.now() });
    while (this.journal.length > 80) this.journal.shift();
    try { localStorage.setItem('taotao-journal-v1', JSON.stringify(this.journal)); } catch { /* Keep the current session in memory. */ }
    this.element('journal-dot').hidden = false;
    if (this.element<HTMLDialogElement>('journal-dialog').open) this.renderJournal();
  }

  private renderJournal() {
    const unique = new Set(this.journal.map(entry => entry.toyId)).size;
    this.element('journal-content').innerHTML = `<div class="journal-stats"><div><b>${this.journal.length}</b><span>次小小探索</span></div><div><b>${unique}<small> / ${toyDefinitions.length}</small></b><span>件玩具新朋友</span></div></div><div class="journal-list">${this.journal.length ? [...this.journal].reverse().map(entry => {
      const toy = toyDefinitions.find(item => item.id === entry.toyId)!;
      return `<div class="journal-entry"><span class="journal-entry-icon" style="--toy-color:${toy.color}">${icon(toy.icon, 20)}</span><div><b>${toy.name}</b><span>${toy.subtitle}</span></div><time>${new Date(entry.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</time></div>`;
    }).join('') : `<div class="journal-empty">${icon('footprints', 40)}<p>第一段小冒险，马上开始。</p><span>陪陶陶选一件喜欢的玩具吧。</span></div>`}</div>`;
  }

  setLoading(progress: number, message: string) {
    this.element('loading-progress').style.width = `${progress}%`;
    this.element('loading-message').textContent = message;
  }

  ready() { this.root.classList.add('is-ready'); this.loadingTimer = setTimeout(() => { this.element('loading-screen').hidden = true; }, this.reducedMotion ? 0 : 700); }
  error(message: string) {
    if (this.loadingTimer) clearTimeout(this.loadingTimer);
    this.root.classList.remove('is-ready');
    this.element('loading-screen').hidden = false;
    this.element('loading-screen').classList.add('has-error');
    this.element('loading-message').textContent = message;
    this.root.querySelector('.loading-title')!.textContent = '小小世界还没准备好';
    this.element('loading-screen').insertAdjacentHTML('beforeend', '<button class="retry-button" id="retry">再试一次</button>');
    this.listen('retry', () => location.reload());
  }

  toast(message: string) {
    const element = this.element('toast'); element.textContent = message; element.hidden = false;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { element.hidden = true; }, 2900);
  }

  dispose() { this.abort.abort(); if (this.toastTimer) clearTimeout(this.toastTimer); if (this.loadingTimer) clearTimeout(this.loadingTimer); }
}
