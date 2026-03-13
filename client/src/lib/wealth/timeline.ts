/**
 * 人生财富时间轴系统
 * 根据分析数据生成各人生阶段的财运预测
 */
import { WealthAssessment } from './assessment';

export interface TimelineStage {
  /** 阶段 ID */
  id: string;
  /** 年龄范围 */
  ageRange: string;
  /** 年份范围 */
  yearRange: string;
  /** 阶段名称 */
  name: string;
  /** 阶段图标 */
  icon: string;
  /** 财运等级 0-100 */
  fortuneLevel: number;
  /** 状态：机遇期/平稳期/注意期 */
  status: 'opportunity' | 'stable' | 'caution';
  /** 状态颜色 */
  statusColor: string;
  /** 一句话概括 */
  summary: string;
  /** 建议（2-3条） */
  tips: string[];
  /** 是否为当前阶段 */
  isCurrent: boolean;
  /** 是否已过去 */
  isPast: boolean;
}

interface StageTemplate {
  id: string;
  ageStart: number;
  ageEnd: number;
  name: string;
  icon: string;
}

const STAGE_TEMPLATES: StageTemplate[] = [
  { id: 'youth', ageStart: 18, ageEnd: 25, name: '起步探索期', icon: '🌱' },
  { id: 'accumulation', ageStart: 25, ageEnd: 30, name: '积累成长期', icon: '📚' },
  { id: 'development', ageStart: 30, ageEnd: 40, name: '发展突破期', icon: '🚀' },
  { id: 'harvest', ageStart: 40, ageEnd: 50, name: '收获丰盛期', icon: '🌾' },
  { id: 'consolidation', ageStart: 50, ageEnd: 60, name: '稳固传承期', icon: '🏛' },
  { id: 'enjoyment', ageStart: 60, ageEnd: 80, name: '从容享受期', icon: '🌅' },
];

/**
 * 根据分析数据和出生年份生成人生财富时间轴
 */
export function generateTimeline(
  assessment: WealthAssessment,
  birthYear: number
): TimelineStage[] {
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthYear;

  return STAGE_TEMPLATES.map(template => {
    const yearStart = birthYear + template.ageStart;
    const yearEnd = birthYear + template.ageEnd;
    const isCurrent = currentAge >= template.ageStart && currentAge < template.ageEnd;
    const isPast = currentAge >= template.ageEnd;

    // 根据分析数据计算每个阶段的财运等级
    const fortuneLevel = computeStageFortuneLevel(assessment, template.id);
    const status = fortuneLevel >= 65 ? 'opportunity' : fortuneLevel >= 40 ? 'stable' : 'caution';
    const statusColor = status === 'opportunity' ? '#7a8a5c' : status === 'stable' ? '#b8963e' : '#c47830';

    const summary = getStageSummary(assessment, template.id, fortuneLevel);
    const tips = getStageTips(assessment, template.id);

    return {
      id: template.id,
      ageRange: `${template.ageStart}-${template.ageEnd}岁`,
      yearRange: `${yearStart}-${yearEnd}年`,
      name: template.name,
      icon: template.icon,
      fortuneLevel,
      status,
      statusColor,
      summary,
      tips,
      isCurrent,
      isPast,
    };
  });
}

/**
 * 根据分析数据计算每个阶段的财运等级
 * 不同阶段受不同维度影响权重不同
 */
function computeStageFortuneLevel(a: WealthAssessment, stageId: string): number {
  const s1 = a.step1.score; // 赚钱天赋
  const s2 = a.step2.score; // 财富能量
  const s3 = a.step3.score; // 财运流动
  const s4 = a.step4.score; // 发财方向
  const s5 = a.step5.score; // 事业财运

  switch (stageId) {
    case 'youth':
      // 起步期：主要看天赋和能量
      return Math.round(s1 * 0.35 + s2 * 0.30 + s3 * 0.15 + s4 * 0.10 + s5 * 0.10);
    case 'accumulation':
      // 积累期：天赋+方向+事业开始重要
      return Math.round(s1 * 0.25 + s2 * 0.20 + s3 * 0.15 + s4 * 0.20 + s5 * 0.20);
    case 'development':
      // 发展期：方向和事业最重要
      return Math.round(s1 * 0.15 + s2 * 0.15 + s3 * 0.20 + s4 * 0.25 + s5 * 0.25);
    case 'harvest':
      // 收获期：全面开花，流动性和方向最重要
      return Math.round(s1 * 0.10 + s2 * 0.15 + s3 * 0.25 + s4 * 0.25 + s5 * 0.25);
    case 'consolidation':
      // 稳固期：能量和流动性
      return Math.round(s1 * 0.15 + s2 * 0.25 + s3 * 0.25 + s4 * 0.20 + s5 * 0.15);
    case 'enjoyment':
      // 享受期：整体平均
      return Math.round(s1 * 0.20 + s2 * 0.20 + s3 * 0.20 + s4 * 0.20 + s5 * 0.20);
    default:
      return a.totalScore;
  }
}

function getStageSummary(a: WealthAssessment, stageId: string, level: number): string {
  const isGood = level >= 65;
  const isOk = level >= 40;

  switch (stageId) {
    case 'youth':
      if (isGood) return '这是你发现赚钱天赋的黄金时期，你比同龄人更早展现出对金钱的敏感度';
      if (isOk) return '这个阶段重在探索和学习，不急于赚大钱，打好基础最重要';
      return '起步阶段可能会遇到一些迷茫，但每一次尝试都是宝贵的经验';

    case 'accumulation':
      if (isGood) return '你的财富积累速度明显加快，这个阶段的努力会为后来打下坚实基础';
      if (isOk) return '稳步积累的阶段，收入逐渐增长，开始形成自己的理财习惯';
      return '这个阶段需要更加努力和耐心，不要和别人比速度，走好自己的路';

    case 'development':
      if (isGood) return '这是你财富突破的关键十年，抓住机遇可能实现质的飞跃';
      if (isOk) return '事业和财富都在稳步发展，保持节奏不要急躁';
      return '这个阶段可能面临一些财务压力，但只要方向正确，终会迎来转机';

    case 'harvest':
      if (isGood) return '多年的积累开始结出丰硕果实，这是你财富增长最快的阶段';
      if (isOk) return '收获期到来，虽然不是爆发式增长，但稳定的回报让你越来越从容';
      return '收获可能来得比预期晚一些，但坚持就是胜利';

    case 'consolidation':
      if (isGood) return '财富已经积累到一定规模，重点转向保值增值和合理配置';
      if (isOk) return '这个阶段适合稳健理财，减少冒险，守住已有的成果';
      return '需要特别注意资产保护，避免大的财务风险';

    case 'enjoyment':
      if (isGood) return '前半生的努力让你可以从容享受生活，财务自由带来内心的平静';
      if (isOk) return '生活品质有保障，可以把更多精力放在自己真正喜欢的事情上';
      return '虽然财务上可能不是最宽裕，但简单的生活也有简单的快乐';

    default:
      return '';
  }
}

function getStageTips(a: WealthAssessment, stageId: string): string[] {
  const s1 = a.step1.score;
  const s4 = a.step4.score;
  const s5 = a.step5.score;

  switch (stageId) {
    case 'youth':
      return [
        s1 >= 60 ? '你有赚钱天赋，可以早点开始尝试副业或兼职' : '多尝试不同的赚钱方式，找到最适合自己的',
        '养成记账和储蓄的习惯，哪怕每月只存一点点',
        '投资自己的学习和技能提升，这是回报率最高的投资',
      ];
    case 'accumulation':
      return [
        s5 >= 60 ? '事业发展是你这个阶段的财富引擎，全力以赴' : '不要只盯着工资，开始学习投资理财知识',
        '建立紧急备用金（至少3-6个月生活费）',
        s4 >= 60 ? '你的发财方向很明确，集中精力深耕' : '多探索不同的收入渠道，不要把鸡蛋放一个篮子里',
      ];
    case 'development':
      return [
        '这是事业和财富的关键突破期，敢于把握大机会',
        s1 >= 60 ? '你的赚钱直觉很准，相信自己的判断' : '重大财务决策前多咨询专业人士',
        '开始考虑资产配置的多元化（房产、基金、保险等）',
      ];
    case 'harvest':
      return [
        '享受收获的同时，不要忘记持续学习和进步',
        '考虑开始做一些长期的财务规划（养老、子女教育等）',
        s4 >= 60 ? '你的优势领域还有很大的深挖空间' : '适当减少高风险投资的比例',
      ];
    case 'consolidation':
      return [
        '重点转向资产保值和稳健增值',
        '考虑财富传承和家族资产规划',
        '适当降低工作强度，平衡生活品质',
      ];
    case 'enjoyment':
      return [
        '享受生活是这个阶段的主题，不要给自己太大压力',
        '保持适度的社交和活动，身心健康就是最大的财富',
        '如果有余力，可以做一些公益或帮助年轻人',
      ];
    default:
      return [];
  }
}
