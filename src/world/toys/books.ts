import * as THREE from "three";
import { box, cylinder, material, mesh, sphere, torus } from "../geometry";
import { colors } from "../palette";
import { artTexture } from "../textures";
import type { ToyModel } from "./types";

export function book(
  parent: THREE.Object3D,
  position: [number, number, number],
  width: number,
  height: number,
  color: string,
  kind: "bunny" | "sun" | "bear" | "garden" = "bunny",
  thickness = 0.075,
) {
  const group = new THREE.Group();
  group.position.set(...position);
  parent.add(group);
  box(group, [width, thickness, height], [0, 0, 0], color, 0.015);
  box(
    group,
    [width - 0.035, thickness - 0.025, height - 0.035],
    [0.01, 0.004, 0],
    "#f4e9d1",
    0.003,
  );
  box(group, [width, 0.012, height], [0, thickness / 2, 0], color, 0.006);
  box(group, [0.025, thickness + 0.012, height], [-width / 2 + 0.015, 0.004, 0], color, 0.012);
  const cover = mesh(
    new THREE.PlaneGeometry(width * 0.72, height * 0.72),
    new THREE.MeshStandardMaterial({ map: artTexture(kind), roughness: 0.95 }),
    group,
    [0.015, thickness / 2 + 0.007, 0],
  );
  cover.rotation.x = -Math.PI / 2;
  // Fine page edges catch the light along the fore-edge.
  for (let i = 0; i < 3; i++)
    box(
      group,
      [0.002, 0.002, height - 0.05],
      [width / 2 - 0.007, -0.017 + i * 0.014, 0],
      "#d6ccb5",
      0,
    );
  return group;
}

export function bunny(parent: THREE.Object3D, position: [number, number, number], scale = 1) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.scale.setScalar(scale);
  parent.add(group);
  const fabric = material("#ddcfb3", "fabric");
  sphere(group, 0.22, [0, 0.24, 0], fabric, [1, 1.25, 0.83]);
  sphere(group, 0.2, [0, 0.52, 0.015], fabric, [1, 0.9, 0.88]);
  const earL = sphere(group, 0.095, [-0.095, 0.79, 0], fabric, [0.65, 2.25, 0.55]);
  earL.rotation.z = 0.14;
  const earR = sphere(group, 0.095, [0.095, 0.78, 0], fabric, [0.65, 2.2, 0.55]);
  earR.rotation.z = -0.17;
  sphere(group, 0.065, [-0.095, 0.79, 0.041], "#d8b5a7", [0.45, 2.1, 0.2]).rotation.z = 0.14;
  sphere(group, 0.065, [0.095, 0.78, 0.041], "#d8b5a7", [0.45, 2.1, 0.2]).rotation.z = -0.17;
  sphere(group, 0.015, [-0.066, 0.54, 0.174], "#574d40");
  sphere(group, 0.015, [0.066, 0.54, 0.174], "#574d40");
  sphere(group, 0.018, [0, 0.497, 0.185], "#b99080", [1, 0.65, 0.45]);
  sphere(group, 0.09, [-0.145, 0.07, 0.13], fabric, [1, 0.65, 1.45]);
  sphere(group, 0.09, [0.145, 0.07, 0.13], fabric, [1, 0.65, 1.45]);
  sphere(group, 0.075, [-0.21, 0.25, 0.04], fabric, [0.65, 1.6, 0.8]).rotation.z = -0.35;
  sphere(group, 0.075, [0.21, 0.25, 0.04], fabric, [0.65, 1.6, 0.8]).rotation.z = 0.35;
  torus(group, 0.127, 0.036, [0, 0.37, 0.015], colors.sage).rotation.x = Math.PI / 2;
  box(group, [0.09, 0.17, 0.045], [0.085, 0.3, 0.18], colors.sage, 0.02, "fabric").rotation.z = 0.2;
  return group;
}

export function createBooks(): ToyModel {
  const group = new THREE.Group();
  // A tufted linen cushion and a tactile circular woven rug.
  cylinder(group, 0.85, 0.86, 0.045, [-0.15, 0.018, -0.3], material("#e4d2ab", "fabric"), 64);
  for (const r of [0.76, 0.8, 0.84])
    torus(group, r, 0.008, [-0.15, 0.045, -0.3], "#cdb992").rotation.x = Math.PI / 2;
  const cushion = box(
    group,
    [1.05, 0.2, 0.79],
    [-0.27, 0.16, -0.65],
    colors.sageLight,
    0.15,
    "fabric",
  );
  cushion.rotation.y = -0.1;
  for (const x of [-0.52, -0.04])
    for (const z of [-0.83, -0.48]) sphere(group, 0.025, [x, 0.259, z], colors.sage, [1, 0.3, 1]);
  bunny(group, [-0.72, 0.055, -0.35], 0.86).rotation.y = 0.35;
  book(group, [0.43, 0.095, -0.55], 0.43, 0.54, colors.coral, "bear").rotation.y = -0.22;
  book(group, [0.44, 0.185, -0.55], 0.4, 0.51, colors.blue, "garden").rotation.y = 0.13;
  const open = new THREE.Group();
  group.add(open);
  open.position.set(0.05, 0.055, 0.2);
  open.rotation.y = -0.13;
  box(open, [0.81, 0.035, 0.51], [0, 0, 0], colors.yellow, 0.016);
  const left = book(open, [-0.2, 0.022, 0], 0.39, 0.49, "#eee3c8", "garden", 0.036);
  left.rotation.z = -0.07;
  const right = book(open, [0.2, 0.022, 0], 0.39, 0.49, "#eee3c8", "bunny", 0.036);
  right.rotation.z = 0.07;
  const pagePivot = new THREE.Group();
  open.add(pagePivot);
  pagePivot.position.y = 0.055;
  pagePivot.userData.dynamic = true;
  const pageMat = new THREE.MeshStandardMaterial({
    map: artTexture("garden"),
    side: THREE.DoubleSide,
    roughness: 1,
  });
  const page = mesh(new THREE.PlaneGeometry(0.38, 0.47, 6, 1), pageMat, pagePivot, [0.19, 0, 0]);
  page.rotation.x = -Math.PI / 2;
  return {
    group,
    update: ({ active, elapsed }) => {
      const t = active ? elapsed % 5 : 0;
      const turning = t > 2.6 ? Math.min((t - 2.6) / 1.25, 1) : 0;
      pagePivot.rotation.z = Math.sin((turning * Math.PI) / 2) * Math.PI;
      pagePivot.visible = active && t > 2.6;
    },
  };
}
