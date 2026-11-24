import * as THREE from "three";
import { box, cylinder, material, mesh } from "../geometry";
import { colors } from "../palette";
import { labelTexture } from "../textures";
import type { ToyModel } from "./types";

export function createBlocks(): ToyModel {
  const group = new THREE.Group();
  // A shallow wooden tray, with a little hand-built town spilling out of it.
  box(group, [1.35, 0.055, 1.05], [0, 0.018, 0], "#dec398", 0.12, "wood");
  const block = (x: number, y: number, z: number, color: string, letter?: string) => {
    const g = new THREE.Group();
    group.add(g);
    g.position.set(x, y, z);
    box(g, [0.28, 0.28, 0.28], [0, 0.14, 0], color, 0.025, "wood");
    if (letter) {
      mesh(
        new THREE.PlaneGeometry(0.19, 0.19),
        new THREE.MeshStandardMaterial({
          map: labelTexture(letter, "#faf1da", color),
          roughness: 0.88,
        }),
        g,
        [0, 0.14, 0.142],
      );
    }
    return g;
  };
  block(-0.33, 0.05, -0.19, colors.sage, "A");
  block(0, 0.05, -0.19, colors.coral, "B");
  block(0.33, 0.05, -0.19, colors.yellow, "C");
  box(group, [1, 0.14, 0.32], [0, 0.4, -0.19], colors.woodLight, 0.025, "wood");
  block(-0.22, 0.48, -0.19, colors.blue);
  block(0.2, 0.48, -0.19, colors.peach);
  const roof = cylinder(group, 0, 0.27, 0.28, [0, 0.9, -0.19], colors.coral, 4);
  roof.rotation.y = Math.PI / 4;
  const loose = block(0.55, 0.055, 0.3, colors.yellow, "D");
  loose.rotation.y = 0.3;
  block(-0.58, 0.055, 0.36, colors.blue).rotation.y = -0.32;
  cylinder(group, 0.13, 0.13, 0.25, [0.13, 0.17, 0.4], material(colors.sageLight, "wood"));
  const held = block(0.18, 0.065, -0.28, colors.sageLight);
  held.userData.dynamic = true;
  return {
    group,
    update: ({ active, elapsed, hands }) => {
      const t = active ? elapsed % 4.4 : 0;
      const grip = Math.min(
        THREE.MathUtils.smoothstep(t, 0.75, 1.25),
        1 - THREE.MathUtils.smoothstep(t, 3.35, 4.1),
      );
      held.position.set(0.18, 0.065, -0.28);
      if (active && hands) {
        const hand = group
          .worldToLocal(hands.right.clone())
          .add(new THREE.Vector3(-0.04, -0.14, 0.04));
        held.position.lerp(hand, grip);
      }
      held.rotation.y = grip * 0.2;
    },
  };
}
