/**
 * 第六步：星座、宫位映射与行星状态判定
 * 包含星座映射、行星庙旺落陷系统
 */

import { normalize360 } from './core';

export interface ZodiacSign {
  index: number;     // 0-11
  name: string;      // 英文名
  nameCn: string;    // 中文名
  symbol: string;    // 符号
  element: 'fire' | 'earth' | 'air' | 'water';
  elementCn: string;
  modality: 'cardinal' | 'fixed' | 'mutable';
  modalityCn: string;
  ruler: string;     // 现代守护星
  rulerCn: string;
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
  { index: 0, name: 'Aries', nameCn: '白羊座', symbol: '♈', element: 'fire', elementCn: '火', modality: 'cardinal', modalityCn: '开创', ruler: 'Mars', rulerCn: '火星' },
  { index: 1, name: 'Taurus', nameCn: '金牛座', symbol: '♉', element: 'earth', elementCn: '土', modality: 'fixed', modalityCn: '固定', ruler: 'Venus', rulerCn: '金星' },
  { index: 2, name: 'Gemini', nameCn: '双子座', symbol: '♊', element: 'air', elementCn: '风', modality: 'mutable', modalityCn: '变动', ruler: 'Mercury', rulerCn: '水星' },
  { index: 3, name: 'Cancer', nameCn: '巨蟹座', symbol: '♋', element: 'water', elementCn: '水', modality: 'cardinal', modalityCn: '开创', ruler: 'Moon', rulerCn: '月亮' },
  { index: 4, name: 'Leo', nameCn: '狮子座', symbol: '♌', element: 'fire', elementCn: '火', modality: 'fixed', modalityCn: '固定', ruler: 'Sun', rulerCn: '太阳' },
  { index: 5, name: 'Virgo', nameCn: '处女座', symbol: '♍', element: 'earth', elementCn: '土', modality: 'mutable', modalityCn: '变动', ruler: 'Mercury', rulerCn: '水星' },
  { index: 6, name: 'Libra', nameCn: '天秤座', symbol: '♎', element: 'air', elementCn: '风', modality: 'cardinal', modalityCn: '开创', ruler: 'Venus', rulerCn: '金星' },
  { index: 7, name: 'Scorpio', nameCn: '天蝎座', symbol: '♏', element: 'water', elementCn: '水', modality: 'fixed', modalityCn: '固定', ruler: 'Pluto', rulerCn: '冥王星' },
  { index: 8, name: 'Sagittarius', nameCn: '射手座', symbol: '♐', element: 'fire', elementCn: '火', modality: 'mutable', modalityCn: '变动', ruler: 'Jupiter', rulerCn: '木星' },
  { index: 9, name: 'Capricorn', nameCn: '摩羯座', symbol: '♑', element: 'earth', elementCn: '土', modality: 'cardinal', modalityCn: '开创', ruler: 'Saturn', rulerCn: '土星' },
  { index: 10, name: 'Aquarius', nameCn: '水瓶座', symbol: '♒', element: 'air', elementCn: '风', modality: 'fixed', modalityCn: '固定', ruler: 'Uranus', rulerCn: '天王星' },
  { index: 11, name: 'Pisces', nameCn: '双鱼座', symbol: '♓', element: 'water', elementCn: '水', modality: 'mutable', modalityCn: '变动', ruler: 'Neptune', rulerCn: '海王星' },
];

/**
 * 黄经 → 星座信息
 */
export function longitudeToSign(longitude: number): { sign: ZodiacSign; degree: number; minute: number } {
  const lon = normalize360(longitude);
  const signIndex = Math.floor(lon / 30);
  const degInSign = lon - signIndex * 30;
  const degree = Math.floor(degInSign);
  const minute = Math.round((degInSign - degree) * 60);

  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree,
    minute
  };
}

/**
 * 获取星座的守护星（现代）
 */
export function getSignRuler(signName: string): string {
  const sign = ZODIAC_SIGNS.find(s => s.name === signName);
  return sign ? sign.ruler : '';
}

/**
 * 行星庙旺落陷系统（现代入庙规则）
 */
export type DignityStatus = 'domicile' | 'exaltation' | 'detriment' | 'fall' | 'neutral';

interface DignityRule {
  domicile: string[];    // 入庙星座
  exaltation: string[];  // 耀升星座
  detriment: string[];   // 失势星座
  fall: string[];        // 落陷星座
}

const DIGNITY_TABLE: Record<string, DignityRule> = {
  Sun: {
    domicile: ['Leo'],
    exaltation: ['Aries'],
    detriment: ['Aquarius'],
    fall: ['Libra']
  },
  Moon: {
    domicile: ['Cancer'],
    exaltation: ['Taurus'],
    detriment: ['Capricorn'],
    fall: ['Scorpio']
  },
  Mercury: {
    domicile: ['Gemini', 'Virgo'],
    exaltation: ['Virgo'],
    detriment: ['Sagittarius', 'Pisces'],
    fall: ['Pisces']
  },
  Venus: {
    domicile: ['Taurus', 'Libra'],
    exaltation: ['Pisces'],
    detriment: ['Scorpio', 'Aries'],
    fall: ['Virgo']
  },
  Mars: {
    domicile: ['Aries', 'Scorpio'],
    exaltation: ['Capricorn'],
    detriment: ['Libra', 'Taurus'],
    fall: ['Cancer']
  },
  Jupiter: {
    domicile: ['Sagittarius', 'Pisces'],
    exaltation: ['Cancer'],
    detriment: ['Gemini', 'Virgo'],
    fall: ['Capricorn']
  },
  Saturn: {
    domicile: ['Capricorn', 'Aquarius'],
    exaltation: ['Libra'],
    detriment: ['Cancer', 'Leo'],
    fall: ['Aries']
  },
  Uranus: {
    domicile: ['Aquarius'],
    exaltation: ['Scorpio'],
    detriment: ['Leo'],
    fall: ['Taurus']
  },
  Neptune: {
    domicile: ['Pisces'],
    exaltation: ['Leo', 'Cancer'],
    detriment: ['Virgo'],
    fall: ['Aquarius', 'Capricorn']
  },
  Pluto: {
    domicile: ['Scorpio'],
    exaltation: ['Aries', 'Leo'],
    detriment: ['Taurus'],
    fall: ['Libra', 'Aquarius']
  }
};

/**
 * 判断行星在某星座的状态
 */
export function getPlanetDignity(planetName: string, signName: string): DignityStatus {
  const rules = DIGNITY_TABLE[planetName];
  if (!rules) return 'neutral';

  if (rules.domicile.includes(signName)) return 'domicile';
  if (rules.exaltation.includes(signName)) return 'exaltation';
  if (rules.detriment.includes(signName)) return 'detriment';
  if (rules.fall.includes(signName)) return 'fall';
  return 'neutral';
}

export function dignityToCn(status: DignityStatus): string {
  switch (status) {
    case 'domicile': return '入庙';
    case 'exaltation': return '耀升';
    case 'detriment': return '失势';
    case 'fall': return '落陷';
    case 'neutral': return '中性';
  }
}

/**
 * 行星状态对应的分数（用于财富评估）
 */
export function dignityScore(status: DignityStatus): number {
  switch (status) {
    case 'domicile': return 5;
    case 'exaltation': return 4;
    case 'neutral': return 3;
    case 'detriment': return 2;
    case 'fall': return 1;
  }
}
