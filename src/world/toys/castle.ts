import * as THREE from "three";
import { arch, box, cylinder, material, mesh, rod, sphere, star, tube } from "../geometry";
import { colors } from "../palette";
import { labelTexture } from "../textures";
import type { ToyModel } from "./types";

export function createCastle(): ToyModel {
  const group = new THREE.Group();
  const wood = material(colors.woodLight, "wood");
  const flags: THREE.Group[] = [];
  for (const [i, x] of [-1.05, 1.05].entries()) {
    const towerColor = i ? "#dcc9a5" : "#e1b79c";
    // Real open archways, softly bevelled at toddler scale.
    arch(group, 1.12, 1.3, 1.06, [x, 0.03, -0.88], towerColor, { width: 0.63, height: 1.01 });
    box(group, [1.23, 0.13, 1.23], [x, 1.37, -0.35], colors.cream, 0.055, "wood");
    const balconyMat = material(towerColor, "plaster").clone();
    balconyMat.side = THREE.DoubleSide;
    mesh(
      new THREE.CylinderGeometry(0.56, 0.56, 0.49, 32, 1, true, Math.PI / 3, (Math.PI * 4) / 3),
      balconyMat,
      group,
      [x, 1.705, -0.35],
    );
    for (let j = 0; j < 8; j++) {
      const a = (j / 8) * Math.PI * 2;
      if (Math.sin(a) > 0.5) continue;
      const tooth = box(
        group,
        [0.22, 0.23, 0.19],
        [x + Math.cos(a) * 0.52, 2.005, -0.35 + Math.sin(a) * 0.52],
        colors.cream,
        0.026,
      );
      tooth.rotation.y = -a;
    }
    for (const dx of [-0.39, 0.39])
      for (const dz of [-0.39, 0.39])
        rod(
          group,
          new THREE.Vector3(x + dx, 1.44, -0.35 + dz),
          new THREE.Vector3(x + dx, 3.05, -0.35 + dz),
          0.033,
          colors.woodLight,
        );
    cylinder(group, 0.64, 0.59, 0.105, [x, 3.03, -0.35], i ? colors.coral : colors.sageDark, 32);
    const roofColor = i ? colors.coral : colors.sage;
    cylinder(group, 0.045, 0.75, 0.83, [x, 3.45, -0.35], material(roofColor, "wood"), 12);
    // Raised roof ribs produce gentle highlights instead of a flat cone.
    for (let j = 0; j < 12; j++) {
      const a = (j / 12) * Math.PI * 2;
      rod(
        group,
        new THREE.Vector3(x + Math.cos(a) * 0.735, 3.045, -0.35 + Math.sin(a) * 0.735),
        new THREE.Vector3(x + Math.cos(a) * 0.04, 3.86, -0.35 + Math.sin(a) * 0.04),
        0.012,
        i ? "#e2a28a" : "#b1bd99",
      );
    }
    const window = arch(group, 0.26, 0.39, 0.022, [x + 0.565, 1.53, -0.35], colors.cream);
    window.rotation.y = Math.PI / 2;
    arch(window, 0.215, 0.34, 0.027, [0, 0.035, 0.015], "#7e9992");
    box(window, [0.018, 0.25, 0.027], [0, 0.18, 0.054], colors.cream, 0.004);
    rod(
      group,
      new THREE.Vector3(x, 3.84, -0.35),
      new THREE.Vector3(x, 4.33, -0.35),
      0.014,
      colors.woodDark,
    );
    sphere(group, 0.034, [x, 4.35, -0.35], colors.yellow);
    const flag = new THREE.Group();
    group.add(flag);
    flag.position.set(x, 4.14, -0.35);
    flags.push(flag);
    flag.userData.dynamic = true;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.4, 0.07);
    shape.lineTo(0.33, -0.045);
    shape.lineTo(0.39, -0.16);
    shape.lineTo(0, -0.19);
    shape.closePath();
    const flagMesh = mesh(
      new THREE.ShapeGeometry(shape),
      new THREE.MeshStandardMaterial({
        color: i ? colors.sage : colors.yellow,
        side: THREE.DoubleSide,
        roughness: 1,
      }),
      flag,
    );
    flagMesh.castShadow = false;
    // Small stone joints around the arch, intentionally sparse.
    for (const side of [-1, 1])
      for (let j = 0; j < 3; j++)
        box(
          group,
          [0.14, 0.015, 0.015],
          [x + side * 0.44, 0.28 + j * 0.28, 0.205],
          "#caa584",
          0.006,
        );
  }
  box(group, [2.37, 0.14, 1.03], [0, 1.36, -0.35], colors.woodLight, 0.055, "wood");
  arch(group, 1.25, 1.29, 0.12, [0, 0.03, -0.12], "#d2bb91", { width: 0.83, height: 1.08 });
  for (const z of [-0.86, 0.16]) {
    for (let i = 0; i < 6; i++) {
      const x = -0.7 + i * 0.28;
      cylinder(group, 0.027, 0.027, 0.47, [x, 1.65, z], wood, 12);
    }
    rod(
      group,
      new THREE.Vector3(-0.77, 1.88, z),
      new THREE.Vector3(0.77, 1.88, z),
      0.044,
      colors.woodDark,
    );
  }
  const plaque = box(group, [0.66, 0.2, 0.05], [0, 1.51, 0.27], colors.cream, 0.065);
  mesh(
    new THREE.PlaneGeometry(0.55, 0.17),
    new THREE.MeshStandardMaterial({
      map: labelTexture("TAOTAO", "#867650", "#f3e5c5"),
      roughness: 1,
    }),
    plaque,
    [0, 0, 0.031],
  );
  // A miniature string of fabric pennants over the bridge.
  const buntingPoints = [
    new THREE.Vector3(-0.75, 2.32, 0.19),
    new THREE.Vector3(0, 2.09, 0.19),
    new THREE.Vector3(0.75, 2.32, 0.19),
  ];
  tube(group, buntingPoints, 0.008, "#c2ac85");
  for (let i = 0; i < 5; i++) {
    const x = -0.58 + i * 0.29;
    const shape = new THREE.Shape();
    shape.moveTo(-0.09, 0);
    shape.lineTo(0.09, 0);
    shape.lineTo(0, -0.18);
    shape.closePath();
    mesh(
      new THREE.ShapeGeometry(shape),
      new THREE.MeshStandardMaterial({
        color: [colors.coral, colors.cream, colors.sage, colors.yellow, colors.blue][i],
        side: THREE.DoubleSide,
      }),
      group,
      [x, 2.1 + x * x * 0.38, 0.19],
    );
  }

  // A smooth, concave slide with continuous rounded handrails.
  const slideCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.05, 1.39, 0.18),
    new THREE.Vector3(-1.05, 1.3, 0.54),
    new THREE.Vector3(-1.05, 0.65, 1.27),
    new THREE.Vector3(-1.05, 0.2, 1.94),
    new THREE.Vector3(-1.05, 0.15, 2.34),
  ]);
  const positions: number[] = [],
    uvs: number[] = [],
    indices: number[] = [];
  const steps = 48,
    across = 12;
  for (let i = 0; i <= steps; i++) {
    const p = slideCurve.getPoint(i / steps);
    for (let j = 0; j <= across; j++) {
      const x = (j / across - 0.5) * 0.74;
      const lip = (Math.abs(x) / 0.37) ** 6 * 0.13;
      positions.push(p.x + x, p.y + lip, p.z);
      uvs.push(j / across, i / steps);
      if (i < steps && j < across) {
        const a = i * (across + 1) + j;
        indices.push(a, a + across + 1, a + 1, a + 1, a + across + 1, a + across + 2);
      }
    }
  }
  const slideGeo = new THREE.BufferGeometry();
  slideGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  slideGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  slideGeo.setIndex(indices);
  slideGeo.computeVertexNormals();
  mesh(
    slideGeo,
    new THREE.MeshStandardMaterial({ color: "#a9bec0", side: THREE.DoubleSide, roughness: 0.46 }),
    group,
  );
  for (const side of [-1, 1]) {
    const railPoints = Array.from({ length: 32 }, (_, i) => {
      const p = slideCurve.getPoint(i / 31);
      p.x += side * 0.39;
      p.y += 0.16;
      return p;
    });
    tube(group, railPoints, 0.046, "#719698");
    rod(
      group,
      new THREE.Vector3(-1.05 + side * 0.33, 0.09, 1.09),
      new THREE.Vector3(-1.05 + side * 0.33, 0.83, 1.09),
      0.04,
      wood,
    );
  }
  box(group, [0.9, 0.06, 0.6], [-1.05, 0.04, 2.4], colors.sageLight, 0.14, "foam");
  // Diagonal rope ladder, real rungs, and a side climbing net.
  for (const x of [0.69, 1.41]) {
    rod(
      group,
      new THREE.Vector3(x, 0.085, 1.35),
      new THREE.Vector3(x, 1.46, 0.16),
      0.045,
      colors.woodDark,
    );
    rod(
      group,
      new THREE.Vector3(x, 0.39, 1.35),
      new THREE.Vector3(x, 1.9, 0.16),
      0.025,
      colors.woodDark,
    );
    rod(
      group,
      new THREE.Vector3(x, 0.08, 1.35),
      new THREE.Vector3(x, 0.39, 1.35),
      0.024,
      colors.woodDark,
    );
  }
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    box(
      group,
      [0.76, 0.065, 0.14],
      [1.05, 0.13 + t * 1.27, 1.35 - t * 1.19],
      colors.woodLight,
      0.023,
      "wood",
    );
  }
  for (const z of [-0.91, 0.48])
    rod(group, new THREE.Vector3(1.72, 0.03, z), new THREE.Vector3(1.72, 1.95, z), 0.05, wood);
  rod(group, new THREE.Vector3(1.72, 1.93, -0.91), new THREE.Vector3(1.72, 1.93, 0.48), 0.05, wood);
  for (let i = 0; i < 6; i++)
    rod(
      group,
      new THREE.Vector3(1.72, 0.22 + i * 0.28, -0.91),
      new THREE.Vector3(1.72, 0.22 + i * 0.28, 0.48),
      0.013,
      "#b49c72",
    );
  for (let i = 0; i < 6; i++)
    rod(
      group,
      new THREE.Vector3(1.72, 0.1, -0.87 + i * 0.26),
      new THREE.Vector3(1.72, 1.94, -0.87 + i * 0.26),
      0.013,
      "#b49c72",
    );
  star(group, 0.07, [0, 1.18, 0.035], colors.cream);

  const mix = (a: number[], b: number[], t: number) =>
    new THREE.Vector3(a[0], a[1], a[2]).lerp(
      new THREE.Vector3(b[0], b[1], b[2]),
      THREE.MathUtils.smoothstep(t, 0, 1),
    );
  return {
    group,
    update: ({ time }) => {
      flags.forEach((flag, i) => {
        flag.rotation.y = Math.sin(time * 1.6 + i) * 0.16;
        flag.rotation.z = Math.sin(time * 2.1 + i) * 0.025;
      });
    },
    actorRoute: (p) => {
      if (p < 0.12)
        return { position: mix([1.55, 0, 2.4], [1.05, 0.04, 1.35], p / 0.12), facing: Math.PI };
      if (p < 0.43)
        return {
          position: new THREE.Vector3(1.05, 0.04, 1.35).lerp(
            new THREE.Vector3(1.05, 1.44, 0.16),
            (p - 0.12) / 0.31,
          ),
          facing: Math.PI,
        };
      if (p < 0.5)
        return {
          position: mix([1.05, 1.44, 0.16], [1.05, 1.44, -0.35], (p - 0.43) / 0.07),
          facing: Math.PI,
        };
      if (p < 0.65)
        return {
          position: mix([1.05, 1.44, -0.35], [-1.05, 1.44, -0.35], (p - 0.5) / 0.15),
          facing: -Math.PI / 2,
        };
      if (p < 0.74)
        return {
          position: mix([-1.05, 1.44, -0.35], [-1.05, 1.14, 0.25], (p - 0.65) / 0.09),
          facing: 0,
        };
      if (p < 0.94) {
        const t = (p - 0.74) / 0.2;
        const point = slideCurve.getPoint(THREE.MathUtils.smoothstep(t, 0, 1));
        point.y -= 0.24;
        return { position: point, facing: 0 };
      }
      return {
        position: mix([-1.05, -0.09, 2.34], [-1.05, 0, 2.95], (p - 0.94) / 0.06),
        facing: 0,
      };
    },
  };
}
