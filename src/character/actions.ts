import type { ActionId } from '../world/toys/types';
import { neutralPose, sitPose, walkPose } from './poses';
import type { Pose } from './poses';

export interface ActionDefinition {
  label: string;
  thought: string;
  duration: number;
  sample: (time: number, progress: number) => Pose;
}

/** Independent animation clips. Toy models receive the same elapsed time. */
export const actions: Record<ActionId, ActionDefinition> = {
  build: {
    label: '在搭一座小房子', thought: '再高一点点！', duration: 13.2,
    sample: (time) => {
      const p = sitPose(); const t = time % 4.4;
      const lift = t > 1 && t < 3.7 ? Math.sin((t - 1) / 2.7 * Math.PI) : 0;
      p.bodyX = .38 - lift * .23;
      p.rightArmX = -.95 - lift * 1.35; p.rightElbow = -.18 - lift * .45;
      p.leftArmX = -.56 - lift * .23; p.leftElbow = -.4;
      p.headX = .27 - lift * .2; p.headZ = Math.sin(time * .8) * .07;
      return p;
    },
  },
  read: {
    label: '在读小兔子的故事', thought: '小兔子去哪里啦？', duration: 15,
    sample: (time) => {
      const p = sitPose(); const turn = Math.max(0, Math.sin((time % 5 - 2.6) / 1.25 * Math.PI));
      p.bodyX = .14; p.headX = .36 + Math.sin(time * 1.2) * .035; p.headY = Math.sin(time * .85) * .08;
      p.leftArmX = -.85; p.leftElbow = -.35;
      p.rightArmX = -.88 - turn * .2; p.rightArmZ = .14 - turn * .63; p.rightElbow = -.24 - turn * .35;
      return p;
    },
  },
  train: {
    label: '在开森林小火车', thought: '呜——出发咯', duration: 12,
    sample: (time) => {
      const p = sitPose(); const push = Math.sin(time * 1.3);
      p.bodyX = .17 + push * .09; p.bodyZ = Math.sin(time * 1.1) * .08;
      p.rightArmX = -1.08 - push * .25; p.rightArmZ = Math.sin(time * .72) * .27;
      p.rightElbow = -.28; p.leftArmX = -.38; p.headY = Math.sin(time * .72) * .35; p.headX = .29;
      return p;
    },
  },
  roll: {
    label: '在和小球捉迷藏', thought: '咕噜咕噜～', duration: 10.4,
    sample: (time) => {
      const p = sitPose(); const push = Math.max(0, Math.sin(time * 1.2 - 1));
      p.bodyX = .18 + push * .18; p.headX = .23 - push * .12;
      p.leftArmX = p.rightArmX = -.9 - push * .42;
      p.leftElbow = p.rightElbow = -.48 + push * .35;
      p.leftArmZ = -.16; p.rightArmZ = .16;
      return p;
    },
  },
  climb: {
    label: '在探索云朵小城堡', thought: '陶陶也可以！', duration: 20,
    sample: (time, progress) => {
      if (progress < .12 || (progress >= .43 && progress < .65)) return walkPose(time * 8);
      if (progress < .43) {
        const s = Math.sin(time * 5.6);
        return { ...neutralPose, bodyX: .25, bodyY: Math.abs(s) * .035, headX: -.18, leftArmX: -2.3 + s * .4, rightArmX: -2.3 - s * .4, leftArmZ: -.22, rightArmZ: .22, leftElbow: -.3 - s * .15, rightElbow: -.3 + s * .15, leftLegX: -.45 + s * .4, rightLegX: -.45 - s * .4, leftKnee: .85 - s * .55, rightKnee: .85 + s * .55 };
      }
      if (progress < .94) {
        const p = sitPose(); p.bodyY = -.18; p.bodyX = -.12; p.headX = -.09;
        p.leftLegX = p.rightLegX = -1.45; p.leftKnee = p.rightKnee = .13;
        p.leftArmX = -1.8; p.rightArmX = -1.8; p.leftArmZ = -.65; p.rightArmZ = .65;
        p.headZ = Math.sin(time * 3) * .045;
        return p;
      }
      const p = { ...neutralPose }; p.leftArmX = -2.5; p.rightArmX = -2.5; p.leftArmZ = -.45; p.rightArmZ = .45; p.bodyY = Math.sin((progress - .94) / .06 * Math.PI) * .13; return p;
    },
  },
  rock: {
    label: '在骑摇摇小木马', thought: '去看大大的世界', duration: 12.4,
    sample: (time, progress) => {
      if (progress < .07 || progress > .94) return walkPose(time * 7);
      const p = sitPose();
      p.bodyY = -.06 + Math.abs(Math.sin(time * 3.4)) * .02; p.bodyX = Math.sin(time * 3.4) * .13;
      p.leftLegX = p.rightLegX = -.35; p.leftLegZ = -.38; p.rightLegZ = .38; p.leftKnee = p.rightKnee = .65;
      p.headX = -.06; p.headZ = Math.sin(time * 1.7) * .035;
      p.leftArmX = p.rightArmX = -1.05; p.leftElbow = p.rightElbow = -.38;
      return p;
    },
  },
  music: {
    label: '在敲自己的小小音乐', thought: '叮叮，咚咚 ♪', duration: 12,
    sample: (time) => {
      const p = sitPose(); const s = Math.sin(time * 5);
      p.leftArmX = -1.05 - Math.max(0, s) * .45; p.rightArmX = -1.05 - Math.max(0, -s) * .45;
      p.leftElbow = -.35 - Math.max(0, s) * .6; p.rightElbow = -.35 - Math.max(0, -s) * .6;
      p.bodyZ = s * .045; p.headX = .26; p.headZ = Math.sin(time * 2.5) * .09;
      return p;
    },
  },
  stack: {
    label: '在给圈圈排排队', thought: '稳稳地放上去', duration: 13.8,
    sample: (time) => {
      const p = sitPose(); const t = time % 4.6;
      const lift = t > 1 && t < 3.8 ? Math.sin((t - 1) / 2.8 * Math.PI) : 0;
      p.rightArmX = -1.03 - lift * .95; p.rightElbow = -.2 - lift * .5; p.leftArmX = -.7 - lift * .45; p.leftElbow = -.4;
      p.headX = .3 - lift * .2; p.bodyX = .1 + lift * .07; p.headZ = -.08;
      return p;
    },
  },
};
