import * as THREE from "three";
import { box, cylinder, material, mesh, sphere, torus, tube } from "../world/geometry";
import { colors } from "../world/palette";
import { shadowTexture } from "../world/textures";
import { neutralPose } from "./poses";
import type { Pose } from "./poses";
import { batchStaticMeshes } from "../world/batch";

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
    this.root.name = "taotao";
    this.root.add(this.body);
    this.body.add(this.head);
    this.body.scale.setScalar(0.95);
    const skin = material(colors.skin);
    const hair = material(colors.hair);
    const shirt = material("#f5e9ce", "fabric");
    const romper = material("#cb9469", "fabric");
    box(this.body, [0.44, 0.36, 0.29], [0, 0.74, 0], shirt, 0.115);
    box(this.body, [0.45, 0.19, 0.32], [0, 0.512, 0.007], romper, 0.07);
    box(this.body, [0.29, 0.27, 0.035], [0, 0.697, 0.164], romper, 0.052);
    box(this.body, [0.14, 0.1, 0.016], [0, 0.651, 0.191], "#be845d", 0.025, "fabric");
    for (const x of [-0.137, 0.137]) {
      box(this.body, [0.067, 0.33, 0.041], [x, 0.787, 0.145], romper, 0.026);
      sphere(this.body, 0.019, [x, 0.772, 0.174], "#e3caa1", [1, 1, 0.4]);
    }
    cylinder(this.body, 0.081, 0.097, 0.115, [0, 0.967, 0], skin);
    torus(this.body, 0.09, 0.017, [0, 0.956, 0.015], "#eadbbe").rotation.x = Math.PI / 2;
    this.head.position.set(0, 1.192, 0.011);
    sphere(this.head, 0.314, [0, 0, 0], skin, [1, 1.06, 0.965]);
    // Dark, softly sculpted hair and an asymmetric baby fringe.
    const cap = mesh(
      new THREE.SphereGeometry(0.322, 32, 18, 0, Math.PI * 2, 0, 1.28),
      hair,
      this.head,
      [0, 0.015, -0.006],
    );
    cap.scale.set(1, 1.08, 1.015);
    for (const x of [-0.273, 0.273])
      sphere(this.head, 0.088, [x, 0.082, -0.007], hair, [0.48, 1.43, 1.35]);
    sphere(this.head, 0.105, [-0.166, 0.216, 0.19], hair, [1.2, 0.75, 0.67]).rotation.z = -0.27;
    sphere(this.head, 0.106, [-0.04, 0.254, 0.198], hair, [1.2, 0.7, 0.7]).rotation.z = 0.19;
    sphere(this.head, 0.084, [0.099, 0.254, 0.187], hair, [1.28, 0.61, 0.71]).rotation.z = 0.36;
    sphere(this.head, 0.08, [-0.047, 0.345, -0.025], hair, [1.24, 0.5, 0.9]);
    const tuft = sphere(this.head, 0.045, [-0.108, 0.354, -0.023], hair, [0.45, 1.2, 0.65]);
    tuft.rotation.z = -0.65;
    for (const side of [-1, 1]) {
      sphere(this.head, 0.067, [side * 0.308, -0.026, -0.004], skin, [0.54, 0.94, 0.81]);
      sphere(this.head, 0.034, [side * 0.337, -0.026, 0.012], "#dca17d", [0.24, 0.78, 0.74]);
      const eye = new THREE.Group();
      this.head.add(eye);
      eye.position.set(side * 0.109, 0.004, 0.29);
      this.eyes.push(eye);
      eye.userData.dynamic = true;
      sphere(eye, 0.027, [0, 0, 0], "#3d342c", [0.86, 1.05, 0.45]);
      sphere(eye, 0.0085, [-0.007, 0.009, 0.012], "#fff2d8", [0.8, 0.9, 0.5]);
      sphere(eye, 0.0035, [0.007, -0.006, 0.013], "#d4bf9d");
      const brow = tube(
        this.head,
        [
          new THREE.Vector3(side * 0.07, 0.074, 0.294),
          new THREE.Vector3(side * 0.109, 0.086, 0.296),
          new THREE.Vector3(side * 0.145, 0.076, 0.279),
        ],
        0.008,
        colors.hair,
        false,
        12,
      );
      brow.castShadow = false;
      sphere(this.head, 0.052, [side * 0.174, -0.065, 0.255], "#e9a28a", [1, 0.56, 0.11]);
    }
    sphere(this.head, 0.026, [0, -0.042, 0.306], "#eab38a", [1, 0.74, 0.79]);
    const smile = tube(
      this.head,
      [
        new THREE.Vector3(-0.033, -0.097, 0.288),
        new THREE.Vector3(0, -0.108, 0.296),
        new THREE.Vector3(0.033, -0.097, 0.288),
      ],
      0.008,
      "#ae735d",
      false,
      12,
    );
    smile.castShadow = false;
    sphere(this.head, 0.007, [-0.068, -0.105, 0.286], "#ddaa87", [1, 0.5, 0.3]);

    for (const [side, arm, elbow] of [
      [-1, this.leftArm, this.leftElbow],
      [1, this.rightArm, this.rightElbow],
    ] as const) {
      this.body.add(arm);
      arm.position.set(side * 0.254, 0.87, 0);
      arm.add(elbow);
      elbow.position.y = -0.197;
      sphere(arm, 0.103, [0, -0.066, 0], shirt, [0.87, 1.14, 1]);
      cylinder(arm, 0.065, 0.062, 0.15, [0, -0.137, 0], skin);
      sphere(elbow, 0.064, [0, 0, 0], skin);
      cylinder(elbow, 0.062, 0.048, 0.15, [0, -0.077, 0], skin);
      sphere(elbow, 0.061, [0, -0.174, 0.006], skin, [0.87, 1.05, 0.78]);
      sphere(elbow, 0.026, [-side * 0.044, -0.16, 0.025], skin, [0.8, 1.25, 0.9]);
      for (let i = 0; i < 3; i++)
        sphere(elbow, 0.014, [-0.027 + i * 0.025, -0.219, 0.01], skin, [0.8, 1.1, 0.9]);
    }
    for (const [side, leg, knee] of [
      [-1, this.leftLeg, this.leftKnee],
      [1, this.rightLeg, this.rightKnee],
    ] as const) {
      this.body.add(leg);
      leg.position.set(side * 0.127, 0.49, 0);
      leg.add(knee);
      knee.position.y = -0.21;
      box(leg, [0.19, 0.2, 0.215], [0, -0.066, 0.004], romper, 0.055);
      cylinder(leg, 0.073, 0.065, 0.145, [0, -0.145, 0.009], skin);
      sphere(knee, 0.066, [0, 0, 0.007], skin);
      cylinder(knee, 0.064, 0.058, 0.15, [0, -0.072, 0.003], skin);
      cylinder(knee, 0.061, 0.06, 0.078, [0, -0.141, 0.006], shirt);
      box(knee, [0.145, 0.09, 0.235], [0, -0.19, 0.048], "#d5ad66", 0.043);
      box(knee, [0.151, 0.027, 0.241], [0, -0.228, 0.048], "#eee0ba", 0.011);
      box(knee, [0.145, 0.025, 0.064], [0, -0.146, 0.087], "#e3c283", 0.01);
    }
    this.shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 1.2),
      new THREE.MeshBasicMaterial({
        map: shadowTexture(),
        transparent: true,
        depthWrite: false,
        opacity: 0.64,
      }),
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.root.position.set(-0.35, 0.19, 0.3);
    this.root.rotation.y = 0.42;
    for (const part of [
      this.head,
      this.leftArm,
      this.rightArm,
      this.leftElbow,
      this.rightElbow,
      this.leftLeg,
      this.rightLeg,
      this.leftKnee,
      this.rightKnee,
    ])
      part.userData.dynamic = true;
    for (const part of [
      this.head,
      this.leftElbow,
      this.rightElbow,
      this.leftArm,
      this.rightArm,
      this.leftKnee,
      this.rightKnee,
      this.leftLeg,
      this.rightLeg,
      this.body,
    ])
      batchStaticMeshes(part);
  }

  applyPose(next: Pose, delta: number, time: number) {
    const alpha = 1 - Math.exp(-delta * 10);
    for (const key of Object.keys(this.pose) as (keyof Pose)[])
      this.pose[key] += (next[key] - this.pose[key]) * alpha;
    const p = this.pose;
    this.body.position.y = p.bodyY;
    this.body.rotation.set(p.bodyX, 0, p.bodyZ);
    this.head.rotation.set(p.headX, p.headY, p.headZ);
    this.leftArm.rotation.set(p.leftArmX, 0, p.leftArmZ);
    this.rightArm.rotation.set(p.rightArmX, 0, p.rightArmZ);
    this.leftElbow.rotation.x = p.leftElbow;
    this.rightElbow.rotation.x = p.rightElbow;
    this.leftLeg.rotation.set(p.leftLegX, 0, p.leftLegZ);
    this.rightLeg.rotation.set(p.rightLegX, 0, p.rightLegZ);
    this.leftKnee.rotation.x = p.leftKnee;
    this.rightKnee.rotation.x = p.rightKnee;
    const blinkTime = (time + 1.72) % 4.3;
    const blink = blinkTime < 0.16 ? 1 - Math.sin((blinkTime / 0.16) * Math.PI) * 0.94 : 1;
    this.eyes.forEach((eye) => {
      eye.scale.y = blink;
    });
    this.shadow.position.set(this.root.position.x, 0.195, this.root.position.z);
    (this.shadow.material as THREE.MeshBasicMaterial).opacity =
      0.64 * Math.max(0.12, 1 - Math.max(0, this.root.position.y - 0.19) * 0.6);
  }

  face(angle: number, delta: number) {
    let difference = angle - this.root.rotation.y;
    difference = Math.atan2(Math.sin(difference), Math.cos(difference));
    this.root.rotation.y += difference * (1 - Math.exp(-delta * 8));
  }

  handPositions() {
    this.root.updateMatrixWorld(true);
    return {
      left: this.leftElbow.localToWorld(new THREE.Vector3(0, -0.184, 0.012)),
      right: this.rightElbow.localToWorld(new THREE.Vector3(0, -0.184, 0.012)),
    };
  }
}
