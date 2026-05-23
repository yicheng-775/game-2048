// 三种游戏模式的配置

import type { ModeConfig, TileLevel } from './types';

// 经典模式配置
export const classicMode: ModeConfig = {
  id: 'classic',
  name: '经典模式',
  emoji: '🔢',
  description: '经典 2048，挑战数字极限',
  maxLevel: 12, // 4096
  winMessage: '🎉 你赢了！',
  spawnLevelRange: [1, 2], // 生成 2 或 4
  recordType: 'score',
  recordLabel: '最高分',
  scoreLabel: '分数',
  getTileContent: (level: TileLevel) => {
    const value = Math.pow(2, level);
    return { emoji: '', name: String(value), value };
  },
  getTileColor: (level: TileLevel) => {
    const colors: Record<TileLevel, string> = {
      1: '#eee4da',   // 2
      2: '#ede0c8',   // 4
      3: '#f2b179',   // 8
      4: '#f59563',   // 16
      5: '#f67c5f',   // 32
      6: '#f65e3b',   // 64
      7: '#edcf72',   // 128
      8: '#edcc61',   // 256
      9: '#edc850',   // 512
      10: '#edc53f',  // 1024
      11: '#edc22e',  // 2048
      12: '#3c3a32',  // 4096
    };
    return colors[level];
  },
  getTextColor: (level: TileLevel) => {
    return level <= 2 ? '#776e65' : '#f9f6f2';
  },
};

// 水果模式配置
export const fruitMode: ModeConfig = {
  id: 'fruit',
  name: '水果模式',
  emoji: '🍇',
  description: '合成水果，成为水果大师',
  maxLevel: 9, // 榴莲
  winMessage: '🎉 水果大师！你合成了榴莲！',
  spawnLevelRange: [1, 2], // 生成葡萄或山竹
  recordType: 'turns',
  recordLabel: '最佳回合',
  scoreLabel: '回合',
  getTileContent: (level: TileLevel) => {
    const fruits: Record<TileLevel, { emoji: string; name: string }> = {
      1: { emoji: '🍇', name: '葡萄' },
      2: { emoji: '🫐', name: '山竹' },
      3: { emoji: '🍎', name: '苹果' },
      4: { emoji: '🍐', name: '梨子' },
      5: { emoji: '⭐', name: '杨桃' },
      6: { emoji: '🍈', name: '哈密瓜' },
      7: { emoji: '🍍', name: '波罗蜜' },
      8: { emoji: '🍉', name: '西瓜' },
      9: { emoji: '🥇', name: '榴莲' },
      10: { emoji: '👑', name: '水果之王' },
      11: { emoji: '🏆', name: '传奇' },
      12: { emoji: '🌟', name: '神话' },
    };
    return fruits[level];
  },
  getTileColor: (level: TileLevel) => {
    const colors: Record<TileLevel, string> = {
      1: '#e8d5e0',  // 葡萄紫
      2: '#d4e5ed',  // 山竹蓝
      3: '#f4d1d1',  // 苹果红
      4: '#f0e6d2',  // 梨子黄
      5: '#fff9c4',  // 杨桃黄
      6: '#e8f5e9',  // 哈密瓜绿
      7: '#fff3e0',  // 波罗蜜橙
      8: '#ffebee',  // 西瓜红
      9: '#ffd700',  // 榴莲金
      10: '#ff6b6b', // 王冠红
      11: '#4ecdc4', // 传奇青
      12: '#a8e6cf', // 神话绿
    };
    return colors[level];
  },
  getTextColor: (level: TileLevel) => {
    return level <= 4 ? '#5d4037' : '#ffffff';
  },
};

// 动物模式配置
export const animalMode: ModeConfig = {
  id: 'animal',
  name: '动物模式',
  emoji: '🥚',
  description: '进化动物，成为驯龙高手',
  maxLevel: 8, // 神龙
  winMessage: '🐉 驯龙高手！你合成了神龙！',
  spawnLevelRange: [1, 2], // 生成蛋或小鸡
  recordType: 'turns',
  recordLabel: '最佳回合',
  scoreLabel: '回合',
  getTileContent: (level: TileLevel) => {
    const animals: Record<TileLevel, { emoji: string; name: string }> = {
      1: { emoji: '🥚', name: '蛋' },
      2: { emoji: '🐣', name: '小鸡' },
      3: { emoji: '🐤', name: '小鸟' },
      4: { emoji: '🐦', name: '飞鸟' },
      5: { emoji: '🦅', name: '雄鹰' },
      6: { emoji: '🦉', name: '猫头鹰' },
      7: { emoji: '🐉', name: '小龙' },
      8: { emoji: '🐲', name: '神龙' },
      9: { emoji: '👑', name: '神兽' },
      10: { emoji: '🌈', name: '传说' },
      11: { emoji: '✨', name: '神话' },
      12: { emoji: '💫', name: '永恒' },
    };
    return animals[level];
  },
  getTileColor: (level: TileLevel) => {
    const colors: Record<TileLevel, string> = {
      1: '#faf0e6',  // 蛋壳色
      2: '#fff8dc',  // 小鸡黄
      3: '#ffe4b5',  // 小鸟橙
      4: '#ffd700',  // 飞鸟金
      5: '#daa520',  // 雄鹰棕
      6: '#cd853f',  // 猫头鹰褐
      7: '#ff6347',  // 小龙红
      8: '#ff4500',  // 神火龙
      9: '#9370db',  // 神兽紫
      10: '#4169e1', // 传说蓝
      11: '#00ced1', // 神话青
      12: '#ff1493', // 永恒粉
    };
    return colors[level];
  },
  getTextColor: (level: TileLevel) => {
    return level <= 3 ? '#5d4037' : '#ffffff';
  },
};

// 模式配置映射
export const modeConfigs: Record<string, ModeConfig> = {
  classic: classicMode,
  fruit: fruitMode,
  animal: animalMode,
};

// 获取模式配置
export function getModeConfig(mode: string): ModeConfig {
  return modeConfigs[mode] || classicMode;
}
