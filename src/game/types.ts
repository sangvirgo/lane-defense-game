export interface Position {
  row: number;
  col: number;
}

export enum PlantType {
  BasicShooter = 'basic_shooter',
  WallNut = 'wall_nut',
  Sunflower = 'sunflower',
}

export enum EnemyType {
  Basic = 'basic',
}

export interface PlantData {
  type: PlantType;
  cost: number;
  hp: number;
  damage: number;
  fireRate: number;
  color: string;
  symbol: string;
}

export interface EnemyData {
  type: EnemyType;
  hp: number;
  speed: number;
  damage: number;
  color: string;
  symbol: string;
}

export interface WaveData {
  enemies: { type: EnemyType; count: number; row: number }[];
  spawnInterval: number;
}

export const PLANT_DATA: Record<PlantType, PlantData> = {
  [PlantType.BasicShooter]: {
    type: PlantType.BasicShooter,
    cost: 100,
    hp: 100,
    damage: 25,
    fireRate: 1,
    color: '#4CAF50',
    symbol: '🌿',
  },
  [PlantType.WallNut]: {
    type: PlantType.WallNut,
    cost: 50,
    hp: 300,
    damage: 0,
    fireRate: 0,
    color: '#8D6E63',
    symbol: '🥜',
  },
  [PlantType.Sunflower]: {
    type: PlantType.Sunflower,
    cost: 50,
    hp: 100,
    damage: 0,
    fireRate: 0,
    color: '#FFD600',
    symbol: '🌻',
  },
};

export const ENEMY_DATA: Record<EnemyType, EnemyData> = {
  [EnemyType.Basic]: {
    type: EnemyType.Basic,
    hp: 100,
    speed: 0.5,
    damage: 10,
    color: '#F44336',
    symbol: '👾',
  },
};

export const WAVE_DATA: WaveData[] = [
  {
    enemies: [
      { type: EnemyType.Basic, count: 5, row: -1 },
    ],
    spawnInterval: 2,
  },
  {
    enemies: [
      { type: EnemyType.Basic, count: 8, row: -1 },
    ],
    spawnInterval: 1.5,
  },
  {
    enemies: [
      { type: EnemyType.Basic, count: 12, row: -1 },
    ],
    spawnInterval: 1,
  },
];
