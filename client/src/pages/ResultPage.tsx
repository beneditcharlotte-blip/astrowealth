/**
 * 结果报告页
 * - 综合报告：LLM 按人生阶段时间表生成
 * - 六步详析：通俗易懂的用户友好展示（无占星术语）
 */
import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartData } from '@/lib/astro/chart';
import { WealthAssessment } from '@/lib/wealth/assessment';
import { trpc } from '@/lib/trpc';
import { Streamdown } from 'streamdown';

const GRADE_COLORS: Record<string, string> = {
  'A10': '#d4a843',
  'A9': '#c49a3e',
  'A8': '#b8963e',
  'A7': '#9a8050',
  'A6': '#7a6a50',
};

// 六步详析 — 用户友好的标题和描述（无占星术语）
const USER_FRIENDLY_STEPS = [
  {
    icon: '💰',
    title: '你的赚钱天赋',
    subtitle: '你天生擅长通过什么方式赚钱',
    color: '#d4a843',
  },
  {
    icon: '🔋',
    title: '你的财富能量',
    subtitle: '你的赚钱潜力有多大',
    color: '#c49a3e',
  },
  {
    icon: '🌊',
    title: '你的财运流动',
    subtitle: '钱来钱去的顺畅程度',
    color: '#b8963e',
  },
  {
    icon: '🎯',
    title: '你的发财方向',
    subtitle: '在哪个领域最容易赚到钱',
    color: '#9a8050',
  },
  {
    icon: '📈',
    title: '你的事业财运',
    subtitle: '职业发展和收入增长的关系',
    color: '#7a8a5c',
  },
  {
    icon: '🏆',
    title: '你的财富总评',
    subtitle: '综合所有因素的最终结论',
    color: '#d4a843',
  },
];

export default function ResultPage() {
  const [, navigate] = useLocation();
  const [chart, setChart] = useState<ChartData | null>(null);
  const [assessment, setAssessment] = useState<WealthAssessment | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'detail'>('overview');

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
            你的财富分析报告
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
            <p className="text-[#8a8070] text-sm mb-4">
              {chart.birthInfo.city} · {chart.birthInfo.year}年{chart.birthInfo.month}月{chart.birthInfo.day}日 {String(chart.birthInfo.hour).padStart(2, '0')}:{String(chart.birthInfo.minute).padStart(2, '0')}
            </p>

            {/* Grade Badge */}
            <div className="relative inline-block mb-4">
              <div
                className="text-7xl md:text-8xl font-bold tracking-wider"
                style={{ fontFamily: 'var(--font-display)', color: gradeColor }}
              >
                {assessment.gradeLabel}
              </div>
              <div className="text-2xl mt-3 tracking-wider" style={{ color: gradeColor, fontFamily: 'var(--font-display)' }}>
                {assessment.gradeName}
              </div>
            </div>

            {/* Score Bar */}
            <div className="max-w-xs mx-auto mt-6 mb-4">
              <div className="flex justify-between text-xs text-[#8a8070] mb-1">
                <span>综合评分</span>
                <span style={{ color: gradeColor }}>{assessment.totalScore}/100</span>
              </div>
              <div className="h-2 bg-[#252830] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${assessment.totalScore}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${gradeColor}80, ${gradeColor})` }}
                />
              </div>
            </div>

            <p className="text-[#a09882] max-w-xl mx-auto text-sm leading-relaxed mt-4">
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
            { key: 'detail', label: '详细解读' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3.5 text-sm tracking-wider transition-colors relative ${
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
        {activeTab === 'detail' && <DetailTab chart={chart} assessment={assessment} />}
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

// ========== Overview Tab (LLM 按人生阶段生成) ==========
function OverviewTab({ chart, assessment }: { chart: ChartData; assessment: WealthAssessment }) {
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMutation = trpc.wealth.generateReport.useMutation({
    onSuccess: (data) => {
      setReport(data.report);
      setIsGenerating(false);
      sessionStorage.setItem('llmReport', data.report);
    },
    onError: (err) => {
      setError('报告生成失败，请稍后重试');
      setIsGenerating(false);
      console.error('LLM error:', err);
    },
  });

  const generateReport = useCallback(() => {
    const cached = sessionStorage.getItem('llmReport');
    if (cached) {
      setReport(cached);
      return;
    }

    setIsGenerating(true);
    setError(null);

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
      {/* Quick Summary Cards */}
      <div>
        <SectionTitle title="你的财富画像" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <QuickCard
            icon="💪"
            title="你的优势"
            items={assessment.step6.strengths}
            color="#7a8a5c"
          />
          <QuickCard
            icon="⚠️"
            title="需要注意"
            items={assessment.step6.challenges}
            color="#c47830"
          />
          <QuickCard
            icon="💡"
            title="行动建议"
            items={assessment.step6.advice}
            color="#b8963e"
          />
        </div>
      </div>

      {/* LLM Report */}
      <div>
        <div className="flex items-center justify-between">
          <SectionTitle title="你的人生财富时间表" />
          {report && (
            <button
              onClick={() => {
                sessionStorage.removeItem('llmReport');
                setReport(null);
                setIsGenerating(true);
                setError(null);
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
                  step1Summary: `${assessment.step1.house2.description} ${assessment.step1.house8.description}`,
                  step2Summary: `整体先天强度：${assessment.step2.overallStrengthCn}`,
                  step3Summary: `${assessment.step3.wealthNetwork}`,
                  step4Summary: '',
                  step5Summary: `${assessment.step5.mcAnalysis}`,
                  strengths: assessment.step6.strengths,
                  challenges: assessment.step6.challenges,
                  keyPlanets: assessment.step1.keyPlanets.map(kp => ({
                    name: kp.planet.nameCn,
                    sign: kp.planet.sign.nameCn,
                    house: kp.planet.house,
                    dignity: kp.planet.dignityCn,
                    role: kp.role,
                  })),
                  scores: {
                    step1: assessment.step1.score,
                    step2: assessment.step2.score,
                    step3: assessment.step3.score,
                    step4: assessment.step4.score,
                    step5: assessment.step5.score,
                  },
                });
              }}
              className="text-xs text-[#8a8070] hover:text-[#b8963e] transition-colors flex items-center gap-1"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7C1 3.68 3.68 1 7 1C10.32 1 13 3.68 13 7C13 10.32 10.32 13 7 13" stroke="currentColor" strokeWidth="1.2" />
                <path d="M1 7L3 9M1 7L3 5" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              重新生成
            </button>
          )}
        </div>

        <div className="mt-4 border border-[#b8963e]/15 bg-[#252830]/30 p-6 md:p-8">
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 border-2 border-[#b8963e]/20 border-t-[#b8963e] rounded-full mb-4"
              />
              <p className="text-[#8a8070] text-sm">正在为你生成个性化报告...</p>
              <p className="text-[#6b6358] text-xs mt-1">根据你的星盘数据，AI 正在分析每个人生阶段的财富趋势</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-[#c47830] text-sm mb-3">{error}</p>
              <button
                onClick={() => {
                  sessionStorage.removeItem('llmReport');
                  setReport(null);
                  generateReport();
                }}
                className="text-sm text-[#b8963e] border border-[#b8963e]/30 px-4 py-1.5 hover:bg-[#b8963e]/10 transition-colors"
              >
                点击重试
              </button>
            </div>
          )}

          {report && !isGenerating && (
            <div className="prose-custom">
              <Streamdown>{report}</Streamdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== Quick Card ==========
function QuickCard({ icon, title, items, color }: { icon: string; title: string; items: string[]; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 border border-[#b8963e]/10 bg-[#252830]/40"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h4 className="text-sm font-medium" style={{ color, fontFamily: 'var(--font-display)' }}>{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-[#a09882] leading-relaxed flex gap-2">
            <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: color }} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// ========== Detail Tab (六步详析 — 通俗版) ==========
function DetailTab({ chart, assessment }: { chart: ChartData; assessment: WealthAssessment }) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  // 将每一步的数据转化为通俗易懂的内容
  const stepContents = getPlainLanguageSteps(assessment);

  return (
    <div className="space-y-10">
      {/* 总览评分 */}
      <div>
        <SectionTitle title="六大维度评分" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {USER_FRIENDLY_STEPS.map((step, i) => {
            const score = stepContents[i].score;
            const scoreColor = score >= 70 ? '#7a8a5c' : score >= 40 ? '#b8963e' : '#c47830';
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                className="p-4 border border-[#b8963e]/10 bg-[#252830]/40 cursor-pointer hover:border-[#b8963e]/25 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{step.icon}</span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: scoreColor, fontFamily: 'var(--font-display)' }}
                  >
                    {score}
                  </span>
                </div>
                <h4 className="text-sm text-[#e8dcc8] font-medium mb-0.5">{step.title}</h4>
                <p className="text-xs text-[#8a8070]">{step.subtitle}</p>
                <div className="h-1.5 bg-[#1c1f26] rounded-full mt-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ background: scoreColor }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 详细解读 */}
      <div>
        <SectionTitle title="逐项解读" />
        <div className="space-y-3 mt-4">
          {USER_FRIENDLY_STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                className="w-full text-left p-4 border border-[#b8963e]/10 bg-[#252830]/30 hover:border-[#b8963e]/25 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{step.icon}</span>
                    <div>
                      <h4 className="text-sm text-[#e8dcc8] font-medium">{step.title}</h4>
                      <p className="text-xs text-[#8a8070] mt-0.5">{stepContents[i].oneLiner}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ScorePill score={stepContents[i].score} />
                    <svg
                      width="16" height="16" viewBox="0 0 16 16" fill="none"
                      className={`text-[#8a8070] transition-transform ${expandedStep === i ? 'rotate-180' : ''}`}
                    >
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {expandedStep === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 border border-t-0 border-[#b8963e]/10 bg-[#252830]/50">
                      {/* 核心结论 */}
                      <div className="p-3 border border-[#b8963e]/15 bg-[#b8963e]/5 mb-4">
                        <p className="text-sm text-[#e0d5c1] leading-relaxed">{stepContents[i].conclusion}</p>
                      </div>

                      {/* 要点列表 */}
                      <div className="space-y-3">
                        {stepContents[i].points.map((point, j) => (
                          <div key={j} className="flex gap-3">
                            <span className={`mt-0.5 text-sm flex-shrink-0 ${
                              point.type === 'good' ? 'text-[#7a8a5c]' :
                              point.type === 'caution' ? 'text-[#c47830]' :
                              'text-[#b8963e]'
                            }`}>
                              {point.type === 'good' ? '✓' : point.type === 'caution' ? '!' : '→'}
                            </span>
                            <p className="text-sm text-[#a09882] leading-relaxed">{point.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 综合总结 */}
      <div>
        <SectionTitle title="综合总结" />
        <div className="mt-4 p-6 border border-[#b8963e]/15 bg-[#252830]/40">
          <p className="text-sm text-[#e0d5c1] leading-relaxed">{assessment.step6.summary}</p>
        </div>
      </div>
    </div>
  );
}

// ========== Score Pill ==========
function ScorePill({ score }: { score: number }) {
  const color = score >= 70 ? '#7a8a5c' : score >= 40 ? '#b8963e' : '#c47830';
  return (
    <span
      className="text-xs px-2 py-0.5 border font-medium"
      style={{ borderColor: `${color}40`, color, fontFamily: 'var(--font-display)' }}
    >
      {score}分
    </span>
  );
}

// ========== Section Title ==========
function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-1 h-5 bg-[#b8963e]/40" />
      <h3 className="text-lg text-[#e8dcc8] tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
        {title}
      </h3>
    </div>
  );
}

// ========== 将分析数据转化为通俗语言 ==========
interface PlainStepContent {
  score: number;
  oneLiner: string;
  conclusion: string;
  points: Array<{ text: string; type: 'good' | 'caution' | 'tip' }>;
}

function getPlainLanguageSteps(a: WealthAssessment): PlainStepContent[] {
  return [
    getStep1Plain(a),
    getStep2Plain(a),
    getStep3Plain(a),
    getStep4Plain(a),
    getStep5Plain(a),
    getStep6Plain(a),
  ];
}

function getStep1Plain(a: WealthAssessment): PlainStepContent {
  const h2Planets = a.step1.house2.planetsInHouse;
  const beneficsIn2 = h2Planets.filter(p => ['Venus', 'Jupiter'].includes(p.name));
  
  let oneLiner = '';
  let conclusion = '';
  const points: PlainStepContent['points'] = [];

  if (beneficsIn2.length > 0) {
    oneLiner = '你天生有很强的赚钱直觉';
    conclusion = `你天生具备很强的财富吸引力。你的个人收入区域有${beneficsIn2.map(p => p.nameCn).join('和')}这样的"财富守护星"坐镇，意味着你对金钱有天然的亲和力，赚钱对你来说相对自然。`;
    points.push({ text: '你有天生的理财直觉，对赚钱机会比较敏感', type: 'good' });
  } else if (h2Planets.length > 0) {
    oneLiner = '你的赚钱方式有独特之处';
    conclusion = `你的个人收入区域有${h2Planets.map(p => p.nameCn).join('、')}的影响，这意味着你的赚钱方式可能比较独特，不走寻常路反而更容易成功。`;
    points.push({ text: '你适合用自己独特的方式赚钱，不必照搬别人的模式', type: 'tip' });
  } else {
    oneLiner = '你的赚钱能力取决于后天培养';
    conclusion = '你的个人收入区域没有特别突出的先天优势，但这也意味着你的赚钱潜力很大程度上取决于你后天的学习和努力。通过正确的方向和持续积累，完全可以建立起很好的财富基础。';
    points.push({ text: '后天的学习和努力对你的财富增长非常关键', type: 'tip' });
  }

  // 关键财富征象星的通俗解读
  a.step1.keyPlanets.forEach(kp => {
    const dignity = kp.planet.dignity;
    if (dignity === 'domicile' || dignity === 'exaltation') {
      points.push({ text: `你在${getRoleSimple(kp.role)}方面有天赋，这是你的财富优势`, type: 'good' });
    } else if (dignity === 'detriment' || dignity === 'fall') {
      points.push({ text: `${getRoleSimple(kp.role)}方面需要多加注意和学习`, type: 'caution' });
    }
  });

  return { score: a.step1.score, oneLiner, conclusion, points };
}

function getStep2Plain(a: WealthAssessment): PlainStepContent {
  const strength = a.step2.overallStrength;
  let oneLiner = '';
  let conclusion = '';
  const points: PlainStepContent['points'] = [];

  if (strength === 'strong') {
    oneLiner = '你的赚钱潜力很大';
    conclusion = '你的财富能量整体很强。这意味着你天生具备较强的赚钱潜力，只要找到正确的方向，财富增长会比较顺利。你的"财富电池"是满格的。';
    points.push({ text: '你的财富潜力起点高，好好利用这个优势', type: 'good' });
  } else if (strength === 'moderate') {
    oneLiner = '你的赚钱潜力中等偏上';
    conclusion = '你的财富能量处于中等水平。这意味着你有一定的赚钱基础，但需要通过后天的努力和正确的策略来充分激发潜力。';
    points.push({ text: '你有不错的基础，关键是找到适合自己的发力方向', type: 'tip' });
  } else {
    oneLiner = '你的赚钱潜力需要后天激发';
    conclusion = '你的财富能量目前偏弱，但这并不意味着你赚不到钱。很多成功人士的先天条件并不突出，关键在于后天的学习、努力和正确的策略。';
    points.push({ text: '不要灰心，后天努力可以大幅提升你的财富能力', type: 'tip' });
  }

  a.step2.dignities.forEach(d => {
    if (d.status === 'domicile' || d.status === 'exaltation') {
      points.push({ text: `你在${d.planet.nameCn === '金星' ? '个人理财' : d.planet.nameCn === '木星' ? '投资扩张' : '日常收支'}方面有天然优势`, type: 'good' });
    } else if (d.status === 'detriment' || d.status === 'fall') {
      points.push({ text: `${d.planet.nameCn === '金星' ? '个人理财' : d.planet.nameCn === '木星' ? '大额投资' : '日常开支'}方面需要更加谨慎`, type: 'caution' });
    }
  });

  return { score: a.step2.score, oneLiner, conclusion, points };
}

function getStep3Plain(a: WealthAssessment): PlainStepContent {
  const harmCount = a.step3.harmoniousAspects.length;
  const challCount = a.step3.challengingAspects.length;
  let oneLiner = '';
  let conclusion = '';
  const points: PlainStepContent['points'] = [];

  if (harmCount >= 3 && challCount <= 1) {
    oneLiner = '你的财运非常顺畅';
    conclusion = '你的财运流动性非常好。赚钱的渠道多且畅通，不同的收入来源之间能够互相促进。你比较容易遇到"好事成双"的财务机遇。';
    points.push({ text: '你的多个收入来源之间能互相促进，形成良性循环', type: 'good' });
  } else if (harmCount >= challCount) {
    oneLiner = '你的财运整体顺畅，偶有波折';
    conclusion = `你的财运整体流动性不错，有${harmCount}个有利因素在帮你赚钱，同时也有${challCount}个因素可能带来一些阻力。总体来说，顺利的时候多于困难的时候。`;
    points.push({ text: '整体财运不错，但要注意防范偶尔出现的财务波动', type: 'tip' });
  } else {
    oneLiner = '你的财运有些波折，需要更多耐心';
    conclusion = `你的财务流动性面临一些挑战。有${challCount}个因素可能会给你的赚钱过程带来阻力或波动。但不要担心，了解这些挑战后可以提前做好准备。`;
    points.push({ text: '建议做好财务规划，为可能的波动留出缓冲', type: 'caution' });
  }

  if (harmCount > 0) {
    points.push({ text: `你有${harmCount}个有利的财运因素在帮助你`, type: 'good' });
  }
  if (challCount > 0) {
    points.push({ text: `有${challCount}个因素可能带来财务上的挑战，提前了解就能更好应对`, type: 'caution' });
  }

  return { score: a.step3.score, oneLiner, conclusion, points };
}

function getStep4Plain(a: WealthAssessment): PlainStepContent {
  const flyIns = [a.step4.house2RulerFlyIn, a.step4.venusFlyIn, a.step4.jupiterFlyIn, a.step4.moonFlyIn];
  const excellentOnes = flyIns.filter(f => f.quality === 'excellent');
  const challengingOnes = flyIns.filter(f => f.quality === 'challenging');

  let oneLiner = '';
  let conclusion = '';
  const points: PlainStepContent['points'] = [];

  if (excellentOnes.length >= 2) {
    oneLiner = '你有多个很好的发财方向';
    conclusion = '你的财富实现路径非常清晰。有多个领域都适合你去发展和赚钱，而且这些方向之间还能互相配合。';
  } else if (excellentOnes.length >= 1) {
    oneLiner = '你有一个明确的发财方向';
    conclusion = '你有一个比较明确的最佳赚钱方向。集中精力在这个方向上深耕，更容易获得丰厚回报。';
  } else {
    oneLiner = '你需要多尝试找到最适合的方向';
    conclusion = '你的最佳赚钱方向还不太明确，这意味着你可能需要多尝试不同的领域，找到最适合自己的那条路。';
  }

  flyIns.forEach(f => {
    const area = getHouseArea(f.house);
    if (f.quality === 'excellent') {
      points.push({ text: `${area}是你的财富优势领域，在这个方向发力回报最大`, type: 'good' });
    } else if (f.quality === 'challenging') {
      points.push({ text: `在${area}方面赚钱可能需要更多耐心和策略`, type: 'caution' });
    } else {
      points.push({ text: `${area}方面有一定的赚钱机会，值得关注`, type: 'tip' });
    }
  });

  return { score: a.step4.score, oneLiner, conclusion, points };
}

function getStep5Plain(a: WealthAssessment): PlainStepContent {
  const score = a.step5.score;
  let oneLiner = '';
  let conclusion = '';
  const points: PlainStepContent['points'] = [];

  if (score >= 70) {
    oneLiner = '你的事业和财富高度联动';
    conclusion = '你的职业发展和财富增长高度联动。简单来说，你的事业越成功，赚的钱就越多。建议把主要精力放在职业发展上，财富会随之而来。';
    points.push({ text: '事业是你最大的财富引擎，全力以赴发展事业', type: 'good' });
  } else if (score >= 40) {
    oneLiner = '你的事业对财富有一定帮助';
    conclusion = '你的职业发展和财富增长有一定的联动关系。事业发展好的时候，收入也会相应提升，但可能不是完全同步的。';
    points.push({ text: '事业发展能带动收入增长，但也可以考虑其他收入渠道', type: 'tip' });
  } else {
    oneLiner = '你的财富来源不完全依赖事业';
    conclusion = '你的财富来源可能不完全依赖于传统的职业发展。这意味着你可能更适合通过副业、投资、创业等方式来增加收入。';
    points.push({ text: '不要把所有鸡蛋放在一个篮子里，多元化收入很重要', type: 'tip' });
  }

  points.push({ text: '人生中会有几个重要的财务机遇期，要提前做好准备', type: 'tip' });

  return { score, oneLiner, conclusion, points };
}

function getStep6Plain(a: WealthAssessment): PlainStepContent {
  const score = a.totalScore;
  const points: PlainStepContent['points'] = [];

  a.step6.strengths.forEach(s => {
    points.push({ text: s, type: 'good' });
  });
  a.step6.challenges.forEach(c => {
    points.push({ text: c, type: 'caution' });
  });
  a.step6.advice.forEach(adv => {
    points.push({ text: adv, type: 'tip' });
  });

  return {
    score,
    oneLiner: a.step6.summary.slice(0, 30) + '...',
    conclusion: a.step6.summary,
    points,
  };
}

// ========== 辅助函数 ==========

function getRoleSimple(role: string): string {
  if (role.includes('财富')) return '赚钱和理财';
  if (role.includes('扩张')) return '投资和扩展';
  if (role.includes('福禄')) return '日常收支管理';
  return '财务管理';
}

function getHouseArea(house: number): string {
  const areas: Record<number, string> = {
    1: '个人品牌和形象',
    2: '个人收入和理财',
    3: '学习和沟通',
    4: '房产和家庭',
    5: '投资和创意',
    6: '工作和健康',
    7: '合作和伙伴关系',
    8: '投资回报和被动收入',
    9: '海外发展和高等教育',
    10: '事业和社会地位',
    11: '人脉和社交圈',
    12: '幕后工作和灵性领域',
  };
  return areas[house] || `第${house}个生活领域`;
}
