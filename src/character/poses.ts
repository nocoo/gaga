export interface Pose {
  bodyY: number;
  bodyX: number;
  bodyZ: number;
  headX: number;
  headY: number;
  headZ: number;
  leftArmX: number;
  leftArmZ: number;
  rightArmX: number;
  rightArmZ: number;
  leftElbow: number;
  rightElbow: number;
  leftLegX: number;
  rightLegX: number;
  leftLegZ: number;
  rightLegZ: number;
  leftKnee: number;
  rightKnee: number;
}

export const neutralPose: Pose = {
  bodyY: 0,
  bodyX: 0,
  bodyZ: 0,
  headX: 0,
  headY: 0,
  headZ: 0,
  leftArmX: 0,
  leftArmZ: -0.1,
  rightArmX: 0,
  rightArmZ: 0.1,
  leftElbow: -0.08,
  rightElbow: -0.08,
  leftLegX: 0,
  rightLegX: 0,
  leftLegZ: 0,
  rightLegZ: 0,
  leftKnee: 0,
  rightKnee: 0,
};

export function idlePose(t: number): Pose {
  return {
    ...neutralPose,
    bodyY: Math.sin(t * 2.2) * 0.009,
    bodyZ: Math.sin(t * 0.9) * 0.018,
    headY: Math.sin(t * 0.7) * 0.13,
    headZ: Math.sin(t * 0.93) * 0.032,
    leftArmX: Math.sin(t * 1.7) * 0.04,
    rightArmX: Math.sin(t * 1.7 + 0.6) * 0.04,
  };
}

export function walkPose(phase: number): Pose {
  const s = Math.sin(phase);
  return {
    ...neutralPose,
    bodyY: Math.abs(Math.cos(phase)) * 0.028,
    bodyX: 0.055,
    bodyZ: s * 0.04,
    headX: -0.025,
    headZ: -s * 0.028,
    leftLegX: s * 0.43,
    rightLegX: -s * 0.43,
    leftKnee: Math.max(0, -s) * 0.53,
    rightKnee: Math.max(0, s) * 0.53,
    leftArmX: -s * 0.35,
    rightArmX: s * 0.35,
    leftArmZ: -0.15,
    rightArmZ: 0.15,
    leftElbow: -0.18,
    rightElbow: -0.18,
  };
}

export function sitPose(): Pose {
  return {
    ...neutralPose,
    bodyY: -0.29,
    bodyX: 0.05,
    leftLegX: -1.28,
    rightLegX: -1.28,
    leftLegZ: -0.22,
    rightLegZ: 0.22,
    leftKnee: 0.55,
    rightKnee: 0.55,
    headX: 0.22,
    leftArmX: -0.54,
    rightArmX: -0.54,
    leftElbow: -0.55,
    rightElbow: -0.55,
  };
}
