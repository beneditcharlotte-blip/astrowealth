/**
 * 九宫格财富维度系统
 * 
 * 排列方式：
 * 第一行（先天优势）：家族财运 | 金钱直觉 | 偏财体质
 * 第二行（连接层）  ：贵人运   | 财富人格  | 人脉经营
 * 第三行（后天努力）：职场晋升 | 投资修炼  | 创业拼搏
 * 
 * 底层逻辑基于专业占星分析，展示层完全通俗化
 */

import { WealthAssessment } from './assessment';
import { ChartData, PlanetData } from '../astro/chart';

export type GridRating = 'S' | 'A' | 'B' | 'C' | 'D';
export type GridRow = 'innate' | 'bridge' | 'effort';

export interface GridCell {
  /** 维度 ID */
  id: string;
  /** 维度名称 */
  name: string;
  /** 英文副标题 */
  subtitle: string;
  /** 所属行 */
  row: GridRow;
  /** 图标 emoji */
  icon: string;
  /** S/A/B/C/D 评级 */
  rating: GridRating;
  /** 原始分数 0-100 */
  rawScore: number;
  /** 一句话个性化描述（非常具体，不空泛） */
  oneLiner: string;
  /** 展开后的详细解读（2-3句话） */
  detail: string;
  /** 具体建议（1-2条） */
  tips: string[];
  /** 主题色 */
  color: string;
}

export interface NineGridResult {
  /** 先天三项 */
  innate: [GridCell, GridCell, GridCell];
  /** 连接层（贵人运、null占位-财富人格、人脉经营） */
  bridge: [GridCell, null, GridCell];
  /** 后天三项 */
  effort: [GridCell, GridCell, GridCell];
  /** 所有格子（不含中间null） */
  allCells: GridCell[];
}

// 评级颜色
const RATING_COLORS: Record<GridRating, string> = {
  S: '#d4a843',
  A: '#b8963e',
  B: '#7a8a5c',
  C: '#8a8070',
  D: '#6b6358',
};

function scoreToRating(score: number): GridRating {
  if (score >= 85) return 'S';
  if (score >= 70) return 'A';
  if (score >= 50) return 'B';
  if (score >= 30) return 'C';
  return 'D';
}

// ========== 先天维度计算 ==========

/** 家族财运：第4宫（家庭宫）相关行星 + 月亮状态 */
function calcFamilyFortune(a: WealthAssessment, c: ChartData): GridCell {
  let score = 50;
  
  // 月亮状态（代表家庭、母亲、情感安全感）
  const moon = c.planets.find(p => p.name === 'Moon');
  if (moon) {
    if (moon.dignity === 'domicile' || moon.dignity === 'exaltation') score += 20;
    else if (moon.dignity === 'detriment' || moon.dignity === 'fall') score -= 15;
    // 月亮在4宫（家庭宫）
    if (moon.house === 4) score += 15;
    // 月亮在2宫或8宫（财富宫）
    if (moon.house === 2 || moon.house === 8) score += 10;
  }
  
  // 第4宫有吉星
  const h4Planets = c.planets.filter(p => p.house === 4);
  for (const p of h4Planets) {
    if (['Venus', 'Jupiter'].includes(p.name)) score += 12;
    if (['Saturn', 'Pluto'].includes(p.name)) score -= 8;
  }
  
  // 木星状态（代表福气、贵人）
  const jupiter = c.planets.find(p => p.name === 'Jupiter');
  if (jupiter && (jupiter.dignity === 'domicile' || jupiter.dignity === 'exaltation')) score += 8;
  
  score = Math.max(0, Math.min(100, score));
  const rating = scoreToRating(score);
  
  let oneLiner = '';
  let detail = '';
  const tips: string[] = [];
  
  if (score >= 70) {
    oneLiner = '你的家庭背景对财富积累有明显助力';
    detail = '你很可能从家庭获得不错的物质基础或财务支持。无论是直接的经济帮助，还是家庭给你的安全感和资源，都为你的财富起步提供了良好的条件。家族中可能有理财或经商的传统。';
    tips.push('善用家庭资源和人脉，这是你的起跑优势');
    tips.push('如果家族有经商传统，可以考虑传承和发扬');
  } else if (score >= 50) {
    oneLiner = '家庭给了你基本的财务基础';
    detail = '你的家庭背景在财务方面属于中等水平，不会给你太大的压力，但也不会有太多直接的财务支持。你的财富更多需要靠自己打拼，但家庭给了你稳定的后盾。';
    tips.push('在家庭基础上稳步发展，不必急于求成');
    tips.push('和家人保持良好的沟通，关键时刻互相支持');
  } else {
    oneLiner = '你更适合白手起家，靠自己闯出一片天';
    detail = '你的财富积累可能较少依赖家庭背景。这并不是坏事——很多成功人士都是白手起家。没有家庭的"舒适区"反而会激发你更强的赚钱动力和独立精神。';
    tips.push('把"白手起家"当作你的骄傲，而不是劣势');
    tips.push('尽早建立自己的财务安全网，不依赖他人');
  }
  
  return {
    id: 'family-fortune',
    name: '家族财运',
    subtitle: 'Family Fortune',
    row: 'innate',
    icon: '🏠',
    rating,
    rawScore: score,
    oneLiner,
    detail,
    tips,
    color: RATING_COLORS[rating],
  };
}

/** 金钱直觉：第2宫（正财宫）宫主星状态 + 金星力量 */
function calcMoneyIntuition(a: WealthAssessment, c: ChartData): GridCell {
  let score = 50;
  
  // 金星状态（天然财星）
  const venus = c.planets.find(p => p.name === 'Venus');
  if (venus) {
    if (venus.dignity === 'domicile' || venus.dignity === 'exaltation') score += 20;
    else if (venus.dignity === 'detriment' || venus.dignity === 'fall') score -= 12;
    // 金星在2宫
    if (venus.house === 2) score += 15;
  }
  
  // 第2宫有吉星
  const h2Planets = c.planets.filter(p => p.house === 2);
  for (const p of h2Planets) {
    if (['Venus', 'Jupiter'].includes(p.name)) score += 10;
    if (p.name === 'Moon') score += 5;
  }
  
  // step1 的赚钱天赋评分
  score += (a.step1.score - 50) * 0.3;
  
  score = Math.max(0, Math.min(100, score));
  const rating = scoreToRating(score);
  
  let oneLiner = '';
  let detail = '';
  const tips: string[] = [];
  
  if (score >= 70) {
    oneLiner = '你对钱有天生的第六感，总能嗅到赚钱机会';
    detail = '你天生对金钱有很强的感知力。在别人还没反应过来的时候，你已经能察觉到哪里有赚钱的机会。这种直觉是你最宝贵的财富天赋，很多成功的投资和商业决策都源于这种直觉。';
    tips.push('相信你的金钱直觉，但也要用理性来验证');
    tips.push('多接触商业信息，让你的直觉有更多"原料"');
  } else if (score >= 50) {
    oneLiner = '你有基本的理财意识，但需要刻意训练';
    detail = '你对金钱的感知力处于正常水平。你不会对赚钱机会完全无感，但也不是那种天生就知道怎么赚钱的人。好消息是，金钱直觉是可以通过学习和实践来提升的。';
    tips.push('养成每天关注财经新闻的习惯，培养金钱敏感度');
    tips.push('从小额投资开始练手，积累实战经验');
  } else {
    oneLiner = '你需要系统学习理财知识来弥补直觉的不足';
    detail = '你在金钱方面的天生直觉不算强，可能经常错过一些赚钱机会，或者在财务决策上容易犹豫不决。但这完全可以通过后天学习来弥补，很多理财高手都是"学出来的"而不是"天生的"。';
    tips.push('报一个理财课程，系统学习基础知识');
    tips.push('做重要财务决策前多咨询专业人士');
  }
  
  return {
    id: 'money-intuition',
    name: '金钱直觉',
    subtitle: 'Money Intuition',
    row: 'innate',
    icon: '🔮',
    rating,
    rawScore: score,
    oneLiner,
    detail,
    tips,
    color: RATING_COLORS[rating],
  };
}

/** 偏财体质：第8宫 + 天王星/海王星相位 */
function calcWindfallLuck(a: WealthAssessment, c: ChartData): GridCell {
  let score = 40; // 偏财起点略低，因为大多数人偏财不强
  
  // 第8宫有吉星
  const h8Planets = c.planets.filter(p => p.house === 8);
  for (const p of h8Planets) {
    if (['Jupiter', 'Venus'].includes(p.name)) score += 15;
    if (p.name === 'Pluto') score += 8; // 冥王星在8宫有变革性财富
    if (p.name === 'Uranus') score += 10; // 天王星带来意外之财
  }
  
  // 木星状态
  const jupiter = c.planets.find(p => p.name === 'Jupiter');
  if (jupiter) {
    if (jupiter.dignity === 'domicile' || jupiter.dignity === 'exaltation') score += 12;
    if (jupiter.house === 5 || jupiter.house === 8 || jupiter.house === 11) score += 10;
  }
  
  // 吉相位多 = 偏财运好
  if (a.step3.harmoniousAspects.length >= 4) score += 10;
  else if (a.step3.harmoniousAspects.length >= 2) score += 5;
  
  score = Math.max(0, Math.min(100, score));
  const rating = scoreToRating(score);
  
  let oneLiner = '';
  let detail = '';
  const tips: string[] = [];
  
  if (score >= 70) {
    oneLiner = '你有"偏财体质"，容易遇到意外的赚钱机会';
    detail = '你属于那种偶尔会有"天上掉馅饼"的人。无论是意外的投资回报、别人主动找你合作、还是突然出现的赚钱机会，你的偏财运都比较旺。当然，这不是让你去买彩票，而是说你要保持开放心态，好运来了要接得住。';
    tips.push('保持对新机会的开放态度，好运来了别犹豫');
    tips.push('适当参与一些有潜力的投资，你的偏财运会帮你');
  } else if (score >= 50) {
    oneLiner = '你偶尔会有意外之财，但不能依赖运气';
    detail = '你的偏财运处于中等水平，偶尔会有一些意外的收入或机会，但不能把它当作主要的财富来源。稳扎稳打地赚钱才是你的主旋律，偏财只是锦上添花。';
    tips.push('不要把希望寄托在"运气"上，踏实赚钱更靠谱');
    tips.push('但也别完全忽视意外机会，保持一定的灵活性');
  } else {
    oneLiner = '你的财富主要靠实力，而不是运气';
    detail = '你不是那种"运气型"选手，意外之财对你来说比较少见。但这恰恰说明你的财富是靠真本事赚来的，更加稳固和可持续。与其期待天上掉馅饼，不如把精力放在提升自己的赚钱能力上。';
    tips.push('专注提升核心技能，你的财富来自实力而非运气');
    tips.push('远离高风险投机，这不是你的赛道');
  }
  
  return {
    id: 'windfall-luck',
    name: '偏财体质',
    subtitle: 'Windfall Luck',
    row: 'innate',
    icon: '🍀',
    rating,
    rawScore: score,
    oneLiner,
    detail,
    tips,
    color: RATING_COLORS[rating],
  };
}

// ========== 连接层维度计算 ==========

/** 贵人运：第11宫（人际宫）+ 木星相位网络 */
function calcNobleHelp(a: WealthAssessment, c: ChartData): GridCell {
  let score = 50;
  
  // 第11宫有吉星
  const h11Planets = c.planets.filter(p => p.house === 11);
  for (const p of h11Planets) {
    if (['Jupiter', 'Venus'].includes(p.name)) score += 15;
    if (p.name === 'Sun') score += 8;
  }
  
  // 木星相位网络
  const jupiter = c.planets.find(p => p.name === 'Jupiter');
  if (jupiter) {
    if (jupiter.dignity === 'domicile' || jupiter.dignity === 'exaltation') score += 15;
    // 木星在角宫（1、4、7、10）更容易遇到贵人
    if ([1, 4, 7, 10].includes(jupiter.house)) score += 10;
  }
  
  // 吉相位多 = 人际关系好
  if (a.step3.harmoniousAspects.length >= 3) score += 10;
  
  // 飞入11宫或7宫
  const flyIns = [a.step4.house2RulerFlyIn, a.step4.venusFlyIn, a.step4.jupiterFlyIn, a.step4.moonFlyIn];
  flyIns.forEach(f => { if (f.house === 11 || f.house === 7) score += 8; });
  
  score = Math.max(0, Math.min(100, score));
  const rating = scoreToRating(score);
  
  let oneLiner = '';
  let detail = '';
  const tips: string[] = [];
  
  if (score >= 70) {
    oneLiner = '你天生容易遇到帮你赚钱的贵人';
    detail = '你的人生中会出现不少"贵人"——他们可能是给你机会的老板、带你入行的前辈、或者关键时刻拉你一把的朋友。你天生有一种让别人愿意帮助你的气质，这是非常珍贵的财富资源。';
    tips.push('珍惜每一个帮助过你的人，贵人关系需要维护');
    tips.push('主动表达感恩，让贵人愿意持续帮助你');
  } else if (score >= 50) {
    oneLiner = '你会遇到一些贵人，但需要主动争取';
    detail = '你的贵人运处于中等水平，不会自动送上门，但只要你主动出击、展现自己的价值，还是能够获得不少人的帮助和支持。关键是你要学会"被看见"。';
    tips.push('主动展示你的能力和价值，让别人看到你的潜力');
    tips.push('参加行业活动和社交场合，增加遇到贵人的概率');
  } else {
    oneLiner = '你更适合靠自己的实力，而不是等待贵人';
    detail = '你的贵人运不算特别突出，不太容易遇到那种"一句话改变你命运"的人。但这也意味着你的成功完全是靠自己的努力，更加踏实和可持续。';
    tips.push('与其等贵人，不如让自己成为别人的贵人');
    tips.push('建立专业口碑，用实力吸引合作机会');
  }
  
  return {
    id: 'noble-help',
    name: '贵人运',
    subtitle: 'Noble Help',
    row: 'bridge',
    icon: '🤲',
    rating,
    rawScore: score,
    oneLiner,
    detail,
    tips,
    color: RATING_COLORS[rating],
  };
}

/** 人脉经营：第7宫（合作宫）+ 金星社交相位 */
function calcNetworking(a: WealthAssessment, c: ChartData): GridCell {
  let score = 50;
  
  // 第7宫有吉星
  const h7Planets = c.planets.filter(p => p.house === 7);
  for (const p of h7Planets) {
    if (['Venus', 'Jupiter'].includes(p.name)) score += 12;
    if (p.name === 'Sun' || p.name === 'Moon') score += 5;
    if (['Saturn', 'Pluto'].includes(p.name)) score -= 5;
  }
  
  // 金星状态（社交能力）
  const venus = c.planets.find(p => p.name === 'Venus');
  if (venus) {
    if (venus.dignity === 'domicile' || venus.dignity === 'exaltation') score += 15;
    else if (venus.dignity === 'detriment' || venus.dignity === 'fall') score -= 8;
    // 金星在社交相关宫位
    if ([3, 7, 11].includes(venus.house)) score += 10;
  }
  
  // 飞入7宫或11宫
  const flyIns = [a.step4.house2RulerFlyIn, a.step4.venusFlyIn, a.step4.jupiterFlyIn, a.step4.moonFlyIn];
  flyIns.forEach(f => { if (f.house === 7 || f.house === 11 || f.house === 3) score += 6; });
  
  // 吉相位多 = 人际和谐
  score += a.step3.harmoniousAspects.length * 3;
  
  score = Math.max(0, Math.min(100, score));
  const rating = scoreToRating(score);
  
  let oneLiner = '';
  let detail = '';
  const tips: string[] = [];
  
  if (score >= 70) {
    oneLiner = '你天生擅长经营人脉，社交就是你的赚钱工具';
    detail = '你有很强的社交天赋，能够轻松地和各种人建立良好的关系。更重要的是，你知道如何把人脉转化为实际的财富——无论是合作机会、客户资源、还是信息优势。';
    tips.push('把社交当作一种投资，定期维护重要关系');
    tips.push('考虑从事需要广泛人脉的行业，如销售、咨询、投资');
  } else if (score >= 50) {
    oneLiner = '你的社交能力够用，但还有提升空间';
    detail = '你能够维持基本的人际关系，但在"把人脉变成钱"这件事上还需要更多练习。你不是天生的社交达人，但通过刻意练习，完全可以建立起有价值的人脉网络。';
    tips.push('学习一些社交技巧，比如如何有效地自我介绍');
    tips.push('找到2-3个核心圈子深耕，而不是广撒网');
  } else {
    oneLiner = '你更适合靠专业能力赚钱，而不是靠人脉';
    detail = '你可能不太擅长或不太喜欢社交应酬。这没关系——很多技术大牛和专业人士都是靠硬实力赚钱的。与其勉强自己去社交，不如把精力放在提升专业能力上。';
    tips.push('专注于提升你的核心专业技能，用作品说话');
    tips.push('找一个擅长社交的合作伙伴，互补短板');
  }
  
  return {
    id: 'networking',
    name: '人脉经营',
    subtitle: 'Networking',
    row: 'bridge',
    icon: '🔗',
    rating,
    rawScore: score,
    oneLiner,
    detail,
    tips,
    color: RATING_COLORS[rating],
  };
}

// ========== 后天努力维度计算 ==========

/** 职场晋升：中天（MC）+ 第10宫 + 土星状态 */
function calcCareerGrowth(a: WealthAssessment, c: ChartData): GridCell {
  let score = 50;
  
  // 第10宫有吉星
  const h10Planets = c.planets.filter(p => p.house === 10);
  for (const p of h10Planets) {
    if (['Jupiter', 'Venus', 'Sun'].includes(p.name)) score += 12;
    if (p.name === 'Saturn') score += 5; // 土星在10宫虽辛苦但最终有成就
    if (p.name === 'Mars') score += 5; // 火星在10宫有事业冲劲
  }
  
  // 土星状态（纪律、耐心、长期积累）
  const saturn = c.planets.find(p => p.name === 'Saturn');
  if (saturn) {
    if (saturn.dignity === 'domicile' || saturn.dignity === 'exaltation') score += 12;
    else if (saturn.dignity === 'detriment' || saturn.dignity === 'fall') score -= 5;
  }
  
  // step5 事业财运评分
  score += (a.step5.score - 50) * 0.4;
  
  // 飞入10宫或6宫
  const flyIns = [a.step4.house2RulerFlyIn, a.step4.venusFlyIn, a.step4.jupiterFlyIn, a.step4.moonFlyIn];
  flyIns.forEach(f => { if (f.house === 10 || f.house === 6) score += 8; });
  
  score = Math.max(0, Math.min(100, score));
  const rating = scoreToRating(score);
  
  let oneLiner = '';
  let detail = '';
  const tips: string[] = [];
  
  if (score >= 70) {
    oneLiner = '你的事业上升通道很宽，升职加薪是你的主旋律';
    detail = '你在职场上有很强的上升潜力。无论是在大公司还是体制内，你都能通过持续的努力和表现获得晋升机会。你的事业发展和收入增长是高度同步的——职位越高，赚得越多。';
    tips.push('制定清晰的职业规划，每2-3年要有一次明显的跃升');
    tips.push('主动争取重要项目和曝光机会，让领导看到你的能力');
  } else if (score >= 50) {
    oneLiner = '职场发展稳定，但需要主动争取机会';
    detail = '你在职场上的发展属于中规中矩，不会特别快但也不会停滞。关键是你需要更加主动地去争取机会，而不是等着别人来提拔你。';
    tips.push('不要只埋头干活，也要学会向上管理和展示成果');
    tips.push('考虑是否需要跳槽来加速职业发展');
  } else {
    oneLiner = '传统职场可能不是你的最佳赛道';
    detail = '你可能不太适合在传统的职场体系中按部就班地往上爬。这不代表你赚不到钱，而是说你可能更适合走一条非传统的路——比如自由职业、创业、或者在某个细分领域做到极致。';
    tips.push('考虑发展一技之长，走专家路线而非管理路线');
    tips.push('探索职场之外的收入可能性，比如副业或自由职业');
  }
  
  return {
    id: 'career-growth',
    name: '职场晋升',
    subtitle: 'Career Growth',
    row: 'effort',
    icon: '📈',
    rating,
    rawScore: score,
    oneLiner,
    detail,
    tips,
    color: RATING_COLORS[rating],
  };
}

/** 投资修炼：第8宫 + 冥王星 + 木星相位 */
function calcInvestmentSkill(a: WealthAssessment, c: ChartData): GridCell {
  let score = 45; // 投资起点略低
  
  // 第8宫有吉星
  const h8Planets = c.planets.filter(p => p.house === 8);
  for (const p of h8Planets) {
    if (['Jupiter', 'Venus'].includes(p.name)) score += 15;
    if (p.name === 'Pluto') score += 10;
  }
  
  // 第5宫有吉星（投资、投机）
  const h5Planets = c.planets.filter(p => p.house === 5);
  for (const p of h5Planets) {
    if (['Jupiter', 'Venus'].includes(p.name)) score += 10;
  }
  
  // 木星状态
  const jupiter = c.planets.find(p => p.name === 'Jupiter');
  if (jupiter) {
    if (jupiter.dignity === 'domicile' || jupiter.dignity === 'exaltation') score += 12;
    if (jupiter.house === 5 || jupiter.house === 8) score += 10;
  }
  
  // 财运流动好 = 投资环境好
  score += (a.step3.score - 50) * 0.3;
  
  // 飞入8宫或5宫
  const flyIns = [a.step4.house2RulerFlyIn, a.step4.venusFlyIn, a.step4.jupiterFlyIn, a.step4.moonFlyIn];
  flyIns.forEach(f => { if (f.house === 8 || f.house === 5) score += 8; });
  
  score = Math.max(0, Math.min(100, score));
  const rating = scoreToRating(score);
  
  let oneLiner = '';
  let detail = '';
  const tips: string[] = [];
  
  if (score >= 70) {
    oneLiner = '你有很好的投资天赋，学习后回报会很可观';
    detail = '你在投资理财方面有不错的天赋和直觉。通过系统学习投资知识，你有很大概率获得超越平均水平的投资回报。被动收入可以成为你财富增长的重要引擎。';
    tips.push('系统学习投资知识，从指数基金定投开始');
    tips.push('逐步建立多元化的投资组合，让钱为你工作');
  } else if (score >= 50) {
    oneLiner = '投资可以作为辅助，但不要作为主要收入来源';
    detail = '你在投资方面有一定的学习潜力，但不建议把投资当作主要的赚钱方式。稳健的理财策略更适合你——比如定投、国债、稳健型基金等。';
    tips.push('以稳健理财为主，不要追求高风险高回报');
    tips.push('每月固定拿出收入的10-20%做定投');
  } else {
    oneLiner = '投资不是你的强项，保守理财更适合你';
    detail = '你在投资方面的天赋不算突出，容易在投资中踩坑或做出不理性的决策。建议你把主要精力放在提升主动收入上，理财方面以保守策略为主。';
    tips.push('远离高风险投资，银行理财和国债更适合你');
    tips.push('如果要投资，找专业的理财顾问帮你做决策');
  }
  
  return {
    id: 'investment-skill',
    name: '投资修炼',
    subtitle: 'Investment Skill',
    row: 'effort',
    icon: '💹',
    rating,
    rawScore: score,
    oneLiner,
    detail,
    tips,
    color: RATING_COLORS[rating],
  };
}

/** 创业拼搏：火星状态 + 第1宫 + 太阳力量 */
function calcEntrepreneurship(a: WealthAssessment, c: ChartData): GridCell {
  let score = 45; // 创业起点略低
  
  // 火星状态（行动力、冲劲）
  const mars = c.planets.find(p => p.name === 'Mars');
  if (mars) {
    if (mars.dignity === 'domicile' || mars.dignity === 'exaltation') score += 18;
    else if (mars.dignity === 'detriment' || mars.dignity === 'fall') score -= 8;
    // 火星在角宫（1、4、7、10）行动力强
    if ([1, 4, 7, 10].includes(mars.house)) score += 10;
  }
  
  // 太阳状态（领导力、自信）
  const sun = c.planets.find(p => p.name === 'Sun');
  if (sun) {
    if (sun.dignity === 'domicile' || sun.dignity === 'exaltation') score += 15;
    if (sun.house === 1 || sun.house === 10) score += 10;
  }
  
  // 第1宫有行星（个人能量强）
  const h1Planets = c.planets.filter(p => p.house === 1);
  if (h1Planets.length >= 2) score += 10;
  else if (h1Planets.length === 1) score += 5;
  
  // 飞入1宫或10宫
  const flyIns = [a.step4.house2RulerFlyIn, a.step4.venusFlyIn, a.step4.jupiterFlyIn, a.step4.moonFlyIn];
  flyIns.forEach(f => { if (f.house === 1 || f.house === 10 || f.house === 5) score += 6; });
  
  // 挑战相位适中 = 有韧性
  if (a.step3.challengingAspects.length >= 1 && a.step3.challengingAspects.length <= 3) score += 5;
  
  score = Math.max(0, Math.min(100, score));
  const rating = scoreToRating(score);
  
  let oneLiner = '';
  let detail = '';
  const tips: string[] = [];
  
  if (score >= 70) {
    oneLiner = '你有很强的创业基因，适合自己当老板';
    detail = '你天生具备创业者的特质——行动力强、敢于冒险、有领导力。你不太适合一直给别人打工，自己创业或做生意可能会让你的财富实现质的飞跃。当然，创业也需要时机和准备。';
    tips.push('如果有好的创业想法，大胆去尝试，你有这个潜力');
    tips.push('先从副业开始验证商业模式，降低风险');
  } else if (score >= 50) {
    oneLiner = '你可以尝试创业，但需要找到好的合伙人';
    detail = '你有一定的创业潜力，但可能在某些方面（比如执行力或抗压能力）还需要加强。如果要创业，建议找一个能力互补的合伙人一起干，成功率会高很多。';
    tips.push('先积累足够的行业经验和资源再考虑创业');
    tips.push('找到能力互补的合伙人，不要单打独斗');
  } else {
    oneLiner = '创业风险对你来说偏高，稳定发展更适合';
    detail = '你可能不太适合承受创业的高风险和高压力。这不是说你不够优秀，而是每个人的赛道不同。在稳定的环境中发挥你的专业能力，同样可以获得很好的财富回报。';
    tips.push('在稳定的平台上发展，用专业能力换取高收入');
    tips.push('如果想增加收入，可以考虑低风险的副业');
  }
  
  return {
    id: 'entrepreneurship',
    name: '创业拼搏',
    subtitle: 'Entrepreneurship',
    row: 'effort',
    icon: '🚀',
    rating,
    rawScore: score,
    oneLiner,
    detail,
    tips,
    color: RATING_COLORS[rating],
  };
}

// ========== 主函数 ==========

/**
 * 计算九宫格所有维度
 */
export function computeNineGrid(
  assessment: WealthAssessment,
  chart: ChartData
): NineGridResult {
  const familyFortune = calcFamilyFortune(assessment, chart);
  const moneyIntuition = calcMoneyIntuition(assessment, chart);
  const windfallLuck = calcWindfallLuck(assessment, chart);
  const nobleHelp = calcNobleHelp(assessment, chart);
  const networking = calcNetworking(assessment, chart);
  const careerGrowth = calcCareerGrowth(assessment, chart);
  const investmentSkill = calcInvestmentSkill(assessment, chart);
  const entrepreneurship = calcEntrepreneurship(assessment, chart);

  const allCells = [
    familyFortune, moneyIntuition, windfallLuck,
    nobleHelp, networking,
    careerGrowth, investmentSkill, entrepreneurship,
  ];

  return {
    innate: [familyFortune, moneyIntuition, windfallLuck],
    bridge: [nobleHelp, null, networking],
    effort: [careerGrowth, investmentSkill, entrepreneurship],
    allCells,
  };
}

/**
 * 获取评级的中文名称
 */
export function getRatingLabel(rating: GridRating): string {
  const labels: Record<GridRating, string> = {
    S: '极强',
    A: '优秀',
    B: '良好',
    C: '一般',
    D: '待提升',
  };
  return labels[rating];
}
