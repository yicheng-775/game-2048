import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

  // Loading 动画
  const [isModeSwitching, setIsModeSwitching] = useState(false);

  // 无效操作震动
  const [isShaking, setIsShaking] = useState(false);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 重新开始确认弹窗
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  // 新出现的方块 ID（用于出现动画）
  const [newTileIds, setNewTileIds] = useState<Set<string>>(new Set());
  // 合并的方块 ID（用于合并动画）
  const [mergedTileIds, setMergedTileIds] = useState<Set<string>>(new Set());

  // 切换模式时重置游戏（带 Loading 动画）
  const handleModeSwitch = useCallback((newMode: GameMode) => {
    if (newMode === currentMode) return;
    setIsModeSwitching(true);
    setTimeout(() => {
      setCurrentMode(newMode);
      const grid = initGrid();
      const config = getModeConfig(newMode);
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
      setHighRecord(getModeRecord(newMode));
      setNewTileIds(new Set());
      setMergedTileIds(new Set());
      setTimeout(() => setIsModeSwitching(false), 300);
    }, 400);
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
    setNewTileIds(new Set());
    setMergedTileIds(new Set());
  }, [currentMode]);

  // 带确认的重新开始
  const handleRestartClick = useCallback(() => {
    setShowRestartConfirm(true);
  }, []);

  const confirmRestart = useCallback(() => {
    setShowRestartConfirm(false);
    resetGame();
  }, [resetGame]);

  const cancelRestart = useCallback(() => {
    setShowRestartConfirm(false);
  }, []);

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

  // 触发震动反馈
  const triggerShake = useCallback(() => {
    setIsShaking(true);
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    shakeTimerRef.current = setTimeout(() => setIsShaking(false), 300);
  }, []);

  // 处理移动
  const handleMove = useCallback(
    (direction: Direction) => {
      if (gameState.isGameOver) return;
      if (gameState.isWon && !gameState.canContinue) return;

      const config = getModeConfig(currentMode);
      const result = moveGrid(gameState.grid, direction);

      if (!result.moved) {
        // 无效操作 - 触发震动
        triggerShake();
        return;
      }

      // 保存历史记录
      const newHistoryEntry: HistoryState = {
        grid: cloneGrid(gameState.grid),
        score: gameState.score,
      };

      // 添加新方块
      const newTile = addRandomTile(result.newGrid, config.spawnLevelRange[0], config.spawnLevelRange[1]);

      // 计算新分数
      let newScore: number;
      if (config.recordType === 'score') {
        newScore = gameState.score + result.mergeScore;
      } else {
        newScore = gameState.score + 1;
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

      // 设置新方块动画
      const newIds = new Set<string>();
      if (newTile) newIds.add(newTile.id);
      setNewTileIds(newIds);

      // 设置合并方块动画
      const mergedIds = new Set<string>();
      if (result.mergedCells) {
        result.mergedCells.forEach(cell => mergedIds.add(cell.id));
      }
      setMergedTileIds(mergedIds);

      // 清除动画标记
      setTimeout(() => {
        setNewTileIds(new Set());
        setMergedTileIds(new Set());
      }, 200);

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
    [gameState, currentMode, highRecord, triggerShake]
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
    const MIN_SWIPE_DISTANCE = 30;

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

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    const gridEl = document.querySelector('.grid-container') as HTMLElement | null;
    if (gridEl) {
      gridEl.addEventListener('touchstart', handleTouchStart as EventListener, { passive: true });
      gridEl.addEventListener('touchend', handleTouchEnd as EventListener, { passive: true });
      gridEl.addEventListener('touchmove', handleTouchMove as EventListener, { passive: false });
    }

    return () => {
      if (gridEl) {
        gridEl.removeEventListener('touchstart', handleTouchStart as EventListener);
        gridEl.removeEventListener('touchend', handleTouchEnd as EventListener);
        gridEl.removeEventListener('touchmove', handleTouchMove as EventListener);
      }
    };
  }, [handleMove]);

  // 渲染方块
  const renderTile = (cell: { level: number; id: string } | null, row: number, col: number) => {
    const level = cell?.level as TileLevel;
    const content = cell ? modeConfig.getTileContent(level) : null;
    const bgColor = cell ? modeConfig.getTileColor(level) : 'transparent';
    const textColor = cell ? modeConfig.getTextColor(level) : 'inherit';

    const isNew = cell ? newTileIds.has(cell.id) : false;
    const isMerged = cell ? mergedTileIds.has(cell.id) : false;

    return (
      <div
        key={cell ? cell.id : `empty-${row}-${col}`}
        className={`tile ${cell ? 'tile-filled' : 'tile-empty'} ${isNew ? 'tile-new' : ''} ${isMerged ? 'tile-merged' : ''}`}
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
      {/* Loading 遮罩 */}
      {isModeSwitching && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner-dot" />
            <div className="spinner-dot" />
            <div className="spinner-dot" />
          </div>
          <p className="loading-text">切换模式中...</p>
        </div>
      )}

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
              onClick={() => handleModeSwitch(mode)}
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
        <button className="control-btn restart-btn" onClick={handleRestartClick}>
          🔄 重新开始
        </button>
      </div>

      {/* 游戏网格 */}
      <div className={`grid-container ${isShaking ? 'grid-shake' : ''}`}>
        <div className="grid">
          {gameState.grid.map((row, i) =>
            row.map((cell, j) => renderTile(cell, i, j))
          )}
        </div>

        {/* 游戏结束覆盖层 */}
        {gameState.isGameOver && (
          <div className="game-overlay">
            <div className="overlay-content">
              <div className="overlay-icon">😢</div>
              <h2 className="overlay-title">游戏结束</h2>
              <p className="overlay-message">
                {modeConfig.scoreLabel}：<strong>{gameState.score}</strong>
                {highRecord !== null && (
                  <span className="overlay-record">
                    {modeConfig.recordType === 'score'
                      ? ` | 最高分：${highRecord}`
                      : ` | 最佳回合：${highRecord}`}
                  </span>
                )}
              </p>
              <button className="overlay-btn" onClick={resetGame}>
                🔄 再来一局
              </button>
            </div>
          </div>
        )}

        {/* 胜利覆盖层 */}
        {gameState.isWon && !gameState.canContinue && (
          <div className="game-overlay win-overlay">
            <div className="overlay-content">
              <div className="overlay-icon">🎉</div>
              <h2 className="overlay-title">恭喜！</h2>
              <p className="overlay-message">
                {modeConfig.winMessage}
              </p>
              <p className="overlay-message">
                {modeConfig.scoreLabel}：<strong>{gameState.score}</strong>
              </p>
              <div className="overlay-buttons">
                <button className="overlay-btn continue-btn" onClick={continueGame}>
                  ▶️ 继续挑战
                </button>
                <button className="overlay-btn" onClick={resetGame}>
                  🔄 再来一局
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 重新开始确认弹窗 */}
      {showRestartConfirm && (
        <div className="modal-backdrop" onClick={cancelRestart}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🤔</div>
            <h3 className="modal-title">确定要重新开始吗？</h3>
            <p className="modal-message">当前游戏进度将会丢失</p>
            <div className="modal-buttons">
              <button className="modal-btn cancel-btn" onClick={cancelRestart}>
                取消
              </button>
              <button className="modal-btn confirm-btn" onClick={confirmRestart}>
                确定重新开始
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 操作说明 */}
      <footer className="game-footer">
        <p>⌨️ 方向键 / 📱 滑动屏幕 移动方块</p>
        <p>相同内容碰撞合并，挑战最高记录！</p>
      </footer>
    </div>
  );
}

export default App;
