import type * as THREE from 'three';

export type ToyId = 'blocks' | 'books' | 'train' | 'ball' | 'castle' | 'rocker' | 'music' | 'rings';
export type ActionId = 'build' | 'read' | 'train' | 'roll' | 'climb' | 'rock' | 'music' | 'stack';
export type ToyCategory = '想象力' | '动起来' | '慢时光';

export interface Obstacle { x: number; z: number; width: number; depth: number }
export interface ToyUpdate {
  time: number; delta: number; active: boolean; progress: number; elapsed: number;
  hands?: { left: THREE.Vector3; right: THREE.Vector3 };
}
export interface ToyModel {
  group: THREE.Group;
  update?: (state: ToyUpdate) => void;
  // Optional body route for interactions that leave the floor, e.g. a slide.
  actorRoute?: (progress: number, elapsed: number) => { position: THREE.Vector3; facing: number };
}

export interface ToyDefinition {
  id: ToyId;
  name: string;
  subtitle: string;
  category: ToyCategory;
  color: string;
  icon: string;
  action: ActionId;
  position: [number, number, number];
  approach: [number, number];
  lookAt: [number, number];
  obstacles: Obstacle[];
  create: (definition: ToyDefinition) => ToyModel;
}

export interface ToyInstance extends ToyDefinition {
  model: ToyModel;
  marker: THREE.Mesh;
}
