import * as THREE from "three";
import { box, cylinder, rod, sphere, tube, material } from "../geometry";
import { colors } from "../palette";
import type { ToyDefinition, ToyModel } from "./types";
import { batchStaticMeshes } from "../batch";

export function createRocker(definition: ToyDefinition): ToyModel {
  const group = new THREE.Group();
  const horse = new THREE.Group();
  group.add(horse);
  horse.rotation.y = 0.45;
  horse.userData.dynamic = true;
  const wood = material(colors.woodLight, "wood");
  for (const x of [-0.24, 0.24]) {
    const curve: THREE.Vector3[] = [];
    for (let i = 0; i <= 12; i++) {
      const z = -0.77 + (i / 12) * 1.54;
      curve.push(new THREE.Vector3(x, 0.08 + z * z * 0.32, z));
    }
    tube(horse, curve, 0.055, colors.woodDark);
    for (const z of [-0.36, 0.34])
      rod(
        horse,
        new THREE.Vector3(x, 0.17, z),
        new THREE.Vector3(x * 0.65, 0.56, z * 0.8),
        0.04,
        wood,
      );
  }
  box(horse, [0.5, 0.16, 0.82], [0, 0.57, 0], colors.woodLight, 0.08, "wood");
  box(horse, [0.42, 0.085, 0.44], [0, 0.69, -0.03], colors.sage, 0.06, "fabric");
  const neck = box(horse, [0.23, 0.55, 0.3], [0, 0.9, 0.32], colors.woodLight, 0.1, "wood");
  neck.rotation.x = -0.22;
  sphere(horse, 0.21, [0, 1.15, 0.39], wood, [0.65, 1, 1.4]);
  sphere(horse, 0.14, [0, 1.08, 0.58], wood, [0.9, 0.76, 1.2]);
  for (const x of [-0.086, 0.086]) {
    sphere(horse, 0.06, [x, 1.37, 0.29], colors.woodLight, [0.6, 1.6, 0.9]).rotation.x = -0.25;
    sphere(horse, 0.017, [x * 1.6, 1.19, 0.46], "#514938", [0.3, 1, 1]);
  }
  for (let i = 0; i < 6; i++)
    sphere(horse, 0.072, [0, 0.87 + i * 0.075, 0.18], colors.woodDark, [1.1, 0.8, 0.75]);
  const handle = cylinder(horse, 0.025, 0.025, 0.57, [0, 0.98, 0.38], colors.woodDark);
  handle.rotation.z = Math.PI / 2;
  for (const x of [-0.29, 0.29]) sphere(horse, 0.035, [x, 0.98, 0.38], colors.coral);
  tube(
    horse,
    [
      new THREE.Vector3(0, 0.67, -0.4),
      new THREE.Vector3(0, 0.62, -0.63),
      new THREE.Vector3(0, 0.38, -0.67),
    ],
    0.045,
    colors.woodDark,
  );
  batchStaticMeshes(horse);
  return {
    group,
    update: ({ active, elapsed }) => {
      horse.rotation.x = active ? Math.sin(elapsed * 3.4) * 0.13 : 0;
      horse.position.y = active ? Math.abs(Math.sin(elapsed * 3.4)) * 0.02 : 0;
    },
    actorRoute: (progress, elapsed) => {
      const approach = new THREE.Vector3(
        definition.approach[0] - definition.position[0],
        0,
        definition.approach[1] - definition.position[2],
      );
      const mount = new THREE.Vector3(
        0,
        0.24 + Math.abs(Math.sin(elapsed * 3.4)) * 0.02,
        -0.035 + Math.sin(elapsed * 3.4) * 0.065,
      );
      const position =
        progress < 0.12
          ? approach.clone().lerp(mount, THREE.MathUtils.smoothstep(progress / 0.12, 0, 1))
          : progress > 0.86
            ? mount
                .clone()
                .lerp(approach, THREE.MathUtils.smoothstep((progress - 0.86) / 0.14, 0, 1))
            : mount;
      return { position, facing: 0.45 };
    },
  };
}
