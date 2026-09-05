import * as THREE from 'three';
import type { Obstacle } from './toys/types';

interface Node { x: number; z: number; g: number; f: number; parent: Node | null }

/** Small A* navigation grid; furniture footprints are inflated by the toddler radius. */
export class Navigation {
  private readonly cell = .24;
  private readonly minX = -4.75;
  private readonly minZ = -3.5;
  private readonly cols = 41;
  private readonly rows = 32;
  private readonly clearance = .18;
  constructor(private readonly obstacles: Obstacle[]) {}

  isWalkable(x: number, z: number) {
    if (x < this.minX || x > 4.85 || z < this.minZ || z > 3.94) return false;
    return !this.obstacles.some(obstacle => Math.abs(x - obstacle.x) < obstacle.width / 2 + this.clearance && Math.abs(z - obstacle.z) < obstacle.depth / 2 + this.clearance);
  }

  private world(x: number, z: number) { return new THREE.Vector3(this.minX + x * this.cell, .19, this.minZ + z * this.cell); }
  private valid(x: number, z: number) {
    if (x < 0 || z < 0 || x >= this.cols || z >= this.rows) return false;
    const p = this.world(x, z); return this.isWalkable(p.x, p.z);
  }

  private nearest(point: THREE.Vector3) {
    const baseX = Math.round((point.x - this.minX) / this.cell), baseZ = Math.round((point.z - this.minZ) / this.cell);
    for (let r = 0; r < 12; r++) {
      let best: { x: number; z: number; distance: number } | null = null;
      for (let dx = -r; dx <= r; dx++) for (let dz = -r; dz <= r; dz++) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
        const x = baseX + dx, z = baseZ + dz;
        if (!this.valid(x, z)) continue;
        const distance = this.world(x, z).distanceToSquared(point);
        if (!best || distance < best.distance) best = { x, z, distance };
      }
      if (best) return best;
    }
    return null;
  }

  private lineClear(a: THREE.Vector3, b: THREE.Vector3) {
    const length = a.distanceTo(b), steps = Math.ceil(length / .07);
    for (let i = 0; i <= steps; i++) {
      const p = a.clone().lerp(b, i / Math.max(steps, 1));
      if (!this.isWalkable(p.x, p.z)) return false;
    }
    return true;
  }

  path(from: THREE.Vector3, to: THREE.Vector3): THREE.Vector3[] {
    if (this.lineClear(from, to)) return [to.clone()];
    const start = this.nearest(from), end = this.nearest(to);
    if (!start || !end) return [];
    const key = (x: number, z: number) => z * this.cols + x;
    const open: Node[] = [{ x: start.x, z: start.z, g: 0, f: 0, parent: null }];
    const costs = new Map<number, number>([[key(start.x, start.z), 0]]);
    const closed = new Set<number>();
    let found: Node | null = null;
    while (open.length) {
      open.sort((a, b) => a.f - b.f);
      const current = open.shift()!; const currentKey = key(current.x, current.z);
      if (closed.has(currentKey)) continue;
      if (current.x === end.x && current.z === end.z) { found = current; break; }
      closed.add(currentKey);
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
        if (dx === 0 && dz === 0) continue;
        const x = current.x + dx, z = current.z + dz;
        if (!this.valid(x, z) || closed.has(key(x, z))) continue;
        if (dx && dz && (!this.valid(current.x + dx, current.z) || !this.valid(current.x, current.z + dz))) continue;
        const g = current.g + Math.hypot(dx, dz);
        if (g >= (costs.get(key(x, z)) ?? Infinity)) continue;
        costs.set(key(x, z), g);
        open.push({ x, z, g, f: g + Math.hypot(end.x - x, end.z - z), parent: current });
      }
    }
    if (!found) return [];
    const points: THREE.Vector3[] = [];
    for (let node: Node | null = found; node; node = node.parent) points.unshift(this.world(node.x, node.z));
    // Keep the true interaction point only when the last leg is collision-free.
    if (this.lineClear(points[points.length - 1], to)) points.push(to.clone());
    const result: THREE.Vector3[] = [];
    let current = from, i = 0;
    while (i < points.length) {
      let farthest = i;
      while (farthest + 1 < points.length && this.lineClear(current, points[farthest + 1])) farthest++;
      result.push(points[farthest]); current = points[farthest]; i = farthest + 1;
    }
    return result;
  }
}
