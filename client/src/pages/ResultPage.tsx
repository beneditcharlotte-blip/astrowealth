/**
 * 结果报告页
 * - 财富人格标签 + 等级
 * - 成就徽章系统
 * - 综合报告：LLM 按人生阶段时间表生成
 * - 详细解读：九宫格展示（先天优势 + 后天努力）
 * - 交互式人生财富时间轴
 */
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartData } from '@/lib/astro/chart';
import { WealthAssessment } from '@/lib/wealth/assessment';
import { deriveWealthPersonality, WealthPersonality } from '@/lib/wealth/personality';
import { computeBadges, Badge, getRarityName } from '@/lib/wealth/badges';
import { generateTimeline, TimelineStage } from '@/lib/wealth/timeline';
import { computeNineGrid, GridCell, NineGridResult, getRatingLabel, GridRating } from '@/lib/wealth/nineGrid';
import { trpc } from '@/lib/trpc';
import { Streamdown } from 'streamdown';

const GRADE_COLORS: Record<string, string> = {
  'A10': '#d4a843',
  'A9': '#c49a3e',
  'A8': '#b8963e',
  'A7': '#9a8050',
  'A6': '#7a6a50',
};

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
          <button onClick={() => navigate('/')} className="text-[#8a8070] hover:text-[#b8963e] transition-colors text-sm flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" /></svg>
            首页
          </button>
          <h1 className="text-lg text-[#b8963e] tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>你的财富分析报告</h1>
          <button onClick={() => navigate('/input')} className="text-[#8a8070] hover:text-[#b8963e] transition-colors text-sm">重新测试</button>
        </div>
      </header>

      {/* Grade Hero + Personality */}
      <GradeHeroSection chart={chart} assessment={assessment} gradeColor={gradeColor} />

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
              className={`px-6 py-3.5 text-sm tracking-wider transition-colors relative ${activeTab === tab.key ? 'text-[#b8963e]' : 'text-[#8a8070] hover:text-[#e0d5c1]'}`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {tab.label}
              {activeTab === tab.key && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-px bg-[#b8963e]" />}
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
          <p className="text-[#6b6358] text-xs text-center leading-relaxed">{assessment.disclaimer}</p>
        </div>
      </footer>
    </div>
  );
}

// ========== Grade Hero + Personality Section ==========
function GradeHeroSection({ chart, assessment, gradeColor }: { chart: ChartData; assessment: WealthAssessment; gradeColor: string }) {
  const personality = useMemo(() => deriveWealthPersonality(assessment, chart), [assessment, chart]);
  const badges = useMemo(() => computeBadges(assessment), [assessment]);
  const unlockedBadges = badges.filter(b => b.unlocked);
  const [showAllBadges, setShowAllBadges] = useState(false);

  return (
    <section className="py-10 border-b border-[#b8963e]/10">
      <div className="container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Birth Info */}
          <p className="text-[#8a8070] text-sm text-center mb-6">
            {chart.birthInfo.city} · {chart.birthInfo.year}年{chart.birthInfo.month}月{chart.birthInfo.day}日 {String(chart.birthInfo.hour).padStart(2, '0')}:{String(chart.birthInfo.minute).padStart(2, '0')}
          </p>

          {/* Grade + Personality Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Grade Card */}
            <div className="text-center p-6 border border-[#b8963e]/15 bg-[#252830]/30">
              <div className="text-6xl font-bold tracking-wider mb-1" style={{ fontFamily: 'var(--font-display)', color: gradeColor }}>
                {assessment.gradeLabel}
              </div>
              <div className="text-xl tracking-wider mb-3" style={{ color: gradeColor, fontFamily: 'var(--font-display)' }}>
                {assessment.gradeName}
              </div>
              <div className="max-w-[200px] mx-auto mb-3">
                <div className="flex justify-between text-xs text-[#8a8070] mb-1">
                  <span>综合评分</span>
                  <span style={{ color: gradeColor }}>{assessment.totalScore}/100</span>
                </div>
                <div className="h-2 bg-[#1c1f26] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${assessment.totalScore}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${gradeColor}80, ${gradeColor})` }}
                  />
                </div>
              </div>
              <p className="text-[#a09882] text-xs leading-relaxed">{assessment.gradeDescription}</p>
            </div>

            {/* Personality Card */}
            <PersonalityCard personality={personality} />
          </div>

          {/* Badges */}
          <BadgesSection badges={badges} unlockedBadges={unlockedBadges} showAll={showAllBadges} onToggle={() => setShowAllBadges(!showAllBadges)} />
        </motion.div>
      </div>
    </section>
  );
}

// ========== Personality Card ==========
function PersonalityCard({ personality }: { personality: WealthPersonality }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="p-6 border bg-[#252830]/30 relative overflow-hidden"
      style={{ borderColor: `${personality.color}30` }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5" style={{ background: personality.color, filter: 'blur(40px)' }} />
      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{personality.emoji}</span>
          <div>
            <h3 className="text-lg font-bold" style={{ color: personality.color, fontFamily: 'var(--font-display)' }}>
              {personality.title}
            </h3>
            <p className="text-xs text-[#8a8070]">{personality.subtitle}</p>
          </div>
        </div>
        <p className="text-sm font-medium mb-3" style={{ color: personality.color }}>
          「{personality.tagline}」
        </p>
        <p className="text-sm text-[#a09882] leading-relaxed mb-4">
          {personality.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {personality.tags.map((tag, i) => (
            <span key={i} className="text-xs px-2.5 py-1 border" style={{ borderColor: `${personality.color}30`, color: personality.color }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ========== Badges Section ==========
function BadgesSection({ badges, unlockedBadges, showAll, onToggle }: {
  badges: Badge[];
  unlockedBadges: Badge[];
  showAll: boolean;
  onToggle: () => void;
}) {
  const displayBadges = showAll ? badges : unlockedBadges;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SectionTitle title="成就徽章" />
          <span className="text-xs text-[#8a8070] ml-2">
            已解锁 {unlockedBadges.length}/{badges.length}
          </span>
        </div>
        <button onClick={onToggle} className="text-xs text-[#8a8070] hover:text-[#b8963e] transition-colors">
          {showAll ? '只看已解锁' : '查看全部'}
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {displayBadges.map((badge, i) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className={`group relative p-3 border text-center transition-all cursor-default ${
              badge.unlocked ? 'bg-[#252830]/50 hover:bg-[#252830]/80' : 'bg-[#1c1f26]/50 opacity-40'
            }`}
            style={{ borderColor: badge.unlocked ? `${badge.rarityColor}25` : 'rgba(184,150,62,0.06)' }}
            title={badge.unlocked ? badge.description : `未解锁：${badge.unlockHint}`}
          >
            <div className={`text-2xl mb-1 ${badge.unlocked ? '' : 'grayscale'}`}>
              {badge.unlocked ? badge.icon : '🔒'}
            </div>
            <div className="text-[10px] text-[#e0d5c1] leading-tight mb-0.5 truncate">{badge.name}</div>
            <div className="text-[9px]" style={{ color: badge.unlocked ? badge.rarityColor : '#555' }}>
              {getRarityName(badge.rarity)}
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#1c1f26] border border-[#b8963e]/20 text-left opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
              <p className="text-xs text-[#e0d5c1] mb-1">{badge.name}</p>
              <p className="text-[10px] text-[#8a8070] leading-relaxed">
                {badge.unlocked ? badge.description : `解锁条件：${badge.unlockHint}`}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ========== Overview Tab ==========
function OverviewTab({ chart, assessment }: { chart: ChartData; assessment: WealthAssessment }) {
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeline = useMemo(() => generateTimeline(assessment, chart.birthInfo.year), [assessment, chart]);
  const personality = useMemo(() => deriveWealthPersonality(assessment, chart), [assessment, chart]);
  const nineGrid = useMemo(() => computeNineGrid(assessment, chart), [assessment, chart]);

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

  const buildMutationInput = useCallback(() => {
    // 构建更具体的数据，让 LLM 能生成个性化内容
    const gridSummary = nineGrid.allCells.map(cell =>
      `${cell.name}（${cell.rating}级，${cell.rawScore}分）：${cell.oneLiner}`
    ).join('\n');

    const step1Summary = `${assessment.step1.house2.description} ${assessment.step1.house8.description}`;
    const step2Summary = `整体先天强度：${assessment.step2.overallStrengthCn}。${assessment.step2.dignities.map(d => `${d.planet.nameCn}${d.statusCn}`).join('，')}`;
    const step3Summary = `${assessment.step3.wealthNetwork} 吉相位${assessment.step3.harmoniousAspects.length}个，挑战相位${assessment.step3.challengingAspects.length}个`;
    const step4Summary = [assessment.step4.house2RulerFlyIn, assessment.step4.venusFlyIn, assessment.step4.jupiterFlyIn, assessment.step4.moonFlyIn]
      .map(f => `${f.planetNameCn}飞入第${f.house}宫（${f.quality}）`).join('；');
    const step5Summary = `${assessment.step5.mcAnalysis} ${assessment.step5.careerWealth}`;
    const keyPlanets = assessment.step1.keyPlanets.map(kp => ({
      name: kp.planet.nameCn, sign: kp.planet.sign.nameCn, house: kp.planet.house, dignity: kp.planet.dignityCn, role: kp.role,
    }));

    return {
      birthInfo: { city: chart.birthInfo.city, year: chart.birthInfo.year, month: chart.birthInfo.month, day: chart.birthInfo.day, hour: chart.birthInfo.hour, minute: chart.birthInfo.minute },
      grade: assessment.grade, gradeLabel: assessment.gradeLabel, gradeName: assessment.gradeName, totalScore: assessment.totalScore,
      ascSign: chart.ascSign.sign.nameCn, mcSign: chart.mcSign.sign.nameCn,
      step1Summary, step2Summary, step3Summary, step4Summary, step5Summary,
      strengths: assessment.step6.strengths, challenges: assessment.step6.challenges,
      keyPlanets,
      scores: { step1: assessment.step1.score, step2: assessment.step2.score, step3: assessment.step3.score, step4: assessment.step4.score, step5: assessment.step5.score },
      personalityTitle: personality.title,
      personalityTagline: personality.tagline,
      gridSummary,
    };
  }, [chart, assessment, personality, nineGrid]);

  useEffect(() => {
    const cached = sessionStorage.getItem('llmReport');
    if (cached) {
      setReport(cached);
      return;
    }
    setIsGenerating(true);
    setError(null);
    generateMutation.mutate(buildMutationInput());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegenerate = () => {
    sessionStorage.removeItem('llmReport');
    setReport(null);
    setIsGenerating(true);
    setError(null);
    generateMutation.mutate(buildMutationInput());
  };

  return (
    <div className="space-y-10">
      {/* Quick Summary Cards */}
      <div>
        <SectionTitle title="你的财富画像" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <QuickCard icon="💪" title="你的优势" items={assessment.step6.strengths} color="#7a8a5c" />
          <QuickCard icon="⚠️" title="需要注意" items={assessment.step6.challenges} color="#c47830" />
          <QuickCard icon="💡" title="行动建议" items={assessment.step6.advice} color="#b8963e" />
        </div>
      </div>

      {/* Interactive Timeline */}
      <div>
        <SectionTitle title="你的人生财富时间轴" />
        <InteractiveTimeline stages={timeline} />
      </div>

      {/* LLM Report */}
      <div>
        <div className="flex items-center justify-between">
          <SectionTitle title="AI 深度解读" />
          {report && (
            <button onClick={handleRegenerate} className="text-xs text-[#8a8070] hover:text-[#b8963e] transition-colors flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7C1 3.68 3.68 1 7 1C10.32 1 13 3.68 13 7C13 10.32 10.32 13 7 13" stroke="currentColor" strokeWidth="1.2" /><path d="M1 7L3 9M1 7L3 5" stroke="currentColor" strokeWidth="1.2" /></svg>
              重新生成
            </button>
          )}
        </div>
        <div className="mt-4 border border-[#b8963e]/15 bg-[#252830]/30 p-6 md:p-8">
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-12">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 border-2 border-[#b8963e]/20 border-t-[#b8963e] rounded-full mb-4" />
              <p className="text-[#8a8070] text-sm">正在为你生成个性化报告...</p>
              <p className="text-[#6b6358] text-xs mt-1">AI 正在分析你的财富基因和每个人生阶段的趋势</p>
            </div>
          )}
          {error && (
            <div className="text-center py-8">
              <p className="text-[#c47830] text-sm mb-3">{error}</p>
              <button onClick={handleRegenerate} className="text-sm text-[#b8963e] border border-[#b8963e]/30 px-4 py-1.5 hover:bg-[#b8963e]/10 transition-colors">点击重试</button>
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

// ========== Interactive Timeline ==========
function InteractiveTimeline({ stages }: { stages: TimelineStage[] }) {
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const currentStage = stages.find(s => s.isCurrent);

  useEffect(() => {
    if (currentStage) setActiveStage(currentStage.id);
  }, [currentStage]);

  return (
    <div className="mt-4 relative">
      <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-[#b8963e]/30 via-[#b8963e]/15 to-transparent hidden md:block" />
      <div className="space-y-3">
        {stages.map((stage, i) => {
          const isActive = activeStage === stage.id;
          const statusLabel = stage.status === 'opportunity' ? '机遇期' : stage.status === 'stable' ? '平稳期' : '注意期';

          return (
            <motion.div key={stage.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
              <button
                onClick={() => setActiveStage(isActive ? null : stage.id)}
                className={`w-full text-left transition-all ${stage.isCurrent ? 'border-l-2 md:border-l-0' : ''}`}
                style={stage.isCurrent ? { borderColor: stage.statusColor } : {}}
              >
                <div className={`flex items-center gap-4 p-4 border transition-all ${
                  isActive ? 'bg-[#252830]/60' : 'bg-[#252830]/20 hover:bg-[#252830]/40'
                } ${stage.isPast ? 'opacity-60' : ''}`}
                  style={{ borderColor: isActive ? `${stage.statusColor}40` : 'rgba(184,150,62,0.08)' }}
                >
                  <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full border-2 flex-shrink-0"
                    style={{ borderColor: stage.statusColor, background: isActive ? `${stage.statusColor}15` : 'transparent' }}
                  >
                    <span className="text-lg">{stage.icon}</span>
                  </div>
                  <span className="text-xl md:hidden flex-shrink-0">{stage.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-medium text-[#e8dcc8]">{stage.name}</h4>
                      {stage.isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-sm text-[#1c1f26] font-medium" style={{ background: stage.statusColor }}>
                          当前阶段
                        </span>
                      )}
                      <span className="text-[10px] px-1.5 py-0.5 border" style={{ borderColor: `${stage.statusColor}40`, color: stage.statusColor }}>
                        {statusLabel}
                      </span>
                    </div>
                    <p className="text-xs text-[#8a8070] mt-0.5">{stage.ageRange} · {stage.yearRange}</p>
                  </div>
                  <div className="w-20 flex-shrink-0 hidden sm:block">
                    <div className="h-1.5 bg-[#1c1f26] rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${stage.fortuneLevel}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} className="h-full rounded-full" style={{ background: stage.statusColor }} />
                    </div>
                    <p className="text-[10px] text-right mt-0.5" style={{ color: stage.statusColor }}>{stage.fortuneLevel}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`text-[#8a8070] transition-transform flex-shrink-0 ${isActive ? 'rotate-180' : ''}`}>
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
              </button>
              <AnimatePresence>
                {isActive && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="p-5 border border-t-0 bg-[#252830]/40" style={{ borderColor: `${stage.statusColor}20` }}>
                      <p className="text-sm text-[#e0d5c1] leading-relaxed mb-4">{stage.summary}</p>
                      <div className="space-y-2">
                        {stage.tips.map((tip, j) => (
                          <div key={j} className="flex gap-2">
                            <span className="text-sm flex-shrink-0" style={{ color: stage.statusColor }}>→</span>
                            <p className="text-sm text-[#a09882] leading-relaxed">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ========== Quick Card ==========
function QuickCard({ icon, title, items, color }: { icon: string; title: string; items: string[]; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 border border-[#b8963e]/10 bg-[#252830]/40">
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

// ========== Detail Tab — Nine Grid ==========
function DetailTab({ chart, assessment }: { chart: ChartData; assessment: WealthAssessment }) {
  const nineGrid = useMemo(() => computeNineGrid(assessment, chart), [assessment, chart]);
  const personality = useMemo(() => deriveWealthPersonality(assessment, chart), [assessment, chart]);
  const [expandedCell, setExpandedCell] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      {/* Nine Grid */}
      <div>
        <SectionTitle title="你的财富九宫格" />
        <p className="text-sm text-[#8a8070] mt-2 mb-6">点击任意格子查看详细解读</p>

        {/* 先天优势行 */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#d4a843] to-[#b8963e]" />
            <span className="text-xs text-[#b8963e] tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>先天优势 · 你天生自带的财富基因</span>
          </div>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {nineGrid.innate.map((cell, i) => (
              <NineGridCell key={cell.id} cell={cell} index={i} isExpanded={expandedCell === cell.id} onToggle={() => setExpandedCell(expandedCell === cell.id ? null : cell.id)} />
            ))}
          </div>
          <NineGridExpandedDetail cells={nineGrid.innate} expandedId={expandedCell} />
        </div>

        {/* 连接层 */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-3 mt-4">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#8a8070] to-[#6b6358]" />
            <span className="text-xs text-[#8a8070] tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>人际连接 · 先天与后天的桥梁</span>
          </div>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <NineGridCell cell={nineGrid.bridge[0]!} index={0} isExpanded={expandedCell === nineGrid.bridge[0]!.id} onToggle={() => setExpandedCell(expandedCell === nineGrid.bridge[0]!.id ? null : nineGrid.bridge[0]!.id)} />
            {/* 中间格：财富人格 */}
            <PersonalityCenterCell personality={personality} />
            <NineGridCell cell={nineGrid.bridge[2]!} index={2} isExpanded={expandedCell === nineGrid.bridge[2]!.id} onToggle={() => setExpandedCell(expandedCell === nineGrid.bridge[2]!.id ? null : nineGrid.bridge[2]!.id)} />
          </div>
          <NineGridExpandedDetail cells={[nineGrid.bridge[0]!, nineGrid.bridge[2]!]} expandedId={expandedCell} />
        </div>

        {/* 后天努力行 */}
        <div>
          <div className="flex items-center gap-2 mb-3 mt-4">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#6b8ab8] to-[#5a7aa8]" />
            <span className="text-xs text-[#6b8ab8] tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>后天努力 · 你可以掌控的财富方向</span>
          </div>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {nineGrid.effort.map((cell, i) => (
              <NineGridCell key={cell.id} cell={cell} index={i} isExpanded={expandedCell === cell.id} onToggle={() => setExpandedCell(expandedCell === cell.id ? null : cell.id)} />
            ))}
          </div>
          <NineGridExpandedDetail cells={nineGrid.effort} expandedId={expandedCell} />
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

// ========== Nine Grid Cell ==========
const RATING_BG: Record<GridRating, string> = {
  S: 'from-[#d4a843]/15 to-[#d4a843]/5',
  A: 'from-[#b8963e]/12 to-[#b8963e]/4',
  B: 'from-[#7a8a5c]/10 to-[#7a8a5c]/3',
  C: 'from-[#8a8070]/8 to-[#8a8070]/3',
  D: 'from-[#6b6358]/8 to-[#6b6358]/3',
};

function NineGridCell({ cell, index, isExpanded, onToggle }: {
  cell: GridCell;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06 }}
      onClick={onToggle}
      className={`relative p-3 md:p-4 border text-left transition-all hover:scale-[1.02] ${
        isExpanded ? 'ring-1' : ''
      } bg-gradient-to-br ${RATING_BG[cell.rating]}`}
      style={{
        borderColor: isExpanded ? `${cell.color}60` : `${cell.color}20`,
        // ring color handled via className
      }}
    >
      {/* Rating badge */}
      <div className="absolute top-2 right-2 w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-xs md:text-sm font-bold rounded-sm"
        style={{ background: `${cell.color}20`, color: cell.color, fontFamily: 'var(--font-display)' }}
      >
        {cell.rating}
      </div>

      <span className="text-xl md:text-2xl block mb-1 md:mb-2">{cell.icon}</span>
      <h4 className="text-xs md:text-sm font-medium text-[#e8dcc8] mb-0.5 pr-6">{cell.name}</h4>
      <p className="text-[10px] md:text-xs text-[#8a8070] hidden sm:block">{cell.subtitle}</p>

      {/* Score bar */}
      <div className="h-1 bg-[#1c1f26] rounded-full mt-2 md:mt-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${cell.rawScore}%` }}
          transition={{ duration: 0.8, delay: index * 0.08 }}
          className="h-full rounded-full"
          style={{ background: cell.color }}
        />
      </div>

      {/* One-liner on larger screens */}
      <p className="text-[10px] text-[#a09882] mt-1.5 leading-tight line-clamp-2 hidden md:block">{cell.oneLiner}</p>
    </motion.button>
  );
}

// ========== Personality Center Cell ==========
function PersonalityCenterCell({ personality }: { personality: WealthPersonality }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="relative p-3 md:p-4 border text-center overflow-hidden"
      style={{
        borderColor: `${personality.color}40`,
        background: `linear-gradient(135deg, ${personality.color}10, ${personality.color}05)`,
      }}
    >
      <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at center, ${personality.color}, transparent 70%)` }} />
      <div className="relative">
        <span className="text-2xl md:text-3xl block mb-1">{personality.emoji}</span>
        <h4 className="text-xs md:text-sm font-bold mb-0.5" style={{ color: personality.color, fontFamily: 'var(--font-display)' }}>
          {personality.title}
        </h4>
        <p className="text-[10px] text-[#8a8070] hidden sm:block">{personality.subtitle}</p>
        <p className="text-[10px] mt-1 leading-tight hidden md:block" style={{ color: `${personality.color}cc` }}>
          「{personality.tagline}」
        </p>
      </div>
    </motion.div>
  );
}

// ========== Nine Grid Expanded Detail ==========
function NineGridExpandedDetail({ cells, expandedId }: { cells: GridCell[]; expandedId: string | null }) {
  const expandedCell = cells.find(c => c && c.id === expandedId);
  if (!expandedCell) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={expandedCell.id}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="mt-2 p-5 border bg-[#252830]/50" style={{ borderColor: `${expandedCell.color}20` }}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{expandedCell.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-medium text-[#e8dcc8]" style={{ fontFamily: 'var(--font-display)' }}>{expandedCell.name}</h4>
                <span className="text-xs px-2 py-0.5 font-bold rounded-sm"
                  style={{ background: `${expandedCell.color}20`, color: expandedCell.color, fontFamily: 'var(--font-display)' }}
                >
                  {expandedCell.rating} · {getRatingLabel(expandedCell.rating)}
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: expandedCell.color }}>{expandedCell.oneLiner}</p>
            </div>
          </div>

          {/* Detail */}
          <div className="p-3 border mb-4" style={{ borderColor: `${expandedCell.color}15`, background: `${expandedCell.color}08` }}>
            <p className="text-sm text-[#e0d5c1] leading-relaxed">{expandedCell.detail}</p>
          </div>

          {/* Tips */}
          <div className="space-y-2">
            {expandedCell.tips.map((tip, j) => (
              <div key={j} className="flex gap-2">
                <span className="text-sm flex-shrink-0" style={{ color: expandedCell.color }}>→</span>
                <p className="text-sm text-[#a09882] leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ========== Section Title ==========
function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-1 h-5 bg-[#b8963e]/40" />
      <h3 className="text-lg text-[#e8dcc8] tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
    </div>
  );
}
