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

// 太空模式配置
export const spaceMode: ModeConfig = {
  id: 'space',
  name: '太空模式',
  emoji: '🚀',
  description: '探索宇宙，合成黑洞',
  maxLevel: 8,
  winMessage: '🕳️ 宇宙霸主！你合成了黑洞！',
  spawnLevelRange: [1, 2],
  recordType: 'turns',
  recordLabel: '最佳回合',
  scoreLabel: '回合',
  getTileContent: (level: TileLevel) => {
    const items: Record<TileLevel, { emoji: string; name: string }> = {
      1: { emoji: '🛰️', name: '卫星' },
      2: { emoji: '🛸', name: 'UFO' },
      3: { emoji: '🤖', name: '机器人' },
      4: { emoji: '🌍', name: '地球' },
      5: { emoji: '☀️', name: '太阳' },
      6: { emoji: '⭐', name: '恒星' },
      7: { emoji: '🌌', name: '银河' },
      8: { emoji: '🕳️', name: '黑洞' },
      9: { emoji: '👽', name: '外星文明' },
      10: { emoji: '🌠', name: '超新星' },
      11: { emoji: '🔭', name: '宇宙之眼' },
      12: { emoji: '🌌', name: '多元宇宙' },
    };
    return items[level];
  },
  getTileColor: (level: TileLevel) => {
    const colors: Record<TileLevel, string> = {
      1: '#e0e0e0',  // 卫星灰
      2: '#b0c4de',  // UFO蓝灰
      3: '#c0c0c0',  // 机器人银
      4: '#4169e1',  // 地球蓝
      5: '#ffa500',  // 太阳橙
      6: '#ffd700',  // 恒星金
      7: '#191970',  // 银河深蓝
      8: '#000000',  // 黑洞黑
      9: '#800080',  // 外星紫
      10: '#ff1493', // 超新星粉
      11: '#00ffff', // 宇宙眼青
      12: '#9400d3', // 多元紫
    };
    return colors[level];
  },
  getTextColor: (level: TileLevel) => {
    return level === 8 || level >= 10 ? '#ffffff' : '#1a1a2e';
  },
};

// 海洋模式配置
export const oceanMode: ModeConfig = {
  id: 'ocean',
  name: '海洋模式',
  emoji: '🐟',
  description: '潜入深海，成为海神',
  maxLevel: 8,
  winMessage: '👑 海洋之王！你成为了海神！',
  spawnLevelRange: [1, 2],
  recordType: 'turns',
  recordLabel: '最佳回合',
  scoreLabel: '回合',
  getTileContent: (level: TileLevel) => {
    const items: Record<TileLevel, { emoji: string; name: string }> = {
      1: { emoji: '🐟', name: '小鱼' },
      2: { emoji: '🐠', name: '热带鱼' },
      3: { emoji: '🐡', name: '河豚' },
      4: { emoji: '🐙', name: '章鱼' },
      5: { emoji: '🦈', name: '鲨鱼' },
      6: { emoji: '🐋', name: '鲸鱼' },
      7: { emoji: '🐉', name: '海龙' },
      8: { emoji: '👑', name: '海神' },
      9: { emoji: '🧜', name: '人鱼' },
      10: { emoji: '🦑', name: '巨乌贼' },
      11: { emoji: '🏴‍☠️', name: '海盗王' },
      12: { emoji: '💎', name: '海洋之心' },
    };
    return items[level];
  },
  getTileColor: (level: TileLevel) => {
    const colors: Record<TileLevel, string> = {
      1: '#e0f7fa',  // 浅蓝
      2: '#b2ebf2',  // 淡青
      3: '#80deea',  // 青色
      4: '#4dd0e1',  // 深青
      5: '#26c6da',  // 蓝绿
      6: '#00bcd4',  // 青色
      7: '#0097a7',  // 深青
      8: '#006064',  // 深海
      9: '#01579b',  // 深蓝
      10: '#0277bd', // 海洋蓝
      11: '#0288d1', // 海盗蓝
      12: '#29b6f6', // 宝石蓝
    };
    return colors[level];
  },
  getTextColor: (level: TileLevel) => {
    return level <= 4 ? '#006064' : '#ffffff';
  },
};

// 表情模式配置
export const emojiMode: ModeConfig = {
  id: 'emoji',
  name: '表情模式',
  emoji: '😊',
  description: '表情进化，成为冠军',
  maxLevel: 8,
  winMessage: '🏆 表情之王！你成为了冠军！',
  spawnLevelRange: [1, 2],
  recordType: 'turns',
  recordLabel: '最佳回合',
  scoreLabel: '回合',
  getTileContent: (level: TileLevel) => {
    const items: Record<TileLevel, { emoji: string; name: string }> = {
      1: { emoji: '😊', name: '微笑' },
      2: { emoji: '😄', name: '大笑' },
      3: { emoji: '🤩', name: '星星眼' },
      4: { emoji: '😎', name: '酷' },
      5: { emoji: '🥳', name: '派对' },
      6: { emoji: '🤴', name: '王子' },
      7: { emoji: '👸', name: '公主' },
      8: { emoji: '🏆', name: '冠军' },
      9: { emoji: '🌟', name: '巨星' },
      10: { emoji: '💫', name: '传奇' },
      11: { emoji: '✨', name: '神话' },
      12: { emoji: '👑', name: '永恒' },
    };
    return items[level];
  },
  getTileColor: (level: TileLevel) => {
    const colors: Record<TileLevel, string> = {
      1: '#fff9c4',  // 微笑黄
      2: '#fff59d',  // 大笑黄
      3: '#fff176',  // 星星黄
      4: '#ffee58',  // 酷黄
      5: '#fdd835',  // 派对金
      6: '#fbc02d',  // 王子金
      7: '#f9a825',  // 公主金
      8: '#f57f17',  // 冠军橙
      9: '#ff6f00',  // 巨星橙
      10: '#ff8f00', // 传奇琥珀
      11: '#ffa000', // 神话金
      12: '#ffb300', // 永恒金
    };
    return colors[level];
  },
  getTextColor: (level: TileLevel) => {
    return level <= 3 ? '#5d4037' : '#ffffff';
  },
};

// 魔法模式配置
export const magicMode: ModeConfig = {
  id: 'magic',
  name: '魔法模式',
  emoji: '🪄',
  description: '施展魔法，寻找宝石',
  maxLevel: 8,
  winMessage: '💎 魔法大师！你找到了宝石！',
  spawnLevelRange: [1, 2],
  recordType: 'turns',
  recordLabel: '最佳回合',
  scoreLabel: '回合',
  getTileContent: (level: TileLevel) => {
    const items: Record<TileLevel, { emoji: string; name: string }> = {
      1: { emoji: '🪄', name: '魔杖' },
      2: { emoji: '📜', name: '卷轴' },
      3: { emoji: '🧪', name: '药水' },
      4: { emoji: '🔮', name: '水晶球' },
      5: { emoji: '🧙', name: '法师' },
      6: { emoji: '🦄', name: '独角兽' },
      7: { emoji: '🌈', name: '彩虹' },
      8: { emoji: '💎', name: '宝石' },
      9: { emoji: '⚡', name: '闪电' },
      10: { emoji: '🔥', name: '火焰' },
      11: { emoji: '❄️', name: '冰霜' },
      12: { emoji: '🌟', name: '星辰' },
    };
    return items[level];
  },
  getTileColor: (level: TileLevel) => {
    const colors: Record<TileLevel, string> = {
      1: '#f3e5f5',  // 魔杖紫
      2: '#e1bee7',  // 卷轴紫
      3: '#ce93d8',  // 药水紫
      4: '#ba68c8',  // 水晶紫
      5: '#ab47bc',  // 法师紫
      6: '#9c27b0',  // 独角兽紫
      7: '#8e24aa',  // 彩虹紫
      8: '#7b1fa2',  // 宝石紫
      9: '#6a1b9a',  // 闪电紫
      10: '#4a148c', // 火焰紫
      11: '#311b92', // 冰霜紫
      12: '#1a237e', // 星辰深蓝
    };
    return colors[level];
  },
  getTextColor: (level: TileLevel) => {
    return level <= 4 ? '#4a148c' : '#ffffff';
  },
};

// 食物模式配置
export const foodMode: ModeConfig = {
  id: 'food',
  name: '食物模式',
  emoji: '🍞',
  description: '烹饪美食，成为美食之王',
  maxLevel: 8,
  winMessage: '👑 美食之王！你征服了味蕾！',
  spawnLevelRange: [1, 2],
  recordType: 'turns',
  recordLabel: '最佳回合',
  scoreLabel: '回合',
  getTileContent: (level: TileLevel) => {
    const items: Record<TileLevel, { emoji: string; name: string }> = {
      1: { emoji: '🍞', name: '面包' },
      2: { emoji: '🥚', name: '鸡蛋' },
      3: { emoji: '🥓', name: '培根' },
      4: { emoji: '🍔', name: '汉堡' },
      5: { emoji: '🌮', name: '卷饼' },
      6: { emoji: '🍕', name: '披萨' },
      7: { emoji: '🎂', name: '蛋糕' },
      8: { emoji: '👑', name: '美食之王' },
      9: { emoji: '🍱', name: '便当' },
      10: { emoji: '🍣', name: '寿司' },
      11: { emoji: '🥘', name: '大餐' },
      12: { emoji: '🍽️', name: '盛宴' },
    };
    return items[level];
  },
  getTileColor: (level: TileLevel) => {
    const colors: Record<TileLevel, string> = {
      1: '#fff3e0',  // 面包色
      2: '#ffecb3',  // 鸡蛋黄
      3: '#ffe082',  // 培根黄
      4: '#ffd54f',  // 汉堡黄
      5: '#ffca28',  // 卷饼黄
      6: '#ffc107',  // 披萨黄
      7: '#ffb300',  // 蛋糕橙
      8: '#ffa000',  // 王冠橙
      9: '#ff8f00',  // 便当红
      10: '#ff6f00', // 寿司橙
      11: '#e65100', // 大餐橙
      12: '#bf360c', // 盛宴红
    };
    return colors[level];
  },
  getTextColor: (level: TileLevel) => {
    return level <= 4 ? '#5d4037' : '#ffffff';
  },
};

// 随机模式列表
export const randomModes = ['space', 'ocean', 'emoji', 'magic', 'food'] as const;
export type RandomMode = typeof randomModes[number];

// 模式配置映射
export const modeConfigs: Record<string, ModeConfig> = {
  classic: classicMode,
  fruit: fruitMode,
  animal: animalMode,
  space: spaceMode,
  ocean: oceanMode,
  emoji: emojiMode,
  magic: magicMode,
  food: foodMode,
};

// 获取模式配置
export function getModeConfig(mode: string): ModeConfig {
  return modeConfigs[mode] || classicMode;
}
