/**
 * 财富人格标签系统
 * 根据六步分析数据推导出形象化的财富人格类型
 * 底层逻辑基于专业占星分析，但展示层完全通俗化
 */
import { WealthAssessment } from './assessment';
import { ChartData } from '../astro/chart';

export interface WealthPersonality {
  /** 人格类型 ID */
  id: string;
  /** 人格名称，如"社交型收割者" */
  title: string;
  /** 英文副标题 */
  subtitle: string;
  /** 一句话描述 */
  tagline: string;
  /** 详细描述（2-3句话） */
  description: string;
  /** 代表色 */
  color: string;
  /** 代表 emoji */
  emoji: string;
  /** 关键词标签 */
  tags: string[];
  /** 匹配度 0-100 */
  matchScore: number;
}

interface PersonalityRule {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  color: string;
  emoji: string;
  tags: string[];
  /** 评分函数，根据分析数据返回 0-100 的匹配度 */
  score: (a: WealthAssessment, c: ChartData) => number;
}

const PERSONALITY_RULES: PersonalityRule[] = [
  {
    id: 'social-harvester',
    title: '社交型收割者',
    subtitle: 'The Social Harvester',
    tagline: '你的人脉就是你的金脉',
    description: '你天生擅长通过人际关系来创造财富。你的社交圈就是你的财富网络，每一次有价值的连接都可能带来意想不到的机遇。你适合在需要广泛人脉的领域发展。',
    color: '#e8a838',
    emoji: '🤝',
    tags: ['人脉达人', '资源整合', '合作共赢'],
    score: (a, c) => {
      let s = 0;
      // 飞入11宫（人脉宫）加分
      const flyIns = [a.step4.house2RulerFlyIn, a.step4.venusFlyIn, a.step4.jupiterFlyIn, a.step4.moonFlyIn];
      flyIns.forEach(f => { if (f.house === 11 || f.house === 7) s += 20; });
      // 相位网络好 = 社交财运好
      if (a.step3.harmoniousAspects.length >= 3) s += 20;
      // 事业联动高
      if (a.step5.score >= 60) s += 15;
      return Math.min(100, s);
    },
  },
  {
    id: 'steady-hunter',
    title: '稳健型猎手',
    subtitle: 'The Steady Hunter',
    tagline: '慢即是快，稳即是赢',
    description: '你的财富积累方式是稳扎稳打、步步为营。你不追求一夜暴富，而是通过持续的专业积累和谨慎的理财策略来实现财富增长。时间是你最好的朋友。',
    color: '#7a8a5c',
    emoji: '🏹',
    tags: ['稳健增长', '长期主义', '风险控制'],
    score: (a, _c) => {
      let s = 0;
      // 先天能量中等偏上
      if (a.step2.overallStrength === 'moderate') s += 25;
      if (a.step2.overallStrength === 'strong') s += 15;
      // 挑战相位有但不多 = 有纪律
      if (a.step3.challengingAspects.length >= 1 && a.step3.challengingAspects.length <= 2) s += 20;
      // 飞入2宫或4宫 = 稳健
      const flyIns = [a.step4.house2RulerFlyIn, a.step4.venusFlyIn, a.step4.jupiterFlyIn, a.step4.moonFlyIn];
      flyIns.forEach(f => { if (f.house === 2 || f.house === 4 || f.house === 6) s += 15; });
      return Math.min(100, s);
    },
  },
  {
    id: 'creative-miner',
    title: '创意型掘金者',
    subtitle: 'The Creative Miner',
    tagline: '别人看到石头，你看到金子',
    description: '你拥有独特的财富视角，能在别人忽略的地方发现赚钱机会。你的创造力和直觉是你最大的财富武器，适合在创意、投资、新兴领域发展。',
    color: '#c47830',
    emoji: '💎',
    tags: ['独特视角', '创意变现', '直觉敏锐'],
    score: (a, _c) => {
      let s = 0;
      // 飞入5宫（创意宫）或9宫（远方/高等教育）
      const flyIns = [a.step4.house2RulerFlyIn, a.step4.venusFlyIn, a.step4.jupiterFlyIn, a.step4.moonFlyIn];
      flyIns.forEach(f => { if (f.house === 5 || f.house === 9 || f.house === 12) s += 20; });
      // 赚钱天赋高
      if (a.step1.score >= 60) s += 20;
      // 有一些挑战但整体不错 = 非传统路径
      if (a.step3.challengingAspects.length >= 1) s += 10;
      return Math.min(100, s);
    },
  },
  {
    id: 'career-climber',
    title: '事业型攀登者',
    subtitle: 'The Career Climber',
    tagline: '事业就是你最大的提款机',
    description: '你的财富和事业高度绑定。你越努力工作、越往上爬，赚的钱就越多。你适合在大公司、体制内或专业领域深耕，通过职位提升来实现财富增长。',
    color: '#b8963e',
    emoji: '🏔',
    tags: ['职场精英', '专业深耕', '晋升加薪'],
    score: (a, _c) => {
      let s = 0;
      // 事业联动得分高
      if (a.step5.score >= 70) s += 30;
      else if (a.step5.score >= 50) s += 20;
      // 飞入10宫（事业宫）
      const flyIns = [a.step4.house2RulerFlyIn, a.step4.venusFlyIn, a.step4.jupiterFlyIn, a.step4.moonFlyIn];
      flyIns.forEach(f => { if (f.house === 10 || f.house === 6) s += 20; });
      // 先天能量强
      if (a.step2.overallStrength === 'strong') s += 15;
      return Math.min(100, s);
    },
  },
  {
    id: 'fortune-magnet',
    title: '天生财富磁铁',
    subtitle: 'The Fortune Magnet',
    tagline: '财富总是不请自来',
    description: '你天生具备极强的财富吸引力。好运气、好机会似乎总是围绕着你。你不需要特别努力就能获得不错的财务回报，但如果你主动出击，回报会更加惊人。',
    color: '#d4a843',
    emoji: '🧲',
    tags: ['天赋异禀', '好运连连', '财富吸引'],
    score: (a, _c) => {
      let s = 0;
      // 先天能量强
      if (a.step2.overallStrength === 'strong') s += 25;
      // 赚钱天赋高
      if (a.step1.score >= 70) s += 25;
      // 相位网络好
      if (a.step3.harmoniousAspects.length >= 3) s += 20;
      // 总分高
      if (a.totalScore >= 70) s += 15;
      return Math.min(100, s);
    },
  },
  {
    id: 'investment-sage',
    title: '投资型智者',
    subtitle: 'The Investment Sage',
    tagline: '让钱为你工作',
    description: '你有很好的投资直觉和理财头脑。比起靠劳动赚钱，你更擅长通过投资、理财、资产配置来实现财富增值。你适合学习投资知识，让被动收入成为你的主要财富来源。',
    color: '#6b8ab8',
    emoji: '📊',
    tags: ['投资达人', '被动收入', '资产配置'],
    score: (a, _c) => {
      let s = 0;
      // 飞入8宫（被动收入）或5宫（投资）
      const flyIns = [a.step4.house2RulerFlyIn, a.step4.venusFlyIn, a.step4.jupiterFlyIn, a.step4.moonFlyIn];
      flyIns.forEach(f => { if (f.house === 8 || f.house === 5) s += 20; });
      // 财运流动好
      if (a.step3.score >= 60) s += 20;
      // 发财方向得分高
      if (a.step4.score >= 60) s += 15;
      return Math.min(100, s);
    },
  },
  {
    id: 'resilient-builder',
    title: '逆袭型建造者',
    subtitle: 'The Resilient Builder',
    tagline: '越挫越勇，大器晚成',
    description: '你的财富之路可能不是一帆风顺，但你有着超强的韧性和学习能力。每一次挫折都会让你变得更强。你属于大器晚成型，前期积累越扎实，后期爆发越惊人。',
    color: '#8a6b9a',
    emoji: '🔨',
    tags: ['越挫越勇', '大器晚成', '后发制人'],
    score: (a, _c) => {
      let s = 0;
      // 挑战多但不是绝望
      if (a.step3.challengingAspects.length >= 2) s += 20;
      // 先天能量偏弱
      if (a.step2.overallStrength === 'weak') s += 20;
      if (a.step2.overallStrength === 'moderate') s += 10;
      // 但某些维度有亮点
      if (a.step1.score >= 50 || a.step4.score >= 50 || a.step5.score >= 50) s += 20;
      // 总分不是最高但有潜力
      if (a.totalScore >= 30 && a.totalScore < 60) s += 15;
      return Math.min(100, s);
    },
  },
];

/**
 * 根据分析数据推导财富人格
 * 返回匹配度最高的人格类型
 */
export function deriveWealthPersonality(
  assessment: WealthAssessment,
  chart: ChartData
): WealthPersonality {
  let bestMatch: PersonalityRule = PERSONALITY_RULES[0];
  let bestScore = 0;

  for (const rule of PERSONALITY_RULES) {
    const score = rule.score(assessment, chart);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = rule;
    }
  }

  return {
    id: bestMatch.id,
    title: bestMatch.title,
    subtitle: bestMatch.subtitle,
    tagline: bestMatch.tagline,
    description: bestMatch.description,
    color: bestMatch.color,
    emoji: bestMatch.emoji,
    tags: bestMatch.tags,
    matchScore: bestScore,
  };
}

/**
 * 获取所有人格的匹配度排名（用于展示次要人格）
 */
export function getAllPersonalityScores(
  assessment: WealthAssessment,
  chart: ChartData
): WealthPersonality[] {
  return PERSONALITY_RULES
    .map(rule => ({
      id: rule.id,
      title: rule.title,
      subtitle: rule.subtitle,
      tagline: rule.tagline,
      description: rule.description,
      color: rule.color,
      emoji: rule.emoji,
      tags: rule.tags,
      matchScore: rule.score(assessment, chart),
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
}
