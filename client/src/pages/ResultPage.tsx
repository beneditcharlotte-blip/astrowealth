/**
 * 结果报告页
 * 展示完整的星盘财富格局分析报告
 * - 综合报告：LLM 动态生成个性化文案
 * - 六步详析：产品化用户友好展示
 */
import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartData } from '@/lib/astro/chart';
import { WealthAssessment } from '@/lib/wealth/assessment';
import ChartWheel from '@/components/ChartWheel';
import { trpc } from '@/lib/trpc';
import { Streamdown } from 'streamdown';

const GRADE_COLORS: Record<string, string> = {
  'A10': '#d4a843',
  'A9': '#c49a3e',
  'A8': '#b8963e',
  'A7': '#9a8050',
  'A6': '#7a6a50',
};

// 六步详析的图标和颜色配置
const STEP_CONFIG = [
  { icon: '🏛', color: '#d4a843', label: '财富宫位', subtitle: '正财宫与偏财宫的能量分布' },
  { icon: '⚡', color: '#c49a3e', label: '先天能量', subtitle: '财富征象星的先天状态强度' },
  { icon: '🔗', color: '#b8963e', label: '相位网络', subtitle: '财富流动的顺畅度与障碍' },
  { icon: '🧭', color: '#9a8050', label: '实现领域', subtitle: '财富在哪些生活领域显现' },
  { icon: '🚀', color: '#7a8a5c', label: '事业联动', subtitle: '职业发展与财富增长的关系' },
  { icon: '🌟', color: '#d4a843', label: '综合定性', subtitle: '整合五步分析的最终结论' },
];

export default function ResultPage() {
  const [, navigate] = useLocation();
  const [chart, setChart] = useState<ChartData | null>(null);
  const [assessment, setAssessment] = useState<WealthAssessment | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'chart' | 'detail' | 'planets'>('overview');

  useEffect(() => {
    try {
      const chartStr = sessionStorage.getItem('chartData');
      const assessStr = sessionStorage.getItem('assessmentData');
      if (!chartStr || !assessStr) { navigate('/input'); return; }
      setChart(JSON.parse(chartStr));
      setAssessment(JSON.parse(assessStr));
    } catch { navigate('/input'); }
  }, [navigate]);

  if (!chart || !assessment) return null;

  const gradeColor = GRADE_COLORS[assessment.grade] || '#b8963e';

  return (
    <div className="min-h-screen bg-[#1c1f26] text-[#e0d5c1]">
      {/* Header */}
      <header className="border-b border-[#b8963e]/10">
        <div className="container max-w-6xl flex items-center justify-between py-4">
          <button
            onClick={() => navigate('/')}
            className="text-[#8a8070] hover:text-[#b8963e] transition-colors text-sm flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            首页
          </button>
          <h1 className="text-lg text-[#b8963e] tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
            星盘财富格局报告
          </h1>
          <button
            onClick={() => navigate('/input')}
            className="text-[#8a8070] hover:text-[#b8963e] transition-colors text-sm"
          >
            重新测试
          </button>
        </div>
      </header>

      {/* Grade Hero */}
      <section className="py-12 border-b border-[#b8963e]/10">
        <div className="container max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#8a8070] text-sm mb-2">
              {chart.birthInfo.city} · {chart.birthInfo.year}年{chart.birthInfo.month}月{chart.birthInfo.day}日 {String(chart.birthInfo.hour).padStart(2, '0')}:{String(chart.birthInfo.minute).padStart(2, '0')}
            </p>
            <p className="text-[#b8963e]/60 text-xs mb-6 tracking-wider">
              上升{chart.ascSign.sign.nameCn} · 中天{chart.mcSign.sign.nameCn}
            </p>

            {/* Grade Badge */}
            <div className="relative inline-block mb-6">
              <div
                className="text-7xl md:text-8xl font-bold tracking-wider"
                style={{ fontFamily: 'var(--font-display)', color: gradeColor }}
              >
                {assessment.gradeLabel}
              </div>
              <div className="text-xl mt-2 tracking-[0.3em]" style={{ color: gradeColor, fontFamily: 'var(--font-display)' }}>
                {assessment.gradeName}
              </div>
            </div>

            <p className="text-[#a09882] max-w-xl mx-auto text-sm leading-relaxed">
              {assessment.gradeDescription}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tab Navigation */}
      <nav className="border-b border-[#b8963e]/10 sticky top-0 bg-[#1c1f26]/95 backdrop-blur z-10">
        <div className="container max-w-4xl flex gap-0">
          {([
            { key: 'overview', label: '综合报告' },
            { key: 'chart', label: '星盘图' },
            { key: 'detail', label: '六步详析' },
            { key: 'planets', label: '行星总览' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3.5 text-sm tracking-wider transition-colors relative ${
                activeTab === tab.key
                  ? 'text-[#b8963e]'
                  : 'text-[#8a8070] hover:text-[#e0d5c1]'
              }`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-px bg-[#b8963e]"
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Tab Content */}
      <main className="container max-w-4xl py-10">
        {activeTab === 'overview' && <OverviewTab chart={chart} assessment={assessment} />}
        {activeTab === 'chart' && <ChartTab chart={chart} />}
        {activeTab === 'detail' && <DetailTab assessment={assessment} />}
        {activeTab === 'planets' && <PlanetsTab chart={chart} />}
      </main>

      {/* Disclaimer */}
      <footer className="py-8 border-t border-[#b8963e]/10">
        <div className="container max-w-4xl">
          <p className="text-[#6b6358] text-xs text-center leading-relaxed">
            {assessment.disclaimer}
          </p>
        </div>
      </footer>
    </div>
  );
}

// ========== Overview Tab (LLM 生成) ==========
function OverviewTab({ chart, assessment }: { chart: ChartData; assessment: WealthAssessment }) {
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMutation = trpc.wealth.generateReport.useMutation({
    onSuccess: (data) => {
      setReport(data.report);
      setIsGenerating(false);
      // 缓存到 sessionStorage
      sessionStorage.setItem('llmReport', data.report);
    },
    onError: (err) => {
      setError('报告生成失败，请稍后重试');
      setIsGenerating(false);
      console.error('LLM error:', err);
    },
  });

  const generateReport = useCallback(() => {
    // 检查缓存
    const cached = sessionStorage.getItem('llmReport');
    if (cached) {
      setReport(cached);
      return;
    }

    setIsGenerating(true);
    setError(null);

    // 构建摘要数据
    const step1Summary = `${assessment.step1.house2.description} ${assessment.step1.house8.description}`;
    const step2Summary = `整体先天强度：${assessment.step2.overallStrengthCn}。${assessment.step2.dignities.map(d => `${d.planet.nameCn}${d.statusCn}`).join('，')}`;
    const step3Summary = `${assessment.step3.wealthNetwork} 吉相位${assessment.step3.harmoniousAspects.length}个，挑战相位${assessment.step3.challengingAspects.length}个`;
    const step4Summary = [assessment.step4.house2RulerFlyIn, assessment.step4.venusFlyIn, assessment.step4.jupiterFlyIn, assessment.step4.moonFlyIn]
      .map(f => `${f.planetNameCn}飞入第${f.house}宫（${f.quality}）`).join('；');
    const step5Summary = `${assessment.step5.mcAnalysis} ${assessment.step5.careerWealth}`;

    const keyPlanets = assessment.step1.keyPlanets.map(kp => ({
      name: kp.planet.nameCn,
      sign: kp.planet.sign.nameCn,
      house: kp.planet.house,
      dignity: kp.planet.dignityCn,
      role: kp.role,
    }));

    generateMutation.mutate({
      birthInfo: {
        city: chart.birthInfo.city,
        year: chart.birthInfo.year,
        month: chart.birthInfo.month,
        day: chart.birthInfo.day,
        hour: chart.birthInfo.hour,
        minute: chart.birthInfo.minute,
      },
      grade: assessment.grade,
      gradeLabel: assessment.gradeLabel,
      gradeName: assessment.gradeName,
      totalScore: assessment.totalScore,
      ascSign: chart.ascSign.sign.nameCn,
      mcSign: chart.mcSign.sign.nameCn,
      step1Summary,
      step2Summary,
      step3Summary,
      step4Summary,
      step5Summary,
      strengths: assessment.step6.strengths,
      challenges: assessment.step6.challenges,
      keyPlanets,
      scores: {
        step1: assessment.step1.score,
        step2: assessment.step2.score,
        step3: assessment.step3.score,
        step4: assessment.step4.score,
        step5: assessment.step5.score,
      },
    });
  }, [chart, assessment, generateMutation]);

  useEffect(() => {
    generateReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-10">
      {/* Score Overview */}
      <Section title="各维度评分">
        <div className="space-y-4">
          {[
            { label: '核心财富征象', score: assessment.step1.score, icon: '🏛' },
            { label: '先天状态强度', score: assessment.step2.score, icon: '⚡' },
            { label: '相位联动网络', score: assessment.step3.score, icon: '🔗' },
            { label: '宫位系统配置', score: assessment.step4.score, icon: '🧭' },
            { label: '职业运势联动', score: assessment.step5.score, icon: '🚀' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-lg w-8 text-center">{item.icon}</span>
              <span className="text-sm text-[#8a8070] w-28 flex-shrink-0">{item.label}</span>
              <div className="flex-1 h-2 bg-[#252830] relative overflow-hidden rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${item.score >= 70 ? '#7a8a5c' : item.score >= 40 ? '#b8963e' : '#c47830'}, ${item.score >= 70 ? '#7a8a5c80' : item.score >= 40 ? '#b8963e80' : '#c4783080'})`,
                  }}
                />
              </div>
              <span className="text-sm text-[#b8963e] w-10 text-right font-medium">{item.score}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* LLM Generated Report */}
      <Section title="个性化深度报告">
        {isGenerating && (
          <div className="flex flex-col items-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 mb-6"
            >
              <svg viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" stroke="#b8963e" strokeWidth="1" opacity="0.2" />
                <path d="M24 4a20 20 0 0 1 20 20" stroke="#b8963e" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </motion.div>
            <p className="text-[#b8963e] text-sm tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
              正在为你生成个性化报告...
            </p>
            <p className="text-[#6b6358] text-xs mt-2">
              AI 正在分析你的星盘数据，请稍候
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-[#c47830] text-sm mb-4">{error}</p>
            <button
              onClick={() => {
                sessionStorage.removeItem('llmReport');
                setReport(null);
                setError(null);
                generateReport();
              }}
              className="px-6 py-2 border border-[#b8963e]/40 text-[#b8963e] text-sm hover:bg-[#b8963e]/10 transition-colors"
            >
              重新生成
            </button>
          </div>
        )}

        {report && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="prose prose-invert max-w-none"
          >
            <div className="text-[#a09882] leading-relaxed text-sm [&_h2]:text-[#e8dcc8] [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:tracking-wider [&_h2]:border-l-2 [&_h2]:border-[#b8963e]/40 [&_h2]:pl-3 [&_strong]:text-[#e0d5c1] [&_ul]:space-y-2 [&_li]:text-[#a09882] [&_p]:mb-4">
              <Streamdown>{report}</Streamdown>
            </div>
            <div className="mt-6 pt-4 border-t border-[#b8963e]/10 flex justify-end">
              <button
                onClick={() => {
                  sessionStorage.removeItem('llmReport');
                  setReport(null);
                  generateReport();
                }}
                className="px-4 py-1.5 border border-[#b8963e]/30 text-[#b8963e] text-xs hover:bg-[#b8963e]/10 transition-colors flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7a6 6 0 0 1 11.2-3M13 7a6 6 0 0 1-11.2 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M12.2 1v3h-3M1.8 13v-3h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                重新生成
              </button>
            </div>
          </motion.div>
        )}
      </Section>
    </div>
  );
}

// ========== Chart Tab ==========
function ChartTab({ chart }: { chart: ChartData }) {
  const [chartSize, setChartSize] = useState(500);

  useEffect(() => {
    const updateSize = () => {
      const w = Math.min(window.innerWidth - 64, 600);
      setChartSize(w);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8">
        <ChartWheel chart={chart} size={chartSize} />
      </div>
      <div className="text-center text-[#8a8070] text-xs space-y-1">
        <p>上升点（ASC）：{chart.ascSign.sign.nameCn} {chart.ascSign.degree}° {chart.ascSign.minute}'</p>
        <p>中天（MC）：{chart.mcSign.sign.nameCn} {chart.mcSign.degree}° {chart.mcSign.minute}'</p>
      </div>
    </div>
  );
}

// ========== Detail Tab (产品化重做) ==========
function DetailTab({ assessment }: { assessment: WealthAssessment }) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const toggleStep = (step: number) => {
    setExpandedStep(expandedStep === step ? null : step);
  };

  // 将各步骤的核心结论提取为用户友好的"洞察"
  const stepInsights = [
    {
      score: assessment.step1.score,
      headline: getStep1Headline(assessment),
      insights: getStep1Insights(assessment),
    },
    {
      score: assessment.step2.score,
      headline: getStep2Headline(assessment),
      insights: getStep2Insights(assessment),
    },
    {
      score: assessment.step3.score,
      headline: getStep3Headline(assessment),
      insights: getStep3Insights(assessment),
    },
    {
      score: assessment.step4.score,
      headline: getStep4Headline(assessment),
      insights: getStep4Insights(assessment),
    },
    {
      score: assessment.step5.score,
      headline: getStep5Headline(assessment),
      insights: getStep5Insights(assessment),
    },
    {
      score: assessment.totalScore,
      headline: `财富格局等级 ${assessment.gradeLabel}`,
      insights: [
        { label: '综合评语', value: assessment.step6.summary, type: 'text' as const },
        ...assessment.step6.strengths.map(s => ({ label: '优势', value: s, type: 'positive' as const })),
        ...assessment.step6.challenges.map(c => ({ label: '关注', value: c, type: 'warning' as const })),
        ...assessment.step6.advice.map(a => ({ label: '建议', value: a, type: 'advice' as const })),
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* 总览卡片 */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
        {STEP_CONFIG.map((step, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => toggleStep(i)}
            className={`p-3 border text-center transition-all duration-200 ${
              expandedStep === i
                ? 'border-[#b8963e]/40 bg-[#b8963e]/10'
                : 'border-[#b8963e]/10 bg-[#252830]/50 hover:border-[#b8963e]/25'
            }`}
          >
            <div className="text-2xl mb-1">{step.icon}</div>
            <div className="text-xs text-[#e0d5c1] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              {step.label}
            </div>
            <div className="text-lg font-bold" style={{ color: step.color, fontFamily: 'var(--font-display)' }}>
              {stepInsights[i].score}
            </div>
          </motion.button>
        ))}
      </div>

      {/* 展开的详情 */}
      <AnimatePresence mode="wait">
        {expandedStep !== null && (
          <motion.div
            key={expandedStep}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <StepDetailCard
              stepIndex={expandedStep}
              config={STEP_CONFIG[expandedStep]}
              data={stepInsights[expandedStep]}
              onClose={() => setExpandedStep(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 步骤时间线 */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-5 bg-[#b8963e]/40" />
          <h3 className="text-lg text-[#e8dcc8] tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
            分析流程
          </h3>
        </div>
        <div className="relative">
          {/* 时间线竖线 */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-[#b8963e]/30 via-[#b8963e]/20 to-transparent" />

          {STEP_CONFIG.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative pl-12 pb-8 last:pb-0 cursor-pointer group"
              onClick={() => toggleStep(i)}
            >
              {/* 时间线节点 */}
              <div
                className={`absolute left-2 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  expandedStep === i
                    ? 'border-[#b8963e] bg-[#b8963e]/20'
                    : 'border-[#b8963e]/30 bg-[#1c1f26] group-hover:border-[#b8963e]/60'
                }`}
              >
                <div className={`w-2 h-2 rounded-full transition-colors ${
                  expandedStep === i ? 'bg-[#b8963e]' : 'bg-[#b8963e]/30'
                }`} />
              </div>

              {/* 内容 */}
              <div className={`p-4 border transition-all duration-200 ${
                expandedStep === i
                  ? 'border-[#b8963e]/30 bg-[#b8963e]/5'
                  : 'border-[#b8963e]/10 bg-[#252830]/30 group-hover:border-[#b8963e]/20'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{step.icon}</span>
                    <div>
                      <span className="text-xs text-[#b8963e]/60 tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                        STEP {String(i + 1).padStart(2, '0')}
                      </span>
                      <h4 className="text-sm text-[#e8dcc8] font-medium" style={{ fontFamily: 'var(--font-display)' }}>
                        {step.label}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ScoreBadge score={stepInsights[i].score} />
                    <svg
                      width="16" height="16" viewBox="0 0 16 16" fill="none"
                      className={`text-[#8a8070] transition-transform ${expandedStep === i ? 'rotate-180' : ''}`}
                    >
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-[#8a8070] ml-9">{step.subtitle}</p>
                
                {/* 核心结论预览 */}
                <p className="text-xs text-[#a09882] mt-2 ml-9 line-clamp-1">
                  {stepInsights[i].headline}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== 步骤详情卡片 ==========
function StepDetailCard({
  stepIndex,
  config,
  data,
  onClose,
}: {
  stepIndex: number;
  config: typeof STEP_CONFIG[0];
  data: { score: number; headline: string; insights: Array<{ label: string; value: string; type: string }> };
  onClose: () => void;
}) {
  return (
    <div className="border border-[#b8963e]/20 bg-[#252830]/60 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <span className="text-xs text-[#b8963e]/60 tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
              STEP {String(stepIndex + 1).padStart(2, '0')}
            </span>
            <h3 className="text-lg text-[#e8dcc8]" style={{ fontFamily: 'var(--font-display)' }}>
              {config.label}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ScoreBadge score={data.score} size="lg" />
          <button onClick={onClose} className="text-[#8a8070] hover:text-[#b8963e] transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Headline */}
      <div className="p-3 border border-[#b8963e]/15 bg-[#b8963e]/5 mb-4">
        <p className="text-sm text-[#e0d5c1]">{data.headline}</p>
      </div>

      {/* Insights */}
      <div className="space-y-3">
        {data.insights.map((insight, i) => (
          <div key={i} className="flex gap-3">
            <span className={`mt-1 flex-shrink-0 text-xs ${
              insight.type === 'positive' ? 'text-[#7a8a5c]' :
              insight.type === 'warning' ? 'text-[#c47830]' :
              insight.type === 'advice' ? 'text-[#b8963e]' :
              'text-[#8a8070]'
            }`}>
              {insight.type === 'positive' ? '◆' :
               insight.type === 'warning' ? '◇' :
               insight.type === 'advice' ? '→' : '·'}
            </span>
            <div>
              <span className={`text-xs font-medium mr-2 ${
                insight.type === 'positive' ? 'text-[#7a8a5c]' :
                insight.type === 'warning' ? 'text-[#c47830]' :
                insight.type === 'advice' ? 'text-[#b8963e]' :
                'text-[#8a8070]'
              }`}>
                {insight.label}
              </span>
              <span className="text-sm text-[#a09882] leading-relaxed">{insight.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== Score Badge ==========
function ScoreBadge({ score, size = 'sm' }: { score: number; size?: 'sm' | 'lg' }) {
  const color = score >= 70 ? '#7a8a5c' : score >= 40 ? '#b8963e' : '#c47830';
  const sizeClass = size === 'lg' ? 'text-xl px-3 py-1' : 'text-xs px-2 py-0.5';
  return (
    <span
      className={`border font-medium ${sizeClass}`}
      style={{ borderColor: `${color}40`, color, fontFamily: 'var(--font-display)' }}
    >
      {score}
    </span>
  );
}

// ========== Planets Tab ==========
function PlanetsTab({ chart }: { chart: ChartData }) {
  return (
    <div>
      <Section title="行星状态总览">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#b8963e]/15">
                <th className="text-left py-3 px-2 text-[#b8963e] font-normal tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>天体</th>
                <th className="text-left py-3 px-2 text-[#b8963e] font-normal tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>星座</th>
                <th className="text-left py-3 px-2 text-[#b8963e] font-normal tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>度数</th>
                <th className="text-left py-3 px-2 text-[#b8963e] font-normal tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>宫位</th>
                <th className="text-left py-3 px-2 text-[#b8963e] font-normal tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>状态</th>
                <th className="text-left py-3 px-2 text-[#b8963e] font-normal tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>逆行</th>
              </tr>
            </thead>
            <tbody>
              {chart.planets.map((planet, i) => (
                <tr key={i} className="border-b border-[#b8963e]/5 hover:bg-[#b8963e]/5 transition-colors">
                  <td className="py-2.5 px-2">
                    <span className="text-lg mr-2">{planet.symbol}</span>
                    <span className="text-[#e0d5c1]">{planet.nameCn}</span>
                  </td>
                  <td className="py-2.5 px-2 text-[#a09882]">
                    {planet.sign.symbol} {planet.sign.nameCn}
                  </td>
                  <td className="py-2.5 px-2 text-[#8a8070]">
                    {planet.signDegree}° {planet.signMinute}'
                  </td>
                  <td className="py-2.5 px-2 text-[#a09882]">
                    第{planet.house}宫
                  </td>
                  <td className="py-2.5 px-2">
                    <span className={
                      planet.dignity === 'domicile' || planet.dignity === 'exaltation'
                        ? 'text-[#7a8a5c]'
                        : planet.dignity === 'detriment' || planet.dignity === 'fall'
                        ? 'text-[#c47830]'
                        : 'text-[#8a8070]'
                    }>
                      {planet.dignityCn}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-[#8a8070]">
                    {planet.retrograde ? <span className="text-[#c47830]">℞</span> : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* House Cusps */}
      <div className="mt-10">
        <Section title="宫头位置">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {chart.houses.cusps.map((cusp, i) => {
              const signIndex = Math.floor((cusp % 360) / 30);
              const signs = ['♈白羊', '♉金牛', '♊双子', '♋巨蟹', '♌狮子', '♍处女', '♎天秤', '♏天蝎', '♐射手', '♑摩羯', '♒水瓶', '♓双鱼'];
              const deg = Math.floor(cusp % 30);
              return (
                <div key={i} className="p-3 border border-[#b8963e]/10 bg-[#252830]/50 text-sm">
                  <span className="text-[#b8963e]" style={{ fontFamily: 'var(--font-display)' }}>
                    第{i + 1}宫
                  </span>
                  <span className="text-[#8a8070] ml-2">
                    {signs[signIndex]} {deg}°
                  </span>
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}

// ========== Shared Components ==========
function Section({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-[#b8963e]/40" />
          <h3 className="text-lg text-[#e8dcc8] tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
            {title}
          </h3>
        </div>
        {badge && (
          <span className="text-xs text-[#b8963e] border border-[#b8963e]/20 px-2 py-0.5">
            {badge}
          </span>
        )}
      </div>
      <div>{children}</div>
    </motion.div>
  );
}

// ========== 洞察提取辅助函数 ==========

function getStep1Headline(a: WealthAssessment): string {
  const h2Planets = a.step1.house2.planetsInHouse;
  const h8Planets = a.step1.house8.planetsInHouse;
  const beneficsIn2 = h2Planets.filter(p => ['Venus', 'Jupiter'].includes(p.name));
  if (beneficsIn2.length > 0) return `正财宫有${beneficsIn2.map(p => p.nameCn).join('、')}等吉星落入，个人财富基础扎实`;
  if (h2Planets.length > 0) return `正财宫有${h2Planets.map(p => p.nameCn).join('、')}落入，为财富增添特殊能量`;
  return `正财宫宫头${a.step1.house2.cuspSignCn}，财富表现取决于宫主星状态`;
}

function getStep1Insights(a: WealthAssessment): Array<{ label: string; value: string; type: string }> {
  return [
    { label: '正财宫', value: a.step1.house2.description, type: 'text' },
    { label: '偏财宫', value: a.step1.house8.description, type: 'text' },
    ...a.step1.keyPlanets.map(kp => ({
      label: kp.role,
      value: kp.description,
      type: kp.planet.dignity === 'domicile' || kp.planet.dignity === 'exaltation' ? 'positive' : 
            kp.planet.dignity === 'detriment' || kp.planet.dignity === 'fall' ? 'warning' : 'text',
    })),
  ];
}

function getStep2Headline(a: WealthAssessment): string {
  return `整体先天强度：${a.step2.overallStrengthCn}`;
}

function getStep2Insights(a: WealthAssessment): Array<{ label: string; value: string; type: string }> {
  return a.step2.dignities.map(d => ({
    label: `${d.planet.nameCn}（${d.role}）`,
    value: d.description,
    type: d.status === 'domicile' || d.status === 'exaltation' ? 'positive' :
          d.status === 'detriment' || d.status === 'fall' ? 'warning' : 'text',
  }));
}

function getStep3Headline(a: WealthAssessment): string {
  const h = a.step3.harmoniousAspects.length;
  const c = a.step3.challengingAspects.length;
  if (h > c) return `吉相位${h}个，挑战相位${c}个，财富流动整体顺畅`;
  if (c > h) return `挑战相位${c}个较多，财富积累需克服一定障碍`;
  return `吉凶相位均衡（各${h}个），财富发展稳中有变`;
}

function getStep3Insights(a: WealthAssessment): Array<{ label: string; value: string; type: string }> {
  return [
    { label: '财富网络', value: a.step3.wealthNetwork, type: 'text' },
    ...a.step3.harmoniousAspects.map(asp => ({
      label: '吉相位',
      value: asp.description,
      type: 'positive',
    })),
    ...a.step3.challengingAspects.map(asp => ({
      label: '挑战相位',
      value: asp.description,
      type: 'warning',
    })),
  ];
}

function getStep4Headline(a: WealthAssessment): string {
  const excellent = [a.step4.house2RulerFlyIn, a.step4.venusFlyIn, a.step4.jupiterFlyIn, a.step4.moonFlyIn]
    .filter(f => f.quality === 'excellent');
  if (excellent.length > 0) return `${excellent.map(f => f.planetNameCn).join('、')}飞入优质宫位，财富实现路径清晰`;
  return '财星分布在不同宫位，财富来源多元化';
}

function getStep4Insights(a: WealthAssessment): Array<{ label: string; value: string; type: string }> {
  return [a.step4.house2RulerFlyIn, a.step4.venusFlyIn, a.step4.jupiterFlyIn, a.step4.moonFlyIn].map(fi => ({
    label: fi.planetNameCn,
    value: fi.description,
    type: fi.quality === 'excellent' ? 'positive' : fi.quality === 'challenging' ? 'warning' : 'text',
  }));
}

function getStep5Headline(a: WealthAssessment): string {
  return a.step5.careerWealth.slice(0, 50) + (a.step5.careerWealth.length > 50 ? '...' : '');
}

function getStep5Insights(a: WealthAssessment): Array<{ label: string; value: string; type: string }> {
  return [
    { label: '中天分析', value: a.step5.mcAnalysis, type: 'text' },
    { label: '事业联动', value: a.step5.careerWealth, type: 'text' },
    { label: '木星周期', value: a.step5.jupiterTransits, type: 'advice' },
    { label: '土星周期', value: a.step5.saturnTransits, type: 'warning' },
  ];
}
