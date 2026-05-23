// 成就勋章系统

import type { GameMode, Cell } from './types';
import type { SessionStats } from './statsTracker';

export interface Achievement {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlocked: boolean;
  unlockedAt: number | null; // 解锁时间戳
}

export interface AchievementData {
  achievements: Record<string, number | null>;
  totalGames: number;
  classicCleared: boolean;
  fruitCleared: boolean;
  animalCleared: boolean;
  highEfficiencyStreak: number; // 连续高效局数
}

const STORAGE_KEY = 'multi-mode-2048-achievements';

// 成就定义
export const achievementDefs: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  { id: 'first_game', name: '初出茅庐', emoji: '🥚', description: '完成第一局' },
  { id: 'classic_512', name: '小试牛刀', emoji: '🏃', description: '经典模式到 512' },
  { id: 'speed_star', name: '速度之星', emoji: '🔥', description: '30秒内操作20次' },
  { id: 'strategist', name: '策略家', emoji: '🧠', description: '单局有效率 >90% 且操作 >15次' },
  { id: 'fruit_hunter', name: '水果猎人', emoji: '🍇', description: '水果模式通关' },
  { id: 'dragon_master', name: '驯龙高手', emoji: '🐲', description: '动物模式通关' },
  { id: 'master_2048', name: '2048大师', emoji: '💎', description: '经典模式到 2048' },
  { id: 'king_of_all', name: '全模式王者', emoji: '👑', description: '三种模式全通关' },
  { id: 'lightning', name: '闪电手', emoji: '⚡', description: '极速模式下通关' },
  { id: 'veteran', name: '百战老兵', emoji: '🎯', description: '累计完成 100 局' },
];

// 获取默认数据
function getDefaultData(): AchievementData {
  return {
    achievements: {},
    totalGames: 0,
    classicCleared: false,
    fruitCleared: false,
    animalCleared: false,
    highEfficiencyStreak: 0,
  };
}

// 读取成就数据
export function getAchievementData(): AchievementData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...getDefaultData(), ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('读取成就数据失败:', e);
  }
  return getDefaultData();
}

// 保存成就数据
function saveAchievementData(data: AchievementData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('保存成就数据失败:', e);
  }
}

// 解锁成就
export function unlockAchievement(id: string): Achievement | null {
  const data = getAchievementData();
  if (data.achievements[id]) return null; // 已解锁

  data.achievements[id] = Date.now();
  saveAchievementData(data);

  const def = achievementDefs.find(a => a.id === id);
  if (!def) return null;

  return {
    ...def,
    unlocked: true,
    unlockedAt: data.achievements[id] as number,
  };
}

// 获取所有成就列表（含解锁状态）
export function getAllAchievements(): Achievement[] {
  const data = getAchievementData();
  return achievementDefs.map(def => ({
    ...def,
    unlocked: !!data.achievements[def.id],
    unlockedAt: data.achievements[def.id] as number | null,
  }));
}

// 获取已解锁数量
export function getUnlockedCount(): number {
  const data = getAchievementData();
  return Object.values(data.achievements).filter(v => v !== null && v !== undefined).length;
}

// 游戏结束时检查成就，返回新解锁的成就列表
export function checkGameEndAchievements(
  mode: GameMode,
  stats: SessionStats,
  maxLevelReached: number,
  isWin: boolean
): Achievement[] {
  const newlyUnlocked: Achievement[] = [];
  const data = getAchievementData();

  // 记录完成一局
  data.totalGames++;
  const validRate = stats.validMoves > 0 ? stats.validMoves / stats.totalMoves : 0;

  // 🥚 初出茅庐：完成第一局
  if (data.totalGames >= 1) {
    const a = unlockAchievement('first_game');
    if (a) newlyUnlocked.push(a);
  }

  // 🏃 小试牛刀：经典模式到 512 (level 9 = 512)
  if (mode === 'classic' && maxLevelReached >= 9) {
    const a = unlockAchievement('classic_512');
    if (a) newlyUnlocked.push(a);
  }

  // 🔥 速度之星：30秒内20次操作
  const sessionDuration = (Date.now() - stats.sessionStartTime) / 1000;
  if (sessionDuration <= 30 && stats.totalMoves >= 20) {
    const a = unlockAchievement('speed_star');
    if (a) newlyUnlocked.push(a);
  }

  // 🧠 策略家：单局有效率>90%且操作>15次
  if (validRate > 0.9 && stats.totalMoves > 15) {
    const a = unlockAchievement('strategist');
    if (a) newlyUnlocked.push(a);
    data.highEfficiencyStreak++;
  } else {
    data.highEfficiencyStreak = 0;
  }

  // 🍇 水果猎人：水果模式通关
  if (mode === 'fruit' && isWin) {
    data.fruitCleared = true;
    const a = unlockAchievement('fruit_hunter');
    if (a) newlyUnlocked.push(a);
  }

  // 🐲 驯龙高手：动物模式通关
  if (mode === 'animal' && isWin) {
    data.animalCleared = true;
    const a = unlockAchievement('dragon_master');
    if (a) newlyUnlocked.push(a);
  }

  // 💎 2048大师：经典模式到 2048 (level 11 = 2048)
  if (mode === 'classic' && maxLevelReached >= 11) {
    data.classicCleared = true;
    const a = unlockAchievement('master_2048');
    if (a) newlyUnlocked.push(a);
  }

  // 👑 全模式王者：三种模式全通关
  if (data.classicCleared && data.fruitCleared && data.animalCleared) {
    const a = unlockAchievement('king_of_all');
    if (a) newlyUnlocked.push(a);
  }

  // ⚡ 闪电手：极速模式下通关（30秒内通关）
  if (isWin && sessionDuration <= 30) {
    const a = unlockAchievement('lightning');
    if (a) newlyUnlocked.push(a);
  }

  // 🎯 百战老兵：累计100局
  if (data.totalGames >= 100) {
    const a = unlockAchievement('veteran');
    if (a) newlyUnlocked.push(a);
  }

  saveAchievementData(data);
  return newlyUnlocked;
}

// 获取棋盘中达到的最高等级
export function getMaxLevel(grid: (Cell | null)[][]): number {
  let max = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell && cell.level > max) max = cell.level;
    }
  }
  return max;
}
