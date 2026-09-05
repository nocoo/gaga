import * as THREE from 'three';
import { actions } from './actions';
import { idlePose, walkPose } from './poses';
import type { Taotao } from './Taotao';
import type { Navigation } from '../world/navigation';
import type { ToyId, ToyInstance } from '../world/toys/types';

export interface ExplorerState {
  running: boolean;
  mode: 'idle' | 'walking' | 'playing';
  toy: ToyInstance | null;
  queued: ToyInstance | null;
  label: string;
  thought: string;
  progress: number;
  discoveries: number;
}

export class Explorer {
  running = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  mode: ExplorerState['mode'] = 'idle';
  current: ToyInstance | null = null;
  queued: ToyInstance | null = null;
  elapsed = 0;
  time = 0;
  readonly visited = new Set<ToyId>();
  onVisit?: (toy: ToyInstance) => void;
  private route: THREE.Vector3[] = [];
  private idleTime = 0;
  private stride = 0;
  private history: ToyId[] = [];
  private distanceRemaining = 1;
  private routeLength = 1;
  private pendingDeparture: ToyInstance | null = null;

  constructor(readonly character: Taotao, private readonly toys: ToyInstance[], private readonly navigation: Navigation) {}

  get progress() { return this.current && this.mode === 'playing' ? Math.min(this.elapsed / actions[this.current.action].duration, 1) : 0; }

  select(id: ToyId): 'queued' | 'selected' | 'unreachable' {
    const toy = this.toys.find(t => t.id === id);
    if (!toy) return 'unreachable';
    this.running = true;
    // Finish elevated interactions before changing toys; never teleport off a slide.
    if (this.mode === 'playing' && this.current?.model.actorRoute) {
      this.queued = toy; return 'queued';
    }
    this.queued = null;
    return this.goTo(toy) ? 'selected' : 'unreachable';
  }

  private goTo(toy: ToyInstance) {
    const destination = new THREE.Vector3(toy.approach[0], .19, toy.approach[1]);
    const path = this.navigation.path(this.character.root.position, destination);
    if (!path.length) return false;
    this.current = toy; this.route = path;
    this.mode = 'walking'; this.elapsed = 0;
    this.routeLength = 0;
    let previous = this.character.root.position;
    for (const point of path) { this.routeLength += previous.distanceTo(point); previous = point; }
    this.distanceRemaining = this.routeLength;
    return true;
  }

  private chooseNext() {
    const unvisited = this.toys.filter(toy => !this.visited.has(toy.id));
    const choices = unvisited.length ? unvisited : this.toys.filter(toy => !this.history.slice(-2).includes(toy.id));
    const pool = [...choices].sort(() => Math.random() - .5);
    for (const toy of pool) if (this.goTo(toy)) return;
    this.idleTime = 0;
  }

  update(delta: number) {
    if (!this.running) return;
    this.time += delta;
    const root = this.character.root;
    if (this.mode === 'idle') {
      this.idleTime += delta;
      const pose = idlePose(this.time);
      if (this.time < 2.6) { pose.rightArmX = -2.25; pose.rightArmZ = .5 + Math.sin(this.time * 8) * .2; pose.rightElbow = -.35; pose.headZ = -.06; }
      this.character.applyPose(pose, delta, this.time);
      if (this.idleTime > (this.visited.size ? 1.1 : 2.9)) {
        if (this.pendingDeparture) { const next = this.pendingDeparture; this.pendingDeparture = null; this.goTo(next); }
        else if (!this.visited.size) this.goTo(this.toys.find(toy => toy.id === 'blocks')!);
        else this.chooseNext();
      }
      return;
    }
    if (this.mode === 'walking') {
      const speed = 1.08;
      let budget = delta * speed;
      while (budget > 0 && this.route.length) {
        const target = this.route[0];
        const difference = target.clone().sub(root.position); difference.y = 0;
        const distance = difference.length();
        if (distance < .015) { root.position.copy(target); this.route.shift(); continue; }
        const step = Math.min(distance, budget);
        this.character.face(Math.atan2(difference.x, difference.z), delta);
        root.position.addScaledVector(difference, step / distance); root.position.y = .19;
        budget -= step; this.distanceRemaining = Math.max(0, this.distanceRemaining - step); this.stride += step * 10;
      }
      this.character.applyPose(walkPose(this.stride), delta, this.time);
      if (!this.route.length && this.current) {
        this.mode = 'playing'; this.elapsed = 0;
        this.visited.add(this.current.id); this.history.push(this.current.id); this.history = this.history.slice(-4);
        this.onVisit?.(this.current);
      }
      return;
    }
    if (!this.current) return;
    this.elapsed += delta;
    const action = actions[this.current.action];
    const p = this.progress;
    if (this.current.model.actorRoute) {
      const route = this.current.model.actorRoute(p, this.elapsed);
      root.position.copy(route.position).add(this.current.model.group.position); root.position.y += .03;
      this.character.face(route.facing, delta);
    } else {
      const look = this.current.lookAt;
      this.character.face(Math.atan2(look[0] - root.position.x, look[1] - root.position.z), delta);
    }
    this.character.applyPose(action.sample(this.elapsed, p), delta, this.time);
    if (p >= 1) {
      this.mode = 'idle'; this.idleTime = 0; this.elapsed = 0;
      this.pendingDeparture = this.queued; this.queued = null;
      root.position.y = .19;
    }
  }

  get state(): ExplorerState {
    const action = this.current ? actions[this.current.action] : null;
    return {
      running: this.running, mode: this.mode, toy: this.current, queued: this.queued,
      label: !this.running ? '让快乐，停留一会儿' : this.mode === 'walking' ? `去找${this.current?.name ?? '新玩具'}` : this.mode === 'playing' ? action!.label : '看看，接下来玩什么呢',
      thought: !this.running ? '休息一下下' : this.mode === 'walking' ? '发现好玩的啦！' : this.mode === 'playing' ? action!.thought : '你好呀，我是陶陶',
      progress: this.mode === 'walking' ? 1 - this.distanceRemaining / Math.max(.01, this.routeLength) : this.progress,
      discoveries: this.visited.size,
    };
  }
}
