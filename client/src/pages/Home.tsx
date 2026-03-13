/**
 * 首页 — Art Deco 天文仪器风格
 * 深炭灰背景 + 黄铜金色 + 几何装饰
 */
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';

const HERO_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663430583073/6TWY7FQUZHTo3qi5RWpAMj/hero-bg-NUVdAQ9ssaVCHms9ctKD6F.webp';
const ZODIAC_WHEEL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663430583073/6TWY7FQUZHTo3qi5RWpAMj/zodiac-wheel-5Uxm3iGPYJ67W9ZXE6Cs5w.webp';

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[#1c1f26] text-[#e0d5c1] overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={HERO_BG}
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1c1f26]/60 via-transparent to-[#1c1f26]" />
        </div>

        {/* Content */}
        <div className="relative z-10 container max-w-5xl text-center">
          {/* Art Deco top ornament */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#b8963e]" />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#b8963e]">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
            </svg>
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#b8963e]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold tracking-wide mb-4"
            style={{ fontFamily: 'var(--font-display)', color: '#e8dcc8' }}
          >
            星盘财富格局
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg md:text-xl text-[#b8963e] tracking-[0.3em] uppercase mb-8"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Astro Wealth Constellation
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-base md:text-lg text-[#a09882] max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            基于专业占星学理论，通过精密的天文算法计算你的本命星盘，
            从财帛宫、偏财宫、行星庙旺落陷、相位联动等多个维度，
            深度解析你的财富潜力格局。
          </motion.p>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/input')}
            className="group relative inline-flex items-center gap-3 px-10 py-4 border border-[#b8963e]/60 bg-[#b8963e]/10 text-[#e8dcc8] text-lg tracking-wider transition-all duration-300 hover:bg-[#b8963e]/20 hover:border-[#b8963e]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span>开始解析你的财富星盘</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="transition-transform group-hover:translate-x-1">
              <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {/* Corner decorations */}
            <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#b8963e]" />
            <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#b8963e]" />
            <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#b8963e]" />
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#b8963e]" />
          </motion.button>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-5 h-8 border border-[#b8963e]/40 rounded-full flex justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-[#b8963e]/60 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-24">
        <div className="container max-w-6xl">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-16 bg-[#b8963e]/30" />
              <span className="text-[#b8963e] text-sm tracking-[0.4em] uppercase" style={{ fontFamily: 'var(--font-display)' }}>
                Analysis Method
              </span>
              <div className="h-px w-16 bg-[#b8963e]/30" />
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#e8dcc8] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              六步专业评估体系
            </h2>
            <p className="text-[#8a8070] max-w-xl mx-auto">
              融合西方占星学与印度占星学精华，通过六个维度全面解析你的财富星盘
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative p-6 border border-[#b8963e]/15 bg-[#1c1f26]/80 hover:border-[#b8963e]/30 transition-colors duration-300"
              >
                {/* Step number */}
                <div className="text-[#b8963e]/30 text-5xl font-bold absolute top-4 right-4" style={{ fontFamily: 'var(--font-display)' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="text-[#b8963e] text-sm tracking-wider mb-3 uppercase" style={{ fontFamily: 'var(--font-display)' }}>
                  {step.label}
                </div>
                <h3 className="text-xl text-[#e8dcc8] font-semibold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  {step.title}
                </h3>
                <p className="text-[#8a8070] text-sm leading-relaxed">
                  {step.desc}
                </p>
                {/* Bottom line */}
                <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#b8963e]/20 to-transparent" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Grade Preview Section */}
      <section className="relative py-24 border-t border-[#b8963e]/10">
        <div className="container max-w-5xl">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-16 bg-[#b8963e]/30" />
              <span className="text-[#b8963e] text-sm tracking-[0.4em] uppercase" style={{ fontFamily: 'var(--font-display)' }}>
                Wealth Grade
              </span>
              <div className="h-px w-16 bg-[#b8963e]/30" />
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#e8dcc8] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              财富格局等级
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {GRADES.map((grade, i) => (
              <motion.div
                key={grade.level}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="text-center p-5 border border-[#b8963e]/15 bg-[#1c1f26]/60 hover:border-[#b8963e]/30 transition-colors"
              >
                <div className="text-2xl font-bold text-[#b8963e] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  {grade.level}
                </div>
                <div className="text-sm text-[#e8dcc8] mb-1">{grade.name}</div>
                <div className="text-xs text-[#8a8070]">{grade.range}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Zodiac Wheel Section */}
      <section className="relative py-24 border-t border-[#b8963e]/10">
        <div className="container max-w-4xl flex flex-col md:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, rotate: -10 }}
            whileInView={{ opacity: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="w-64 h-64 md:w-80 md:h-80 flex-shrink-0"
          >
            <img src={ZODIAC_WHEEL} alt="Zodiac Wheel" className="w-full h-full object-contain opacity-80" />
          </motion.div>
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-[#e8dcc8] mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              精密天文算法
            </h2>
            <div className="space-y-4 text-[#a09882] leading-relaxed">
              <p>
                采用VSOP87行星运动理论和专业的宫位计算系统，精确计算你出生时刻的天体位置。
                包含太阳、月亮及八大行星的地心视黄经、逆行状态、月亮南北交点等完整数据。
              </p>
              <p>
                基于Placidus宫位制计算十二宫头，结合行星庙旺落陷系统（现代入庙规则），
                全面评估每颗财富征象星的先天状态与能量强度。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#b8963e]/10">
        <div className="container max-w-4xl text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-[#b8963e]/20" />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#b8963e]/40">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
            </svg>
            <div className="h-px w-12 bg-[#b8963e]/20" />
          </div>
          <p className="text-[#6b6358] text-sm">
            星盘显示的是潜能和模式，最终财富水平还受意识水平、教育、机遇等现实因素调节。
            本站仅供参考与娱乐，不构成任何投资或财务建议。
          </p>
        </div>
      </footer>
    </div>
  );
}

const STEPS = [
  { label: 'Step I', title: '定位核心财富征象', desc: '分析第二宫（正财宫）与第八宫（偏财宫），定位金星、木星、月亮三大天然财富征象星。' },
  { label: 'Step II', title: '评估先天状态', desc: '通过庙旺落陷系统判断财富征象星的先天能量强弱，这是财富格局高低的根本依据。' },
  { label: 'Step III', title: '分析相位联动', desc: '识别财富征象星之间的吉相位网络与挑战相位，判断财富流动的顺畅度与障碍。' },
  { label: 'Step IV', title: '整合宫位系统', desc: '分析财星"飞入"何宫，揭示财富在事业、人脉、投资等哪些生活领域显现。' },
  { label: 'Step V', title: '结合职业运势', desc: '分析中天与财富征象星的联动，推演木星、土星行运周期中的财务机遇与考验期。' },
  { label: 'Step VI', title: '综合定性评估', desc: '整合五步分析，给出A6至A10的财富格局等级与个性化的详细报告。' },
];

const GRADES = [
  { level: 'A10', name: '卓越财星', range: '十亿以上' },
  { level: 'A9', name: '上等财星', range: '亿级' },
  { level: 'A8', name: '优良财星', range: '千万级' },
  { level: 'A7', name: '稳健财星', range: '百万级' },
  { level: 'A6', name: '潜力财星', range: '十万级' },
];
