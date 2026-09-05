import * as THREE from 'three';
import { arch, box, cylinder, material, mesh, rod, sphere, star, tube } from '../geometry';
import { colors } from '../palette';
import { labelTexture } from '../textures';
import type { ToyModel } from './types';

export function createCastle(): ToyModel {
  const group = new THREE.Group();
  const wood = material(colors.woodLight, 'wood');
  const flags: THREE.Group[] = [];
  for (const [i, x] of [-1.05, 1.05].entries()) {
    const towerColor = i ? '#dcc9a5' : '#e1b79c';
    // Real open archways, softly bevelled at toddler scale.
    arch(group, 1.12, 1.3, 1.06, [x, .03, -.88], towerColor, { width: .63, height: 1.01 });
    box(group, [1.23, .13, 1.23], [x, 1.37, -.35], colors.cream, .055, 'wood');
    const balconyMat = material(towerColor, 'plaster').clone(); balconyMat.side = THREE.DoubleSide;
    mesh(new THREE.CylinderGeometry(.56, .56, .49, 32, 1, true, Math.PI / 3, Math.PI * 4 / 3), balconyMat, group, [x, 1.705, -.35]);
    for (let j = 0; j < 8; j++) {
      const a = j / 8 * Math.PI * 2;
      if (Math.sin(a) > .5) continue;
      const tooth = box(group, [.22, .23, .19], [x + Math.cos(a) * .52, 2.005, -.35 + Math.sin(a) * .52], colors.cream, .026);
      tooth.rotation.y = -a;
    }
    for (const dx of [-.39, .39]) for (const dz of [-.39, .39]) rod(group, new THREE.Vector3(x + dx, 1.44, -.35 + dz), new THREE.Vector3(x + dx, 3.05, -.35 + dz), .033, colors.woodLight);
    cylinder(group, .64, .59, .105, [x, 3.03, -.35], i ? colors.coral : colors.sageDark, 32);
    const roofColor = i ? colors.coral : colors.sage;
    cylinder(group, .045, .75, .83, [x, 3.45, -.35], material(roofColor, 'wood'), 12);
    // Raised roof ribs produce gentle highlights instead of a flat cone.
    for (let j = 0; j < 12; j++) {
      const a = j / 12 * Math.PI * 2;
      rod(group, new THREE.Vector3(x + Math.cos(a) * .735, 3.045, -.35 + Math.sin(a) * .735), new THREE.Vector3(x + Math.cos(a) * .04, 3.86, -.35 + Math.sin(a) * .04), .012, i ? '#e2a28a' : '#b1bd99');
    }
    const window = arch(group, .26, .39, .022, [x + .565, 1.53, -.35], colors.cream); window.rotation.y = Math.PI / 2;
    arch(window, .215, .34, .027, [0, .035, .015], '#7e9992');
    box(window, [.018, .25, .027], [0, .18, .054], colors.cream, .004);
    rod(group, new THREE.Vector3(x, 3.84, -.35), new THREE.Vector3(x, 4.33, -.35), .014, colors.woodDark);
    sphere(group, .034, [x, 4.35, -.35], colors.yellow);
    const flag = new THREE.Group(); group.add(flag); flag.position.set(x, 4.14, -.35); flags.push(flag);
    flag.userData.dynamic = true;
    const shape = new THREE.Shape(); shape.moveTo(0, 0); shape.lineTo(.4, .07); shape.lineTo(.33, -.045); shape.lineTo(.39, -.16); shape.lineTo(0, -.19); shape.closePath();
    const flagMesh = mesh(new THREE.ShapeGeometry(shape), new THREE.MeshStandardMaterial({ color: i ? colors.sage : colors.yellow, side: THREE.DoubleSide, roughness: 1 }), flag);
    flagMesh.castShadow = false;
    // Small stone joints around the arch, intentionally sparse.
    for (const side of [-1, 1]) for (let j = 0; j < 3; j++) box(group, [.14, .015, .015], [x + side * .44, .28 + j * .28, .205], '#caa584', .006);
  }
  box(group, [2.37, .14, 1.03], [0, 1.36, -.35], colors.woodLight, .055, 'wood');
  arch(group, 1.25, 1.29, .12, [0, .03, -.12], '#d2bb91', { width: .83, height: 1.08 });
  for (const z of [-.86, .16]) {
    for (let i = 0; i < 6; i++) {
      const x = -.7 + i * .28;
      cylinder(group, .027, .027, .47, [x, 1.65, z], wood, 12);
    }
    rod(group, new THREE.Vector3(-.77, 1.88, z), new THREE.Vector3(.77, 1.88, z), .044, colors.woodDark);
  }
  const plaque = box(group, [.66, .2, .05], [0, 1.51, .27], colors.cream, .065);
  mesh(new THREE.PlaneGeometry(.55, .17), new THREE.MeshStandardMaterial({ map: labelTexture('TAOTAO', '#867650', '#f3e5c5'), roughness: 1 }), plaque, [0, 0, .031]);
  // A miniature string of fabric pennants over the bridge.
  const buntingPoints = [new THREE.Vector3(-.75, 2.32, .19), new THREE.Vector3(0, 2.09, .19), new THREE.Vector3(.75, 2.32, .19)];
  tube(group, buntingPoints, .008, '#c2ac85');
  for (let i = 0; i < 5; i++) {
    const x = -.58 + i * .29;
    const shape = new THREE.Shape(); shape.moveTo(-.09, 0); shape.lineTo(.09, 0); shape.lineTo(0, -.18); shape.closePath();
    mesh(new THREE.ShapeGeometry(shape), new THREE.MeshStandardMaterial({ color: [colors.coral, colors.cream, colors.sage, colors.yellow, colors.blue][i], side: THREE.DoubleSide }), group, [x, 2.1 + x * x * .38, .19]);
  }

  // A smooth, concave slide with continuous rounded handrails.
  const slideCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.05, 1.39, .18), new THREE.Vector3(-1.05, 1.3, .54),
    new THREE.Vector3(-1.05, .65, 1.27), new THREE.Vector3(-1.05, .2, 1.94), new THREE.Vector3(-1.05, .15, 2.34),
  ]);
  const positions: number[] = [], uvs: number[] = [], indices: number[] = [];
  const steps = 48, across = 12;
  for (let i = 0; i <= steps; i++) {
    const p = slideCurve.getPoint(i / steps);
    for (let j = 0; j <= across; j++) {
      const x = (j / across - .5) * .74;
      const lip = Math.pow(Math.abs(x) / .37, 6) * .13;
      positions.push(p.x + x, p.y + lip, p.z); uvs.push(j / across, i / steps);
      if (i < steps && j < across) {
        const a = i * (across + 1) + j;
        indices.push(a, a + across + 1, a + 1, a + 1, a + across + 1, a + across + 2);
      }
    }
  }
  const slideGeo = new THREE.BufferGeometry(); slideGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); slideGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); slideGeo.setIndex(indices); slideGeo.computeVertexNormals();
  mesh(slideGeo, new THREE.MeshStandardMaterial({ color: '#a9bec0', side: THREE.DoubleSide, roughness: .46 }), group);
  for (const side of [-1, 1]) {
    const railPoints = Array.from({ length: 32 }, (_, i) => { const p = slideCurve.getPoint(i / 31); p.x += side * .39; p.y += .16; return p; });
    tube(group, railPoints, .046, '#719698');
    rod(group, new THREE.Vector3(-1.05 + side * .33, .09, 1.09), new THREE.Vector3(-1.05 + side * .33, .83, 1.09), .04, wood);
  }
  box(group, [.9, .06, .6], [-1.05, .04, 2.4], colors.sageLight, .14, 'foam');
  // Diagonal rope ladder, real rungs, and a side climbing net.
  for (const x of [.69, 1.41]) {
    rod(group, new THREE.Vector3(x, .085, 1.35), new THREE.Vector3(x, 1.46, .16), .045, colors.woodDark);
    rod(group, new THREE.Vector3(x, .39, 1.35), new THREE.Vector3(x, 1.9, .16), .025, colors.woodDark);
    rod(group, new THREE.Vector3(x, .08, 1.35), new THREE.Vector3(x, .39, 1.35), .024, colors.woodDark);
  }
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    box(group, [.76, .065, .14], [1.05, .13 + t * 1.27, 1.35 - t * 1.19], colors.woodLight, .023, 'wood');
  }
  for (const z of [-.91, .48]) rod(group, new THREE.Vector3(1.72, .03, z), new THREE.Vector3(1.72, 1.95, z), .05, wood);
  rod(group, new THREE.Vector3(1.72, 1.93, -.91), new THREE.Vector3(1.72, 1.93, .48), .05, wood);
  for (let i = 0; i < 6; i++) rod(group, new THREE.Vector3(1.72, .22 + i * .28, -.91), new THREE.Vector3(1.72, .22 + i * .28, .48), .013, '#b49c72');
  for (let i = 0; i < 6; i++) rod(group, new THREE.Vector3(1.72, .1, -.87 + i * .26), new THREE.Vector3(1.72, 1.94, -.87 + i * .26), .013, '#b49c72');
  star(group, .07, [0, 1.18, .035], colors.cream);

  const mix = (a: number[], b: number[], t: number) => new THREE.Vector3(a[0], a[1], a[2]).lerp(new THREE.Vector3(b[0], b[1], b[2]), THREE.MathUtils.smoothstep(t, 0, 1));
  return {
    group,
    update: ({ time }) => { flags.forEach((flag, i) => { flag.rotation.y = Math.sin(time * 1.6 + i) * .16; flag.rotation.z = Math.sin(time * 2.1 + i) * .025; }); },
    actorRoute: (p) => {
      if (p < .12) return { position: mix([1.55, 0, 2.4], [1.05, .04, 1.35], p / .12), facing: Math.PI };
      if (p < .43) return { position: new THREE.Vector3(1.05, .04, 1.35).lerp(new THREE.Vector3(1.05, 1.44, .16), (p - .12) / .31), facing: Math.PI };
      if (p < .5) return { position: mix([1.05, 1.44, .16], [1.05, 1.44, -.35], (p - .43) / .07), facing: Math.PI };
      if (p < .65) return { position: mix([1.05, 1.44, -.35], [-1.05, 1.44, -.35], (p - .5) / .15), facing: -Math.PI / 2 };
      if (p < .74) return { position: mix([-1.05, 1.44, -.35], [-1.05, 1.14, .25], (p - .65) / .09), facing: 0 };
      if (p < .94) {
        const t = (p - .74) / .2;
        const point = slideCurve.getPoint(THREE.MathUtils.smoothstep(t, 0, 1)); point.y -= .24;
        return { position: point, facing: 0 };
      }
      return { position: mix([-1.05, -.09, 2.34], [-1.05, 0, 2.95], (p - .94) / .06), facing: 0 };
    },
  };
}
