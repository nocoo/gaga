import * as THREE from 'three';
import { box, cylinder, sphere } from '../geometry';
import { colors } from '../palette';
import type { ToyModel } from './types';

export function createMusic(): ToyModel {
  const group = new THREE.Group();
  const instrument = new THREE.Group(); group.add(instrument); instrument.rotation.y = -.1;
  box(instrument, [1.2, .115, .48], [0, .09, 0], colors.woodLight, .05, 'wood');
  box(instrument, [1.11, .06, .045], [0, .19, -.14], '#bbaa85', .016);
  box(instrument, [1.11, .06, .045], [0, .19, .14], '#bbaa85', .016);
  const keys: THREE.Mesh[] = [];
  [colors.coral, colors.peach, colors.yellow, '#d2cb8d', colors.sage, colors.blue, '#a6a5b8'].forEach((color, i) => {
    const length = .55 - i * .038;
    keys.push(box(instrument, [.134, .07, length], [-.48 + i * .16, .235, 0], color, .025));
    keys[keys.length - 1].userData.dynamic = true;
    for (const z of [-length * .31, length * .31]) cylinder(instrument, .012, .012, .012, [-.48 + i * .16, .276, z], '#d4caba', 12);
  });
  const mallets: THREE.Group[] = [];
  for (let i = 0; i < 2; i++) {
    const mallet = new THREE.Group(); group.add(mallet); mallet.position.set(i ? .26 : -.24, .095, .46); mallet.rotation.y = i ? -.3 : .3;
    mallet.userData.dynamic = true;
    cylinder(mallet, .018, .018, .4, [0, 0, 0], colors.woodLight).rotation.x = Math.PI / 2;
    sphere(mallet, .05, [0, 0, -.21], colors.cream);
    mallets.push(mallet);
  }
  return {
    group,
    update: ({ active, elapsed, hands }) => {
      keys.forEach((key, i) => {
        const t = elapsed * 3.2;
        key.position.y = .235 + (active && Math.floor(t) % 7 === i ? Math.sin((t % 1) * Math.PI) * .018 : 0);
      });
      mallets.forEach((mallet, i) => {
        mallet.position.set(i ? .26 : -.24, .095, .46);
        if (active && hands) {
          const hand = group.worldToLocal((i ? hands.right : hands.left).clone());
          mallet.position.copy(hand).add(new THREE.Vector3(0, -.045, .13));
        }
        mallet.rotation.y = active ? Math.PI + (i ? -.1 : .1) : (i ? -.3 : .3);
        mallet.rotation.x = active ? .65 + Math.sin(elapsed * 5 + i * Math.PI) * -.2 : 0;
      });
    },
  };
}
