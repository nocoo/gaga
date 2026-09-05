import * as THREE from 'three';
import { box, cylinder, material, sphere, tube } from '../geometry';
import { colors } from '../palette';
import type { ToyModel } from './types';
import { batchStaticMeshes } from '../batch';

export function createTrain(): ToyModel {
  const group = new THREE.Group();
  const rx = 1.18, rz = .65;
  const point = (angle: number, r = 0) => new THREE.Vector3(Math.cos(angle) * (rx + r), .073, Math.sin(angle) * (rz + r));
  for (let i = 0; i < 38; i++) {
    const a = i / 38 * Math.PI * 2;
    const p = point(a);
    const sleeper = box(group, [.26, .042, .09], [p.x, .028, p.z], colors.woodLight, .012, 'wood');
    sleeper.rotation.y = -Math.atan2(Math.sin(a) * rx, Math.cos(a) * rz);
  }
  for (const offset of [-.09, .09]) {
    const points = Array.from({ length: 80 }, (_, i) => point(i / 80 * Math.PI * 2, offset));
    tube(group, points, .024, colors.woodDark, true, 100);
  }
  const cars: THREE.Group[] = [];
  const wheels: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const car = new THREE.Group(); group.add(car); cars.push(car);
    car.userData.dynamic = true;
    const color = [colors.sage, colors.coral, colors.yellow][i];
    box(car, [.29, .1, .39], [0, .16, 0], colors.woodLight, .025, 'wood');
    if (!i) {
      cylinder(car, .115, .115, .29, [0, .31, .065], material(color)).rotation.x = Math.PI / 2;
      box(car, [.28, .3, .2], [0, .36, -.15], color, .025);
      box(car, [.34, .055, .26], [0, .535, -.15], colors.cream, .025);
      box(car, [.19, .14, .015], [0, .38, -.043], '#c5d2ba', .015);
      cylinder(car, .054, .04, .12, [0, .45, .13], colors.coral);
      cylinder(car, .072, .072, .026, [0, .52, .13], colors.coral);
      sphere(car, .035, [0, .32, .217], colors.yellow, [1, 1, .5]);
    } else {
      box(car, [.27, .16, .32], [0, .275, 0], color, .025, 'wood');
      if (i === 1) {
        for (const x of [-.07, .065]) cylinder(car, .052, .052, .24, [x, .42, 0], colors.woodLight).rotation.x = Math.PI / 2;
      } else {
        sphere(car, .075, [0, .43, .02], colors.sageLight); sphere(car, .06, [.03, .42, -.09], colors.peach);
      }
    }
    for (const x of [-.17, .17]) for (const z of [-.125, .125]) {
      const wheel = cylinder(car, .068, .068, .035, [x, .11, z], colors.woodDark, 16); wheel.rotation.z = Math.PI / 2; wheels.push(wheel);
      wheel.userData.dynamic = true;
      sphere(car, .021, [x * 1.12, .11, z], colors.cream, [.35, 1, 1]);
    }
    sphere(car, .025, [0, .16, -.235], colors.woodDark); sphere(car, .025, [0, .16, .235], colors.woodDark);
    batchStaticMeshes(car);
  }
  let travel = -Math.PI / 2;
  return {
    group,
    update: ({ active, delta }) => {
      if (active) travel += delta * .72;
      cars.forEach((car, i) => {
        const a = travel - i * .44;
        car.position.set(Math.cos(a) * rx, 0, Math.sin(a) * rz);
        car.rotation.y = Math.atan2(-Math.sin(a) * rx, Math.cos(a) * rz);
      });
      if (active) wheels.forEach(wheel => { wheel.rotation.x += delta * 6; });
    },
  };
}
