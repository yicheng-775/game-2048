// 游戏类型定义

export type Direction = 'up' | 'down' | 'left' | 'right';

// 游戏模式
export type GameMode = 'classic' | 'fruit' | 'animal';

// 方块等级（1-12 对应不同内容）
export type TileLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// 网格单元格
export interface Cell {
  level: TileLevel;
  id: string; // 唯一标识，用于动画
}

// 4x4 网格
export type Grid = (Cell | null)[][];

// 游戏状态
export interface GameState {
  grid: Grid;
  score: number; // 经典模式：分数；其他模式：回合数
  isGameOver: boolean;
  isWon: boolean;
  canContinue: boolean; // 赢了之后是否可以继续
}

// 历史记录（用于撤销）
export interface HistoryState {
  grid: Grid;
  score: number;
}

// 模式配置
export interface ModeConfig {
  id: GameMode;
  name: string;
  emoji: string;
  description: string;
  // 获取方块显示内容
  getTileContent: (level: TileLevel) => { emoji: string; name: string; value?: number };
  // 获取方块颜色
  getTileColor: (level: TileLevel) => string;
  // 获取文字颜色
  getTextColor: (level: TileLevel) => string;
  // 最大等级（胜利条件）
  maxLevel: TileLevel;
  // 胜利消息
  winMessage: string;
  // 初始生成等级范围
  spawnLevelRange: [TileLevel, TileLevel];
  // 记录类型：'score' 分数越高越好 | 'turns' 回合数越低越好
  recordType: 'score' | 'turns';
  // 记录标签
  recordLabel: string;
  // 当前分数/回合标签
  scoreLabel: string;
}

// 本地存储数据
export interface LocalStorageData {
  classic: { highScore: number };
  fruit: { bestTurns: number | null };
  animal: { bestTurns: number | null };
}
