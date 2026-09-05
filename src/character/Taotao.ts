import * as THREE from 'three';
import { box, cylinder, material, mesh, sphere, torus, tube } from '../world/geometry';
import { colors } from '../world/palette';
import { shadowTexture } from '../world/textures';
import { neutralPose } from './poses';
import type { Pose } from './poses';
import { batchStaticMeshes } from '../world/batch';

export class Taotao {
  readonly root = new THREE.Group();
  readonly body = new THREE.Group();
  readonly head = new THREE.Group();
  readonly leftArm = new THREE.Group();
  readonly rightArm = new THREE.Group();
  readonly leftElbow = new THREE.Group();
  readonly rightElbow = new THREE.Group();
  readonly leftLeg = new THREE.Group();
  readonly rightLeg = new THREE.Group();
  readonly leftKnee = new THREE.Group();
  readonly rightKnee = new THREE.Group();
  readonly shadow: THREE.Mesh;
  readonly eyes: THREE.Group[] = [];
  private pose: Pose = { ...neutralPose };

  constructor() {
    this.root.name = 'taotao'; this.root.add(this.body); this.body.add(this.head);
    this.body.scale.setScalar(.95);
    const skin = material(colors.skin); const hair = material(colors.hair);
    const shirt = material('#f5e9ce', 'fabric'); const romper = material('#cb9469', 'fabric');
    box(this.body, [.44, .36, .29], [0, .74, 0], shirt, .115);
    box(this.body, [.45, .19, .32], [0, .512, .007], romper, .07);
    box(this.body, [.29, .27, .035], [0, .697, .164], romper, .052);
    box(this.body, [.14, .1, .016], [0, .651, .191], '#be845d', .025, 'fabric');
    for (const x of [-.137, .137]) {
      box(this.body, [.067, .33, .041], [x, .787, .145], romper, .026);
      sphere(this.body, .019, [x, .772, .174], '#e3caa1', [1, 1, .4]);
    }
    cylinder(this.body, .081, .097, .115, [0, .967, 0], skin);
    torus(this.body, .09, .017, [0, .956, .015], '#eadbbe').rotation.x = Math.PI / 2;
    this.head.position.set(0, 1.192, .011);
    sphere(this.head, .314, [0, 0, 0], skin, [1, 1.06, .965]);
    // Dark, softly sculpted hair and an asymmetric baby fringe.
    const cap = mesh(new THREE.SphereGeometry(.322, 32, 18, 0, Math.PI * 2, 0, 1.28), hair, this.head, [0, .015, -.006]); cap.scale.set(1, 1.08, 1.015);
    for (const x of [-.273, .273]) sphere(this.head, .088, [x, .082, -.007], hair, [.48, 1.43, 1.35]);
    sphere(this.head, .105, [-.166, .216, .19], hair, [1.2, .75, .67]).rotation.z = -.27;
    sphere(this.head, .106, [-.04, .254, .198], hair, [1.2, .7, .7]).rotation.z = .19;
    sphere(this.head, .084, [.099, .254, .187], hair, [1.28, .61, .71]).rotation.z = .36;
    sphere(this.head, .08, [-.047, .345, -.025], hair, [1.24, .5, .9]);
    const tuft = sphere(this.head, .045, [-.108, .354, -.023], hair, [.45, 1.2, .65]); tuft.rotation.z = -.65;
    for (const side of [-1, 1]) {
      sphere(this.head, .067, [side * .308, -.026, -.004], skin, [.54, .94, .81]);
      sphere(this.head, .034, [side * .337, -.026, .012], '#dca17d', [.24, .78, .74]);
      const eye = new THREE.Group(); this.head.add(eye); eye.position.set(side * .109, .004, .29); this.eyes.push(eye);
      eye.userData.dynamic = true;
      sphere(eye, .027, [0, 0, 0], '#3d342c', [.86, 1.05, .45]);
      sphere(eye, .0085, [-.007, .009, .012], '#fff2d8', [.8, .9, .5]);
      sphere(eye, .0035, [.007, -.006, .013], '#d4bf9d');
      const brow = tube(this.head, [new THREE.Vector3(side * .07, .074, .294), new THREE.Vector3(side * .109, .086, .296), new THREE.Vector3(side * .145, .076, .279)], .008, colors.hair, false, 12); brow.castShadow = false;
      sphere(this.head, .052, [side * .174, -.065, .255], '#e9a28a', [1, .56, .11]);
    }
    sphere(this.head, .026, [0, -.042, .306], '#eab38a', [1, .74, .79]);
    const smile = tube(this.head, [new THREE.Vector3(-.033, -.097, .288), new THREE.Vector3(0, -.108, .296), new THREE.Vector3(.033, -.097, .288)], .008, '#ae735d', false, 12); smile.castShadow = false;
    sphere(this.head, .007, [-.068, -.105, .286], '#ddaa87', [1, .5, .3]);

    for (const [side, arm, elbow] of [[-1, this.leftArm, this.leftElbow], [1, this.rightArm, this.rightElbow]] as const) {
      this.body.add(arm); arm.position.set(side * .254, .87, 0); arm.add(elbow); elbow.position.y = -.197;
      sphere(arm, .103, [0, -.066, 0], shirt, [.87, 1.14, 1]);
      cylinder(arm, .065, .062, .15, [0, -.137, 0], skin);
      sphere(elbow, .064, [0, 0, 0], skin);
      cylinder(elbow, .062, .048, .15, [0, -.077, 0], skin);
      sphere(elbow, .061, [0, -.174, .006], skin, [.87, 1.05, .78]);
      sphere(elbow, .026, [-side * .044, -.16, .025], skin, [.8, 1.25, .9]);
      for (let i = 0; i < 3; i++) sphere(elbow, .014, [-.027 + i * .025, -.219, .01], skin, [.8, 1.1, .9]);
    }
    for (const [side, leg, knee] of [[-1, this.leftLeg, this.leftKnee], [1, this.rightLeg, this.rightKnee]] as const) {
      this.body.add(leg); leg.position.set(side * .127, .49, 0); leg.add(knee); knee.position.y = -.21;
      box(leg, [.19, .2, .215], [0, -.066, .004], romper, .055);
      cylinder(leg, .073, .065, .145, [0, -.145, .009], skin);
      sphere(knee, .066, [0, 0, .007], skin);
      cylinder(knee, .064, .058, .15, [0, -.072, .003], skin);
      cylinder(knee, .061, .06, .078, [0, -.141, .006], shirt);
      box(knee, [.145, .09, .235], [0, -.19, .048], '#d5ad66', .043);
      box(knee, [.151, .027, .241], [0, -.228, .048], '#eee0ba', .011);
      box(knee, [.145, .025, .064], [0, -.146, .087], '#e3c283', .01);
    }
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: .64 }));
    this.shadow.rotation.x = -Math.PI / 2;
    this.root.position.set(-.35, .19, .3); this.root.rotation.y = .42;
    for (const part of [this.head, this.leftArm, this.rightArm, this.leftElbow, this.rightElbow, this.leftLeg, this.rightLeg, this.leftKnee, this.rightKnee]) part.userData.dynamic = true;
    for (const part of [this.head, this.leftElbow, this.rightElbow, this.leftArm, this.rightArm, this.leftKnee, this.rightKnee, this.leftLeg, this.rightLeg, this.body]) batchStaticMeshes(part);
  }

  applyPose(next: Pose, delta: number, time: number) {
    const alpha = 1 - Math.exp(-delta * 10);
    for (const key of Object.keys(this.pose) as (keyof Pose)[]) this.pose[key] += (next[key] - this.pose[key]) * alpha;
    const p = this.pose;
    this.body.position.y = p.bodyY; this.body.rotation.set(p.bodyX, 0, p.bodyZ);
    this.head.rotation.set(p.headX, p.headY, p.headZ);
    this.leftArm.rotation.set(p.leftArmX, 0, p.leftArmZ); this.rightArm.rotation.set(p.rightArmX, 0, p.rightArmZ);
    this.leftElbow.rotation.x = p.leftElbow; this.rightElbow.rotation.x = p.rightElbow;
    this.leftLeg.rotation.set(p.leftLegX, 0, p.leftLegZ); this.rightLeg.rotation.set(p.rightLegX, 0, p.rightLegZ);
    this.leftKnee.rotation.x = p.leftKnee; this.rightKnee.rotation.x = p.rightKnee;
    const blinkTime = (time + 1.72) % 4.3;
    const blink = blinkTime < .16 ? 1 - Math.sin(blinkTime / .16 * Math.PI) * .94 : 1;
    this.eyes.forEach(eye => { eye.scale.y = blink; });
    this.shadow.position.set(this.root.position.x, .195, this.root.position.z);
    (this.shadow.material as THREE.MeshBasicMaterial).opacity = .64 * Math.max(.12, 1 - Math.max(0, this.root.position.y - .19) * .6);
  }

  face(angle: number, delta: number) {
    let difference = angle - this.root.rotation.y;
    difference = Math.atan2(Math.sin(difference), Math.cos(difference));
    this.root.rotation.y += difference * (1 - Math.exp(-delta * 8));
  }

  handPositions() {
    this.root.updateMatrixWorld(true);
    return {
      left: this.leftElbow.localToWorld(new THREE.Vector3(0, -.184, .012)),
      right: this.rightElbow.localToWorld(new THREE.Vector3(0, -.184, .012)),
    };
  }
}
