// 策略建议系统

import type { GameMode } from './types';

export interface StrategyTip {
  id: number;
  text: string;
  category: 'beginner' | 'advanced' | 'encourage' | 'classic' | 'fruit' | 'animal' | 'context';
  mode?: GameMode | 'all';
  context?: 'low_space' | 'high_tile' | 'no_move' | 'streak' | 'new_game';
}

const tips: StrategyTip[] = [
  // ===== 新手引导类 (15条) =====
  { id: 1, text: '刚开局先随便移几步，熟悉一下手感', category: 'beginner', mode: 'all' },
  { id: 2, text: '把最大的数字放在角落，这是最经典的策略', category: 'beginner', mode: 'all' },
  { id: 3, text: '尽量只用两个方向键移动，比如只按上和左', category: 'beginner', mode: 'all' },
  { id: 4, text: '合并前先看看周围，别急着动', category: 'beginner', mode: 'all' },
  { id: 5, text: '每次移动前想一下：这一步会让棋盘更整齐吗？', category: 'beginner', mode: 'all' },
  { id: 6, text: '空格越多越好，至少保持 2-3 个空格', category: 'beginner', mode: 'all' },
  { id: 7, text: '不要频繁换方向，坚持一个主方向', category: 'beginner', mode: 'all' },
  { id: 8, text: '底部一行尽量填满，这样上面的方块才能往下合并', category: 'beginner', mode: 'all' },
  { id: 9, text: '遇到相同数字就合并，别让它们分开', category: 'beginner', mode: 'all' },
  { id: 10, text: '善用撤销功能，走错了可以回退', category: 'beginner', mode: 'all' },
  { id: 11, text: '先在角落堆大数字，再慢慢向外扩展', category: 'beginner', mode: 'all' },
  { id: 12, text: '不要害怕合并小数字，它们是铺路石', category: 'beginner', mode: 'all' },
  { id: 13, text: '观察整个棋盘，不要只盯着一个角落', category: 'beginner', mode: 'all' },
  { id: 14, text: '每一步都要有目的，不要无意义地来回移动', category: 'beginner', mode: 'all' },
  { id: 15, text: '棋盘满了不一定是死局，仔细看看还有没有合并的机会', category: 'beginner', mode: 'all' },

  // ===== 进阶策略类 (12条) =====
  { id: 16, text: '蛇形排列：让数字从大到小沿一条路径排列', category: 'advanced', mode: 'all' },
  { id: 17, text: '当角落大数字被挤走时，优先把它送回角落', category: 'advanced', mode: 'all' },
  { id: 18, text: '提前规划 3-5 步，不要只看眼前', category: 'advanced', mode: 'all' },
  { id: 19, text: '如果被迫换方向，尽快回到原来的策略', category: 'advanced', mode: 'all' },
  { id: 20, text: '中间的空格比边缘的空格更有价值', category: 'advanced', mode: 'all' },
  { id: 21, text: '合并顺序很重要：先合并小的，再合并大的', category: 'advanced', mode: 'all' },
  { id: 22, text: '当只剩 1-2 个空格时，每一步都要极其谨慎', category: 'advanced', mode: 'all' },
  { id: 23, text: '有时候不合并反而是更好的选择', category: 'advanced', mode: 'all' },
  { id: 24, text: '保持数字的递减顺序，像楼梯一样排列', category: 'advanced', mode: 'all' },
  { id: 25, text: '有效移动率是衡量技术的重要指标，争取 >80%', category: 'advanced', mode: 'all' },
  { id: 26, text: '速度不是一切，稳定和准确更重要', category: 'advanced', mode: 'all' },
  { id: 27, text: '学会"忍耐"：有时候最好的操作是等待机会', category: 'advanced', mode: 'all' },

  // ===== 心态鼓励类 (10条) =====
  { id: 28, text: '输一局没关系，每局都在变强！', category: 'encourage', mode: 'all' },
  { id: 29, text: '你已经比 80% 的人玩得好了！', category: 'encourage', mode: 'all' },
  { id: 30, text: '2048 大师也是从新手开始的', category: 'encourage', mode: 'all' },
  { id: 31, text: '连续玩几局试试，手感会越来越好', category: 'encourage', mode: 'all' },
  { id: 32, text: '别着急，享受思考的过程', category: 'encourage', mode: 'all' },
  { id: 33, text: '每一局都是全新的开始，加油！', category: 'encourage', mode: 'all' },
  { id: 34, text: '你的最高分就是你的实力证明！', category: 'encourage', mode: 'all' },
  { id: 35, text: '休息一下再玩，状态会更好', category: 'encourage', mode: 'all' },
  { id: 36, text: '试试其他模式，换换脑子也很有趣', category: 'encourage', mode: 'all' },
  { id: 37, text: '记住：游戏的目的是开心！', category: 'encourage', mode: 'all' },

  // ===== 经典模式专属 (6条) =====
  { id: 38, text: '经典模式中 2 和 4 的出现概率是 9:1', category: 'classic', mode: 'classic' },
  { id: 39, text: '目标是 2048，但到了之后还可以继续挑战 4096！', category: 'classic', mode: 'classic' },
  { id: 40, text: '经典模式分数 = 每次合并产生的数字之和', category: 'classic', mode: 'classic' },
  { id: 41, text: '合并 128+ 的方块会产生大量分数', category: 'classic', mode: 'classic' },
  { id: 42, text: '经典模式的核心：保持大数字在角落不动', category: 'classic', mode: 'classic' },
  { id: 43, text: '到了后期，每一步都要考虑 3 种可能的随机结果', category: 'classic', mode: 'classic' },

  // ===== 水果模式专属 (6条) =====
  { id: 44, text: '水果模式看的是回合数，越少越好', category: 'fruit', mode: 'fruit' },
  { id: 45, text: '先合成小水果，为大水果腾出空间', category: 'fruit', mode: 'fruit' },
  { id: 46, text: '葡萄和山竹是基础，不要浪费合并机会', category: 'fruit', mode: 'fruit' },
  { id: 47, text: '合成西瓜需要 8 步连续合并，提前规划路线', category: 'fruit', mode: 'fruit' },
  { id: 48, text: '水果模式的关键：减少无效移动，每步都要合并', category: 'fruit', mode: 'fruit' },
  { id: 49, text: '波罗蜜和西瓜是通向榴莲的关键，优先合成', category: 'fruit', mode: 'fruit' },

  // ===== 动物模式专属 (6条) =====
  { id: 50, text: '动物模式看的是回合数，用最少回合进化出神龙', category: 'animal', mode: 'animal' },
  { id: 51, text: '蛋和小鸡是最基础的，快速合成小鸟是第一步', category: 'animal', mode: 'animal' },
  { id: 52, text: '动物进化链：蛋→鸡→鸟→鹰→鸮→龙→神龙', category: 'animal', mode: 'animal' },
  { id: 53, text: '猫头鹰到小龙是关键瓶颈，需要精心安排', category: 'animal', mode: 'animal' },
  { id: 54, text: '动物模式比水果模式少一步，理论上更容易通关', category: 'animal', mode: 'animal' },
  { id: 55, text: '保持进化链不断裂，不要让同等级的动物分散', category: 'animal', mode: 'animal' },

  // ===== 情境触发类 (6条) =====
  { id: 56, text: '⚠️ 空格不多了！每一步都要三思', category: 'context', mode: 'all', context: 'low_space' },
  { id: 57, text: '🔥 已经有高等级方块了！保护好它', category: 'context', mode: 'all', context: 'high_tile' },
  { id: 58, text: '🤔 这一步走不通？试试换个方向', category: 'context', mode: 'all', context: 'no_move' },
  { id: 59, text: '✨ 连续合并中！保持节奏，别断链', category: 'context', mode: 'all', context: 'streak' },
  { id: 60, text: '🆕 新的一局！这次一定能更好', category: 'context', mode: 'all', context: 'new_game' },
  { id: 61, text: '💡 提示：当没有好选择时，选择让棋盘最整齐的那个方向', category: 'context', mode: 'all', context: 'low_space' },
];

// 获取欢迎建议（每次打开游戏时显示）
export function getWelcomeTip(): StrategyTip {
  const welcomeTips = tips.filter(t => t.category === 'beginner' || t.category === 'encourage');
  return welcomeTips[Math.floor(Math.random() * welcomeTips.length)];
}

// 获取随机建议
export function getRandomTip(mode?: GameMode): StrategyTip {
  let pool = tips;
  if (mode) {
    const modeTips = tips.filter(t => t.mode === mode || t.mode === 'all');
    if (modeTips.length > 0) pool = modeTips;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

// 获取情境建议
export function getContextTip(context: StrategyTip['context'], mode?: GameMode): StrategyTip {
  const contextTips = tips.filter(t => t.context === context);
  if (contextTips.length === 0) return getRandomTip(mode);
  return contextTips[Math.floor(Math.random() * contextTips.length)];
}

// 获取所有建议
export function getAllTips(): StrategyTip[] {
  return [...tips];
}

// 获取当前模式可用的建议
export function getModeTips(mode: GameMode): StrategyTip[] {
  return tips.filter(t => t.mode === mode || t.mode === 'all');
}
