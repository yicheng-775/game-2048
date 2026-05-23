import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { GameMode, Direction, GameState, HistoryState, TileLevel } from './types';
import { initGrid, addRandomTile, moveGrid, canMove, hasReachedLevel, cloneGrid } from './gameLogic';
import { getModeConfig, modeConfigs, randomModes } from './modeConfigs';
import { getModeRecord, updateModeRecord } from './storage';
import { getRandomTip, getWelcomeTip, getContextTip } from './strategyTips';
import type { StrategyTip } from './strategyTips';
import {
  createSessionStats, recordValidMove, recordInvalidMove,
  getEncouragement, getIdleSeconds, evaluatePlayerType,
  getSessionDuration, formatDuration, getValidMoveRate
} from './statsTracker';
import type { SessionStats } from './statsTracker';
import {
  checkGameEndAchievements, getAllAchievements, getUnlockedCount,
  getMaxLevel, achievementDefs
} from './achievements';
import type { Achievement } from './achievements';
import { ErrorBoundary } from './ErrorBoundary';
import { Onboarding } from './Onboarding';
import './App.css';

// 分数动画组件
function AnimatedScore({ value, label }: { value: number; label: string }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      setIsAnimating(true);
      setDisplayValue(value);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <div className="stat-box">
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${isAnimating ? 'score-pop' : ''}`}>
        {displayValue}
      </span>
    </div>
  );
}

function GameContent() {
  // 当前模式
  const [currentMode, setCurrentMode] = useState<GameMode>('classic');
  const modeConfig = useMemo(() => getModeConfig(currentMode), [currentMode]);

  // 游戏状态
  const [gameState, setGameState] = useState<GameState>(() => {
    const grid = initGrid();
    addRandomTile(grid, 1, 2);
    addRandomTile(grid, 1, 2);
    return { grid, score: 0, isGameOver: false, isWon: false, canContinue: false };
  });

  const [history, setHistory] = useState<HistoryState[]>([]);
  const [highRecord, setHighRecord] = useState<number | null>(() => getModeRecord(currentMode));

  // UI 状态
  const [isModeSwitching, setIsModeSwitching] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [newTileIds, setNewTileIds] = useState<Set<string>>(new Set());
  const [mergedTileIds, setMergedTileIds] = useState<Set<string>>(new Set());

  // 策略建议面板
  const [showTips, setShowTips] = useState(false);
  const [currentTip, setCurrentTip] = useState<StrategyTip>(() => getWelcomeTip());

  // 操作节奏鼓励
  const [sessionStats, setSessionStats] = useState<SessionStats>(() => createSessionStats());
  const [encouragement, setEncouragement] = useState<{ text: string; type: string } | null>(null);
  const encourageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 成就系统
  const [achievements, setAchievements] = useState<Achievement[]>(() => getAllAchievements());
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showAchievementList, setShowAchievementList] = useState(false);

  // 本局统计报告
  const [showStatsReport, setShowStatsReport] = useState(false);
  const [finalStats, setFinalStats] = useState<SessionStats | null>(null);
  const [finalMaxLevel, setFinalMaxLevel] = useState(0);
  const [finalNewAchievements, setFinalNewAchievements] = useState<Achievement[]>([]);

  // 随机模式转盘
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningMode, setSpinningMode] = useState<string | null>(null);
  const [showRandomResult, setShowRandomResult] = useState(false);
  const [selectedRandomMode, setSelectedRandomMode] = useState<GameMode | null>(null);

  // 引导（由 Onboarding 组件内部管理）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showOnboarding, _setShowOnboarding] = useState(false);

  // 显示鼓励信息
  const showEncouragement = useCallback((text: string, type: string) => {
    setEncouragement({ text, type });
    if (encourageTimerRef.current) clearTimeout(encourageTimerRef.current);
    encourageTimerRef.current = setTimeout(() => setEncouragement(null), 2000);
  }, []);

  // 空闲检测
  useEffect(() => {
    idleTimerRef.current = setInterval(() => {
      if (sessionStats.totalMoves > 0 && !gameState.isGameOver) {
        const idle = getIdleSeconds(sessionStats);
        if (idle >= 10 && idle < 10.5) {
          showEncouragement('💤 棋盘在等你～', 'idle');
        }
      }
    }, 1000);
    return () => {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    };
  }, [sessionStats, gameState.isGameOver, showEncouragement]);

  // 切换模式
  const handleModeSwitch = useCallback((newMode: GameMode) => {
    if (newMode === currentMode) return;
    setIsModeSwitching(true);
    setTimeout(() => {
      setCurrentMode(newMode);
      const grid = initGrid();
      const config = getModeConfig(newMode);
      addRandomTile(grid, config.spawnLevelRange[0], config.spawnLevelRange[1]);
      addRandomTile(grid, config.spawnLevelRange[0], config.spawnLevelRange[1]);
      setGameState({ grid, score: 0, isGameOver: false, isWon: false, canContinue: false });
      setHistory([]);
      setHighRecord(getModeRecord(newMode));
      setNewTileIds(new Set());
      setMergedTileIds(new Set());
      setSessionStats(createSessionStats());
      setCurrentTip(getContextTip('new_game', newMode));
      setTimeout(() => setIsModeSwitching(false), 300);
    }, 400);
  }, [currentMode]);

  // 随机模式
  const handleRandomMode = useCallback(() => {
    if (isSpinning) return;
    setIsSpinning(true);
    setShowRandomResult(false);

    let count = 0;
    const totalSpins = 15;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * randomModes.length);
      setSpinningMode(randomModes[randomIndex]);
      count++;
      if (count >= totalSpins) {
        clearInterval(interval);
        const finalIndex = Math.floor(Math.random() * randomModes.length);
        const selected = randomModes[finalIndex] as GameMode;
        setSpinningMode(selected);
        setSelectedRandomMode(selected);
        setTimeout(() => {
          setShowRandomResult(true);
          setIsSpinning(false);
        }, 300);
      }
    }, 100);
  }, [isSpinning]);

  const confirmRandomMode = useCallback(() => {
    if (selectedRandomMode) {
      setShowRandomResult(false);
      handleModeSwitch(selectedRandomMode);
    }
  }, [selectedRandomMode, handleModeSwitch]);

  const cancelRandomMode = useCallback(() => {
    setShowRandomResult(false);
    setSpinningMode(null);
    setSelectedRandomMode(null);
  }, []);

  // 重置游戏
  const resetGame = useCallback(() => {
    const grid = initGrid();
    const config = getModeConfig(currentMode);
    addRandomTile(grid, config.spawnLevelRange[0], config.spawnLevelRange[1]);
    addRandomTile(grid, config.spawnLevelRange[0], config.spawnLevelRange[1]);
    setGameState({ grid, score: 0, isGameOver: false, isWon: false, canContinue: false });
    setHistory([]);
    setNewTileIds(new Set());
    setMergedTileIds(new Set());
    setSessionStats(createSessionStats());
    setCurrentTip(getContextTip('new_game', currentMode));
  }, [currentMode]);

  const handleRestartClick = useCallback(() => setShowRestartConfirm(true), []);
  const confirmRestart = useCallback(() => { setShowRestartConfirm(false); resetGame(); }, [resetGame]);
  const cancelRestart = useCallback(() => setShowRestartConfirm(false), []);

  // 撤销
  const undoMove = useCallback(() => {
    if (history.length === 0 || gameState.isGameOver) return;
    const prev = history[history.length - 1];
    setGameState(p => ({ ...p, grid: cloneGrid(prev.grid), score: prev.score, isGameOver: false }));
    setHistory(p => p.slice(0, -1));
  }, [history, gameState.isGameOver]);

  // 震动
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
        triggerShake();
        setSessionStats(prev => recordInvalidMove(prev));
        if (sessionStats.totalMoves > 3) {
          setCurrentTip(getContextTip('no_move', currentMode));
        }
        return;
      }

      const mergeCount = result.mergedCells ? result.mergedCells.length : 0;
      const newStats = recordValidMove(sessionStats, mergeCount);
      setSessionStats(newStats);

      const newHistoryEntry: HistoryState = { grid: cloneGrid(gameState.grid), score: gameState.score };
      const newTile = addRandomTile(result.newGrid, config.spawnLevelRange[0], config.spawnLevelRange[1]);

      let newScore: number;
      if (config.recordType === 'score') {
        newScore = gameState.score + result.mergeScore;
      } else {
        newScore = gameState.score + 1;
      }

      const isWon = hasReachedLevel(result.newGrid, config.maxLevel);
      const canContinue = gameState.isWon || isWon;
      const isGameOver = !canMove(result.newGrid);

      setGameState({ grid: result.newGrid, score: newScore, isGameOver, isWon: gameState.isWon || isWon, canContinue });
      setHistory(prev => [...prev, newHistoryEntry]);

      const nIds = new Set<string>();
      if (newTile) nIds.add(newTile.id);
      setNewTileIds(nIds);
      const mIds = new Set<string>();
      if (result.mergedCells) result.mergedCells.forEach(c => mIds.add(c.id));
      setMergedTileIds(mIds);
      setTimeout(() => { setNewTileIds(new Set()); setMergedTileIds(new Set()); }, 200);

      let isNewRecord = false;
      if (isGameOver || (isWon && !gameState.isWon)) {
        if (config.recordType === 'score') {
          if (newScore > (highRecord || 0)) {
            updateModeRecord(currentMode, newScore);
            setHighRecord(newScore);
            isNewRecord = true;
          }
        } else {
          if (highRecord === null || newScore < highRecord) {
            updateModeRecord(currentMode, newScore);
            setHighRecord(newScore);
            isNewRecord = true;
          }
        }
      }

      if (isNewRecord) {
        showEncouragement('🏆 新纪录！你又变强了！', 'record');
      }

      const enc = getEncouragement({ ...newStats, newHighScore: isNewRecord });
      if (enc) showEncouragement(enc.text, enc.type);

      const emptyCells = result.newGrid.flat().filter(c => c === null).length;
      if (emptyCells <= 3 && emptyCells > 0) {
        setCurrentTip(getContextTip('low_space', currentMode));
      } else if (mergeCount >= 2) {
        setCurrentTip(getContextTip('streak', currentMode));
      }

      if (isGameOver) {
        const maxLv = getMaxLevel(result.newGrid);
        const won = gameState.isWon || isWon;
        const unlocked = checkGameEndAchievements(currentMode, newStats, maxLv, won);
        if (unlocked.length > 0) {
          setNewAchievements(unlocked);
          setAchievements(getAllAchievements());
        }
        setFinalStats({ ...newStats });
        setFinalMaxLevel(maxLv);
        setFinalNewAchievements(unlocked);
        setTimeout(() => setShowStatsReport(true), 600);
      }
    },
    [gameState, currentMode, highRecord, sessionStats, triggerShake, showEncouragement]
  );

  const continueGame = useCallback(() => {
    setGameState(prev => ({ ...prev, canContinue: true }));
  }, []);

  // 键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': e.preventDefault(); handleMove('up'); break;
        case 'ArrowDown': e.preventDefault(); handleMove('down'); break;
        case 'ArrowLeft': e.preventDefault(); handleMove('left'); break;
        case 'ArrowRight': e.preventDefault(); handleMove('right'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  // 触摸事件
  useEffect(() => {
    let tx = 0, ty = 0;
    const MIN = 30;
    const ts = (e: TouchEvent) => { tx = e.changedTouches[0].screenX; ty = e.changedTouches[0].screenY; };
    const te = (e: TouchEvent) => {
      const dx = e.changedTouches[0].screenX - tx, dy = e.changedTouches[0].screenY - ty;
      const ax = Math.abs(dx), ay = Math.abs(dy);
      if (Math.max(ax, ay) < MIN) return;
      handleMove(ax > ay ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    };
    const tm = (e: TouchEvent) => { e.preventDefault(); };
    const el = document.querySelector('.grid-container') as HTMLElement | null;
    if (el) {
      el.addEventListener('touchstart', ts as EventListener, { passive: true });
      el.addEventListener('touchend', te as EventListener, { passive: true });
      el.addEventListener('touchmove', tm as EventListener, { passive: false });
    }
    return () => {
      if (el) {
        el.removeEventListener('touchstart', ts as EventListener);
        el.removeEventListener('touchend', te as EventListener);
        el.removeEventListener('touchmove', tm as EventListener);
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
      <div key={cell ? cell.id : `empty-${row}-${col}`}
        className={`tile ${cell ? 'tile-filled' : 'tile-empty'} ${isNew ? 'tile-new' : ''} ${isMerged ? 'tile-merged' : ''}`}
        style={{ backgroundColor: bgColor, color: textColor }}>
        {content && (
          <div className="tile-content">
            <span className="tile-emoji">{content.emoji}</span>
            <span className="tile-name">{content.name}</span>
          </div>
        )}
      </div>
    );
  };

  const unlockedCount = getUnlockedCount();
  const playerType = finalStats ? evaluatePlayerType(finalStats) : null;

  // 基础模式列表
  const baseModes: GameMode[] = ['classic', 'fruit', 'animal'];

  return (
    <div className={`game-container mode-${currentMode}`}>
      {/* Loading */}
      {isModeSwitching && (
        <div className="loading-overlay">
          <div className="loading-spinner"><div className="spinner-dot" /><div className="spinner-dot" /><div className="spinner-dot" /></div>
          <p className="loading-text">切换模式中...</p>
        </div>
      )}

      {/* 标题 */}
      <header className="game-header">
        <h1 className="game-title"><span className="title-icon">🎮</span>多模式 2048</h1>
        <p className="game-subtitle">{modeConfig.description}</p>
      </header>

      {/* 卡片式模式切换 */}
      <nav className="mode-tabs">
        {baseModes.map(mode => (
          <button
            key={mode}
            className={`mode-tab ${currentMode === mode ? 'active' : ''}`}
            onClick={() => handleModeSwitch(mode)}
          >
            <span className="mode-tab-emoji">{modeConfigs[mode].emoji}</span>
            <span className="mode-tab-name">{modeConfigs[mode].name}</span>
          </button>
        ))}
      </nav>

      {/* 分数和记录 */}
      <div className="stats-container">
        <AnimatedScore value={gameState.score} label={modeConfig.scoreLabel} />
        <AnimatedScore value={highRecord ?? 0} label={modeConfig.recordLabel} />
        <button className="stat-box achievement-box" onClick={() => setShowAchievementList(true)}>
          <span className="stat-label">勋章</span>
          <span className="stat-value">{unlockedCount}/{achievementDefs.length}</span>
        </button>
      </div>

      {/* 控制按钮 */}
      <div className="controls">
        <button className="control-btn undo-btn" onClick={undoMove}
          disabled={history.length === 0 || gameState.isGameOver}>↩️ 撤销</button>
        <button className="control-btn restart-btn" onClick={handleRestartClick}>🔄 重新开始</button>
        <button className="control-btn tips-btn" onClick={() => setShowTips(!showTips)}>
          {showTips ? '📝 收起' : '💡 策略'}
        </button>
      </div>

      {/* 策略建议面板 */}
      {showTips && (
        <div className="tips-panel">
          <div className="tips-header">
            <span className="tips-title">💡 策略建议</span>
            <button className="tips-refresh" onClick={() => setCurrentTip(getRandomTip(currentMode))}>换一条 🎲</button>
          </div>
          <p className="tips-text">{currentTip.text}</p>
          <span className="tips-category">{currentTip.category === 'beginner' ? '🌱 新手引导' :
            currentTip.category === 'advanced' ? '📚 进阶策略' :
            currentTip.category === 'encourage' ? '💪 心态鼓励' :
            currentTip.category === 'classic' ? '🔢 经典专属' :
            currentTip.category === 'fruit' ? '🍇 水果专属' :
            currentTip.category === 'animal' ? '🥚 动物专属' : '🎯 情境提示'}</span>
        </div>
      )}

      {/* 随机模式按钮 */}
      <button
        className={`random-mode-btn ${isSpinning ? 'spinning' : ''}`}
        onClick={handleRandomMode}
        disabled={isSpinning}
      >
        <span className="random-mode-emoji">🎲</span>
        <span className="random-mode-text">
          {isSpinning && spinningMode
            ? `${modeConfigs[spinningMode].emoji} ${modeConfigs[spinningMode].name}`
            : '🎲 随一个！'}
        </span>
      </button>

      {/* 游戏网格 */}
      <div className={`grid-container ${isShaking ? 'grid-shake' : ''}`}>
        <div className="grid">
          {gameState.grid.map((row, i) => row.map((cell, j) => renderTile(cell, i, j)))}
        </div>

        {/* 鼓励提示 */}
        {encouragement && (
          <div className={`encouragement-toast encouragement-${encouragement.type}`}>
            {encouragement.text}
          </div>
        )}

        {/* 游戏结束 */}
        {gameState.isGameOver && !showStatsReport && (
          <div className="game-overlay">
            <div className="overlay-content">
              <div className="overlay-icon">😢</div>
              <h2 className="overlay-title">游戏结束</h2>
              <p className="overlay-message">
                {modeConfig.scoreLabel}：<strong>{gameState.score}</strong>
                {highRecord !== null && <span className="overlay-record"> | {modeConfig.recordType === 'score' ? `最高分：${highRecord}` : `最佳回合：${highRecord}`}</span>}
              </p>
              <button className="overlay-btn" onClick={resetGame}>🔄 再来一局</button>
            </div>
          </div>
        )}

        {/* 胜利 */}
        {gameState.isWon && !gameState.canContinue && (
          <div className="game-overlay win-overlay">
            <div className="overlay-content">
              <div className="overlay-icon">🎉</div>
              <h2 className="overlay-title">恭喜！</h2>
              <p className="overlay-message">{modeConfig.winMessage}</p>
              <p className="overlay-message">{modeConfig.scoreLabel}：<strong>{gameState.score}</strong></p>
              <div className="overlay-buttons">
                <button className="overlay-btn continue-btn" onClick={continueGame}>▶️ 继续挑战</button>
                <button className="overlay-btn" onClick={resetGame}>🔄 再来一局</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部 */}
      <footer className="game-footer">
        <p>⌨️ 方向键 / 📱 滑动屏幕 移动方块</p>
      </footer>

      {/* 重新开始确认弹窗 */}
      {showRestartConfirm && (
        <div className="modal-backdrop" onClick={cancelRestart}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🤔</div>
            <h3 className="modal-title">确定要重新开始吗？</h3>
            <p className="modal-message">当前游戏进度将会丢失</p>
            <div className="modal-buttons">
              <button className="modal-btn cancel-btn" onClick={cancelRestart}>取消</button>
              <button className="modal-btn confirm-btn" onClick={confirmRestart}>确定重新开始</button>
            </div>
          </div>
        </div>
      )}

      {/* 成就解锁弹窗 */}
      {newAchievements.length > 0 && !showStatsReport && (
        <div className="modal-backdrop" onClick={() => setNewAchievements([])}>
          <div className="modal-content achievement-unlock-modal" onClick={e => e.stopPropagation()}>
            <div className="achievement-unlock-icon">🏅</div>
            <h3 className="modal-title">成就解锁！</h3>
            <div className="achievement-unlock-list">
              {newAchievements.map(a => (
                <div key={a.id} className="achievement-unlock-item">
                  <span className="achievement-unlock-emoji">{a.emoji}</span>
                  <div>
                    <div className="achievement-unlock-name">{a.name}</div>
                    <div className="achievement-unlock-desc">{a.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="modal-btn confirm-btn" style={{ marginTop: 16 }} onClick={() => setNewAchievements([])}>太棒了！</button>
          </div>
        </div>
      )}

      {/* 成就列表弹窗 */}
      {showAchievementList && (
        <div className="modal-backdrop" onClick={() => setShowAchievementList(false)}>
          <div className="modal-content achievement-list-modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">🏅 成就勋章 ({unlockedCount}/{achievementDefs.length})</h3>
            <div className="achievement-list">
              {achievements.map(a => (
                <div key={a.id} className={`achievement-item ${a.unlocked ? 'unlocked' : 'locked'}`}>
                  <span className="achievement-item-emoji">{a.unlocked ? a.emoji : '🔒'}</span>
                  <div className="achievement-item-info">
                    <span className="achievement-item-name">{a.name}</span>
                    <span className="achievement-item-desc">{a.description}</span>
                  </div>
                  {a.unlocked && <span className="achievement-item-check">✅</span>}
                </div>
              ))}
            </div>
            <button className="modal-btn cancel-btn" style={{ marginTop: 16 }} onClick={() => setShowAchievementList(false)}>关闭</button>
          </div>
        </div>
      )}

      {/* 本局统计报告弹窗 */}
      {showStatsReport && finalStats && (
        <div className="modal-backdrop" onClick={() => { setShowStatsReport(false); }}>
          <div className="modal-content stats-report-modal" onClick={e => e.stopPropagation()}>
            <div className="stats-report-icon">📊</div>
            <h3 className="modal-title">本局统计报告</h3>
            <div className="stats-report-grid">
              <div className="stats-report-item">
                <span className="stats-report-label">总操作次数</span>
                <span className="stats-report-value">{finalStats.totalMoves}</span>
              </div>
              <div className="stats-report-item">
                <span className="stats-report-label">有效移动率</span>
                <span className="stats-report-value">{(getValidMoveRate(finalStats) * 100).toFixed(1)}%</span>
              </div>
              <div className="stats-report-item">
                <span className="stats-report-label">总计合并</span>
                <span className="stats-report-value">{finalStats.totalMerges}</span>
              </div>
              <div className="stats-report-item">
                <span className="stats-report-label">最快间隔</span>
                <span className="stats-report-value">{finalStats.fastestInterval === Infinity ? '-' : `${Math.round(finalStats.fastestInterval)}ms`}</span>
              </div>
              <div className="stats-report-item">
                <span className="stats-report-label">游戏时长</span>
                <span className="stats-report-value">{formatDuration(getSessionDuration(finalStats))}</span>
              </div>
              <div className="stats-report-item">
                <span className="stats-report-label">最高方块</span>
                <span className="stats-report-value">Lv.{finalMaxLevel}</span>
              </div>
            </div>
            {playerType && (
              <div className="stats-report-player-type">
                <span className="player-type-emoji">{playerType.emoji}</span>
                <span className="player-type-label">{playerType.label}</span>
                <span className="player-type-desc">{playerType.description}</span>
              </div>
            )}
            {finalNewAchievements.length > 0 && (
              <div className="stats-report-achievements">
                <span className="stats-report-achievements-title">🏅 本局解锁：</span>
                {finalNewAchievements.map(a => (
                  <span key={a.id} className="stats-report-achievement-badge">{a.emoji} {a.name}</span>
                ))}
              </div>
            )}
            <button className="modal-btn confirm-btn" style={{ marginTop: 16 }} onClick={() => { setShowStatsReport(false); resetGame(); }}>
              🔄 再来一局
            </button>
          </div>
        </div>
      )}

      {/* 随机模式结果弹窗 */}
      {showRandomResult && selectedRandomMode && (
        <div className="modal-backdrop" onClick={cancelRandomMode}>
          <div className="modal-content random-result-modal" onClick={e => e.stopPropagation()}>
            <div className="random-result-icon">🎉</div>
            <h3 className="modal-title">🎲 抽中了！</h3>
            <div className="random-result-mode">
              <span className="random-result-emoji">{modeConfigs[selectedRandomMode].emoji}</span>
              <span className="random-result-name">{modeConfigs[selectedRandomMode].name}</span>
            </div>
            <p className="random-result-desc">{modeConfigs[selectedRandomMode].description}</p>
            <div className="modal-buttons">
              <button className="modal-btn cancel-btn" onClick={cancelRandomMode}>重新抽取</button>
              <button className="modal-btn confirm-btn" onClick={confirmRandomMode}>开始游戏</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 主应用组件
function App() {
  return (
    <ErrorBoundary>
      <GameContent />
      <Onboarding onClose={() => {}} />
    </ErrorBoundary>
  );
}

export default App;
