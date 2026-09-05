import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { colors } from './palette';
import { artTexture, surfaceTexture } from './textures';

const materials = new Map<string, THREE.MeshStandardMaterial>();
const geometries = new Map<string, THREE.BufferGeometry>();

export function material(color: string, texture?: 'wood' | 'fabric' | 'plaster' | 'foam') {
  const key = `${color}-${texture}`;
  if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({
    color: texture ? '#ffffff' : color,
    map: texture ? surfaceTexture(texture, color) : null,
    roughness: texture === 'wood' ? .78 : .9,
    metalness: 0,
  }));
  return materials.get(key)!;
}

export function mesh(geometry: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D, position: [number, number, number] = [0, 0, 0]) {
  const item = new THREE.Mesh(geometry, mat);
  item.position.set(...position); item.castShadow = true; item.receiveShadow = true;
  parent.add(item); return item;
}

export function box(parent: THREE.Object3D, size: [number, number, number], position: [number, number, number], color: string | THREE.Material, radius = .04, texture?: 'wood' | 'fabric' | 'plaster' | 'foam') {
  const r = Math.min(radius, ...size.map(n => n / 2 - .001));
  const key = `box-${size.join('-')}-${r}`;
  if (!geometries.has(key)) geometries.set(key, r > 0 ? new RoundedBoxGeometry(...size, 2, r) : new THREE.BoxGeometry(...size));
  return mesh(geometries.get(key)!, typeof color === 'string' ? material(color, texture) : color, parent, position);
}

export function sphere(parent: THREE.Object3D, radius: number, position: [number, number, number], color: string | THREE.Material, scale: [number, number, number] = [1, 1, 1]) {
  const key = 'sphere';
  if (!geometries.has(key)) geometries.set(key, new THREE.SphereGeometry(1, 24, 16));
  const item = mesh(geometries.get(key)!, typeof color === 'string' ? material(color) : color, parent, position);
  item.scale.set(radius * scale[0], radius * scale[1], radius * scale[2]); return item;
}

export function cylinder(parent: THREE.Object3D, top: number, bottom: number, height: number, position: [number, number, number], color: string | THREE.Material, segments = 24) {
  const key = `cylinder-${top}-${bottom}-${height}-${segments}`;
  if (!geometries.has(key)) geometries.set(key, new THREE.CylinderGeometry(top, bottom, height, segments));
  return mesh(geometries.get(key)!, typeof color === 'string' ? material(color) : color, parent, position);
}

export function rod(parent: THREE.Object3D, from: THREE.Vector3, to: THREE.Vector3, radius: number, color: string | THREE.Material) {
  const direction = to.clone().sub(from);
  const item = cylinder(parent, radius, radius, direction.length(), [0, 0, 0], color, 10);
  item.position.copy(from).add(to).multiplyScalar(.5);
  item.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return item;
}

export function tube(parent: THREE.Object3D, points: THREE.Vector3[], radius: number, color: string, closed = false, segments = 40) {
  const curve = new THREE.CatmullRomCurve3(points, closed);
  return mesh(new THREE.TubeGeometry(curve, segments, radius, 8, closed), material(color), parent);
}

export function torus(parent: THREE.Object3D, radius: number, tubeRadius: number, position: [number, number, number], color: string | THREE.Material, arc = Math.PI * 2) {
  const item = mesh(new THREE.TorusGeometry(radius, tubeRadius, 8, 36, arc), typeof color === 'string' ? material(color) : color, parent, position);
  return item;
}

export function archShape(width: number, height: number) {
  const radius = width / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-radius, 0); shape.lineTo(radius, 0); shape.lineTo(radius, height - radius);
  shape.absarc(0, height - radius, radius, 0, Math.PI, false);
  shape.lineTo(-radius, 0); return shape;
}

export function arch(parent: THREE.Object3D, width: number, height: number, depth: number, position: [number, number, number], color: string, opening?: { width: number; height: number }) {
  let shape = archShape(width, height);
  if (opening) {
    // A doorway touches the outer boundary: use one U-shaped contour, not a hole.
    const outer = width / 2, inner = opening.width / 2;
    shape = new THREE.Shape();
    shape.moveTo(-outer, 0); shape.lineTo(-outer, height - outer);
    shape.absarc(0, height - outer, outer, Math.PI, 0, true);
    shape.lineTo(outer, 0); shape.lineTo(inner, 0); shape.lineTo(inner, opening.height - inner);
    shape.absarc(0, opening.height - inner, inner, 0, Math.PI, false);
    shape.lineTo(-inner, 0); shape.lineTo(-outer, 0); shape.closePath();
  }
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .025, bevelThickness: .025, curveSegments: 20 });
  return mesh(geometry, material(color, 'wood'), parent, position);
}

export function star(parent: THREE.Object3D, radius: number, position: [number, number, number], color: string, depth = .055) {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2 + Math.PI / 2, r = i % 2 === 0 ? radius : radius * .46;
    if (!i) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r); else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  shape.closePath();
  return mesh(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .014, bevelThickness: .014 }), material(color), parent, position);
}

export function picture(parent: THREE.Object3D, kind: 'bunny' | 'sun' | 'alphabet' | 'bear' | 'garden', width: number, height: number, position: [number, number, number], frameColor = colors.woodLight) {
  const group = new THREE.Group(); group.position.set(...position); parent.add(group);
  box(group, [width + .12, height + .12, .085], [0, 0, 0], frameColor, .035, 'wood');
  box(group, [width + .025, height + .025, .02], [0, 0, .055], colors.cream, .005);
  const painting = mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshStandardMaterial({ map: artTexture(kind), roughness: 1 }), group, [0, 0, .07]);
  painting.castShadow = false; return group;
}

export function leaf(parent: THREE.Object3D, position: [number, number, number], scale: number, angle: number, color: string) {
  const item = sphere(parent, .17, position, color, [scale * .55, scale * 1.9, scale * .15]);
  item.rotation.z = angle; return item;
}

export function plant(parent: THREE.Object3D, position: [number, number, number], scale = 1, potColor = colors.coral) {
  const group = new THREE.Group(); group.position.set(...position); group.scale.setScalar(scale); parent.add(group);
  cylinder(group, .23, .17, .4, [0, .2, 0], material(potColor, 'plaster'));
  torus(group, .215, .025, [0, .4, 0], potColor).rotation.x = Math.PI / 2;
  cylinder(group, .205, .205, .016, [0, .397, 0], '#706044');
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4, h = .68 + Math.sin(i * 1.9) * .15;
    const end = new THREE.Vector3(Math.cos(a) * .24, h, Math.sin(a) * .24);
    rod(group, new THREE.Vector3(0, .39, 0), end, .014, colors.sageDark);
    const l = leaf(group, [end.x, end.y + .1, end.z], 1.05, -Math.cos(a) * .65, i % 2 ? '#81926c' : '#a2ae7b');
    l.rotation.y = -a;
  }
  return group;
}

export function disposeGeometryCache() {
  geometries.forEach(g => g.dispose()); geometries.clear();
  materials.forEach(m => m.dispose()); materials.clear();
}
