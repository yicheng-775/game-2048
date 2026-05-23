// 本地存储管理

import type { LocalStorageData, GameMode } from './types';

const STORAGE_KEY = 'multi-mode-2048-data';

// 默认数据
const defaultData: LocalStorageData = {
  classic: { highScore: 0 },
  fruit: { bestTurns: null },
  animal: { bestTurns: null },
};

// 获取存储数据
export function getStorageData(): LocalStorageData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return { ...defaultData, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('读取本地存储失败:', e);
  }
  return { ...defaultData };
}

// 保存存储数据
export function saveStorageData(data: LocalStorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('保存本地存储失败:', e);
  }
}

// 更新经典模式最高分
export function updateHighScore(score: number): void {
  const data = getStorageData();
  if (score > data.classic.highScore) {
    data.classic.highScore = score;
    saveStorageData(data);
  }
}

// 更新水果模式最佳回合
export function updateFruitBestTurns(turns: number): void {
  const data = getStorageData();
  if (data.fruit.bestTurns === null || turns < data.fruit.bestTurns) {
    data.fruit.bestTurns = turns;
    saveStorageData(data);
  }
}

// 更新动物模式最佳回合
export function updateAnimalBestTurns(turns: number): void {
  const data = getStorageData();
  if (data.animal.bestTurns === null || turns < data.animal.bestTurns) {
    data.animal.bestTurns = turns;
    saveStorageData(data);
  }
}

// 获取模式的最高记录
export function getModeRecord(mode: GameMode): number | null {
  const data = getStorageData();
  switch (mode) {
    case 'classic':
      return data.classic.highScore;
    case 'fruit':
      return data.fruit.bestTurns;
    case 'animal':
      return data.animal.bestTurns;
    default:
      return null;
  }
}

// 更新模式的记录
export function updateModeRecord(mode: GameMode, value: number): void {
  switch (mode) {
    case 'classic':
      updateHighScore(value);
      break;
    case 'fruit':
      updateFruitBestTurns(value);
      break;
    case 'animal':
      updateAnimalBestTurns(value);
      break;
  }
}
