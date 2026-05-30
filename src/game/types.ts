export interface Position {
  row: number;
  col: number;
}

export enum PlantType {
  BasicShooter = 'basic_shooter',
  DoubleShooter = 'double_shooter',
  Sunflower = 'sunflower',
  WallNut = 'wall_nut',
  FreezePlant = 'freeze_plant',
  BombPlant = 'bomb_plant',
  IceShooter = 'ice_shooter',
  ShieldWall = 'shield_wall',
}

export enum EnemyType {
  Basic = 'basic',
  Fast = 'fast',
  Tank = 'tank',
  Shield = 'shield',
  Boss = 'boss',
  Flying = 'flying',
  Healer = 'healer',
}

export interface PlantData {
  type: PlantType;
  cost: number;
  hp: number;
  damage: number;
  fireRate: number;
  color: string;
  symbol: string;
  description: string;
  special?: string;
}

export interface EnemyData {
  type: EnemyType;
  hp: number;
  speed: number;
  damage: number;
  color: string;
  symbol: string;
  score: number;
}

export interface WaveData {
  enemies: { type: EnemyType; count: number; row: number }[];
  spawnInterval: number;
}

export interface LevelData {
  name: string;
  waves: WaveData[];
  startEnergy: number;
}

export const PLANT_DATA: Record<PlantType, PlantData> = {
  [PlantType.BasicShooter]: {
    type: PlantType.BasicShooter,
    cost: 75,
    hp: 100,
    damage: 25,
    fireRate: 1,
    color: '#4CAF50',
    symbol: '🌿',
    description: 'Basic shooter. Fires projectiles at enemies.',
  },
  [PlantType.DoubleShooter]: {
    type: PlantType.DoubleShooter,
    cost: 200,
    hp: 100,
    damage: 25,
    fireRate: 2,
    color: '#2E7D32',
    symbol: '🌲',
    description: 'Double shooter. Fires twice as fast!',
    special: 'Double fire rate',
  },
  [PlantType.Sunflower]: {
    type: PlantType.Sunflower,
    cost: 50,
    hp: 100,
    damage: 0,
    fireRate: 0,
    color: '#FFD600',
    symbol: '🌻',
    description: 'Produces 30 energy every 5 seconds.',
    special: 'Energy producer',
  },
  [PlantType.WallNut]: {
    type: PlantType.WallNut,
    cost: 50,
    hp: 300,
    damage: 0,
    fireRate: 0,
    color: '#8D6E63',
    symbol: '🥜',
    description: 'High HP wall. Blocks enemies.',
    special: 'Tank wall',
  },
  [PlantType.FreezePlant]: {
    type: PlantType.FreezePlant,
    cost: 150,
    hp: 100,
    damage: 20,
    fireRate: 0.8,
    color: '#29B6F6',
    symbol: '❄️',
    description: 'Slows enemies by 50% for 3 seconds.',
    special: 'Slow effect',
  },
  [PlantType.BombPlant]: {
    type: PlantType.BombPlant,
    cost: 125,
    hp: 100,
    damage: 100,
    fireRate: 0.5,
    color: '#FF5722',
    symbol: '💣',
    description: 'Area damage. Hits all enemies in 3x3 area.',
    special: 'AOE damage',
  },
  [PlantType.IceShooter]: {
    type: PlantType.IceShooter,
    cost: 0,
    hp: 120,
    damage: 30,
    fireRate: 1.2,
    color: '#00BCD4',
    symbol: '🧊',
    description: 'Upgrade: Slows + shoots. Combine Shooter + Freeze.',
    special: 'Slow + Shoot',
  },
  [PlantType.ShieldWall]: {
    type: PlantType.ShieldWall,
    cost: 0,
    hp: 600,
    damage: 0,
    fireRate: 0,
    color: '#78909C',
    symbol: '🏰',
    description: 'Upgrade: Double HP wall. Click WallNut to upgrade.',
    special: '2x HP',
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
    score: 10,
  },
  [EnemyType.Fast]: {
    type: EnemyType.Fast,
    hp: 60,
    speed: 1.0,
    damage: 8,
    color: '#FF9800',
    symbol: '⚡',
    score: 15,
  },
  [EnemyType.Tank]: {
    type: EnemyType.Tank,
    hp: 300,
    speed: 0.3,
    damage: 20,
    color: '#795548',
    symbol: '🛡️',
    score: 25,
  },
  [EnemyType.Shield]: {
    type: EnemyType.Shield,
    hp: 200,
    speed: 0.4,
    damage: 15,
    color: '#607D8B',
    symbol: '⛑️',
    score: 20,
  },
  [EnemyType.Boss]: {
    type: EnemyType.Boss,
    hp: 800,
    speed: 0.2,
    damage: 30,
    color: '#9C27B0',
    symbol: '👹',
    score: 100,
  },
  [EnemyType.Flying]: {
    type: EnemyType.Flying,
    hp: 80,
    speed: 0.6,
    damage: 12,
    color: '#E91E63',
    symbol: '🦇',
    score: 20,
  },
  [EnemyType.Healer]: {
    type: EnemyType.Healer,
    hp: 150,
    speed: 0.3,
    damage: 8,
    color: '#00BCD4',
    symbol: '💚',
    score: 30,
  },
};

export const LEVELS: LevelData[] = [
  {
    name: 'Level 1 - The Beginning',
    startEnergy: 200,
    waves: [
      { enemies: [{ type: EnemyType.Basic, count: 5, row: -1 }], spawnInterval: 2 },
      { enemies: [{ type: EnemyType.Basic, count: 8, row: -1 }], spawnInterval: 1.5 },
      { enemies: [{ type: EnemyType.Basic, count: 10, row: -1 }, { type: EnemyType.Fast, count: 2, row: -1 }], spawnInterval: 1.2 },
    ],
  },
  {
    name: 'Level 2 - Speed Challenge',
    startEnergy: 225,
    waves: [
      { enemies: [{ type: EnemyType.Basic, count: 6, row: -1 }, { type: EnemyType.Fast, count: 3, row: -1 }], spawnInterval: 1.5 },
      { enemies: [{ type: EnemyType.Fast, count: 8, row: -1 }], spawnInterval: 1 },
      { enemies: [{ type: EnemyType.Basic, count: 5, row: -1 }, { type: EnemyType.Fast, count: 6, row: -1 }], spawnInterval: 0.8 },
    ],
  },
  {
    name: 'Level 3 - Heavy Armor',
    startEnergy: 250,
    waves: [
      { enemies: [{ type: EnemyType.Basic, count: 8, row: -1 }, { type: EnemyType.Tank, count: 2, row: -1 }], spawnInterval: 1.5 },
      { enemies: [{ type: EnemyType.Tank, count: 4, row: -1 }, { type: EnemyType.Shield, count: 3, row: -1 }, { type: EnemyType.Flying, count: 2, row: -1 }], spawnInterval: 1.2 },
      { enemies: [{ type: EnemyType.Basic, count: 6, row: -1 }, { type: EnemyType.Tank, count: 3, row: -1 }, { type: EnemyType.Flying, count: 3, row: -1 }], spawnInterval: 1 },
    ],
  },
  {
    name: 'Level 4 - Mixed Assault',
    startEnergy: 275,
    waves: [
      { enemies: [{ type: EnemyType.Basic, count: 10, row: -1 }, { type: EnemyType.Fast, count: 5, row: -1 }, { type: EnemyType.Flying, count: 2, row: -1 }], spawnInterval: 1 },
      { enemies: [{ type: EnemyType.Fast, count: 8, row: -1 }, { type: EnemyType.Tank, count: 3, row: -1 }, { type: EnemyType.Healer, count: 2, row: -1 }], spawnInterval: 0.8 },
      { enemies: [{ type: EnemyType.Basic, count: 8, row: -1 }, { type: EnemyType.Fast, count: 6, row: -1 }, { type: EnemyType.Healer, count: 3, row: -1 }, { type: EnemyType.Flying, count: 3, row: -1 }], spawnInterval: 0.7 },
    ],
  },
  {
    name: 'Level 5 - Boss Battle',
    startEnergy: 300,
    waves: [
      { enemies: [{ type: EnemyType.Basic, count: 12, row: -1 }, { type: EnemyType.Fast, count: 6, row: -1 }, { type: EnemyType.Flying, count: 4, row: -1 }], spawnInterval: 0.8 },
      { enemies: [{ type: EnemyType.Tank, count: 5, row: -1 }, { type: EnemyType.Shield, count: 4, row: -1 }, { type: EnemyType.Healer, count: 3, row: -1 }], spawnInterval: 0.7 },
      { enemies: [{ type: EnemyType.Boss, count: 1, row: -1 }, { type: EnemyType.Basic, count: 10, row: -1 }, { type: EnemyType.Healer, count: 2, row: -1 }, { type: EnemyType.Flying, count: 5, row: -1 }], spawnInterval: 0.5 },
    ],
  },
];
