import { createBall } from './ball';
import { createBlocks } from './blocks';
import { createBooks } from './books';
import { createCastle } from './castle';
import { createMusic } from './music';
import { createRings } from './rings';
import { createRocker } from './rocker';
import { createTrain } from './train';
import type { ToyDefinition } from './types';

/** Add a model + an entry here to extend the room. All positions are in metres. */
export const toyDefinitions: ToyDefinition[] = [
  {
    id: 'blocks', name: '小小建筑师', subtitle: '一块一块，搭起想象', description: '圆角木积木，今天要搭一座什么样的小房子呢？', category: '想象力', color: '#e8b49c', icon: 'blocks', action: 'build',
    position: [-3.05, .16, .25], approach: [-3.05, -.65], lookAt: [-3.05, .25], labelHeight: 1.35,
    obstacles: [{ x: -3.05, z: .15, width: 1.3, depth: .9 }], create: createBlocks,
  },
  {
    id: 'books', name: '绘本里的朋友', subtitle: '翻开一页小小的奇遇', description: '小兔子陪着陶陶，把森林里的故事再读一遍。', category: '慢时光', color: '#adbc99', icon: 'book', action: 'read',
    position: [-3.25, .16, -2.32], approach: [-3.12, -1.48], lookAt: [-3.25, -2.32], labelHeight: 1.15,
    obstacles: [{ x: -3.5, z: -2.85, width: 1.55, depth: 1.1 }], create: createBooks,
  },
  {
    id: 'train', name: '森林小火车', subtitle: '呜——下一站，快乐', description: '推一推小火车，载着木头和果子环游小小世界。', category: '想象力', color: '#9aaf97', icon: 'train', action: 'train',
    position: [-.45, .16, 2.74], approach: [-.52, 1.66], lookAt: [-.45, 2.74], labelHeight: .95,
    obstacles: [{ x: -.45, z: 2.74, width: 2.7, depth: 1.45 }], create: createTrain,
  },
  {
    id: 'ball', name: '咕噜咕噜球', subtitle: '追着快乐，滚呀滚', description: '软软的彩色布球，滚过来，再轻轻推回去。', category: '动起来', color: '#d4b36f', icon: 'ball', action: 'roll',
    position: [.12, .16, .15], approach: [.15, -.64], lookAt: [.12, .5], labelHeight: .95,
    obstacles: [], create: createBall,
  },
  {
    id: 'castle', name: '云朵小城堡', subtitle: '每一级，都是新冒险', description: '爬上木梯，穿过小桥，再从弯弯的滑梯滑下来！', category: '动起来', color: '#9bb6b6', icon: 'castle', action: 'climb',
    position: [2.5, .16, -2.12], approach: [4.05, .28], lookAt: [3.55, -1.1], labelHeight: 3.7,
    obstacles: [
      { x: 2.5, z: -2.47, width: 3.7, depth: 1.8 },
      { x: 1.45, z: -.73, width: 1, depth: 2.3 },
      { x: 3.55, z: -1.4, width: .93, depth: 1.4 },
    ], create: createCastle,
  },
  {
    id: 'rocker', name: '摇摇小木马', subtitle: '骑着小马去远方', description: '扶好小把手，跟着木马前后摇一摇。', category: '动起来', color: '#cba97e', icon: 'horse', action: 'rock',
    position: [-4.03, .16, 2.53], approach: [-3.22, 2.13], lookAt: [-4.03, 2.53], labelHeight: 1.75,
    obstacles: [{ x: -4.03, z: 2.53, width: .8, depth: 1.5 }], create: createRocker,
  },
  {
    id: 'music', name: '彩虹叮叮琴', subtitle: '把好心情敲成一首歌', description: '左手叮，右手咚。每一种颜色都有自己的声音。', category: '慢时光', color: '#d8a69d', icon: 'music', action: 'music',
    position: [1.77, .16, 3.08], approach: [1.8, 2.26], lookAt: [1.77, 3.08], labelHeight: .92,
    obstacles: [{ x: 1.77, z: 3.08, width: 1.4, depth: .65 }], create: createMusic,
  },
  {
    id: 'rings', name: '彩色圈圈塔', subtitle: '大圈小圈，慢慢长高', description: '拿起一个彩色木环，对准小柱子，稳稳地放下。', category: '想象力', color: '#d9bd7c', icon: 'rings', action: 'stack',
    position: [3.56, .16, 2.55], approach: [3.52, 1.75], lookAt: [3.56, 2.55], labelHeight: 1.2,
    obstacles: [{ x: 3.56, z: 2.5, width: .75, depth: .65 }], create: createRings,
  },
];
