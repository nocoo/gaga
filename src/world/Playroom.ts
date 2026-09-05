import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Taotao } from '../character/Taotao';
import { Explorer } from '../character/Explorer';
import { Soundscape } from '../audio/Soundscape';
import type { AppUI } from '../ui/AppUI';
import { createRoom } from './room';
import type { Room } from './room';
import { toyDefinitions } from './toys';
import type { ToyId, ToyInstance } from './toys/types';
import { Navigation } from './navigation';
import { batchStaticMeshes } from './batch';
import { disposeGeometryCache } from './geometry';
import { disposeTextures, shadowTexture } from './textures';

const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
const startPosition = new THREE.Vector3(13, 13.5, 16);
const startTarget = new THREE.Vector3(0, 1.53, 0);

export class Playroom {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.OrthographicCamera(-10, 10, 6, -6, .1, 90);
  readonly renderer: THREE.WebGLRenderer;
  readonly controls: OrbitControls;
  readonly composer: EffectComposer;
  readonly ao: SSAOPass;
  readonly sound = new Soundscape();
  readonly toys: ToyInstance[] = [];
  explorer!: Explorer;
  character!: Taotao;
  navigation!: Navigation;
  private room!: Room;
  private readonly ambient = new THREE.HemisphereLight('#fff7e6', '#c5b692', 1.8);
  private readonly sun = new THREE.DirectionalLight('#fff1d2', 2.6);
  private readonly fill = new THREE.DirectionalLight('#e3edee', .8);
  private readonly lamp = new THREE.PointLight('#ffd5a0', 0, 15, 1.5);
  private readonly castleLamp = new THREE.PointLight('#ffce87', 0, 6, 1.3);
  private resizeObserver: ResizeObserver;
  private readonly abort = new AbortController();
  private animationId = 0;
  private lastFrame = 0;
  private lastUIUpdate = 0;
  private night = false;
  private nightBlend = 0;
  private hover: ToyInstance | null = null;
  private pointerDown = new THREE.Vector2();
  private dragging = false;
  private initialized = false;
  private lastNote = -1;
  private resetProgress = 1;
  private resetPosition = new THREE.Vector3();
  private resetTarget = new THREE.Vector3();
  private resetZoom = 1;
  private following = false;
  private focusProgress = 0;
  private focusZoom = 1;
  private disposed = false;
  private raycaster = new THREE.Raycaster();
  private viewportRect!: DOMRect;

  constructor(private readonly ui: AppUI) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 761 ? 1.7 : 1.65));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = .98;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.info.autoReset = false;
    this.renderer.domElement.setAttribute('aria-label', '温暖的三维玩具房，陶陶在爬爬垫上玩耍');
    this.ui.viewport.append(this.renderer.domElement);
    this.camera.position.copy(startPosition); this.camera.lookAt(startTarget);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.copy(startTarget);
    this.controls.enableDamping = true; this.controls.dampingFactor = .065;
    this.controls.enablePan = false;
    this.controls.minZoom = .72; this.controls.maxZoom = 2.5;
    this.controls.minPolarAngle = .24; this.controls.maxPolarAngle = 1.35;
    this.controls.rotateSpeed = .5; this.controls.zoomSpeed = .7; this.controls.autoRotateSpeed = .38;
    this.controls.touches.ONE = THREE.TOUCH.ROTATE; this.controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
    this.controls.update();
    this.sun.position.set(-3.5, 8, 5); this.sun.target.position.set(-.5, 0, -1.5);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.left = -9; this.sun.shadow.camera.right = 9;
    this.sun.shadow.camera.top = 9; this.sun.shadow.camera.bottom = -9;
    this.sun.shadow.camera.near = .5; this.sun.shadow.camera.far = 28;
    this.sun.shadow.normalBias = .032; this.sun.shadow.bias = -.00012;
    this.sun.shadow.radius = 3;
    this.fill.position.set(7, 6, -3);
    this.lamp.position.set(-1.4, 3, -2.7); this.castleLamp.position.set(2.4, 1.55, -2.3);
    this.scene.add(this.ambient, this.sun, this.sun.target, this.fill, this.lamp, this.castleLamp);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.ShadowMaterial({ color: '#806b4e', transparent: true, opacity: .1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -.327; ground.receiveShadow = true;
    this.scene.add(ground);
    const contact = new THREE.Mesh(new THREE.PlaneGeometry(16.4, 14.5), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: .27 }));
    contact.rotation.x = -Math.PI / 2; contact.position.y = -.326; this.scene.add(contact);
    const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: this.renderer.capabilities.maxSamples >= 4 ? 4 : 0 });
    this.composer = new EffectComposer(this.renderer, target);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.ao = new SSAOPass(this.scene, this.camera, 512, 512, 16);
    this.ao.kernelRadius = .34; this.ao.minDistance = .0002; this.ao.maxDistance = .025;
    this.ao.ssaoMaterial.defines.PERSPECTIVE_CAMERA = 0;
    this.ao.depthRenderMaterial.defines.PERSPECTIVE_CAMERA = 0;
    this.composer.addPass(this.ao);
    this.composer.addPass(new OutputPass());
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.ui.viewport);
    this.resize(); this.bindPointer();
    this.renderer.domElement.addEventListener('webglcontextlost', event => {
      event.preventDefault(); cancelAnimationFrame(this.animationId);
      this.ui.error('图形环境暂时中断了，重新打开小屋就可以继续。');
    }, { signal: this.abort.signal });
    document.addEventListener('visibilitychange', () => { this.lastFrame = performance.now(); }, { signal: this.abort.signal });
  }

  async init() {
    this.ui.setLoading(15, '让阳光，轻轻照进来。'); await nextFrame();
    this.room = createRoom(); this.scene.add(this.room.group);
    this.ui.setLoading(46, '把心爱的玩具，一件件摆好。'); await nextFrame();
    for (const [i, definition] of toyDefinitions.entries()) {
      const model = definition.create(definition);
      batchStaticMeshes(model.group);
      model.group.position.set(...definition.position);
      model.group.name = definition.id;
      model.group.traverse(object => { object.userData.toyId = definition.id; });
      this.scene.add(model.group);
      const marker = new THREE.Mesh(new THREE.RingGeometry(.52, .55, 64), new THREE.MeshBasicMaterial({ color: '#fff8d9', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
      marker.rotation.x = -Math.PI / 2;
      marker.position.set(definition.approach[0], .191, definition.approach[1]); this.scene.add(marker);
      this.toys.push({ ...definition, model, marker });
      if (i % 3 === 2) { this.ui.setLoading(46 + i * 4, '小火车、绘本，还有一座小城堡。'); await nextFrame(); }
    }
    this.character = new Taotao(); this.scene.add(this.character.root, this.character.shadow);
    this.navigation = new Navigation([
      ...toyDefinitions.flatMap(toy => toy.obstacles),
      { x: -5.12, z: -.73, width: .78, depth: 2.5 },
      { x: -3.14, z: -4.03, width: 2.75, depth: .9 },
      { x: -.56, z: -4.25, width: 2.4, depth: .85 },
    ]);
    this.explorer = new Explorer(this.character, this.toys, this.navigation);
    for (const entry of this.ui.journal) this.explorer.visited.add(entry.toyId);
    this.explorer.onVisit = toy => { this.ui.visit(toy); this.sound.chime(2); };
    this.ui.setLoading(88, '陶陶准备好啦，你呢？'); await nextFrame();
    this.scene.updateMatrixWorld(true);
    this.toys.forEach(toy => toy.model.update?.({ time: 0, delta: 0, active: false, progress: 0, elapsed: 0 }));
    await this.renderer.compileAsync(this.scene, this.camera);
    if (this.disposed) return;
    this.initialized = true;
    this.ui.setLoading(100, '欢迎来到陶陶的小小世界。');
    this.ui.update(this.explorer.state);
    this.lastFrame = performance.now();
    this.tick(this.lastFrame);
    await nextFrame(); this.ui.ready();
  }

  private resize() {
    this.viewportRect = this.ui.viewport.getBoundingClientRect();
    const width = Math.max(1, this.viewportRect.width), height = Math.max(1, this.viewportRect.height);
    const aspect = width / height;
    const viewHeight = Math.max(12.5, 17 / aspect);
    this.camera.left = -viewHeight * aspect / 2; this.camera.right = viewHeight * aspect / 2;
    this.camera.top = viewHeight / 2; this.camera.bottom = -viewHeight / 2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height); this.composer.setSize(width, height);
  }

  private getToyAt(x: number, y: number) {
    const r = this.viewportRect;
    this.raycaster.setFromCamera(new THREE.Vector2((x - r.left) / r.width * 2 - 1, -(y - r.top) / r.height * 2 + 1), this.camera);
    const hits = this.raycaster.intersectObjects(this.toys.map(toy => toy.model.group), true);
    const id = hits.find(hit => hit.object.visible && hit.object.userData.toyId)?.object.userData.toyId as ToyId | undefined;
    return this.toys.find(toy => toy.id === id) ?? null;
  }

  private bindPointer() {
    const canvas = this.renderer.domElement, signal = this.abort.signal;
    canvas.addEventListener('pointerdown', event => { this.pointerDown.set(event.clientX, event.clientY); this.dragging = false; this.resetProgress = 1; this.focusProgress = 1; this.ui.tooltip(null); }, { signal });
    canvas.addEventListener('pointermove', event => {
      if (!this.initialized) return;
      if (event.buttons) { if (this.pointerDown.distanceTo(new THREE.Vector2(event.clientX, event.clientY)) > 5) this.dragging = true; this.hover = null; this.ui.tooltip(null); return; }
      this.hover = this.getToyAt(event.clientX, event.clientY);
      canvas.style.cursor = this.hover ? 'pointer' : 'grab';
      this.ui.tooltip(this.hover, event.clientX, event.clientY);
    }, { signal });
    canvas.addEventListener('pointerup', event => {
      if (!this.initialized || this.dragging || this.pointerDown.distanceTo(new THREE.Vector2(event.clientX, event.clientY)) > 5) return;
      const toy = this.getToyAt(event.clientX, event.clientY);
      if (toy) this.ui.selectToy(toy.id);
    }, { signal });
    canvas.addEventListener('pointerleave', () => { this.hover = null; this.ui.tooltip(null); }, { signal });
    canvas.addEventListener('wheel', () => { this.resetProgress = 1; this.focusProgress = 1; }, { signal, passive: true });
    this.controls.addEventListener('start', () => { this.resetProgress = 1; });
  }

  togglePause() { this.explorer.running = !this.explorer.running; this.ui.update(this.explorer.state); }
  selectToy(id: ToyId) { const result = this.explorer.select(id); this.ui.update(this.explorer.state); return result; }
  zoom(direction: number) { this.resetProgress = 1; this.focusProgress = 1; this.camera.zoom = THREE.MathUtils.clamp(this.camera.zoom * (direction > 0 ? 1.15 : 1 / 1.15), .72, 2.5); this.camera.updateProjectionMatrix(); }
  rotate() { this.controls.autoRotate = !this.controls.autoRotate; this.resetProgress = 1; return this.controls.autoRotate; }
  reset() {
    this.following = false;
    this.controls.autoRotate = false;
    this.resetPosition.copy(this.camera.position); this.resetTarget.copy(this.controls.target); this.resetZoom = this.camera.zoom; this.resetProgress = 0;
    // Clear OrbitControls' residual rotation before tweening, without a visible jump.
    this.controls.enableDamping = false; this.controls.update(0); this.controls.enableDamping = true;
    this.camera.position.copy(this.resetPosition); this.controls.target.copy(this.resetTarget); this.camera.zoom = this.resetZoom;
    this.camera.updateProjectionMatrix();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) this.resetProgress = .999;
  }
  focus() {
    if (this.following) { this.reset(); return false; }
    this.following = true; this.focusProgress = 0; this.focusZoom = this.camera.zoom;
    this.resetProgress = 1; this.controls.enabled = true; this.controls.autoRotate = false;
    return true;
  }
  toggleNight() { this.night = !this.night; this.room.setNight(this.night); return this.night; }

  private simulationStep(delta: number) {
    this.explorer.update(delta);
    const time = this.explorer.time;
    const hands = this.character.handPositions();
    this.room.update(time);
    for (const toy of this.toys) {
      const active = this.explorer.mode === 'playing' && this.explorer.current?.id === toy.id;
      toy.model.update?.({ time, delta: this.explorer.running ? delta : 0, active, progress: active ? this.explorer.progress : 0, elapsed: active ? this.explorer.elapsed : 0, hands: active ? hands : undefined });
      const material = toy.marker.material as THREE.MeshBasicMaterial;
      const highlighted = this.hover === toy || (this.explorer.current === toy && this.explorer.mode === 'walking');
      material.opacity = THREE.MathUtils.damp(material.opacity, highlighted ? .67 : 0, 7, delta);
      toy.marker.scale.setScalar(1 + Math.sin(time * 2) * .035);
    }
    if (this.explorer.current?.action === 'music' && this.explorer.mode === 'playing' && this.explorer.running) {
      const note = Math.floor(this.explorer.elapsed * 2.5);
      if (note !== this.lastNote) { this.lastNote = note; this.sound.chime(note); }
    } else this.lastNote = -1;
  }

  private tick = (now: number) => {
    if (this.disposed) return;
    this.animationId = requestAnimationFrame(this.tick);
    const delta = Math.min((now - this.lastFrame) / 1000, .05); this.lastFrame = now;
    if (document.hidden || !this.initialized) return;
    this.simulationStep(delta);
    if (this.resetProgress < 1) {
      this.resetProgress = Math.min(1, this.resetProgress + delta * 1.8);
      const t = THREE.MathUtils.smoothstep(this.resetProgress, 0, 1);
      this.camera.position.copy(this.resetPosition).lerp(startPosition, t);
      this.controls.target.copy(this.resetTarget).lerp(startTarget, t);
      this.camera.zoom = THREE.MathUtils.lerp(this.resetZoom, 1, t); this.camera.updateProjectionMatrix();
      if (this.resetProgress === 1) this.controls.enabled = true;
    }
    if (this.following) {
      const target = this.character.root.position.clone().add(new THREE.Vector3(0, .83 + this.character.body.position.y * .4, 0));
      const next = this.controls.target.clone().lerp(target, 1 - Math.exp(-delta * 3.5));
      this.camera.position.add(next.clone().sub(this.controls.target)); this.controls.target.copy(next);
      if (this.focusProgress < 1) {
        this.focusProgress = Math.min(1, this.focusProgress + delta * 1.25);
        this.camera.zoom = THREE.MathUtils.lerp(this.focusZoom, window.innerWidth < 761 ? 2.25 : 1.95, THREE.MathUtils.smoothstep(this.focusProgress, 0, 1));
        this.camera.updateProjectionMatrix();
      }
    }
    this.controls.update(delta);
    this.room.setView(this.camera.position.clone().sub(this.controls.target).normalize());
    this.nightBlend = THREE.MathUtils.damp(this.nightBlend, this.night ? 1 : 0, 2.2, delta);
    const blend = this.nightBlend;
    this.ambient.intensity = THREE.MathUtils.lerp(1.8, .75, blend);
    this.ambient.color.set('#fff7e6').lerp(new THREE.Color('#aebcce'), blend);
    this.sun.intensity = THREE.MathUtils.lerp(2.6, .62, blend);
    this.sun.color.set('#fff1d2').lerp(new THREE.Color('#b2cced'), blend);
    this.fill.intensity = THREE.MathUtils.lerp(.8, .35, blend);
    this.lamp.intensity = blend * 13; this.castleLamp.intensity = blend * 3;
    this.ao.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix);
    this.ao.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse);
    this.renderer.shadowMap.needsUpdate = true;
    this.renderer.info.reset(); this.composer.render();
    const point = this.character.root.position.clone().add(new THREE.Vector3(0, this.character.body.position.y + 1.73, 0));
    const projected = this.screenPoint(point);
    this.ui.setCharacterPosition(projected.x, projected.y, projected.visible);
    if (now - this.lastUIUpdate > 130) { this.ui.update(this.explorer.state); this.ui.setZoom(this.camera.zoom); this.lastUIUpdate = now; }
  };

  screenPoint(point: THREE.Vector3) {
    const projected = point.clone().project(this.camera), r = this.viewportRect;
    return { x: r.left + (projected.x + 1) / 2 * r.width, y: r.top + (1 - projected.y) / 2 * r.height, visible: Math.abs(projected.x) < .97 && Math.abs(projected.y) < .96 && projected.z > -1 && projected.z < 1 };
  }

  /** Development diagnostics exercise the same simulation used by real frames. */
  diagnostics() {
    return {
      state: () => ({ mode: this.explorer.mode, running: this.explorer.running, toy: this.explorer.current?.id, queued: this.explorer.queued?.id, elapsed: this.explorer.elapsed, time: this.explorer.time, progress: this.explorer.progress, position: this.character.root.position.toArray(), zoom: this.camera.zoom, camera: this.camera.position.toArray(), following: this.following, night: this.night, sound: this.sound.enabled, visits: [...this.explorer.visited], arm: this.character.rightArm.rotation.x, calls: this.renderer.info.render.calls, triangles: this.renderer.info.render.triangles }),
      advance: (seconds: number) => { for (let t = 0; t < seconds; t += 1 / 60) this.simulationStep(Math.min(1 / 60, seconds - t)); this.ui.update(this.explorer.state); },
      projectToy: (id: ToyId) => { const toy = this.toys.find(item => item.id === id)!; return this.screenPoint(toy.model.group.position.clone().add(new THREE.Vector3(0, id === 'ball' ? .26 : .4, 0))); },
      toyTransforms: (id: ToyId) => {
        const values: number[] = [];
        this.toys.find(toy => toy.id === id)!.model.group.traverse(object => {
          if (object.userData.dynamic) values.push(...object.position.toArray(), object.rotation.x, object.rotation.y, object.rotation.z, Number(object.visible));
        });
        return values;
      },
      routes: () => this.toys.flatMap(from => this.toys.map(to => {
        const start = new THREE.Vector3(from.approach[0], .19, from.approach[1]);
        const end = new THREE.Vector3(to.approach[0], .19, to.approach[1]);
        const path = this.navigation.path(start, end);
        return { from: from.id, to: to.id, reachable: path.length > 0 && path[path.length - 1].distanceTo(end) < .05, clear: path.every(point => this.navigation.isWalkable(point.x, point.z)) };
      })),
    };
  }

  dispose() {
    this.disposed = true; cancelAnimationFrame(this.animationId);
    this.abort.abort(); this.resizeObserver.disconnect(); this.controls.dispose(); this.sound.dispose();
    const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
    this.scene.traverse(object => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
        geometries.add(object.geometry);
        const list = Array.isArray(object.material) ? object.material : [object.material];
        for (const mat of list) { materials.add(mat); for (const value of Object.values(mat)) if (value instanceof THREE.Texture) textures.add(value); }
      }
    });
    geometries.forEach(item => item.dispose()); materials.forEach(item => item.dispose()); textures.forEach(item => item.dispose());
    this.ao.dispose(); this.composer.passes.forEach(pass => { if (pass !== this.ao) pass.dispose(); }); this.composer.dispose();
    this.sun.shadow.dispose(); this.renderer.dispose(); this.renderer.domElement.remove();
    disposeGeometryCache(); disposeTextures();
  }
}
