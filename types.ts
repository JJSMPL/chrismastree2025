export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface ParticleData {
  scatterPosition: [number, number, number];
  treePosition: [number, number, number];
  color: string;
  speed: number;
  scale: number;
}

export interface Ornament {
  id: string;
  logoUrl: string;
  position: [number, number, number];
  scatterPosition: [number, number, number];
}