import { useState, useEffect, useCallback, useMemo } from 'react';
import type { GameMode, Direction, GameState, HistoryState, TileLevel } from './types';
import { initGrid, addRandomTile, moveGrid, canMove, hasReachedLevel, cloneGrid } from './gameLogic';
import { getModeConfig, modeConfigs } from './modeConfigs';
import { getModeRecord, updateModeRecord } from './storage';
import './App.css';

function App() {
  // 当前模式
  const [currentMode, setCurrentMode] = useState<GameMode>('classic');
  const modeConfig = useMemo(() => getModeConfig(currentMode), [currentMode]);

  // 游戏状态
  const [gameState, setGameState] = useState<GameState>(() => {
    const grid = initGrid();
    addRandomTile(grid, 1, 2);
    addRandomTile(grid, 1, 2);
    return {
      grid,
      score: 0,
      isGameOver: false,
      isWon: false,
      canContinue: false,
    };
  });

  // 历史记录（用于撤销）
  const [history, setHistory] = useState<HistoryState[]>([]);

  // 最高记录
  const [highRecord, setHighRecord] = useState<number | null>(() =>
    getModeRecord(currentMode)
  );

  // 切换模式时重置游戏
  useEffect(() => {
    resetGame();
    setHighRecord(getModeRecord(currentMode));
  }, [currentMode]);

  // 初始化游戏
  const resetGame = useCallback(() => {
    const grid = initGrid();
    const config = getModeConfig(currentMode);
    addRandomTile(grid, config.spawnLevelRange[0], config.spawnLevelRange[1]);
    addRandomTile(grid, config.spawnLevelRange[0], config.spawnLevelRange[1]);
    setGameState({
      grid,
      score: 0,
      isGameOver: false,
      isWon: false,
      canContinue: false,
    });
    setHistory([]);
  }, [currentMode]);

  // 撤销上一步
  const undoMove = useCallback(() => {
    if (history.length === 0 || gameState.isGameOver) return;
    const previousState = history[history.length - 1];
    setGameState(prev => ({
      ...prev,
      grid: cloneGrid(previousState.grid),
      score: previousState.score,
      isGameOver: false,
    }));
    setHistory(prev => prev.slice(0, -1));
  }, [history, gameState.isGameOver]);

  // 处理移动
  const handleMove = useCallback(
    (direction: Direction) => {
      if (gameState.isGameOver) return;
      if (gameState.isWon && !gameState.canContinue) return;

      const config = getModeConfig(currentMode);
      const result = moveGrid(gameState.grid, direction);

      if (!result.moved) return;

      // 保存历史记录
      const newHistoryEntry: HistoryState = {
        grid: cloneGrid(gameState.grid),
        score: gameState.score,
      };

      // 添加新方块
      addRandomTile(result.newGrid, config.spawnLevelRange[0], config.spawnLevelRange[1]);

      // 计算新分数
      let newScore: number;
      if (config.recordType === 'score') {
        newScore = gameState.score + result.mergeScore;
      } else {
        newScore = gameState.score + 1; // 回合数
      }

      // 检查胜利条件
      const isWon = hasReachedLevel(result.newGrid, config.maxLevel);
      const canContinue = gameState.isWon || isWon;

      // 检查游戏结束
      const isGameOver = !canMove(result.newGrid);

      setGameState({
        grid: result.newGrid,
        score: newScore,
        isGameOver,
        isWon: gameState.isWon || isWon,
        canContinue,
      });

      setHistory(prev => [...prev, newHistoryEntry]);

      // 更新最高记录
      if (isGameOver || (isWon && !gameState.isWon)) {
        if (config.recordType === 'score') {
          if (newScore > (highRecord || 0)) {
            updateModeRecord(currentMode, newScore);
            setHighRecord(newScore);
          }
        } else {
          if (highRecord === null || newScore < highRecord) {
            updateModeRecord(currentMode, newScore);
            setHighRecord(newScore);
          }
        }
      }
    },
    [gameState, currentMode, highRecord]
  );

  // 继续游戏（胜利后）
  const continueGame = useCallback(() => {
    setGameState(prev => ({ ...prev, canContinue: true }));
  }, []);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleMove('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleMove('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleMove('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleMove('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  // 触摸滑动事件处理（手机支持）
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    const MIN_SWIPE_DISTANCE = 30; // 最小滑动距离（像素）

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) < MIN_SWIPE_DISTANCE) return;

      if (absDx > absDy) {
        handleMove(dx > 0 ? 'right' : 'left');
      } else {
        handleMove(dy > 0 ? 'down' : 'up');
      }
    };

    // 阻止页面在游戏区域滚动
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    const gridEl = document.querySelector('.grid-container');
    if (gridEl) {
      gridEl.addEventListener('touchstart', handleTouchStart, { passive: true });
      gridEl.addEventListener('touchend', handleTouchEnd, { passive: true });
      gridEl.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      if (gridEl) {
        gridEl.removeEventListener('touchstart', handleTouchStart);
        gridEl.removeEventListener('touchend', handleTouchEnd);
        gridEl.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [handleMove]);

  // 渲染方块
  const renderTile = (cell: { level: number; id: string } | null, row: number, col: number) => {
    const level = cell?.level as TileLevel;
    const content = cell ? modeConfig.getTileContent(level) : null;
    const bgColor = cell ? modeConfig.getTileColor(level) : 'transparent';
    const textColor = cell ? modeConfig.getTextColor(level) : 'inherit';

    return (
      <div
        key={cell ? cell.id : `empty-${row}-${col}`}
        className={`tile ${cell ? 'tile-filled' : 'tile-empty'}`}
        style={{
          backgroundColor: bgColor,
          color: textColor,
        }}
      >
        {content && (
          <div className="tile-content">
            <span className="tile-emoji">{content.emoji}</span>
            <span className="tile-name">{content.name}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`game-container mode-${currentMode}`}>
      {/* 标题 */}
      <header className="game-header">
        <h1 className="game-title">
          <span className="title-icon">🎮</span>
          多模式 2048
        </h1>
        <p className="game-subtitle">{modeConfig.description}</p>
      </header>

      {/* 模式切换 */}
      <nav className="mode-selector">
        {(Object.keys(modeConfigs) as GameMode[]).map(mode => {
          const config = modeConfigs[mode];
          return (
            <button
              key={mode}
              className={`mode-btn ${currentMode === mode ? 'active' : ''}`}
              onClick={() => setCurrentMode(mode)}
            >
              <span className="mode-emoji">{config.emoji}</span>
              <span className="mode-name">{config.name}</span>
            </button>
          );
        })}
      </nav>

      {/* 分数和记录 */}
      <div className="stats-container">
        <div className="stat-box current">
          <span className="stat-label">{modeConfig.scoreLabel}</span>
          <span className="stat-value">{gameState.score}</span>
        </div>
        <div className="stat-box record">
          <span className="stat-label">{modeConfig.recordLabel}</span>
          <span className="stat-value">
            {highRecord === null ? '-' : highRecord}
          </span>
        </div>
      </div>

      {/* 游戏控制按钮 */}
      <div className="controls">
        <button
          className="control-btn undo-btn"
          onClick={undoMove}
          disabled={history.length === 0 || gameState.isGameOver}
        >
          ↩️ 撤销
        </button>
        <button className="control-btn restart-btn" onClick={resetGame}>
          🔄 重新开始
        </button>
      </div>

      {/* 游戏网格 */}
      <div className="grid-container">
        <div className="grid">
          {gameState.grid.map((row, i) =>
            row.map((cell, j) => renderTile(cell, i, j))
          )}
        </div>

        {/* 游戏结束覆盖层 */}
        {gameState.isGameOver && (
          <div className="game-overlay">
            <div className="overlay-content">
              <h2 className="overlay-title">😢 游戏结束</h2>
              <p className="overlay-message">
                {modeConfig.scoreLabel}：{gameState.score}
              </p>
              <button className="overlay-btn" onClick={resetGame}>
                再来一局
              </button>
            </div>
          </div>
        )}

        {/* 胜利覆盖层 */}
        {gameState.isWon && !gameState.canContinue && (
          <div className="game-overlay win-overlay">
            <div className="overlay-content">
              <h2 className="overlay-title">{modeConfig.winMessage}</h2>
              <p className="overlay-message">
                {modeConfig.scoreLabel}：{gameState.score}
              </p>
              <div className="overlay-buttons">
                <button className="overlay-btn continue-btn" onClick={continueGame}>
                  继续游戏
                </button>
                <button className="overlay-btn" onClick={resetGame}>
                  重新开始
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 操作说明 */}
      <footer className="game-footer">
        <p>⌨️ 方向键 / 📱 滑动屏幕 移动方块</p>
        <p>相同内容碰撞合并，挑战最高记录！</p>
      </footer>
    </div>
  );
}

export default App;
