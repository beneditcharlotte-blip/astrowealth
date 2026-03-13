/**
 * 结果报告页
 * 展示完整的星盘财富格局分析报告
 */
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ChartData } from '@/lib/astro/chart';
import { WealthAssessment } from '@/lib/wealth/assessment';
import ChartWheel from '@/components/ChartWheel';

const WEALTH_BADGE = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663430583073/6TWY7FQUZHTo3qi5RWpAMj/wealth-badge-9v3M3oeqSHWXZjVZZvHJCT.webp';

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
        {activeTab === 'overview' && <OverviewTab assessment={assessment} />}
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

// ========== Overview Tab ==========
function OverviewTab({ assessment }: { assessment: WealthAssessment }) {
  return (
    <div className="space-y-10">
      {/* Summary */}
      <Section title="综合评语">
        <p className="text-[#a09882] leading-relaxed">{assessment.step6.summary}</p>
      </Section>

      {/* Strengths & Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="财富优势">
          <ul className="space-y-3">
            {assessment.step6.strengths.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm text-[#a09882]">
                <span className="text-[#7a8a5c] mt-0.5 flex-shrink-0">◆</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Section>
        <Section title="需要关注">
          <ul className="space-y-3">
            {assessment.step6.challenges.map((c, i) => (
              <li key={i} className="flex gap-3 text-sm text-[#a09882]">
                <span className="text-[#c47830] mt-0.5 flex-shrink-0">◇</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* Advice */}
      <Section title="改善建议">
        <ul className="space-y-3">
          {assessment.step6.advice.map((a, i) => (
            <li key={i} className="flex gap-3 text-sm text-[#a09882]">
              <span className="text-[#b8963e] mt-0.5 flex-shrink-0">→</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Score Bars */}
      <Section title="各维度评分">
        <div className="space-y-4">
          {[
            { label: '核心财富征象', score: assessment.step1.score },
            { label: '先天状态强度', score: assessment.step2.score },
            { label: '相位联动网络', score: assessment.step3.score },
            { label: '宫位系统配置', score: assessment.step4.score },
            { label: '职业运势联动', score: assessment.step5.score },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-sm text-[#8a8070] w-28 flex-shrink-0">{item.label}</span>
              <div className="flex-1 h-1.5 bg-[#252830] relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="h-full bg-[#b8963e]/60"
                />
              </div>
              <span className="text-sm text-[#b8963e] w-10 text-right">{item.score}</span>
            </div>
          ))}
        </div>
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

// ========== Detail Tab ==========
function DetailTab({ assessment }: { assessment: WealthAssessment }) {
  return (
    <div className="space-y-10">
      {/* Step 1 */}
      <Section title="第一步：定位核心财富征象" badge={`${assessment.step1.score}分`}>
        <div className="space-y-6">
          <div className="p-4 border border-[#b8963e]/10 bg-[#252830]/50">
            <h4 className="text-sm text-[#b8963e] mb-2" style={{ fontFamily: 'var(--font-display)' }}>正财宫（第二宫）</h4>
            <p className="text-sm text-[#a09882] leading-relaxed">{assessment.step1.house2.description}</p>
          </div>
          <div className="p-4 border border-[#b8963e]/10 bg-[#252830]/50">
            <h4 className="text-sm text-[#b8963e] mb-2" style={{ fontFamily: 'var(--font-display)' }}>偏财宫（第八宫）</h4>
            <p className="text-sm text-[#a09882] leading-relaxed">{assessment.step1.house8.description}</p>
          </div>
          {assessment.step1.keyPlanets.map((kp, i) => (
            <div key={i} className="p-4 border border-[#b8963e]/10 bg-[#252830]/50">
              <h4 className="text-sm text-[#b8963e] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                {kp.planet.symbol} {kp.role}
              </h4>
              <p className="text-sm text-[#a09882] leading-relaxed">{kp.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Step 2 */}
      <Section title="第二步：评估征象星先天状态" badge={`${assessment.step2.score}分`}>
        <p className="text-sm text-[#8a8070] mb-4">
          整体先天强度：<span className={
            assessment.step2.overallStrength === 'strong' ? 'text-[#7a8a5c]' :
            assessment.step2.overallStrength === 'weak' ? 'text-[#c47830]' : 'text-[#b8963e]'
          }>{assessment.step2.overallStrengthCn}</span>
        </p>
        <div className="space-y-4">
          {assessment.step2.dignities.map((d, i) => (
            <div key={i} className="p-4 border border-[#b8963e]/10 bg-[#252830]/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#b8963e]" style={{ fontFamily: 'var(--font-display)' }}>
                  {d.planet.symbol} {d.role}
                </span>
                <span className={`text-xs px-2 py-0.5 border ${
                  d.status === 'domicile' || d.status === 'exaltation'
                    ? 'border-[#7a8a5c]/30 text-[#7a8a5c]'
                    : d.status === 'detriment' || d.status === 'fall'
                    ? 'border-[#c47830]/30 text-[#c47830]'
                    : 'border-[#8a8070]/30 text-[#8a8070]'
                }`}>
                  {d.statusCn}
                </span>
              </div>
              <p className="text-sm text-[#a09882] leading-relaxed">{d.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Step 3 */}
      <Section title="第三步：分析相位联动" badge={`${assessment.step3.score}分`}>
        <p className="text-sm text-[#a09882] mb-4 leading-relaxed">{assessment.step3.wealthNetwork}</p>
        {assessment.step3.harmoniousAspects.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm text-[#7a8a5c] mb-3" style={{ fontFamily: 'var(--font-display)' }}>吉相位</h4>
            <div className="space-y-2">
              {assessment.step3.harmoniousAspects.map((a, i) => (
                <div key={i} className="p-3 border border-[#7a8a5c]/10 bg-[#252830]/50 text-sm text-[#a09882]">
                  {a.description}
                </div>
              ))}
            </div>
          </div>
        )}
        {assessment.step3.challengingAspects.length > 0 && (
          <div>
            <h4 className="text-sm text-[#c47830] mb-3" style={{ fontFamily: 'var(--font-display)' }}>挑战相位</h4>
            <div className="space-y-2">
              {assessment.step3.challengingAspects.map((a, i) => (
                <div key={i} className="p-3 border border-[#c47830]/10 bg-[#252830]/50 text-sm text-[#a09882]">
                  {a.description}
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Step 4 */}
      <Section title="第四步：整合宫位系统" badge={`${assessment.step4.score}分`}>
        <div className="space-y-3">
          {[assessment.step4.house2RulerFlyIn, assessment.step4.venusFlyIn, assessment.step4.jupiterFlyIn, assessment.step4.moonFlyIn].map((fi, i) => (
            <div key={i} className="p-4 border border-[#b8963e]/10 bg-[#252830]/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#b8963e]" style={{ fontFamily: 'var(--font-display)' }}>
                  {fi.planetNameCn}
                </span>
                <span className={`text-xs px-2 py-0.5 border ${
                  fi.quality === 'excellent' ? 'border-[#7a8a5c]/30 text-[#7a8a5c]' :
                  fi.quality === 'good' ? 'border-[#b8963e]/30 text-[#b8963e]' :
                  fi.quality === 'challenging' ? 'border-[#c47830]/30 text-[#c47830]' :
                  'border-[#8a8070]/30 text-[#8a8070]'
                }`}>
                  飞入第{fi.house}宫
                </span>
              </div>
              <p className="text-sm text-[#a09882] leading-relaxed">{fi.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Step 5 */}
      <Section title="第五步：结合职业与运势" badge={`${assessment.step5.score}分`}>
        <div className="space-y-4">
          <div className="p-4 border border-[#b8963e]/10 bg-[#252830]/50">
            <h4 className="text-sm text-[#b8963e] mb-2" style={{ fontFamily: 'var(--font-display)' }}>中天分析</h4>
            <p className="text-sm text-[#a09882] leading-relaxed">{assessment.step5.mcAnalysis}</p>
          </div>
          <div className="p-4 border border-[#b8963e]/10 bg-[#252830]/50">
            <h4 className="text-sm text-[#b8963e] mb-2" style={{ fontFamily: 'var(--font-display)' }}>事业-财富联动</h4>
            <p className="text-sm text-[#a09882] leading-relaxed">{assessment.step5.careerWealth}</p>
          </div>
          <div className="p-4 border border-[#b8963e]/10 bg-[#252830]/50">
            <h4 className="text-sm text-[#b8963e] mb-2" style={{ fontFamily: 'var(--font-display)' }}>木星行运周期</h4>
            <p className="text-sm text-[#a09882] leading-relaxed">{assessment.step5.jupiterTransits}</p>
          </div>
          <div className="p-4 border border-[#b8963e]/10 bg-[#252830]/50">
            <h4 className="text-sm text-[#b8963e] mb-2" style={{ fontFamily: 'var(--font-display)' }}>土星行运周期</h4>
            <p className="text-sm text-[#a09882] leading-relaxed">{assessment.step5.saturnTransits}</p>
          </div>
        </div>
      </Section>
    </div>
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
