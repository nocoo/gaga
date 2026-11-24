import * as THREE from "three";
import { box, cylinder, sphere } from "../geometry";
import { colors } from "../palette";
import type { ToyModel } from "./types";

export function createMusic(): ToyModel {
  const group = new THREE.Group();
  const instrument = new THREE.Group();
  group.add(instrument);
  instrument.rotation.y = -0.1;
  box(instrument, [1.2, 0.115, 0.48], [0, 0.09, 0], colors.woodLight, 0.05, "wood");
  box(instrument, [1.11, 0.06, 0.045], [0, 0.19, -0.14], "#bbaa85", 0.016);
  box(instrument, [1.11, 0.06, 0.045], [0, 0.19, 0.14], "#bbaa85", 0.016);
  const keys: THREE.Mesh[] = [];
  [
    colors.coral,
    colors.peach,
    colors.yellow,
    "#d2cb8d",
    colors.sage,
    colors.blue,
    "#a6a5b8",
  ].forEach((color, i) => {
    const length = 0.55 - i * 0.038;
    keys.push(box(instrument, [0.134, 0.07, length], [-0.48 + i * 0.16, 0.235, 0], color, 0.025));
    keys[keys.length - 1].userData.dynamic = true;
    for (const z of [-length * 0.31, length * 0.31])
      cylinder(instrument, 0.012, 0.012, 0.012, [-0.48 + i * 0.16, 0.276, z], "#d4caba", 12);
  });
  const mallets: THREE.Group[] = [];
  for (let i = 0; i < 2; i++) {
    const mallet = new THREE.Group();
    group.add(mallet);
    mallet.position.set(i ? 0.26 : -0.24, 0.095, 0.46);
    mallet.rotation.y = i ? -0.3 : 0.3;
    mallet.userData.dynamic = true;
    cylinder(mallet, 0.018, 0.018, 0.4, [0, 0, 0], colors.woodLight).rotation.x = Math.PI / 2;
    sphere(mallet, 0.05, [0, 0, -0.21], colors.cream);
    mallets.push(mallet);
  }
  return {
    group,
    update: ({ active, elapsed, hands }) => {
      keys.forEach((key, i) => {
        const t = elapsed * 3.2;
        key.position.y =
          0.235 + (active && Math.floor(t) % 7 === i ? Math.sin((t % 1) * Math.PI) * 0.018 : 0);
      });
      mallets.forEach((mallet, i) => {
        mallet.position.set(i ? 0.26 : -0.24, 0.095, 0.46);
        if (active && hands) {
          const hand = group.worldToLocal((i ? hands.right : hands.left).clone());
          mallet.position.copy(hand).add(new THREE.Vector3(0, -0.045, 0.13));
        }
        mallet.rotation.y = active ? Math.PI + (i ? -0.1 : 0.1) : i ? -0.3 : 0.3;
        mallet.rotation.x = active ? 0.65 + Math.sin(elapsed * 5 + i * Math.PI) * -0.2 : 0;
      });
    },
  };
}
