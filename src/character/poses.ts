export interface Pose {
  bodyY: number; bodyX: number; bodyZ: number;
  headX: number; headY: number; headZ: number;
  leftArmX: number; leftArmZ: number; rightArmX: number; rightArmZ: number;
  leftElbow: number; rightElbow: number;
  leftLegX: number; rightLegX: number; leftLegZ: number; rightLegZ: number;
  leftKnee: number; rightKnee: number;
}

export const neutralPose: Pose = {
  bodyY: 0, bodyX: 0, bodyZ: 0,
  headX: 0, headY: 0, headZ: 0,
  leftArmX: 0, leftArmZ: -.1, rightArmX: 0, rightArmZ: .1,
  leftElbow: -.08, rightElbow: -.08,
  leftLegX: 0, rightLegX: 0, leftLegZ: 0, rightLegZ: 0,
  leftKnee: 0, rightKnee: 0,
};

export function idlePose(t: number): Pose {
  return { ...neutralPose, bodyY: Math.sin(t * 2.2) * .009, bodyZ: Math.sin(t * .9) * .018, headY: Math.sin(t * .7) * .13, headZ: Math.sin(t * .93) * .032, leftArmX: Math.sin(t * 1.7) * .04, rightArmX: Math.sin(t * 1.7 + .6) * .04 };
}

export function walkPose(phase: number): Pose {
  const s = Math.sin(phase);
  return {
    ...neutralPose,
    bodyY: Math.abs(Math.cos(phase)) * .028, bodyX: .055, bodyZ: s * .04,
    headX: -.025, headZ: -s * .028,
    leftLegX: s * .43, rightLegX: -s * .43,
    leftKnee: Math.max(0, -s) * .53, rightKnee: Math.max(0, s) * .53,
    leftArmX: -s * .35, rightArmX: s * .35,
    leftArmZ: -.15, rightArmZ: .15,
    leftElbow: -.18, rightElbow: -.18,
  };
}

export function sitPose(): Pose {
  return { ...neutralPose, bodyY: -.29, bodyX: .05, leftLegX: -1.28, rightLegX: -1.28, leftLegZ: -.22, rightLegZ: .22, leftKnee: .55, rightKnee: .55, headX: .22, leftArmX: -.54, rightArmX: -.54, leftElbow: -.55, rightElbow: -.55 };
}
