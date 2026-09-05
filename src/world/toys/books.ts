import * as THREE from 'three';
import { box, cylinder, material, mesh, sphere, torus } from '../geometry';
import { colors } from '../palette';
import { artTexture } from '../textures';
import type { ToyModel } from './types';

export function book(parent: THREE.Object3D, position: [number, number, number], width: number, height: number, color: string, kind: 'bunny' | 'sun' | 'bear' | 'garden' = 'bunny', thickness = .075) {
  const group = new THREE.Group(); group.position.set(...position); parent.add(group);
  box(group, [width, thickness, height], [0, 0, 0], color, .015);
  box(group, [width - .035, thickness - .025, height - .035], [.01, .004, 0], '#f4e9d1', .003);
  box(group, [width, .012, height], [0, thickness / 2, 0], color, .006);
  box(group, [.025, thickness + .012, height], [-width / 2 + .015, .004, 0], color, .012);
  const cover = mesh(new THREE.PlaneGeometry(width * .72, height * .72), new THREE.MeshStandardMaterial({ map: artTexture(kind), roughness: .95 }), group, [.015, thickness / 2 + .007, 0]);
  cover.rotation.x = -Math.PI / 2;
  // Fine page edges catch the light along the fore-edge.
  for (let i = 0; i < 3; i++) box(group, [.002, .002, height - .05], [width / 2 - .007, -.017 + i * .014, 0], '#d6ccb5', 0);
  return group;
}

export function bunny(parent: THREE.Object3D, position: [number, number, number], scale = 1) {
  const group = new THREE.Group(); group.position.set(...position); group.scale.setScalar(scale); parent.add(group);
  const fabric = material('#ddcfb3', 'fabric');
  sphere(group, .22, [0, .24, 0], fabric, [1, 1.25, .83]);
  sphere(group, .2, [0, .52, .015], fabric, [1, .9, .88]);
  const earL = sphere(group, .095, [-.095, .79, 0], fabric, [.65, 2.25, .55]); earL.rotation.z = .14;
  const earR = sphere(group, .095, [.095, .78, 0], fabric, [.65, 2.2, .55]); earR.rotation.z = -.17;
  sphere(group, .065, [-.095, .79, .041], '#d8b5a7', [.45, 2.1, .2]).rotation.z = .14;
  sphere(group, .065, [.095, .78, .041], '#d8b5a7', [.45, 2.1, .2]).rotation.z = -.17;
  sphere(group, .015, [-.066, .54, .174], '#574d40'); sphere(group, .015, [.066, .54, .174], '#574d40');
  sphere(group, .018, [0, .497, .185], '#b99080', [1, .65, .45]);
  sphere(group, .09, [-.145, .07, .13], fabric, [1, .65, 1.45]); sphere(group, .09, [.145, .07, .13], fabric, [1, .65, 1.45]);
  sphere(group, .075, [-.21, .25, .04], fabric, [.65, 1.6, .8]).rotation.z = -.35;
  sphere(group, .075, [.21, .25, .04], fabric, [.65, 1.6, .8]).rotation.z = .35;
  torus(group, .127, .036, [0, .37, .015], colors.sage).rotation.x = Math.PI / 2;
  box(group, [.09, .17, .045], [.085, .3, .18], colors.sage, .02, 'fabric').rotation.z = .2;
  return group;
}

export function createBooks(): ToyModel {
  const group = new THREE.Group();
  // A tufted linen cushion and a tactile circular woven rug.
  cylinder(group, .85, .86, .045, [-.15, .018, -.3], material('#e4d2ab', 'fabric'), 64);
  for (const r of [.76, .8, .84]) torus(group, r, .008, [-.15, .045, -.3], '#cdb992').rotation.x = Math.PI / 2;
  const cushion = box(group, [1.05, .2, .79], [-.27, .16, -.65], colors.sageLight, .15, 'fabric'); cushion.rotation.y = -.1;
  for (const x of [-.52, -.04]) for (const z of [-.83, -.48]) sphere(group, .025, [x, .259, z], colors.sage, [1, .3, 1]);
  bunny(group, [-.72, .055, -.35], .86).rotation.y = .35;
  book(group, [.43, .095, -.55], .43, .54, colors.coral, 'bear').rotation.y = -.22;
  book(group, [.44, .185, -.55], .4, .51, colors.blue, 'garden').rotation.y = .13;
  const open = new THREE.Group(); group.add(open); open.position.set(.05, .055, .2); open.rotation.y = -.13;
  box(open, [.81, .035, .51], [0, 0, 0], colors.yellow, .016);
  const left = book(open, [-.2, .022, 0], .39, .49, '#eee3c8', 'garden', .036); left.rotation.z = -.07;
  const right = book(open, [.2, .022, 0], .39, .49, '#eee3c8', 'bunny', .036); right.rotation.z = .07;
  const pagePivot = new THREE.Group(); open.add(pagePivot); pagePivot.position.y = .055;
  pagePivot.userData.dynamic = true;
  const pageMat = new THREE.MeshStandardMaterial({ map: artTexture('garden'), side: THREE.DoubleSide, roughness: 1 });
  const page = mesh(new THREE.PlaneGeometry(.38, .47, 6, 1), pageMat, pagePivot, [.19, 0, 0]); page.rotation.x = -Math.PI / 2;
  return {
    group,
    update: ({ active, elapsed }) => {
      const t = active ? elapsed % 5 : 0;
      const turning = t > 2.6 ? Math.min((t - 2.6) / 1.25, 1) : 0;
      pagePivot.rotation.z = Math.sin(turning * Math.PI / 2) * Math.PI;
      pagePivot.visible = active && t > 2.6;
    },
  };
}
