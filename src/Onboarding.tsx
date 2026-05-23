// 首次引导提示组件

import { useState, useEffect } from 'react';

interface OnboardingProps {
  onClose: () => void;
}

const steps = [
  {
    icon: '🎮',
    title: '欢迎来到多模式 2048！',
    desc: '这是一款融合经典玩法与创意模式的益智游戏',
  },
  {
    icon: '⌨️',
    title: '基础操作',
    desc: '使用键盘方向键 ↑↓←→ 或手指滑动屏幕来移动方块',
  },
  {
    icon: '🔄',
    title: '合并规则',
    desc: '相同数字/图案的方块碰撞时会合并，目标是合成最高等级',
  },
  {
    icon: '🎯',
    title: '多种模式',
    desc: '经典模式计分数，水果/动物模式计回合，还有随机模式等你探索',
  },
  {
    icon: '💡',
    title: '策略提示',
    desc: '点击"💡 策略"按钮获取游戏技巧，帮你更快通关',
  },
  {
    icon: '🏆',
    title: '开始挑战吧！',
    desc: '收集勋章，刷新纪录，成为 2048 大师！',
  },
];

export function Onboarding({ onClose }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 检查是否首次访问
    const hasSeenOnboarding = localStorage.getItem('multi-mode-2048-onboarding');
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    localStorage.setItem('multi-mode-2048-onboarding', 'true');
    setIsVisible(false);
    onClose();
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        {/* 进度指示器 */}
        <div className="onboarding-progress">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`onboarding-dot ${index === currentStep ? 'active' : ''} ${
                index < currentStep ? 'completed' : ''
              }`}
            />
          ))}
        </div>

        {/* 内容 */}
        <div className="onboarding-content">
          <div className="onboarding-icon">{step.icon}</div>
          <h3 className="onboarding-title">{step.title}</h3>
          <p className="onboarding-desc">{step.desc}</p>
        </div>

        {/* 按钮 */}
        <div className="onboarding-actions">
          <button className="onboarding-btn skip" onClick={handleSkip}>
            跳过
          </button>
          <button className="onboarding-btn next" onClick={handleNext}>
            {currentStep === steps.length - 1 ? '开始游戏 🎮' : '下一步 →'}
          </button>
        </div>

        {/* 步骤计数 */}
        <div className="onboarding-step-count">
          {currentStep + 1} / {steps.length}
        </div>
      </div>
    </div>
  );
}
