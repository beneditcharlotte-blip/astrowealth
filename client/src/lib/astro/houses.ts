/**
 * 第三步：计算四大基本点与宫位系统
 * ASC（上升点）、MC（中天）、Placidus宫位制
 * 
 * 已验证：Steve Jobs (1955-02-25 03:15 UTC, 37.77°N 122.42°W)
 *   MC = Gem 21° (期望 Gem 22°) ✓
 *   ASC = Vir 22° (期望 Vir 21°) ✓
 *   H11 = Can 24.5° (期望 Can 25°) ✓
 *   H12 = Leo 25.2° (期望 Leo 26°) ✓
 */

import { degToRad, radToDeg, normalize360, lst, trueObliquity } from './core';

export interface HouseSystem {
  ascendant: number;  // ASC 黄经（度）
  midheaven: number;  // MC 黄经（度）
  cusps: number[];    // 12个宫头黄经（度），cusps[0] = 1宫 = ASC
}

/**
 * 计算中天（MC）黄经
 * MC = atan(tan(RAMC) / cos(ε))
 */
function calculateMC(ramcDeg: number, obliquity: number): number {
  const ramc = degToRad(ramcDeg);
  const eps = degToRad(obliquity);
  
  let mc = radToDeg(Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps)));
  mc = normalize360(mc);

  // MC and RAMC must be in the same quadrant
  const ramcNorm = normalize360(ramcDeg);
  const diff = normalize360(mc - ramcNorm);
  if (diff > 90 && diff < 270) {
    mc = normalize360(mc + 180);
  }

  return mc;
}

/**
 * 计算上升点（ASC）黄经
 * 
 * 标准公式 atan2(-cos(RAMC), sin(ε)·tan(φ) + cos(ε)·sin(RAMC))
 * 给出的是下降点（DSC），需要 +180° 得到 ASC。
 * 
 * 验证方法：ASC 的赤经应约等于 RAMC + 90°（东方地平线）
 */
function calculateASC(ramcDeg: number, obliquity: number, latitude: number): number {
  const ramc = degToRad(ramcDeg);
  const eps = degToRad(obliquity);
  const phi = degToRad(latitude);

  const y = -Math.cos(ramc);
  const x = Math.sin(eps) * Math.tan(phi) + Math.cos(eps) * Math.sin(ramc);
  const asc = radToDeg(Math.atan2(y, x));
  // +180° 修正：公式给出的是 DSC，加 180° 得到 ASC
  return normalize360(asc + 180);
}

/**
 * 黄经 → 赤经
 */
function eclipticToRA(lonDeg: number, obliquity: number): number {
  const l = degToRad(lonDeg);
  const eps = degToRad(obliquity);
  return normalize360(radToDeg(Math.atan2(Math.sin(l) * Math.cos(eps), Math.cos(l))));
}

/**
 * 黄经 → 赤纬
 */
function eclipticToDec(lonDeg: number, obliquity: number): number {
  const l = degToRad(lonDeg);
  const eps = degToRad(obliquity);
  return radToDeg(Math.asin(Math.max(-1, Math.min(1, Math.sin(eps) * Math.sin(l)))));
}

/**
 * 计算短弧（考虑跨越0°的情况）
 */
function shortArc(from: number, to: number): number {
  let d = to - from;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

/**
 * Placidus 宫位制计算
 * 
 * 核心公式（已验证）：
 * - H11: 找到黄经 λ 使得 RA(λ) = RAMC + SDA(λ)/3
 * - H12: 找到黄经 λ 使得 RA(λ) = RAMC + 2·SDA(λ)/3
 * - H2:  找到黄经 λ 使得 RA(λ) = RAMC + SDA(λ) + NSA(λ)/3
 * - H3:  找到黄经 λ 使得 RA(λ) = RAMC + SDA(λ) + 2·NSA(λ)/3
 * 
 * 其中 SDA = 半日弧 = acos(-tan(φ)·tan(δ))
 *      NSA = 半夜弧 = 180° - SDA
 */
function placidusCusp(
  houseNum: 11 | 12 | 2 | 3,
  ramc: number,
  obliquity: number,
  latitude: number,
  mc: number,
  asc: number
): number {
  const ic = normalize360(mc + 180);
  
  // 初始猜测：MC→ASC 或 ASC→IC 之间的线性插值
  const frac = (houseNum === 11 || houseNum === 2) ? 1 / 3 : 2 / 3;
  let lon: number;
  if (houseNum === 11 || houseNum === 12) {
    lon = normalize360(mc + shortArc(mc, asc) * frac);
  } else {
    lon = normalize360(asc + shortArc(asc, ic) * frac);
  }

  // 迭代求解
  for (let iter = 0; iter < 100; iter++) {
    const ra = eclipticToRA(lon, obliquity);
    const dec = eclipticToDec(lon, obliquity);
    
    // 计算半日弧
    const x = -Math.tan(degToRad(latitude)) * Math.tan(degToRad(dec));
    let sda: number;
    if (x <= -1) sda = 180;
    else if (x >= 1) sda = 0;
    else sda = radToDeg(Math.acos(x));
    const nsa = 180 - sda;

    // 目标赤经
    let requiredRA: number;
    switch (houseNum) {
      case 11: requiredRA = normalize360(ramc + sda / 3); break;
      case 12: requiredRA = normalize360(ramc + 2 * sda / 3); break;
      case 2:  requiredRA = normalize360(ramc + sda + nsa / 3); break;
      case 3:  requiredRA = normalize360(ramc + sda + 2 * nsa / 3); break;
    }

    // 误差
    let err = ra - requiredRA;
    if (err > 180) err -= 360;
    if (err < -180) err += 360;

    if (Math.abs(err) < 0.001) break;
    
    // 阻尼迭代
    lon = normalize360(lon - err * 0.8);
  }

  return normalize360(lon);
}

/**
 * 等宫制（Equal House System）作为后备
 */
function equalHouseCusps(asc: number, mc: number): number[] {
  const cusps: number[] = [];
  for (let i = 0; i < 12; i++) {
    cusps.push(normalize360(asc + i * 30));
  }
  cusps[9] = mc;
  return cusps;
}

/**
 * 计算完整的宫位系统
 */
export function calculateHouses(jd: number, latitude: number, longitude: number): HouseSystem {
  const localSiderealTime = lst(jd, longitude);
  const ramc = localSiderealTime;
  const obliquity = trueObliquity(jd);

  const mc = calculateMC(ramc, obliquity);
  const asc = calculateASC(ramc, obliquity, latitude);

  let cusps: number[];

  // 高纬度地区（>66°）Placidus 可能不稳定，使用等宫制
  if (Math.abs(latitude) > 66) {
    cusps = equalHouseCusps(asc, mc);
  } else {
    try {
      const cusp11 = placidusCusp(11, ramc, obliquity, latitude, mc, asc);
      const cusp12 = placidusCusp(12, ramc, obliquity, latitude, mc, asc);
      const cusp2 = placidusCusp(2, ramc, obliquity, latitude, mc, asc);
      const cusp3 = placidusCusp(3, ramc, obliquity, latitude, mc, asc);

      // 对称宫头（+180°）
      const ic = normalize360(mc + 180);
      const dsc = normalize360(asc + 180);
      const cusp5 = normalize360(cusp11 + 180);
      const cusp6 = normalize360(cusp12 + 180);
      const cusp8 = normalize360(cusp2 + 180);
      const cusp9 = normalize360(cusp3 + 180);

      cusps = [
        asc,     // 1宫 = ASC
        cusp2,   // 2宫
        cusp3,   // 3宫
        ic,      // 4宫 = IC
        cusp5,   // 5宫
        cusp6,   // 6宫
        dsc,     // 7宫 = DSC
        cusp8,   // 8宫
        cusp9,   // 9宫
        mc,      // 10宫 = MC
        cusp11,  // 11宫
        cusp12,  // 12宫
      ];

      // 验证：检查宫头是否有 NaN
      if (cusps.some(c => isNaN(c))) {
        cusps = equalHouseCusps(asc, mc);
      }
    } catch {
      cusps = equalHouseCusps(asc, mc);
    }
  }

  return {
    ascendant: asc,
    midheaven: mc,
    cusps
  };
}

/**
 * 判断行星落入哪个宫位
 * 
 * 宫头按黄道正方向（逆时针）递增排列
 * 行星在第 i 宫头和第 (i+1) 宫头之间，则在第 i 宫
 */
export function getHousePosition(longitude: number, cusps: number[]): number {
  const lon = normalize360(longitude);
  
  for (let i = 0; i < 12; i++) {
    const nextI = (i + 1) % 12;
    const start = normalize360(cusps[i]);
    const end = normalize360(cusps[nextI]);

    let inArc: boolean;
    if (start < end) {
      inArc = lon >= start && lon < end;
    } else {
      // 跨越 0° 的情况
      inArc = lon >= start || lon < end;
    }

    if (inArc) return i + 1;
  }
  return 1;
}
