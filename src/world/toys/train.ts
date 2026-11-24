import * as THREE from "three";
import { box, cylinder, material, sphere, tube } from "../geometry";
import { colors } from "../palette";
import type { ToyModel } from "./types";
import { batchStaticMeshes } from "../batch";

export function createTrain(): ToyModel {
  const group = new THREE.Group();
  const rx = 1.18,
    rz = 0.65;
  const point = (angle: number, r = 0) =>
    new THREE.Vector3(Math.cos(angle) * (rx + r), 0.073, Math.sin(angle) * (rz + r));
  for (let i = 0; i < 38; i++) {
    const a = (i / 38) * Math.PI * 2;
    const p = point(a);
    const sleeper = box(
      group,
      [0.26, 0.042, 0.09],
      [p.x, 0.028, p.z],
      colors.woodLight,
      0.012,
      "wood",
    );
    sleeper.rotation.y = -Math.atan2(Math.sin(a) * rx, Math.cos(a) * rz);
  }
  for (const offset of [-0.09, 0.09]) {
    const points = Array.from({ length: 80 }, (_, i) => point((i / 80) * Math.PI * 2, offset));
    tube(group, points, 0.024, colors.woodDark, true, 100);
  }
  const cars: THREE.Group[] = [];
  const wheels: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const car = new THREE.Group();
    group.add(car);
    cars.push(car);
    car.userData.dynamic = true;
    const color = [colors.sage, colors.coral, colors.yellow][i];
    box(car, [0.29, 0.1, 0.39], [0, 0.16, 0], colors.woodLight, 0.025, "wood");
    if (!i) {
      cylinder(car, 0.115, 0.115, 0.29, [0, 0.31, 0.065], material(color)).rotation.x = Math.PI / 2;
      box(car, [0.28, 0.3, 0.2], [0, 0.36, -0.15], color, 0.025);
      box(car, [0.34, 0.055, 0.26], [0, 0.535, -0.15], colors.cream, 0.025);
      box(car, [0.19, 0.14, 0.015], [0, 0.38, -0.043], "#c5d2ba", 0.015);
      cylinder(car, 0.054, 0.04, 0.12, [0, 0.45, 0.13], colors.coral);
      cylinder(car, 0.072, 0.072, 0.026, [0, 0.52, 0.13], colors.coral);
      sphere(car, 0.035, [0, 0.32, 0.217], colors.yellow, [1, 1, 0.5]);
    } else {
      box(car, [0.27, 0.16, 0.32], [0, 0.275, 0], color, 0.025, "wood");
      if (i === 1) {
        for (const x of [-0.07, 0.065])
          cylinder(car, 0.052, 0.052, 0.24, [x, 0.42, 0], colors.woodLight).rotation.x =
            Math.PI / 2;
      } else {
        sphere(car, 0.075, [0, 0.43, 0.02], colors.sageLight);
        sphere(car, 0.06, [0.03, 0.42, -0.09], colors.peach);
      }
    }
    for (const x of [-0.17, 0.17])
      for (const z of [-0.125, 0.125]) {
        const wheel = cylinder(car, 0.068, 0.068, 0.035, [x, 0.11, z], colors.woodDark, 16);
        wheel.rotation.z = Math.PI / 2;
        wheels.push(wheel);
        wheel.userData.dynamic = true;
        sphere(car, 0.021, [x * 1.12, 0.11, z], colors.cream, [0.35, 1, 1]);
      }
    sphere(car, 0.025, [0, 0.16, -0.235], colors.woodDark);
    sphere(car, 0.025, [0, 0.16, 0.235], colors.woodDark);
    batchStaticMeshes(car);
  }
  let travel = -Math.PI / 2;
  return {
    group,
    update: ({ active, delta }) => {
      if (active) travel += delta * 0.72;
      cars.forEach((car, i) => {
        const a = travel - i * 0.44;
        car.position.set(Math.cos(a) * rx, 0, Math.sin(a) * rz);
        car.rotation.y = Math.atan2(-Math.sin(a) * rx, Math.cos(a) * rz);
      });
      if (active)
        wheels.forEach((wheel) => {
          wheel.rotation.x += delta * 6;
        });
    },
  };
}
