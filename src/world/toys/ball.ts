import * as THREE from "three";
import { mesh, material, sphere } from "../geometry";
import { colors } from "../palette";
import type { ToyModel } from "./types";

export function createBall(): ToyModel {
  const group = new THREE.Group();
  const ball = new THREE.Group();
  group.add(ball);
  ball.position.y = 0.25;
  ball.userData.dynamic = true;
  [colors.coral, colors.cream, colors.sage, colors.cream, colors.yellow, colors.cream].forEach(
    (color, i) => {
      mesh(
        new THREE.SphereGeometry(0.255, 10, 22, (i / 6) * Math.PI * 2, Math.PI / 3),
        material(color, "fabric"),
        ball,
      );
    },
  );
  sphere(ball, 0.043, [0, 0.251, 0], colors.cream, [1, 0.2, 1]);
  return {
    group,
    update: ({ active, elapsed }) => {
      const wave = active ? Math.max(0, Math.sin(elapsed * 1.2 - 1)) : 0;
      ball.position.z = wave * 0.95;
      ball.position.y = 0.255 + Math.sin(wave * Math.PI) * 0.025;
      ball.rotation.x = -wave * 3.7;
    },
  };
}
