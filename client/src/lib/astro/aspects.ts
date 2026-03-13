/**
 * 第五步：计算相位
 * 包含合相、六分相、四分相、三分相、对冲相
 * 采用动态容许度系统
 */

import { normalize360 } from './core';

export interface Aspect {
  planet1: string;
  planet1Cn: string;
  planet2: string;
  planet2Cn: string;
  type: AspectType;
  typeCn: string;
  angle: number;      // 精确角度差
  orb: number;        // 容许度内的偏差
  maxOrb: number;     // 使用的最大容许度
  isApplying: boolean; // 是否正在形成（入相位）
  nature: 'harmonious' | 'challenging' | 'neutral'; // 相位性质
}

export type AspectType = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';

interface AspectDef {
  type: AspectType;
  typeCn: string;
  angle: number;
  defaultOrb: number;
  nature: 'harmonious' | 'challenging' | 'neutral';
}

const ASPECT_DEFINITIONS: AspectDef[] = [
  { type: 'conjunction', typeCn: '合相', angle: 0, defaultOrb: 8, nature: 'neutral' },
  { type: 'sextile', typeCn: '六分相', angle: 60, defaultOrb: 4, nature: 'harmonious' },
  { type: 'square', typeCn: '四分相', angle: 90, defaultOrb: 6, nature: 'challenging' },
  { type: 'trine', typeCn: '三分相', angle: 120, defaultOrb: 6, nature: 'harmonious' },
  { type: 'opposition', typeCn: '对冲相', angle: 180, defaultOrb: 8, nature: 'challenging' },
];

// 发光体（日月）的容许度放宽
const LUMINARY_NAMES = ['Sun', 'Moon'];

/**
 * 获取两颗星体之间的动态容许度
 * 日月相位放宽至10-12°
 */
function getOrb(planet1: string, planet2: string, aspectDef: AspectDef): number {
  const isLuminary = LUMINARY_NAMES.includes(planet1) || LUMINARY_NAMES.includes(planet2);
  if (isLuminary) {
    // 日月相位放宽
    if (aspectDef.type === 'conjunction' || aspectDef.type === 'opposition') return 10;
    if (aspectDef.type === 'square' || aspectDef.type === 'trine') return 8;
    return 6;
  }
  return aspectDef.defaultOrb;
}

/**
 * 计算两个黄经之间的角度差（0-180°）
 */
function angleDifference(lon1: number, lon2: number): number {
  let diff = Math.abs(normalize360(lon1) - normalize360(lon2));
  if (diff > 180) diff = 360 - diff;
  return diff;
}

/**
 * 计算所有相位
 */
export function calculateAspects(
  bodies: Array<{ name: string; nameCn: string; longitude: number }>
): Aspect[] {
  const aspects: Aspect[] = [];

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const b1 = bodies[i];
      const b2 = bodies[j];
      const diff = angleDifference(b1.longitude, b2.longitude);

      for (const aspectDef of ASPECT_DEFINITIONS) {
        const maxOrb = getOrb(b1.name, b2.name, aspectDef);
        const orb = Math.abs(diff - aspectDef.angle);

        if (orb <= maxOrb) {
          aspects.push({
            planet1: b1.name,
            planet1Cn: b1.nameCn,
            planet2: b2.name,
            planet2Cn: b2.nameCn,
            type: aspectDef.type,
            typeCn: aspectDef.typeCn,
            angle: diff,
            orb: Math.round(orb * 100) / 100,
            maxOrb,
            isApplying: false, // 简化处理
            nature: aspectDef.nature,
          });
          break; // 每对星体只取最精确的相位
        }
      }
    }
  }

  return aspects;
}

/**
 * 获取特定星体的所有相位
 */
export function getAspectsForPlanet(aspects: Aspect[], planetName: string): Aspect[] {
  return aspects.filter(a => a.planet1 === planetName || a.planet2 === planetName);
}

/**
 * 获取两颗特定星体之间的相位
 */
export function getAspectBetween(aspects: Aspect[], planet1: string, planet2: string): Aspect | undefined {
  return aspects.find(
    a => (a.planet1 === planet1 && a.planet2 === planet2) ||
         (a.planet1 === planet2 && a.planet2 === planet1)
  );
}
