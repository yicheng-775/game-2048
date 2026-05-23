// 游戏核心逻辑 - 通用算法

import type { Grid, Cell, TileLevel, Direction } from './types';

// 生成唯一 ID
let idCounter = 0;
export function generateId(): string {
  return `tile-${Date.now()}-${idCounter++}`;
}

// 创建新方块
export function createCell(level: TileLevel): Cell {
  return { level, id: generateId() };
}

// 初始化空网格
export function initGrid(): Grid {
  return Array(4).fill(null).map(() => Array(4).fill(null));
}

// 深拷贝网格
export function cloneGrid(grid: Grid): Grid {
  return grid.map(row =>
    row.map(cell => (cell ? { ...cell } : null))
  );
}

// 获取所有空格位置
export function getEmptyCells(grid: Grid): [number, number][] {
  const empty: [number, number][] = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] === null) {
        empty.push([i, j]);
      }
    }
  }
  return empty;
}

// 随机添加方块，返回新创建的 Cell（用于动画）
export function addRandomTile(
  grid: Grid,
  minLevel: TileLevel,
  maxLevel: TileLevel
): Cell | null {
  const empty = getEmptyCells(grid);
  if (empty.length === 0) return null;

  const [row, col] = empty[Math.floor(Math.random() * empty.length)];
  const levelRange = maxLevel - minLevel + 1;
  const level = (minLevel + Math.floor(Math.random() * levelRange)) as TileLevel;
  const cell = createCell(level);
  grid[row][col] = cell;
  return cell;
}

// 滑动一行（向左）
function slideRow(
  row: (Cell | null)[]
): { newRow: (Cell | null)[]; merged: boolean; mergeScore: number } {
  // 过滤掉 null
  const tiles = row.filter((cell): cell is Cell => cell !== null);
  const newRow: (Cell | null)[] = [];
  let merged = false;
  let mergeScore = 0;

  let i = 0;
  while (i < tiles.length) {
    if (i + 1 < tiles.length && tiles[i].level === tiles[i + 1].level) {
      // 合并
      const newLevel = (tiles[i].level + 1) as TileLevel;
      newRow.push(createCell(newLevel));
      mergeScore += Math.pow(2, newLevel); // 经典模式分数计算
      merged = true;
      i += 2;
    } else {
      newRow.push({ ...tiles[i] });
      i++;
    }
  }

  // 填充 null
  while (newRow.length < 4) {
    newRow.push(null);
  }

  return { newRow, merged, mergeScore };
}

// 移动网格
export function moveGrid(
  grid: Grid,
  direction: Direction
): {
  newGrid: Grid;
  moved: boolean;
  mergeScore: number;
  mergedCells: Cell[];
} {
  const newGrid = initGrid();
  let moved = false;
  let mergeScore = 0;
  const mergedCells: Cell[] = [];

  if (direction === 'left') {
    for (let i = 0; i < 4; i++) {
      const result = slideRow(grid[i]);
      newGrid[i] = result.newRow;
      mergeScore += result.mergeScore;
      if (JSON.stringify(grid[i]) !== JSON.stringify(result.newRow)) {
        moved = true;
      }
    }
  } else if (direction === 'right') {
    for (let i = 0; i < 4; i++) {
      const result = slideRow([...grid[i]].reverse());
      newGrid[i] = result.newRow.reverse();
      mergeScore += result.mergeScore;
      if (JSON.stringify(grid[i]) !== JSON.stringify(newGrid[i])) {
        moved = true;
      }
    }
  } else if (direction === 'up') {
    for (let j = 0; j < 4; j++) {
      const col = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]];
      const result = slideRow(col);
      for (let i = 0; i < 4; i++) {
        newGrid[i][j] = result.newRow[i];
      }
      mergeScore += result.mergeScore;
      if (JSON.stringify(col) !== JSON.stringify(result.newRow)) {
        moved = true;
      }
    }
  } else if (direction === 'down') {
    for (let j = 0; j < 4; j++) {
      const col = [grid[3][j], grid[2][j], grid[1][j], grid[0][j]];
      const result = slideRow(col);
      for (let i = 0; i < 4; i++) {
        newGrid[i][j] = result.newRow[3 - i];
      }
      mergeScore += result.mergeScore;
      if (JSON.stringify([grid[0][j], grid[1][j], grid[2][j], grid[3][j]]) !==
          JSON.stringify([newGrid[0][j], newGrid[1][j], newGrid[2][j], newGrid[3][j]])) {
        moved = true;
      }
    }
  }

  // 收集合并的方块：对比新旧网格，找出新网格中新增的、等级更高的方块
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const newCell = newGrid[i][j];
      if (!newCell) continue;
      const oldCell = grid[i][j];
      // 如果旧位置为空或等级不同，且新方块等级 > 1，可能是合并产生的
      if (!oldCell || oldCell.level !== newCell.level) {
        // 检查这个方块是否是合并产生的（等级比原来的高）
        const origLevel = newCell.level - 1;
        const origCells = grid.flat().filter(c => c && c.level === origLevel);
        if (origCells.length >= 2) {
          mergedCells.push(newCell);
        }
      }
    }
  }

  return { newGrid, moved, mergeScore, mergedCells };
}

// 检查是否可以移动
export function canMove(grid: Grid): boolean {
  // 检查是否有空格
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] === null) return true;
    }
  }

  // 检查是否有相邻相同的等级
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const current = grid[i][j]!;
      if (j < 3 && grid[i][j + 1]!.level === current.level) return true;
      if (i < 3 && grid[i + 1][j]!.level === current.level) return true;
    }
  }

  return false;
}

// 检查是否达到指定等级
export function hasReachedLevel(grid: Grid, targetLevel: TileLevel): boolean {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j]?.level === targetLevel) {
        return true;
      }
    }
  }
  return false;
}
