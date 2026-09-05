import * as THREE from 'three';
import { box, cylinder, rod, sphere, tube, material } from '../geometry';
import { colors } from '../palette';
import type { ToyDefinition, ToyModel } from './types';
import { batchStaticMeshes } from '../batch';

export function createRocker(definition: ToyDefinition): ToyModel {
  const group = new THREE.Group();
  const horse = new THREE.Group(); group.add(horse); horse.rotation.y = .45;
  horse.userData.dynamic = true;
  const wood = material(colors.woodLight, 'wood');
  for (const x of [-.24, .24]) {
    const curve: THREE.Vector3[] = [];
    for (let i = 0; i <= 12; i++) { const z = -.77 + i / 12 * 1.54; curve.push(new THREE.Vector3(x, .08 + z * z * .32, z)); }
    tube(horse, curve, .055, colors.woodDark);
    for (const z of [-.36, .34]) rod(horse, new THREE.Vector3(x, .17, z), new THREE.Vector3(x * .65, .56, z * .8), .04, wood);
  }
  box(horse, [.5, .16, .82], [0, .57, 0], colors.woodLight, .08, 'wood');
  box(horse, [.42, .085, .44], [0, .69, -.03], colors.sage, .06, 'fabric');
  const neck = box(horse, [.23, .55, .3], [0, .9, .32], colors.woodLight, .1, 'wood'); neck.rotation.x = -.22;
  sphere(horse, .21, [0, 1.15, .39], wood, [.65, 1, 1.4]);
  sphere(horse, .14, [0, 1.08, .58], wood, [.9, .76, 1.2]);
  for (const x of [-.086, .086]) {
    sphere(horse, .06, [x, 1.37, .29], colors.woodLight, [.6, 1.6, .9]).rotation.x = -.25;
    sphere(horse, .017, [x * 1.6, 1.19, .46], '#514938', [.3, 1, 1]);
  }
  for (let i = 0; i < 6; i++) sphere(horse, .072, [0, .87 + i * .075, .18], colors.woodDark, [1.1, .8, .75]);
  const handle = cylinder(horse, .025, .025, .57, [0, .98, .38], colors.woodDark); handle.rotation.z = Math.PI / 2;
  for (const x of [-.29, .29]) sphere(horse, .035, [x, .98, .38], colors.coral);
  tube(horse, [new THREE.Vector3(0, .67, -.4), new THREE.Vector3(0, .62, -.63), new THREE.Vector3(0, .38, -.67)], .045, colors.woodDark);
  batchStaticMeshes(horse);
  return {
    group,
    update: ({ active, elapsed }) => { horse.rotation.x = active ? Math.sin(elapsed * 3.4) * .13 : 0; horse.position.y = active ? Math.abs(Math.sin(elapsed * 3.4)) * .02 : 0; },
    actorRoute: (progress, elapsed) => {
      const approach = new THREE.Vector3(definition.approach[0] - definition.position[0], 0, definition.approach[1] - definition.position[2]);
      const mount = new THREE.Vector3(0, .24 + Math.abs(Math.sin(elapsed * 3.4)) * .02, -.035 + Math.sin(elapsed * 3.4) * .065);
      const position = progress < .12 ? approach.clone().lerp(mount, THREE.MathUtils.smoothstep(progress / .12, 0, 1)) : progress > .86 ? mount.clone().lerp(approach, THREE.MathUtils.smoothstep((progress - .86) / .14, 0, 1)) : mount;
      return { position, facing: .45 };
    },
  };
}
