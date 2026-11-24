import * as THREE from "three";
import { box, cylinder, sphere, torus } from "../geometry";
import { colors } from "../palette";
import type { ToyModel } from "./types";

export function createRings(): ToyModel {
  const group = new THREE.Group();
  box(group, [0.79, 0.095, 0.63], [0, 0.05, 0], colors.woodLight, 0.18, "wood");
  cylinder(group, 0.036, 0.044, 0.75, [0, 0.46, 0], colors.woodLight);
  const rings: THREE.Mesh[] = [];
  [colors.coral, colors.peach, colors.yellow, colors.sage, colors.blue].forEach((color, i) => {
    const ring = torus(group, 0.26 - i * 0.039, 0.055, [0, 0.155 + i * 0.115, 0], color);
    ring.rotation.x = Math.PI / 2;
    rings.push(ring);
  });
  sphere(group, 0.069, [0, 0.785, 0], colors.yellow);
  rings[4].userData.dynamic = true;
  const extra = torus(group, 0.19, 0.055, [0.49, 0.055, 0.27], colors.sageLight);
  extra.rotation.x = Math.PI / 2;
  return {
    group,
    update: ({ active, elapsed }) => {
      const t = active ? elapsed % 4.6 : 0;
      const lift = t > 1 && t < 3.8 ? Math.sin(((t - 1) / 2.8) * Math.PI) : 0;
      rings[4].position.y = 0.615 + lift * 0.6;
      rings[4].position.x = lift * 0.16;
      rings[4].rotation.z = lift * 0.12;
    },
  };
}
