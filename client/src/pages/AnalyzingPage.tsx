/**
 * 分析过程页
 * 星盘计算动画 + 步骤进度提示
 */
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateChart } from '@/lib/astro/chart';
import { assessWealth } from '@/lib/wealth/assessment';

const STEPS = [
  '正在计算儒略日...',
  '正在定位恒星时与黄赤交角...',
  '正在计算上升点与中天...',
  '正在推算行星位置...',
  '正在分析行星相位...',
  '正在映射星座与宫位...',
  '正在评估财富征象...',
  '正在生成财富格局报告...',
];

export default function AnalyzingPage() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const birthDataStr = sessionStorage.getItem('birthData');
    if (!birthDataStr) {
      navigate('/input');
      return;
    }

    // Animate through steps
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 400);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 100) return prev + 1.5;
        return 100;
      });
    }, 40);

    // Perform actual calculation
    const timer = setTimeout(() => {
      try {
        const birthData = JSON.parse(birthDataStr);
        const chart = calculateChart(
          birthData.year, birthData.month, birthData.day,
          birthData.hour, birthData.minute,
          birthData.latitude, birthData.longitude,
          birthData.city, birthData.timezone
        );
        const assessment = assessWealth(chart);

        sessionStorage.setItem('chartData', JSON.stringify(chart));
        sessionStorage.setItem('assessmentData', JSON.stringify(assessment));

        navigate('/result');
      } catch (err) {
        console.error('Calculation error:', err);
        navigate('/input');
      }
    }, 3500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#1c1f26] text-[#e0d5c1] flex items-center justify-center">
      <div className="text-center max-w-lg px-6">
        {/* Spinning astrolabe animation */}
        <motion.div
          className="w-40 h-40 mx-auto mb-12 relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          {/* Outer ring */}
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="90" fill="none" stroke="#b8963e" strokeWidth="0.5" opacity="0.3" />
            <circle cx="100" cy="100" r="75" fill="none" stroke="#b8963e" strokeWidth="0.5" opacity="0.2" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="#b8963e" strokeWidth="0.5" opacity="0.15" />
            {/* Zodiac markers */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 - 90) * Math.PI / 180;
              const x1 = 100 + 85 * Math.cos(angle);
              const y1 = 100 + 85 * Math.sin(angle);
              const x2 = 100 + 95 * Math.cos(angle);
              const y2 = 100 + 95 * Math.sin(angle);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#b8963e" strokeWidth="1" opacity="0.4" />;
            })}
            {/* Cross lines */}
            <line x1="100" y1="10" x2="100" y2="190" stroke="#b8963e" strokeWidth="0.3" opacity="0.15" />
            <line x1="10" y1="100" x2="190" y2="100" stroke="#b8963e" strokeWidth="0.3" opacity="0.15" />
            {/* Center dot */}
            <circle cx="100" cy="100" r="3" fill="#b8963e" opacity="0.6" />
          </svg>
          {/* Pulsing glow */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ boxShadow: ['0 0 20px rgba(184,150,62,0.1)', '0 0 40px rgba(184,150,62,0.2)', '0 0 20px rgba(184,150,62,0.1)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Step text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-[#b8963e] text-base mb-8 tracking-wider"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {STEPS[currentStep]}
          </motion.p>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="w-full max-w-xs mx-auto">
          <div className="h-px bg-[#b8963e]/10 relative overflow-hidden">
            <motion.div
              className="h-full bg-[#b8963e]/60"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-[#6b6358] text-xs mt-3">
            {Math.min(Math.round(progress), 100)}%
          </p>
        </div>
      </div>
    </div>
  );
}
