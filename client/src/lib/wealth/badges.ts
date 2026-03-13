/**
 * 成就徽章系统
 * 根据各维度得分和分析数据解锁不同的成就徽章
 */
import { WealthAssessment } from './assessment';

export interface Badge {
  /** 徽章 ID */
  id: string;
  /** 徽章名称 */
  name: string;
  /** 徽章 emoji */
  icon: string;
  /** 徽章描述 */
  description: string;
  /** 是否已解锁 */
  unlocked: boolean;
  /** 解锁条件描述 */
  unlockHint: string;
  /** 稀有度 */
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  /** 稀有度颜色 */
  rarityColor: string;
}

interface BadgeRule {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockHint: string;
  rarity: Badge['rarity'];
  check: (a: WealthAssessment) => boolean;
}

const RARITY_COLORS: Record<Badge['rarity'], string> = {
  common: '#8a8070',
  rare: '#6b8ab8',
  epic: '#8a6b9a',
  legendary: '#d4a843',
};

const BADGE_RULES: BadgeRule[] = [
  // === 基于维度得分的徽章 ===
  {
    id: 'born-talent',
    name: '天赋满满',
    icon: '⭐',
    description: '你的赚钱天赋得分超过80，天生就是赚钱的料！',
    unlockHint: '赚钱天赋评分达到80以上',
    rarity: 'epic',
    check: (a) => a.step1.score >= 80,
  },
  {
    id: 'energy-full',
    name: '能量爆棚',
    icon: '🔋',
    description: '你的财富能量得分超过80，潜力巨大！',
    unlockHint: '财富能量评分达到80以上',
    rarity: 'epic',
    check: (a) => a.step2.score >= 80,
  },
  {
    id: 'smooth-flow',
    name: '财运亨通',
    icon: '🌊',
    description: '你的财运流动得分超过80，赚钱之路畅通无阻！',
    unlockHint: '财运流动评分达到80以上',
    rarity: 'epic',
    check: (a) => a.step3.score >= 80,
  },
  {
    id: 'direction-clear',
    name: '方向明确',
    icon: '🧭',
    description: '你的发财方向得分超过80，知道往哪里使劲！',
    unlockHint: '发财方向评分达到80以上',
    rarity: 'epic',
    check: (a) => a.step4.score >= 80,
  },
  {
    id: 'career-star',
    name: '职场之星',
    icon: '💼',
    description: '你的事业财运得分超过80，事业就是你的聚宝盆！',
    unlockHint: '事业财运评分达到80以上',
    rarity: 'epic',
    check: (a) => a.step5.score >= 80,
  },

  // === 基于综合表现的徽章 ===
  {
    id: 'all-rounder',
    name: '六边形战士',
    icon: '🏅',
    description: '所有维度得分均超过60，你是全面发展的财富达人！',
    unlockHint: '所有六个维度评分均达到60以上',
    rarity: 'legendary',
    check: (a) => {
      return a.step1.score >= 60 && a.step2.score >= 60 &&
        a.step3.score >= 60 && a.step4.score >= 60 && a.step5.score >= 60;
    },
  },
  {
    id: 'top-grade',
    name: '财富之巅',
    icon: '👑',
    description: '获得A9或A10的顶级评级，你站在财富金字塔的顶端！',
    unlockHint: '获得A9或A10评级',
    rarity: 'legendary',
    check: (a) => a.grade === 'A10' || a.grade === 'A9',
  },
  {
    id: 'high-scorer',
    name: '高分选手',
    icon: '🎯',
    description: '综合评分超过75，你的财富潜力非常出色！',
    unlockHint: '综合评分达到75以上',
    rarity: 'rare',
    check: (a) => a.totalScore >= 75,
  },

  // === 基于特殊组合的徽章 ===
  {
    id: 'lucky-charm',
    name: '好运连连',
    icon: '🍀',
    description: '你的吉利因素远多于挑战因素，运气站在你这边！',
    unlockHint: '吉利因素数量是挑战因素的2倍以上',
    rarity: 'rare',
    check: (a) => {
      return a.step3.harmoniousAspects.length >= 3 &&
        a.step3.harmoniousAspects.length >= a.step3.challengingAspects.length * 2;
    },
  },
  {
    id: 'multi-channel',
    name: '多财多路',
    icon: '🔀',
    description: '你有多个优质的发财方向，条条大路通罗马！',
    unlockHint: '拥有2个以上优质发财方向',
    rarity: 'rare',
    check: (a) => {
      const flyIns = [a.step4.house2RulerFlyIn, a.step4.venusFlyIn, a.step4.jupiterFlyIn, a.step4.moonFlyIn];
      return flyIns.filter(f => f.quality === 'excellent').length >= 2;
    },
  },
  {
    id: 'strong-foundation',
    name: '根基深厚',
    icon: '🏛',
    description: '你的赚钱天赋和财富能量都很强，基础非常扎实！',
    unlockHint: '赚钱天赋和财富能量评分均达到65以上',
    rarity: 'rare',
    check: (a) => a.step1.score >= 65 && a.step2.score >= 65,
  },
  {
    id: 'career-wealth-sync',
    name: '事业财富双丰收',
    icon: '🎊',
    description: '你的事业和财富高度联动，升职就是加薪！',
    unlockHint: '事业财运和发财方向评分均达到65以上',
    rarity: 'rare',
    check: (a) => a.step5.score >= 65 && a.step4.score >= 65,
  },

  // === 基于门槛的普通徽章（容易获得）===
  {
    id: 'first-step',
    name: '初识财运',
    icon: '🌱',
    description: '完成了财富分析，迈出了了解自己的第一步！',
    unlockHint: '完成财富分析',
    rarity: 'common',
    check: () => true, // 所有人都能获得
  },
  {
    id: 'above-average',
    name: '潜力新星',
    icon: '✨',
    description: '综合评分超过50，你的财富潜力高于平均水平！',
    unlockHint: '综合评分达到50以上',
    rarity: 'common',
    check: (a) => a.totalScore >= 50,
  },
  {
    id: 'talent-spark',
    name: '天赋火花',
    icon: '🔥',
    description: '至少有一个维度得分超过70，你在某方面很有天赋！',
    unlockHint: '任意一个维度评分达到70以上',
    rarity: 'common',
    check: (a) => {
      return a.step1.score >= 70 || a.step2.score >= 70 ||
        a.step3.score >= 70 || a.step4.score >= 70 || a.step5.score >= 70;
    },
  },
];

/**
 * 根据分析数据计算所有徽章的解锁状态
 */
export function computeBadges(assessment: WealthAssessment): Badge[] {
  return BADGE_RULES.map(rule => ({
    id: rule.id,
    name: rule.name,
    icon: rule.icon,
    description: rule.description,
    unlocked: rule.check(assessment),
    unlockHint: rule.unlockHint,
    rarity: rule.rarity,
    rarityColor: RARITY_COLORS[rule.rarity],
  }));
}

/**
 * 获取已解锁的徽章
 */
export function getUnlockedBadges(assessment: WealthAssessment): Badge[] {
  return computeBadges(assessment).filter(b => b.unlocked);
}

/**
 * 获取未解锁的徽章（用于展示"差一点就能获得"的激励）
 */
export function getLockedBadges(assessment: WealthAssessment): Badge[] {
  return computeBadges(assessment).filter(b => !b.unlocked);
}

/**
 * 稀有度中文名
 */
export function getRarityName(rarity: Badge['rarity']): string {
  const names: Record<Badge['rarity'], string> = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说',
  };
  return names[rarity];
}
