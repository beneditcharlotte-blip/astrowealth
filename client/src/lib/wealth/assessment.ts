/**
 * 六步财富评估系统
 * 
 * 第一步：定位核心财富征象（本命盘基础）
 * 第二步：评估征象星的"先天状态"（庙旺落陷）
 * 第三步：分析相位联动（财富流动与阻碍）
 * 第四步：整合宫位系统（财富实现领域）
 * 第五步：结合职业与运势推演
 * 第六步：综合判断与定性描述
 */

import { ChartData, PlanetData, getPlanet, getPlanetsInHouse, getHouseCuspSign } from '../astro/chart';
import { Aspect, getAspectsForPlanet } from '../astro/aspects';
import { ZODIAC_SIGNS, getSignRuler, dignityScore, DignityStatus } from '../astro/zodiac';

// ========== 类型定义 ==========

export type WealthGrade = 'A10' | 'A9' | 'A8' | 'A7' | 'A6';
export type WealthSubGrade = '+' | '' | '-';

export interface WealthAssessment {
  // 总评
  grade: WealthGrade;
  subGrade: WealthSubGrade;
  gradeLabel: string;       // 如 "A8+"
  gradeName: string;        // 如 "优良财星"
  gradeDescription: string; // 等级描述
  totalScore: number;       // 总分（内部计算用，0-100）

  // 六步分析
  step1: Step1Result;  // 核心财富征象
  step2: Step2Result;  // 先天状态
  step3: Step3Result;  // 相位联动
  step4: Step4Result;  // 宫位系统
  step5: Step5Result;  // 职业运势
  step6: Step6Result;  // 综合结论

  // 免责声明
  disclaimer: string;
}

export interface Step1Result {
  title: string;
  house2: HouseAnalysis;    // 第二宫分析
  house8: HouseAnalysis;    // 第八宫分析
  keyPlanets: KeyPlanetInfo[]; // 关键财富征象星
  score: number;
}

export interface HouseAnalysis {
  houseNumber: number;
  cuspSign: string;
  cuspSignCn: string;
  ruler: string;
  rulerCn: string;
  rulerPlanet?: PlanetData;
  planetsInHouse: PlanetData[];
  description: string;
}

export interface KeyPlanetInfo {
  planet: PlanetData;
  role: string;
  description: string;
}

export interface Step2Result {
  title: string;
  dignities: Array<{
    planet: PlanetData;
    role: string;
    status: DignityStatus;
    statusCn: string;
    score: number;
    description: string;
  }>;
  overallStrength: 'strong' | 'moderate' | 'weak';
  overallStrengthCn: string;
  score: number;
}

export interface Step3Result {
  title: string;
  harmoniousAspects: AspectAnalysis[];
  challengingAspects: AspectAnalysis[];
  wealthNetwork: string;
  score: number;
}

export interface AspectAnalysis {
  aspect: Aspect;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface Step4Result {
  title: string;
  house2RulerFlyIn: FlyInAnalysis;
  venusFlyIn: FlyInAnalysis;
  jupiterFlyIn: FlyInAnalysis;
  moonFlyIn: FlyInAnalysis;
  score: number;
}

export interface FlyInAnalysis {
  planetName: string;
  planetNameCn: string;
  house: number;
  description: string;
  quality: 'excellent' | 'good' | 'neutral' | 'challenging';
}

export interface Step5Result {
  title: string;
  careerWealth: string;
  mcAnalysis: string;
  jupiterTransits: string;
  saturnTransits: string;
  score: number;
}

export interface Step6Result {
  title: string;
  summary: string;
  strengths: string[];
  challenges: string[];
  advice: string[];
}

// ========== 评估实现 ==========

/**
 * 主评估函数
 */
export function assessWealth(chart: ChartData): WealthAssessment {
  const step1 = analyzeStep1(chart);
  const step2 = analyzeStep2(chart);
  const step3 = analyzeStep3(chart);
  const step4 = analyzeStep4(chart);
  const step5 = analyzeStep5(chart);

  // 计算总分
  const totalScore = Math.round(
    step1.score * 0.20 +
    step2.score * 0.30 +
    step3.score * 0.20 +
    step4.score * 0.20 +
    step5.score * 0.10
  );

  // 确定等级
  const { grade, subGrade } = scoreToGrade(totalScore);
  const gradeInfo = GRADE_INFO[grade];

  const step6 = analyzeStep6(chart, totalScore, grade, step1, step2, step3, step4, step5);

  return {
    grade,
    subGrade,
    gradeLabel: `${grade}${subGrade}`,
    gradeName: gradeInfo.name,
    gradeDescription: gradeInfo.description,
    totalScore,
    step1, step2, step3, step4, step5, step6,
    disclaimer: '星盘显示的是潜能和模式，最终财富水平还受意识水平、教育、机遇、地域等现实因素调节。现实选择决定其发挥程度。本报告仅供参考和娱乐，不构成任何投资或财务建议。'
  };
}

// ========== 等级定义 ==========

const GRADE_INFO: Record<WealthGrade, { name: string; description: string; min: number; max: number }> = {
  A10: {
    name: '卓越财星',
    description: '核心财星庙旺，多重吉相位网络，飞入最佳宫位，事业与财富完美联动。财富潜力巨大，获取渠道多且顺畅，易得贵人助力，人生中有明显的财富跃升期。',
    min: 85, max: 100
  },
  A9: {
    name: '上等财星',
    description: '关键财星状态良好，有明显吉相位支撑，飞入较好宫位。财富基础优良，有较好的发展空间，关键时期把握机遇可实现跃升。',
    min: 70, max: 84
  },
  A8: {
    name: '优良财星',
    description: '财星状态中上，吉凶并存但吉多于凶，宫位配置尚可。财富需通过个人努力和专业能力稳定积累，有不错的收入潜力。',
    min: 55, max: 69
  },
  A7: {
    name: '稳健财星',
    description: '财星状态中性，吉凶相位均衡。财富需通过持续努力和专业能力积累，面临特定领域的财务压力或波动，但整体稳定。',
    min: 40, max: 54
  },
  A6: {
    name: '潜力财星',
    description: '财星状态偏弱或受挑战相位较多。财务之路需要付出更多努力克服障碍，重点在于管理风险、建立财务纪律，通过特定方向努力改善。',
    min: 0, max: 39
  }
};

function scoreToGrade(score: number): { grade: WealthGrade; subGrade: WealthSubGrade } {
  let grade: WealthGrade;
  if (score >= 85) grade = 'A10';
  else if (score >= 70) grade = 'A9';
  else if (score >= 55) grade = 'A8';
  else if (score >= 40) grade = 'A7';
  else grade = 'A6';

  const info = GRADE_INFO[grade];
  const range = info.max - info.min;
  const posInRange = score - info.min;
  let subGrade: WealthSubGrade;
  if (posInRange > range * 0.66) subGrade = '+';
  else if (posInRange > range * 0.33) subGrade = '';
  else subGrade = '-';

  return { grade, subGrade };
}

// ========== 第一步：定位核心财富征象 ==========

function analyzeStep1(chart: ChartData): Step1Result {
  // 第二宫分析
  const house2CuspSign = getHouseCuspSign(chart, 2);
  const house2Ruler = getSignRuler(house2CuspSign.name);
  const house2RulerPlanet = chart.planets.find(p => p.name === house2Ruler);
  const house2Planets = getPlanetsInHouse(chart, 2);

  // 第八宫分析
  const house8CuspSign = getHouseCuspSign(chart, 8);
  const house8Ruler = getSignRuler(house8CuspSign.name);
  const house8RulerPlanet = chart.planets.find(p => p.name === house8Ruler);
  const house8Planets = getPlanetsInHouse(chart, 8);

  // 关键征象星
  const venus = getPlanet(chart, 'Venus');
  const jupiter = getPlanet(chart, 'Jupiter');
  const moon = getPlanet(chart, 'Moon');

  const keyPlanets: KeyPlanetInfo[] = [];
  if (venus) keyPlanets.push({
    planet: venus,
    role: '天然财富征象星',
    description: `金星落在${venus.sign.nameCn}${venus.house}宫，${venus.dignityCn}状态。金星天然象征金钱、价值与财富，其状态直接反映个人对金钱的态度和吸引力。`
  });
  if (jupiter) keyPlanets.push({
    planet: jupiter,
    role: '天然扩张征象星',
    description: `木星落在${jupiter.sign.nameCn}${jupiter.house}宫，${jupiter.dignityCn}状态。木星天然象征扩张、幸运与红利，代表财富增长的潜力和机遇。`
  });
  if (moon) keyPlanets.push({
    planet: moon,
    role: '福禄征象星',
    description: `月亮落在${moon.sign.nameCn}${moon.house}宫，${moon.dignityCn}状态。月亮代表福禄、生活的舒适与成就，在印度占星中是重要的财富指标。`
  });

  // 评分
  let score = 50;
  // 二宫有吉星加分
  for (const p of house2Planets) {
    if (['Venus', 'Jupiter'].includes(p.name)) score += 8;
    if (['Sun', 'Moon'].includes(p.name)) score += 5;
    if (['Saturn', 'Mars', 'Pluto'].includes(p.name)) score -= 3;
  }
  // 八宫有行星
  for (const p of house8Planets) {
    if (['Jupiter', 'Pluto'].includes(p.name)) score += 5;
    if (['Venus'].includes(p.name)) score += 3;
  }
  score = Math.max(0, Math.min(100, score));

  return {
    title: '定位核心财富征象',
    house2: {
      houseNumber: 2,
      cuspSign: house2CuspSign.name,
      cuspSignCn: house2CuspSign.nameCn,
      ruler: house2Ruler,
      rulerCn: house2RulerPlanet?.nameCn || house2Ruler,
      rulerPlanet: house2RulerPlanet,
      planetsInHouse: house2Planets,
      description: generateHouseDescription(2, house2CuspSign.nameCn, house2Planets, house2RulerPlanet)
    },
    house8: {
      houseNumber: 8,
      cuspSign: house8CuspSign.name,
      cuspSignCn: house8CuspSign.nameCn,
      ruler: house8Ruler,
      rulerCn: house8RulerPlanet?.nameCn || house8Ruler,
      rulerPlanet: house8RulerPlanet,
      planetsInHouse: house8Planets,
      description: generateHouseDescription(8, house8CuspSign.nameCn, house8Planets, house8RulerPlanet)
    },
    keyPlanets,
    score
  };
}

function generateHouseDescription(house: number, signCn: string, planets: PlanetData[], ruler?: PlanetData): string {
  const houseName = house === 2 ? '正财宫（第二宫）' : '偏财宫（第八宫）';
  const houseTheme = house === 2 ? '个人财富、资产、现金流与价值观' : '他人资源、投资、遗产与合伙财';
  
  let desc = `${houseName}宫头落在${signCn}，主宰${houseTheme}。`;
  
  if (ruler) {
    desc += `宫主星${ruler.nameCn}落在${ruler.sign.nameCn}${ruler.house}宫，处于${ruler.dignityCn}状态。`;
  }
  
  if (planets.length > 0) {
    const names = planets.map(p => p.nameCn).join('、');
    desc += `宫内有${names}落入，`;
    const benefics = planets.filter(p => ['Venus', 'Jupiter'].includes(p.name));
    const malefics = planets.filter(p => ['Saturn', 'Mars', 'Pluto'].includes(p.name));
    if (benefics.length > 0 && malefics.length === 0) {
      desc += '吉星入宫，财富能量充沛。';
    } else if (malefics.length > 0 && benefics.length === 0) {
      desc += '凶星入宫，财富获取需克服挑战。';
    } else if (benefics.length > 0 && malefics.length > 0) {
      desc += '吉凶并存，财富伴随机遇与挑战。';
    } else {
      desc += '为财富宫位增添了特殊能量。';
    }
  } else {
    desc += '宫内无行星落入，财富表现主要取决于宫主星的状态。';
  }

  return desc;
}

// ========== 第二步：评估先天状态 ==========

function analyzeStep2(chart: ChartData): Step2Result {
  const house2CuspSign = getHouseCuspSign(chart, 2);
  const house2Ruler = getSignRuler(house2CuspSign.name);
  const house8CuspSign = getHouseCuspSign(chart, 8);
  const house8Ruler = getSignRuler(house8CuspSign.name);

  const keyNames = new Set([house2Ruler, house8Ruler, 'Venus', 'Jupiter', 'Moon']);
  const roles: Record<string, string> = {
    [house2Ruler]: '二宫主星',
    [house8Ruler]: '八宫主星',
    Venus: '天然财星（金星）',
    Jupiter: '天然吉星（木星）',
    Moon: '福禄星（月亮）'
  };

  const dignities = Array.from(keyNames).map(name => {
    const planet = chart.planets.find(p => p.name === name);
    if (!planet) return null;
    const score = dignityScore(planet.dignity);
    
    let description = '';
    switch (planet.dignity) {
      case 'domicile':
        description = `${planet.nameCn}在${planet.sign.nameCn}入庙，财富能量纯正稳定，能完全发挥正面特质，先天财富格局起点高。`;
        break;
      case 'exaltation':
        description = `${planet.nameCn}在${planet.sign.nameCn}耀升，财富能量被拔高，有超常发挥的潜力，格局起点较高。`;
        break;
      case 'detriment':
        description = `${planet.nameCn}在${planet.sign.nameCn}失势，财富能量难以舒展，容易用错误的方式表达，需要更多意识和努力来转化。`;
        break;
      case 'fall':
        description = `${planet.nameCn}在${planet.sign.nameCn}落陷，财富能量被压抑，获取过程多挑战，需要克服相关课题。`;
        break;
      default:
        description = `${planet.nameCn}在${planet.sign.nameCn}处于中性状态，财富能量不偏不倚，发挥取决于其他因素的配合。`;
    }

    return {
      planet,
      role: roles[name] || name,
      status: planet.dignity,
      statusCn: planet.dignityCn,
      score,
      description
    };
  }).filter((d): d is NonNullable<typeof d> => d !== null);

  const avgScore = dignities.reduce((sum, d) => sum + d.score, 0) / Math.max(dignities.length, 1);
  let overallStrength: 'strong' | 'moderate' | 'weak';
  let overallStrengthCn: string;
  if (avgScore >= 4) { overallStrength = 'strong'; overallStrengthCn = '强势'; }
  else if (avgScore >= 2.5) { overallStrength = 'moderate'; overallStrengthCn = '中等'; }
  else { overallStrength = 'weak'; overallStrengthCn = '偏弱'; }

  const normalizedScore = Math.round((avgScore / 5) * 100);

  return {
    title: '评估征象星先天状态',
    dignities,
    overallStrength,
    overallStrengthCn,
    score: normalizedScore
  };
}

// ========== 第三步：分析相位联动 ==========

function analyzeStep3(chart: ChartData): Step3Result {
  const wealthPlanets = ['Venus', 'Jupiter', 'Moon'];
  const house2CuspSign = getHouseCuspSign(chart, 2);
  const house2Ruler = getSignRuler(house2CuspSign.name);
  const house8CuspSign = getHouseCuspSign(chart, 8);
  const house8Ruler = getSignRuler(house8CuspSign.name);
  
  const relevantPlanets = new Set([...wealthPlanets, house2Ruler, house8Ruler, 'ASC', 'MC']);
  
  const harmoniousAspects: AspectAnalysis[] = [];
  const challengingAspects: AspectAnalysis[] = [];

  for (const aspect of chart.aspects) {
    const isRelevant = relevantPlanets.has(aspect.planet1) || relevantPlanets.has(aspect.planet2);
    if (!isRelevant) continue;

    const desc = generateAspectDescription(aspect);
    
    if (aspect.nature === 'harmonious') {
      harmoniousAspects.push({ aspect, description: desc, impact: 'positive' });
    } else if (aspect.nature === 'challenging') {
      // 检查是否涉及凶星
      const involvesMalefic = ['Saturn', 'Mars', 'Pluto'].includes(aspect.planet1) || 
                               ['Saturn', 'Mars', 'Pluto'].includes(aspect.planet2);
      challengingAspects.push({
        aspect,
        description: desc,
        impact: involvesMalefic ? 'negative' : 'neutral'
      });
    } else {
      // 合相看具体星体
      const isBenefic = ['Venus', 'Jupiter'].includes(aspect.planet1) || ['Venus', 'Jupiter'].includes(aspect.planet2);
      if (isBenefic) {
        harmoniousAspects.push({ aspect, description: desc, impact: 'positive' });
      } else {
        challengingAspects.push({ aspect, description: desc, impact: 'neutral' });
      }
    }
  }

  // 评分
  let score = 50;
  score += harmoniousAspects.length * 6;
  score -= challengingAspects.filter(a => a.impact === 'negative').length * 5;
  score -= challengingAspects.filter(a => a.impact === 'neutral').length * 2;
  score = Math.max(0, Math.min(100, score));

  let wealthNetwork = '';
  if (harmoniousAspects.length >= 3 && challengingAspects.length <= 1) {
    wealthNetwork = '星盘中形成了明显的"财富网络"，多颗财富征象星通过吉相位互相连接，财富机遇多、渠道畅通，容易增值。';
  } else if (harmoniousAspects.length > challengingAspects.length) {
    wealthNetwork = '财富征象星之间吉相位占优，整体财富流动较为顺畅，但仍有部分挑战需要应对。';
  } else if (challengingAspects.length > harmoniousAspects.length) {
    wealthNetwork = '财富征象星面临较多挑战相位，赚钱过程伴随压力和考验，但挑战也是成长的动力。';
  } else {
    wealthNetwork = '财富相位吉凶均衡，财富之路既有机遇也有挑战，关键在于如何把握时机。';
  }

  return {
    title: '分析相位联动',
    harmoniousAspects,
    challengingAspects,
    wealthNetwork,
    score
  };
}

function generateAspectDescription(aspect: Aspect): string {
  const p1 = aspect.planet1Cn;
  const p2 = aspect.planet2Cn;
  const type = aspect.typeCn;
  const orb = aspect.orb.toFixed(1);

  const descriptions: Record<string, Record<string, string>> = {
    conjunction: {
      default: `${p1}与${p2}形成合相（容许度${orb}°），两者能量融合，在财富领域产生强烈的协同效应。`
    },
    trine: {
      default: `${p1}与${p2}形成三分相（容许度${orb}°），构成和谐的能量流动，财富获取较为顺畅自然。`
    },
    sextile: {
      default: `${p1}与${p2}形成六分相（容许度${orb}°），提供有利的机遇和合作渠道。`
    },
    square: {
      default: `${p1}与${p2}形成四分相（容许度${orb}°），带来内在张力和外在挑战，但也是推动成长的动力。`
    },
    opposition: {
      default: `${p1}与${p2}形成对冲相（容许度${orb}°），需要在两种力量之间寻找平衡，可能带来财务上的起伏。`
    }
  };

  return descriptions[aspect.type]?.default || `${p1}${type}${p2}（容许度${orb}°）`;
}

// ========== 第四步：整合宫位系统 ==========

function analyzeStep4(chart: ChartData): Step4Result {
  const house2CuspSign = getHouseCuspSign(chart, 2);
  const house2Ruler = getSignRuler(house2CuspSign.name);
  const house2RulerPlanet = chart.planets.find(p => p.name === house2Ruler);

  const venus = getPlanet(chart, 'Venus');
  const jupiter = getPlanet(chart, 'Jupiter');
  const moon = getPlanet(chart, 'Moon');

  const house2RulerFlyIn = analyzeFlyIn(house2RulerPlanet, '二宫主星');
  const venusFlyIn = analyzeFlyIn(venus, '金星');
  const jupiterFlyIn = analyzeFlyIn(jupiter, '木星');
  const moonFlyIn = analyzeFlyIn(moon, '月亮');

  // 评分
  let score = 50;
  const flyIns = [house2RulerFlyIn, venusFlyIn, jupiterFlyIn, moonFlyIn];
  for (const fi of flyIns) {
    switch (fi.quality) {
      case 'excellent': score += 10; break;
      case 'good': score += 5; break;
      case 'neutral': break;
      case 'challenging': score -= 5; break;
    }
  }
  score = Math.max(0, Math.min(100, score));

  return {
    title: '整合宫位系统',
    house2RulerFlyIn,
    venusFlyIn,
    jupiterFlyIn,
    moonFlyIn,
    score
  };
}

const FLY_IN_DESCRIPTIONS: Record<number, { desc: string; quality: 'excellent' | 'good' | 'neutral' | 'challenging' }> = {
  1: { desc: '通过个人能力、形象与主动出击获取财富，自力更生型。', quality: 'good' },
  2: { desc: '财富自然积累，稳定进财，对金钱有天然的掌控力。', quality: 'good' },
  3: { desc: '通过沟通、写作、教学、短途贸易或兄弟姐妹关系获取财富。', quality: 'neutral' },
  4: { desc: '通过不动产、家族资源、家庭事业获取财富，根基稳固。', quality: 'good' },
  5: { desc: '通过创意、投机、娱乐、子女相关事业获取财富，有投资天赋。', quality: 'good' },
  6: { desc: '通过服务业、日常工作、健康领域获取财富，但过程较为辛苦。', quality: 'challenging' },
  7: { desc: '通过合伙、婚姻、客户关系、咨询服务获取财富。', quality: 'good' },
  8: { desc: '通过投资、遗产、配偶资源、保险金融获取财富，伴随风险但回报可能丰厚。', quality: 'neutral' },
  9: { desc: '通过高等教育、海外事业、出版、法律、宗教领域获取财富。', quality: 'good' },
  10: { desc: '通过事业成就、社会地位、公众影响力获取财富，事业即财富。', quality: 'excellent' },
  11: { desc: '通过人脉网络、社交圈子、团队项目、投资收益获取财富，是最有利于财运的位置之一。', quality: 'excellent' },
  12: { desc: '财富面临消耗、隐性支出，或通过幕后工作、慈善、灵性领域获取，需要特别注意财务管理。', quality: 'challenging' },
};

function analyzeFlyIn(planet: PlanetData | undefined, role: string): FlyInAnalysis {
  if (!planet) {
    return {
      planetName: role,
      planetNameCn: role,
      house: 0,
      description: `${role}信息不可用。`,
      quality: 'neutral'
    };
  }

  const flyInInfo = FLY_IN_DESCRIPTIONS[planet.house] || { desc: '位置特殊。', quality: 'neutral' as const };

  return {
    planetName: planet.name,
    planetNameCn: `${role}（${planet.nameCn}）`,
    house: planet.house,
    description: `${role}${planet.nameCn}飞入第${planet.house}宫：${flyInInfo.desc}`,
    quality: flyInInfo.quality
  };
}

// ========== 第五步：职业与运势 ==========

function analyzeStep5(chart: ChartData): Step5Result {
  const mc = chart.mcSign;
  const mcRuler = getSignRuler(mc.sign.name);
  const mcRulerPlanet = chart.planets.find(p => p.name === mcRuler);

  // MC分析
  let mcAnalysis = `中天（MC）落在${mc.sign.nameCn}，`;
  if (mcRulerPlanet) {
    mcAnalysis += `MC定位星${mcRulerPlanet.nameCn}落在第${mcRulerPlanet.house}宫。`;
    const wealthHouses = [2, 8, 11];
    if (wealthHouses.includes(mcRulerPlanet.house)) {
      mcAnalysis += '事业定位星指向财富宫位，事业与财富深度绑定，通过事业发展直接带动财富增长。';
    } else if (mcRulerPlanet.house === 10) {
      mcAnalysis += '事业定位星回到事业宫，事业心极强，通过专注事业自然积累财富。';
    } else {
      mcAnalysis += `事业发展主要在第${mcRulerPlanet.house}宫相关领域展开。`;
    }
  }

  // 木星行运（简化推演）
  const jupiter = getPlanet(chart, 'Jupiter');
  let jupiterTransits = '木星约12年运行一周，';
  if (jupiter) {
    jupiterTransits += `当前本命木星在第${jupiter.house}宫。行运木星经过你的第2宫（正财宫）、第8宫（偏财宫）、第10宫（事业宫）和第11宫（福德宫）时，通常是财务扩张的关键机遇期，建议把握这些时间窗口积极行动。`;
  }

  // 土星行运
  const saturn = getPlanet(chart, 'Saturn');
  let saturnTransits = '土星约29年运行一周，';
  if (saturn) {
    saturnTransits += `当前本命土星在第${saturn.house}宫。行运土星经过财富相关宫位时，是财务积累、责任加重或面临考验的时期，需要建立扎实的财务基础和纪律。`;
  }

  // 事业-财富联动
  let careerWealth = '';
  if (mcRulerPlanet) {
    const wealthHouses = [2, 8, 11];
    if (wealthHouses.includes(mcRulerPlanet.house)) {
      careerWealth = '你的星盘显示事业与财富高度联动，职业发展是财富增长的主要引擎。建议专注于事业突破，财富将随之而来。';
    } else {
      careerWealth = '事业与财富有一定关联，但财富来源可能不仅限于主业。建议在发展事业的同时，关注其他财富渠道。';
    }
  } else {
    careerWealth = '事业发展对财富有间接影响，建议综合考虑多种财富积累路径。';
  }

  // 评分
  let score = 50;
  if (mcRulerPlanet) {
    if ([2, 8, 11].includes(mcRulerPlanet.house)) score += 15;
    if (mcRulerPlanet.house === 10) score += 10;
    if (mcRulerPlanet.dignity === 'domicile' || mcRulerPlanet.dignity === 'exaltation') score += 10;
  }
  score = Math.max(0, Math.min(100, score));

  return {
    title: '结合职业与运势',
    careerWealth,
    mcAnalysis,
    jupiterTransits,
    saturnTransits,
    score
  };
}

// ========== 第六步：综合结论 ==========

function analyzeStep6(
  chart: ChartData, totalScore: number, grade: WealthGrade,
  step1: Step1Result, step2: Step2Result, step3: Step3Result,
  step4: Step4Result, step5: Step5Result
): Step6Result {
  const strengths: string[] = [];
  const challenges: string[] = [];
  const advice: string[] = [];

  // 分析优势
  if (step2.overallStrength === 'strong') {
    strengths.push('核心财富征象星先天状态优秀，财富潜力起点高');
  }
  if (step3.harmoniousAspects.length >= 3) {
    strengths.push('多重吉相位构成财富网络，机遇渠道畅通');
  }
  const excellentFlyIns = [step4.house2RulerFlyIn, step4.venusFlyIn, step4.jupiterFlyIn, step4.moonFlyIn]
    .filter(f => f.quality === 'excellent');
  if (excellentFlyIns.length > 0) {
    strengths.push(`财星飞入优质宫位（${excellentFlyIns.map(f => `第${f.house}宫`).join('、')}），财富实现路径清晰`);
  }
  if (step1.house2.planetsInHouse.some(p => ['Venus', 'Jupiter'].includes(p.name))) {
    strengths.push('正财宫有吉星落入，个人财富基础扎实');
  }

  // 分析挑战
  if (step2.overallStrength === 'weak') {
    challenges.push('财富征象星先天状态偏弱，需要更多后天努力');
  }
  if (step3.challengingAspects.length >= 3) {
    challenges.push('较多挑战相位影响财富流动，需要克服障碍');
  }
  const challengingFlyIns = [step4.house2RulerFlyIn, step4.venusFlyIn, step4.jupiterFlyIn, step4.moonFlyIn]
    .filter(f => f.quality === 'challenging');
  if (challengingFlyIns.length > 0) {
    challenges.push('部分财星飞入挑战宫位，财富积累过程需要更多耐心');
  }

  // 建议
  if (step4.venusFlyIn.house === 10 || step4.jupiterFlyIn.house === 10) {
    advice.push('事业是你的核心财富引擎，建议全力投入职业发展');
  }
  if (step4.venusFlyIn.house === 11 || step4.jupiterFlyIn.house === 11) {
    advice.push('人脉和社交圈是你的财富助力，积极拓展高质量社交网络');
  }
  if (step3.challengingAspects.some(a => a.aspect.planet1 === 'Saturn' || a.aspect.planet2 === 'Saturn')) {
    advice.push('土星的挑战相位提示需要建立财务纪律和长期规划');
  }
  advice.push('把握木星行运经过财富宫位的机遇期，积极行动');
  if (challenges.length > 0) {
    advice.push('面对挑战相位，建议通过学习和成长来转化压力为动力');
  }

  // 如果没有明显优势/挑战，添加默认项
  if (strengths.length === 0) strengths.push('财富格局整体均衡，具备稳定发展的基础');
  if (challenges.length === 0) challenges.push('整体挑战较少，但仍需保持警觉和持续努力');

  // 综合总结
  let summary = '';
  switch (grade) {
    case 'A10':
      summary = '你的星盘展现出卓越的财富格局。核心财星状态优秀，多重吉相位构成强大的财富网络，事业与财富深度联动。你天生具备出色的财富吸引力和增值能力，人生中有明显的财富跃升期。关键在于把握机遇、持续精进。';
      break;
    case 'A9':
      summary = '你的星盘展现出上等的财富格局。关键财星状态良好，有明显的吉相位支撑。你具备很强的财富积累潜力，通过正确的方向和持续努力，有望实现显著的财富增长。关键时期的决策尤为重要。';
      break;
    case 'A8':
      summary = '你的星盘展现出优良的财富格局。财星状态中上，吉凶并存但整体偏向积极。通过专业能力的提升和正确的财富策略，你有望实现稳健的财富增长。建议发挥优势、规避风险。';
      break;
    case 'A7':
      summary = '你的星盘展现出稳健的财富格局。财富需要通过持续的个人努力和专业积累来实现。虽然过程中会面临一些挑战，但整体财务基础稳定。建议注重技能提升和长期规划。';
      break;
    case 'A6':
      summary = '你的星盘提示财富之路需要更多的耐心和策略。虽然面临一些挑战，但每个星盘都有其独特的财富密码。建议重点关注风险管理、建立财务纪律，通过持续学习和成长来提升财富能力。';
      break;
  }

  return {
    title: '综合判断与定性描述',
    summary,
    strengths,
    challenges,
    advice
  };
}
