import * as THREE from 'three';
import { box, cylinder, material, mesh } from '../geometry';
import { colors } from '../palette';
import { labelTexture } from '../textures';
import type { ToyModel } from './types';

export function createBlocks(): ToyModel {
  const group = new THREE.Group();
  // A shallow wooden tray, with a little hand-built town spilling out of it.
  box(group, [1.35, .055, 1.05], [0, .018, 0], '#dec398', .12, 'wood');
  const block = (x: number, y: number, z: number, color: string, letter?: string) => {
    const g = new THREE.Group(); group.add(g); g.position.set(x, y, z);
    box(g, [.28, .28, .28], [0, .14, 0], color, .025, 'wood');
    if (letter) {
      mesh(new THREE.PlaneGeometry(.19, .19), new THREE.MeshStandardMaterial({ map: labelTexture(letter, '#faf1da', color), roughness: .88 }), g, [0, .14, .142]);
    }
    return g;
  };
  block(-.33, .05, -.19, colors.sage, 'A'); block(0, .05, -.19, colors.coral, 'B'); block(.33, .05, -.19, colors.yellow, 'C');
  box(group, [1, .14, .32], [0, .4, -.19], colors.woodLight, .025, 'wood');
  block(-.22, .48, -.19, colors.blue); block(.2, .48, -.19, colors.peach);
  const roof = cylinder(group, 0, .27, .28, [0, .9, -.19], colors.coral, 4); roof.rotation.y = Math.PI / 4;
  const loose = block(.55, .055, .3, colors.yellow, 'D'); loose.rotation.y = .3;
  block(-.58, .055, .36, colors.blue).rotation.y = -.32;
  cylinder(group, .13, .13, .25, [.13, .17, .4], material(colors.sageLight, 'wood'));
  const held = block(.18, .065, -.28, colors.sageLight);
  held.userData.dynamic = true;
  return {
    group,
    update: ({ active, elapsed, hands }) => {
      const t = active ? elapsed % 4.4 : 0;
      const grip = Math.min(THREE.MathUtils.smoothstep(t, .75, 1.25), 1 - THREE.MathUtils.smoothstep(t, 3.35, 4.1));
      held.position.set(.18, .065, -.28);
      if (active && hands) {
        const hand = group.worldToLocal(hands.right.clone()).add(new THREE.Vector3(-.04, -.14, .04));
        held.position.lerp(hand, grip);
      }
      held.rotation.y = grip * .2;
    },
  };
}
