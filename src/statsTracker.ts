// 操作节奏追踪与统计系统

export interface SessionStats {
  totalMoves: number;        // 总操作次数
  validMoves: number;        // 有效移动次数
  invalidMoves: number;      // 无效移动次数
  totalMerges: number;       // 总合并次数
  lastMoveTime: number;      // 上次操作时间戳
  moveTimestamps: number[];   // 最近操作时间戳列表
  fastestInterval: number;   // 最快操作间隔(ms)
  sessionStartTime: number;  // 本局开始时间
  consecutiveMerges: number;  // 连续合并次数
  maxConsecutiveMerges: number; // 最大连续合并次数
  newHighScore: boolean;     // 是否刷新了最高分
}

export interface PlayerType {
  label: string;
  emoji: string;
  description: string;
}

// 创建新的会话统计
export function createSessionStats(): SessionStats {
  return {
    totalMoves: 0,
    validMoves: 0,
    invalidMoves: 0,
    totalMerges: 0,
    lastMoveTime: 0,
    moveTimestamps: [],
    fastestInterval: Infinity,
    sessionStartTime: Date.now(),
    consecutiveMerges: 0,
    maxConsecutiveMerges: 0,
    newHighScore: false,
  };
}

// 记录一次有效移动
export function recordValidMove(stats: SessionStats, mergeCount: number): SessionStats {
  const now = Date.now();
  const newStats = { ...stats };
  newStats.totalMoves++;
  newStats.validMoves++;
  newStats.totalMerges += mergeCount;
  newStats.moveTimestamps.push(now);

  // 计算操作间隔
  if (newStats.lastMoveTime > 0) {
    const interval = now - newStats.lastMoveTime;
    if (interval < newStats.fastestInterval) {
      newStats.fastestInterval = interval;
    }
  }
  newStats.lastMoveTime = now;

  // 连续合并追踪
  if (mergeCount > 0) {
    newStats.consecutiveMerges += mergeCount;
    if (newStats.consecutiveMerges > newStats.maxConsecutiveMerges) {
      newStats.maxConsecutiveMerges = newStats.consecutiveMerges;
    }
  } else {
    newStats.consecutiveMerges = 0;
  }

  // 只保留最近 20 个时间戳
  if (newStats.moveTimestamps.length > 20) {
    newStats.moveTimestamps = newStats.moveTimestamps.slice(-20);
  }

  return newStats;
}

// 记录一次无效移动
export function recordInvalidMove(stats: SessionStats): SessionStats {
  return {
    ...stats,
    totalMoves: stats.totalMoves + 1,
    invalidMoves: stats.invalidMoves + 1,
    consecutiveMerges: 0,
  };
}

// 获取有效移动率
export function getValidMoveRate(stats: SessionStats): number {
  if (stats.totalMoves === 0) return 1;
  return stats.validMoves / stats.totalMoves;
}

// 获取最近 N 秒内的操作次数
export function getRecentMoveCount(stats: SessionStats, seconds: number): number {
  const cutoff = Date.now() - seconds * 1000;
  return stats.moveTimestamps.filter(t => t >= cutoff).length;
}

// 获取最近一次操作距今的秒数
export function getIdleSeconds(stats: SessionStats): number {
  if (stats.lastMoveTime === 0) return Infinity;
  return (Date.now() - stats.lastMoveTime) / 1000;
}

// 获取平均操作间隔
export function getAverageInterval(stats: SessionStats): number {
  if (stats.moveTimestamps.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < stats.moveTimestamps.length; i++) {
    total += stats.moveTimestamps[i] - stats.moveTimestamps[i - 1];
  }
  return total / (stats.moveTimestamps.length - 1);
}

// 获取鼓励信息
export function getEncouragement(stats: SessionStats): { text: string; type: string } | null {
  const recentMoves = getRecentMoveCount(stats, 3);
  const idleSeconds = getIdleSeconds(stats);
  const validRate = getValidMoveRate(stats);
  const avgInterval = getAverageInterval(stats);

  // 极速模式
  if (recentMoves >= 5) {
    return { text: '🔥 手速爆炸！', type: 'speed' };
  }

  // 连续合并
  if (stats.consecutiveMerges >= 3) {
    return { text: '💥 连环合并！太丝滑了！', type: 'combo' };
  }

  // 稳健模式
  if (stats.totalMoves >= 5 && avgInterval > 1000 && avgInterval < 3000 && validRate > 0.8) {
    return { text: '🧠 稳如泰山！', type: 'steady' };
  }

  // 慢速模式
  if (stats.totalMoves > 0 && idleSeconds >= 10) {
    return { text: '💤 棋盘在等你～', type: 'idle' };
  }

  // 刷新最高分
  if (stats.newHighScore) {
    return { text: '🏆 新纪录！你又变强了！', type: 'record' };
  }

  return null;
}

// 评价玩家类型
export function evaluatePlayerType(stats: SessionStats): PlayerType {
  const validRate = getValidMoveRate(stats);
  const avgInterval = getAverageInterval(stats);
  const totalMoves = stats.totalMoves;

  if (totalMoves < 5) {
    return { label: '新手探索者', emoji: '🌟', description: '刚开始探索，继续加油！' };
  }

  if (avgInterval < 500 && validRate > 0.7) {
    return { label: '闪电侠', emoji: '⚡', description: '手速惊人，但注意准确性！' };
  }

  if (validRate > 0.9 && avgInterval > 800) {
    return { label: '策略大师', emoji: '🧠', description: '深思熟虑，步步为营！' };
  }

  if (validRate > 0.85) {
    return { label: '稳健型选手', emoji: '🎯', description: '准确率高，节奏稳定！' };
  }

  if (validRate > 0.7) {
    return { label: '激进型选手', emoji: '🔥', description: '敢想敢干，偶尔冲动！' };
  }

  if (avgInterval < 1000) {
    return { label: '快枪手', emoji: '🔫', description: '速度优先，但可以更精准！' };
  }

  return { label: '休闲玩家', emoji: '😊', description: '享受游戏，轻松愉快！' };
}

// 获取本局时长（秒）
export function getSessionDuration(stats: SessionStats): number {
  return Math.floor((Date.now() - stats.sessionStartTime) / 1000);
}

// 格式化时长
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}分${sec}秒`;
}
