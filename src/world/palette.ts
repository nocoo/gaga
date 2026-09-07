export const colors = {
  wall: '#eee7d6',
  wallSide: '#dedfc9',
  trim: '#fcf5df',
  woodLight: '#e1bc87',
  woodDark: '#a8794d',
  sage: '#9da983',
  sageDark: '#67775b',
  sageLight: '#cad0ad',
  cream: '#f3e5c5',
  coral: '#d78d71',
  peach: '#e8b99a',
  yellow: '#e8bd66',
  blue: '#92b5bc',
  skin: '#f0bd92',
  hair: '#40332c',
};

export function seededRandom(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
