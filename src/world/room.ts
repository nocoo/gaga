import * as THREE from 'three';
import { arch, archShape, box, cylinder, material, mesh, picture, plant, rod, sphere, star, torus, tube } from './geometry';
import { colors, seededRandom } from './palette';
import { labelTexture, skyTexture, surfaceTexture } from './textures';
import { book, bunny } from './toys/books';
import { batchStaticMeshes } from './batch';

export interface Room {
  group: THREE.Group;
  setNight: (night: boolean) => void;
  update: (time: number) => void;
  setView: (direction: THREE.Vector3) => void;
}

function basket(parent: THREE.Object3D, position: [number, number, number], scale = 1) {
  const group = new THREE.Group(); group.position.set(...position); group.scale.setScalar(scale); parent.add(group);
  cylinder(group, .28, .24, .33, [0, .17, 0], material('#cab089', 'fabric'));
  cylinder(group, .245, .245, .009, [0, .339, 0], '#a18b65');
  for (let i = 0; i < 8; i++) torus(group, .24 + i * .005, .009, [0, .018 + i * .045, 0], '#dfc396').rotation.x = Math.PI / 2;
  for (let i = 0; i < 20; i++) {
    const a = i / 20 * Math.PI * 2;
    rod(group, new THREE.Vector3(Math.cos(a) * .239, .02, Math.sin(a) * .239), new THREE.Vector3(Math.cos(a) * .277, .32, Math.sin(a) * .277), .008, '#b39a71');
  }
  for (const x of [-.28, .28]) torus(group, .068, .012, [x, .32, 0], '#b39a71').rotation.y = Math.PI / 2;
  return group;
}

function shelf(parent: THREE.Object3D, position: [number, number, number], rotation = 0) {
  const group = new THREE.Group(); group.position.set(...position); group.rotation.y = rotation; parent.add(group);
  const width = 2.22, depth = .65;
  box(group, [width, 1.34, .055], [0, .8, -depth / 2], '#cfb58a', .02, 'wood');
  for (const x of [-1.07, 0, 1.07]) box(group, [.08, 1.45, depth], [x, .87, 0], colors.woodLight, .025, 'wood');
  for (const y of [.17, .82, 1.59]) box(group, [width + .06, .09, depth + .04], [0, y, 0], colors.woodLight, .025, 'wood');
  for (const x of [-.93, .93]) for (const z of [-.22, .22]) box(group, [.095, .18, .095], [x, .085, z], colors.woodDark, .025);
  const bookColors = [colors.sage, colors.coral, colors.yellow, colors.blue, '#e9d7b1'];
  for (let i = 0; i < 6; i++) {
    const h = [.38, .44, .41, .35, .47, .4][i];
    const b = book(group, [-.87 + i * .125, .225 + h / 2, .025], h, .39, bookColors[i % 5], i % 2 ? 'garden' : 'bear', .095);
    b.rotation.z = Math.PI / 2;
    if (i === 5) { b.rotation.z -= .17; b.position.x += .04; }
  }
  basket(group, [.55, .22, .03], 1.35);
  bunny(group, [.51, .87, -.01], .63).rotation.y = -.15;
  for (let i = 0; i < 3; i++) book(group, [-.54 + (i % 2) * .035, .91 + i * .085, .07], .62, .43, bookColors[i], 'bunny');
  const frontBook = book(group, [-.61, 1.22, -.11], .47, .57, colors.sageLight, 'garden'); frontBook.rotation.x = Math.PI / 2 - .14;
  plant(group, [.67, 1.66, -.08], .6, colors.cream);
  picture(group, 'sun', .46, .56, [-.58, 1.99, -.06]).rotation.x = -.08;
  cylinder(group, .1, .09, .14, [.04, 1.74, .08], colors.coral);
  return group;
}

function rainbow(parent: THREE.Object3D, position: [number, number, number], scale = 1) {
  const group = new THREE.Group(); group.position.set(...position); group.scale.setScalar(scale); parent.add(group);
  [colors.coral, colors.peach, colors.yellow, colors.sageLight, colors.sage].forEach((color, i) => {
    const r = .45 - i * .08;
    torus(group, r, .032, [0, 0, i * .001], material(color, 'fabric'), Math.PI);
    for (const x of [-r, r]) box(group, [.064, .16, .058], [x, -.08, 0], color, .024, 'fabric');
  });
  return group;
}

export function createRoom(): Room {
  const group = new THREE.Group(); group.name = 'room';
  const backWall = new THREE.Group(), sideWall = new THREE.Group();
  backWall.userData.dynamic = sideWall.userData.dynamic = true;
  group.add(backWall, sideWall);
  const random = seededRandom(342);
  // The rounded plinth is a dollhouse edge, not an infinite ground plane.
  box(group, [11.9, .16, 9.9], [0, -.23, 0], '#c7b796', .18);
  box(group, [11.83, .23, 9.82], [0, -.08, 0], colors.woodLight, .14, 'wood');
  for (let row = 0; row < 14; row++) {
    const z = -4.57 + row * .704;
    const plankColor = ['#dbc59f', '#e0cba7', '#dfc8a1', '#e3cdaa'][row % 4];
    box(group, [11.57, .045, .693], [0, .047, z], plankColor, .008, 'wood');
    for (let j = 0; j < 3; j++) {
      const x = -4.8 + j * 3.9 + (row % 2) * 1.6;
      if (x < 5.65) box(group, [.006, .002, .68], [x, .071, z], '#c8b18b', 0);
    }
  }
  // The padded play area is 8.8 × 6.8 = 59.84 square metres.
  box(group, [8.94, .07, 6.94], [0, .102, .35], '#c6bea1', .1, 'foam');
  const matColors = ['#e4e5cc', '#eee7cd', '#e9d6bc', '#d3dbc0', '#ebe6d0'];
  for (let row = 0; row < 8; row++) for (let col = 0; col < 10; col++) {
    const pattern = (row + col * 2) % 7;
    const color = matColors[pattern < 2 ? 3 : pattern < 4 ? 1 : pattern === 4 ? 2 : 0];
    const x = -3.96 + col * .88, z = -2.625 + row * .85;
    box(group, [.873, .055, .843], [x, .153, z], color, .018, 'foam');
    // Discreet puzzle tabs at alternating seams.
    if (col < 9 && (row + col) % 2 === 0) cylinder(group, .069, .069, .008, [x + .44, .183, z], material(color, 'foam'), 16);
    if (row < 7 && (col + row) % 3 === 0) cylinder(group, .062, .062, .008, [x, .183, z + .425], material(color, 'foam'), 16);
  }
  for (const [x, z] of [[-3.95, -1.74], [3.08, 1.61], [-2.2, 2.46]]) {
    const decoration = star(group, .105, [x, .19, z], '#c2c9ab', .001); decoration.rotation.x = -Math.PI / 2;
  }

  // Two open walls leave a generous, readable isometric composition.
  box(backWall, [11.9, 3.75, .2], [0, 1.89, -4.85], colors.wall, .06, 'plaster');
  box(sideWall, [.2, 3.75, 9.85], [-5.85, 1.89, 0], colors.wallSide, .06, 'plaster');
  box(backWall, [11.9, .12, .27], [0, 3.79, -4.85], colors.trim, .04, 'wood');
  box(sideWall, [.27, .12, 9.85], [-5.85, 3.79, 0], colors.trim, .04, 'wood');
  box(backWall, [11.66, .79, .04], [0, .47, -4.724], '#d5d6bb', .015, 'wood');
  box(sideWall, [.04, .79, 9.7], [-5.724, .47, 0], '#c9cdb0', .015, 'wood');
  for (let i = 0; i < 15; i++) box(backWall, [.04, .8, .04], [-5.4 + i * .78, .48, -4.687], '#e0dfc5', .01);
  for (let i = 0; i < 12; i++) box(sideWall, [.04, .8, .04], [-5.69, .48, -4.35 + i * .78], '#dcddc1', .01);
  box(backWall, [11.6, .055, .09], [0, .91, -4.675], '#dfdfc4', .015);
  box(sideWall, [.09, .055, 9.7], [-5.675, .91, 0], '#d8dbbc', .015);
  box(backWall, [11.6, .15, .09], [0, .135, -4.675], colors.trim, .02);
  box(sideWall, [.09, .15, 9.7], [-5.675, .135, 0], colors.trim, .02);

  // Arched window, original painted landscape, deep sill and linen curtains.
  const windowGroup = new THREE.Group(); windowGroup.position.set(-3.1, 1.08, -4.64); backWall.add(windowGroup);
  arch(windowGroup, 2.66, 2.42, .075, [0, 0, 0], '#faf2d9');
  const skyGeo = new THREE.ShapeGeometry(archShape(2.36, 2.19), 36);
  const uv = skyGeo.attributes.uv, pos = skyGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + 1.18) / 2.36, pos.getY(i) / 2.19);
  const skyMat = new THREE.MeshBasicMaterial({ map: skyTexture() });
  const sky = mesh(skyGeo, skyMat, windowGroup, [0, .11, .112]); sky.castShadow = false; sky.receiveShadow = false;
  box(windowGroup, [.055, 2.13, .07], [0, 1.15, .18], colors.trim, .015);
  box(windowGroup, [2.36, .055, .07], [0, 1.02, .18], colors.trim, .015);
  box(windowGroup, [2.92, .125, .45], [0, -.04, .17], colors.trim, .04, 'wood');
  rod(windowGroup, new THREE.Vector3(-1.64, 2.5, .22), new THREE.Vector3(1.64, 2.5, .22), .029, colors.woodDark);
  for (const side of [-1, 1]) {
    sphere(windowGroup, .054, [side * 1.7, 2.5, .22], colors.woodDark);
    const curtainGeo = new THREE.PlaneGeometry(.49, 2.25, 16, 24);
    const attr = curtainGeo.attributes.position;
    for (let i = 0; i < attr.count; i++) {
      const y = attr.getY(i), x = attr.getX(i);
      const cinch = Math.exp(-Math.pow((y + .25) * 2.8, 2));
      attr.setXYZ(i, x * (1 - cinch * .38) + side * cinch * .06, y, Math.sin(x * 60) * .038);
    }
    curtainGeo.computeVertexNormals();
    const curtain = mesh(curtainGeo, new THREE.MeshStandardMaterial({ map: surfaceTexture('fabric', '#e7dfc5'), side: THREE.DoubleSide, roughness: 1 }), windowGroup, [side * 1.35, 1.3, .28]);
    curtain.castShadow = true;
    box(windowGroup, [.3, .045, .08], [side * 1.39, 1.06, .32], '#c7b58e', .018);
  }
  plant(windowGroup, [-1.05, .03, .27], .4, colors.yellow);

  // A bench below the window, with soft cushions and visible piping.
  box(group, [2.52, .15, .76], [-3.14, .52, -4.03], colors.woodLight, .055, 'wood');
  for (const x of [-4.15, -2.12]) for (const z of [-4.24, -3.78]) box(group, [.11, .45, .11], [x, .285, z], colors.woodDark, .025, 'wood');
  box(group, [2.42, .16, .69], [-3.14, .66, -4.03], colors.sageLight, .09, 'fabric');
  for (let i = 0; i < 2; i++) {
    const pillow = new THREE.Group(); pillow.position.set(-3.73 + i * 1.15, .94, -4.12); pillow.rotation.set(-.12, 0, i ? -.17 : .16); group.add(pillow);
    box(pillow, [.54, .54, .17], [0, 0, 0], i ? colors.cream : colors.peach, .105, 'fabric');
    const seam = new THREE.CatmullRomCurve3([new THREE.Vector3(-.19, -.2, .079), new THREE.Vector3(.19, -.2, .079), new THREE.Vector3(.2, .2, .079), new THREE.Vector3(-.2, .2, .079)], true);
    mesh(new THREE.TubeGeometry(seam, 32, .005, 4, true), material(i ? '#d9c99f' : '#d3a98b'), pillow);
  }
  basket(group, [-3.19, .07, -4.08], 1.12);
  shelf(group, [-.56, .075, -4.25]);
  shelf(group, [-5.12, .075, -.73], Math.PI / 2);
  picture(backWall, 'alphabet', 1.05, .73, [-.69, 2.76, -4.68]);
  picture(sideWall, 'bunny', .73, .95, [-5.68, 2.78, -.82]).rotation.y = Math.PI / 2;
  const tinyArt = picture(sideWall, 'garden', .43, .57, [-5.68, 2.66, .35]); tinyArt.rotation.y = Math.PI / 2;
  plant(group, [-5.04, .075, -3.89], 1.45, '#d3b793');
  plant(group, [5.03, .075, 3.52], 1.7, '#d3ae8b');
  plant(group, [.95, .075, -4.14], 1.23, '#b5bf9f');
  rainbow(backWall, [2.97, 2.87, -4.66], 1.22);
  // Peg rail and a small canvas satchel on the side wall.
  const pegs = new THREE.Group(); pegs.position.set(-5.69, 2.22, 2.05); pegs.rotation.y = Math.PI / 2; sideWall.add(pegs);
  box(pegs, [1.7, .12, .075], [0, 0, 0], colors.woodLight, .045, 'wood');
  for (const x of [-.56, 0, .56]) cylinder(pegs, .03, .03, .13, [x, -.015, .095], colors.woodDark).rotation.x = Math.PI / 2;
  const bag = box(pegs, [.43, .49, .16], [-.54, -.48, .14], colors.cream, .095, 'fabric'); bag.rotation.z = -.06;
  torus(pegs, .1, .018, [-.54, -.12, .15], '#c6ae85', Math.PI);
  star(pegs, .086, [-.54, -.44, .231], colors.yellow, .008);
  const hat = new THREE.Group(); pegs.add(hat); hat.position.set(.57, -.22, .21); hat.rotation.x = Math.PI / 2 + .25;
  cylinder(hat, .19, .26, .038, [0, 0, 0], material('#d9ba80', 'fabric'));
  sphere(hat, .165, [0, .035, 0], '#d9ba80', [1, .78, 1]);
  const largeBasket = basket(group, [-5.04, .074, 1.64], 1.55);
  sphere(largeBasket, .22, [.02, .43, 0], material(colors.sageLight, 'fabric'));
  bunny(group, [-4.97, .55, 1.6], .66).rotation.y = .8;

  // A folded blanket, and an enamel bottle waiting on the edge of the mat.
  box(group, [1.05, .095, .58], [4.98, .12, 1.22], colors.sage, .06, 'fabric').rotation.y = -.12;
  box(group, [.98, .08, .52], [4.98, .2, 1.2], '#b1bd99', .06, 'fabric').rotation.y = -.12;
  for (let i = 0; i < 8; i++) rod(group, new THREE.Vector3(4.57 + i * .11, .18, 1.49), new THREE.Vector3(4.56 + i * .11, .16, 1.57), .006, '#d7dfbf');
  cylinder(group, .08, .08, .28, [5.16, .21, .62], colors.cream);
  cylinder(group, .062, .073, .07, [5.16, .39, .62], colors.coral);

  // A pendant and a lazy little mobile, kept clear of the central camera view.
  const mobile = new THREE.Group(); mobile.position.set(-4.85, 3.51, -2.64); group.add(mobile);
  mobile.userData.dynamic = true;
  rod(mobile, new THREE.Vector3(0, .25, 0), new THREE.Vector3(0, -.1, 0), .006, '#b4a787');
  rod(mobile, new THREE.Vector3(-.58, -.1, 0), new THREE.Vector3(.58, -.1, 0), .012, colors.woodDark);
  for (let i = 0; i < 4; i++) {
    const x = -.5 + i * .33, length = .3 + (i % 2) * .2;
    rod(mobile, new THREE.Vector3(x, -.1, 0), new THREE.Vector3(x, -.1 - length, 0), .004, '#c0b395');
    star(mobile, .1, [x, -.23 - length, 0], i % 2 ? colors.cream : colors.yellow, .025);
  }
  const pendant = new THREE.Group(); pendant.position.set(-.55, 3.6, -3.16); group.add(pendant);
  rod(pendant, new THREE.Vector3(0, .35, 0), new THREE.Vector3(0, -.03, 0), .014, '#978b6b');
  const shadeMat = new THREE.MeshStandardMaterial({ color: '#efe2be', roughness: .93, side: THREE.DoubleSide });
  const shade = mesh(new THREE.CylinderGeometry(.16, .41, .32, 48, 1, true), shadeMat, pendant, [0, -.14, 0]);
  shade.castShadow = false;
  torus(pendant, .41, .015, [0, -.3, 0], colors.woodDark).rotation.x = Math.PI / 2;
  const bulbMaterial = new THREE.MeshStandardMaterial({ color: '#fff4cc', emissive: '#ffd58e', emissiveIntensity: .5 });
  sphere(pendant, .085, [0, -.24, 0], bulbMaterial);

  const garlandPoints = [new THREE.Vector3(-5.43, 3.55, -4.63), new THREE.Vector3(-.1, 3.38, -4.61), new THREE.Vector3(5.41, 3.53, -4.63)];
  tube(backWall, garlandPoints, .009, '#bbae8e');
  for (let i = 0; i < 19; i++) {
    const x = -5.4 + i * .6, y = 3.39 + (x / 5.4) ** 2 * .14;
    cylinder(backWall, .018, .018, .05, [x, y - .025, -4.61], '#a59b7e', 8);
    sphere(backWall, .028, [x, y - .065, -4.61], bulbMaterial, [1, 1.22, 1]);
  }

  // Dappled afternoon light, feathered at the edge with a procedural canvas.
  const sunlightCanvas = document.createElement('canvas'); sunlightCanvas.width = sunlightCanvas.height = 256;
  const ctx = sunlightCanvas.getContext('2d')!;
  const gradient = ctx.createLinearGradient(0, 0, 0, 256); gradient.addColorStop(0, 'rgba(255,237,187,.27)'); gradient.addColorStop(1, 'rgba(255,237,187,0)');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 256, 256);
  const sunlightTexture = new THREE.CanvasTexture(sunlightCanvas); sunlightTexture.colorSpace = THREE.SRGBColorSpace;
  const sunlightMat = new THREE.MeshBasicMaterial({ map: sunlightTexture, transparent: true, depthWrite: false, opacity: .55, blending: THREE.AdditiveBlending });
  const sunlight = mesh(new THREE.PlaneGeometry(2.7, 5.5), sunlightMat, group, [-2.25, .192, -1.25]);
  sunlight.rotation.set(-Math.PI / 2, 0, -.2); sunlight.castShadow = false; sunlight.receiveShadow = false;

  // Dust motes live in a small sunlit volume and use a single draw call.
  const dustPositions = new Float32Array(24 * 3);
  for (let i = 0; i < 24; i++) { dustPositions[i * 3] = -4.5 + random() * 5; dustPositions[i * 3 + 1] = .4 + random() * 2.6; dustPositions[i * 3 + 2] = -3.9 + random() * 4; }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dustMat = new THREE.PointsMaterial({ color: '#fff3c9', size: .026, transparent: true, opacity: .5, depthWrite: false });
  const dust = new THREE.Points(dustGeo, dustMat); group.add(dust);

  // Brass room label on the front lip.
  box(group, [1.31, .135, .018], [0, -.09, 4.914], '#bfaa7e', .025);
  const nameplate = mesh(new THREE.PlaneGeometry(1.2, .12), new THREE.MeshStandardMaterial({ map: labelTexture("TAOTAO'S ROOM", '#736343', '#bfaa7e'), roughness: .7 }), group, [0, -.09, 4.927]);
  nameplate.castShadow = false;
  batchStaticMeshes(backWall); batchStaticMeshes(sideWall); batchStaticMeshes(group);

  return {
    group,
    setNight: (night) => {
      skyMat.map = skyTexture(night); skyMat.needsUpdate = true;
      bulbMaterial.emissiveIntensity = night ? 2 : .4;
      shadeMat.emissive.set(night ? '#b87f38' : '#000000'); shadeMat.emissiveIntensity = .15;
      sunlightMat.opacity = night ? 0 : .55; dustMat.opacity = night ? .18 : .5;
    },
    update: (time) => {
      mobile.rotation.y = Math.sin(time * .26) * .16; mobile.rotation.z = Math.sin(time * .48) * .025;
      dust.rotation.y = Math.sin(time * .035) * .05; dust.position.y = Math.sin(time * .15) * .065;
    },
    setView: (direction) => { backWall.visible = direction.z > -.04; sideWall.visible = direction.x > -.04; },
  };
}
