/**
 * 第四步：计算行星位置
 * 使用简化的VSOP87理论计算行星地心视黄经
 * 包含太阳、月亮、水星、金星、火星、木星、土星、天王星、海王星、冥王星
 */

import { jdToT, normalize360, degToRad, radToDeg } from './core';

export interface PlanetPosition {
  name: string;
  nameCn: string;
  longitude: number;  // 地心视黄经（度）
  retrograde: boolean; // 是否逆行
  symbol: string;
}

/**
 * 太阳视黄经（VSOP87简化）
 */
function solarLongitude(jd: number): number {
  const T = jdToT(jd);
  // 太阳平黄经
  const L0 = normalize360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  // 太阳平近点角
  const M = normalize360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mrad = degToRad(M);
  // 太阳中心差
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
    + 0.000289 * Math.sin(3 * Mrad);
  // 太阳真黄经
  const sunLon = L0 + C;
  // 视黄经修正（章动和光行差）
  const omega = 125.04 - 1934.136 * T;
  const apparent = sunLon - 0.00569 - 0.00478 * Math.sin(degToRad(omega));
  return normalize360(apparent);
}

/**
 * 月亮黄经（简化ELP2000理论）
 */
function lunarLongitude(jd: number): number {
  const T = jdToT(jd);
  // 月亮平黄经
  const Lp = normalize360(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841 - T * T * T * T / 65194000);
  // 月亮平近点角
  const M = normalize360(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699 - T * T * T * T / 14712000);
  // 太阳平近点角
  const Ms = normalize360(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T * T * T / 24490000);
  // 月亮平距角
  const D = normalize360(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868 - T * T * T * T / 113065000);
  // 月亮升交点经度
  const F = normalize360(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T * T * T / 3526000 + T * T * T * T / 863310000);

  const Mrad = degToRad(M);
  const Msrad = degToRad(Ms);
  const Drad = degToRad(D);
  const Frad = degToRad(F);

  // 主要摄动项
  let lon = Lp
    + 6.288774 * Math.sin(Mrad)
    + 1.274027 * Math.sin(2 * Drad - Mrad)
    + 0.658314 * Math.sin(2 * Drad)
    + 0.213618 * Math.sin(2 * Mrad)
    - 0.185116 * Math.sin(Msrad)
    - 0.114332 * Math.sin(2 * Frad)
    + 0.058793 * Math.sin(2 * Drad - 2 * Mrad)
    + 0.057066 * Math.sin(2 * Drad - Msrad - Mrad)
    + 0.053322 * Math.sin(2 * Drad + Mrad)
    + 0.045758 * Math.sin(2 * Drad - Msrad)
    - 0.040923 * Math.sin(Msrad - Mrad)
    - 0.034720 * Math.sin(Drad)
    - 0.030383 * Math.sin(Msrad + Mrad)
    + 0.015327 * Math.sin(2 * Drad - 2 * Frad)
    - 0.012528 * Math.sin(Mrad + 2 * Frad)
    + 0.010980 * Math.sin(Mrad - 2 * Frad)
    + 0.010675 * Math.sin(4 * Drad - Mrad)
    + 0.010034 * Math.sin(3 * Mrad)
    + 0.008548 * Math.sin(4 * Drad - 2 * Mrad)
    - 0.007888 * Math.sin(2 * Drad + Msrad - Mrad)
    - 0.006766 * Math.sin(2 * Drad + Msrad)
    - 0.005163 * Math.sin(Drad - Mrad);

  return normalize360(lon);
}

/**
 * 行星平黄经和平近点角参数
 * 来源: Meeus, Astronomical Algorithms
 */
interface PlanetOrbitalElements {
  L: [number, number]; // 平黄经 [L0, L1] (度)
  a: number;           // 半长轴 (AU)
  e: [number, number]; // 离心率
  M: [number, number]; // 平近点角
  omega: [number, number]; // 近日点经度
  Omega: [number, number]; // 升交点经度
  i: [number, number]; // 轨道倾角
}

const PLANET_ELEMENTS: Record<string, PlanetOrbitalElements> = {
  mercury: {
    L: [252.250906, 149472.6746358], a: 0.387098310,
    e: [0.20563175, 0.000020407], M: [174.7948, 149472.5153],
    omega: [77.456119, 0.1588643], Omega: [48.330893, -0.1254615], i: [7.004986, 0.0018215]
  },
  venus: {
    L: [181.979801, 58517.8156760], a: 0.723329820,
    e: [0.00677188, -0.000047766], M: [50.4161, 58517.8039],
    omega: [131.563707, 0.0048646], Omega: [76.679920, -0.2780080], i: [3.394662, 0.0010037]
  },
  mars: {
    L: [355.433275, 19140.2993313], a: 1.523679342,
    e: [0.09340062, 0.000090483], M: [19.3730, 19140.3023],
    omega: [336.060234, 0.4438898], Omega: [49.558093, -0.2949846], i: [1.849726, -0.0006011]
  },
  jupiter: {
    L: [34.351484, 3034.9056746], a: 5.202603191,
    e: [0.04849485, 0.000163244], M: [20.0202, 3034.9057],
    omega: [14.331309, 0.2155525], Omega: [100.464441, 0.1766828], i: [1.303270, -0.0019872]
  },
  saturn: {
    L: [50.077471, 1222.1137943], a: 9.554909596,
    e: [0.05550862, -0.000346818], M: [317.0207, 1222.1138],
    omega: [93.056787, 0.5665496], Omega: [113.665524, -0.2566649], i: [2.488878, 0.0025515]
  },
  uranus: {
    L: [314.055005, 428.4669983], a: 19.218446062,
    e: [0.04629590, -0.000027337], M: [141.0498, 428.4670],
    omega: [173.005159, 0.0893206], Omega: [74.005947, 0.0741461], i: [0.773196, 0.0007744]
  },
  neptune: {
    L: [304.348665, 218.4862002], a: 30.110386869,
    e: [0.00898809, 0.000006408], M: [256.2250, 218.4862],
    omega: [48.123691, 0.0291587], Omega: [131.784057, -0.0061651], i: [1.769952, -0.0093082]
  }
};

/**
 * 计算行星日心黄经（简化VSOP87）
 */
function heliocentricLongitude(planet: string, T: number): number {
  const el = PLANET_ELEMENTS[planet];
  if (!el) return 0;
  const L = normalize360(el.L[0] + el.L[1] * T);
  const M = normalize360(el.M[0] + el.M[1] * T);
  const e = el.e[0] + el.e[1] * T;
  const Mrad = degToRad(M);
  
  // 开普勒方程近似（中心差）
  const C = (2 * e - e * e * e / 4) * Math.sin(Mrad) * radToDeg(1)
    + (5 / 4) * e * e * Math.sin(2 * Mrad) * radToDeg(1)
    + (13 / 12) * e * e * e * Math.sin(3 * Mrad) * radToDeg(1);
  
  return normalize360(L + C);
}

/**
 * 计算行星日心距离（AU）
 */
function heliocentricDistance(planet: string, T: number): number {
  const el = PLANET_ELEMENTS[planet];
  if (!el) return 1;
  const M = degToRad(normalize360(el.M[0] + el.M[1] * T));
  const e = el.e[0] + el.e[1] * T;
  return el.a * (1 - e * e) / (1 + e * Math.cos(M));
}

/**
 * 日心坐标转地心黄经
 */
function helioToGeoLon(planetLon: number, planetDist: number, sunLon: number, sunDist: number): number {
  const pRad = degToRad(planetLon);
  const sRad = degToRad(sunLon);
  
  const x = planetDist * Math.cos(pRad) - sunDist * Math.cos(sRad);
  const y = planetDist * Math.sin(pRad) - sunDist * Math.sin(sRad);
  
  let geoLon = radToDeg(Math.atan2(y, x));
  return normalize360(geoLon);
}

/**
 * 冥王星黄经（特殊处理，使用多项式近似）
 */
function plutoLongitude(jd: number): number {
  const T = jdToT(jd);
  const J = 34.35 + 3034.9057 * T;
  const S = 50.08 + 1222.1138 * T;
  const P = 238.96 + 144.9600 * T;
  const Jrad = degToRad(J);
  const Srad = degToRad(S);
  const Prad = degToRad(P);

  let lon = 238.958116 + 144.9600 * T
    + 6.6540070 * Math.sin(Prad) + 0.0 // simplified
    + 0.3257 * Math.sin(2 * Prad)
    + 0.0314 * Math.sin(3 * Prad)
    - 0.0212 * Math.sin(Srad - Prad)
    + 0.0114 * Math.sin(2 * Jrad - 2 * Srad)
    - 0.0100 * Math.sin(2 * Srad - 3 * Prad)
    + 0.0091 * Math.sin(Jrad - Srad)
    - 0.0073 * Math.sin(Srad - 2 * Prad);

  return normalize360(lon);
}

/**
 * 月亮平均升交点（North Node）
 */
function moonNorthNode(jd: number): number {
  const T = jdToT(jd);
  return normalize360(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + T * T * T / 467441 - T * T * T * T / 60616000);
}

/**
 * 判断逆行：比较 jd 和 jd+0.5 时的黄经
 */
function isRetrograde(getLon: (jd: number) => number, jd: number): boolean {
  const lon1 = getLon(jd);
  const lon2 = getLon(jd + 0.5);
  let diff = lon2 - lon1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

/**
 * 计算所有行星位置
 */
export function calculatePlanets(jd: number): PlanetPosition[] {
  const T = jdToT(jd);
  const sunLon = solarLongitude(jd);
  const sunDist = 1.0; // AU (简化)

  // 地球日心黄经（太阳黄经 + 180°）
  const earthLon = normalize360(sunLon + 180);

  const planets: PlanetPosition[] = [];

  // 太阳
  planets.push({
    name: 'Sun', nameCn: '太阳', longitude: sunLon,
    retrograde: false, symbol: '☉'
  });

  // 月亮
  const moonLon = lunarLongitude(jd);
  planets.push({
    name: 'Moon', nameCn: '月亮', longitude: moonLon,
    retrograde: false, symbol: '☽'
  });

  // 内行星和外行星
  const planetList: Array<{ key: string; name: string; nameCn: string; symbol: string }> = [
    { key: 'mercury', name: 'Mercury', nameCn: '水星', symbol: '☿' },
    { key: 'venus', name: 'Venus', nameCn: '金星', symbol: '♀' },
    { key: 'mars', name: 'Mars', nameCn: '火星', symbol: '♂' },
    { key: 'jupiter', name: 'Jupiter', nameCn: '木星', symbol: '♃' },
    { key: 'saturn', name: 'Saturn', nameCn: '土星', symbol: '♄' },
    { key: 'uranus', name: 'Uranus', nameCn: '天王星', symbol: '♅' },
    { key: 'neptune', name: 'Neptune', nameCn: '海王星', symbol: '♆' },
  ];

  for (const p of planetList) {
    const pLon = heliocentricLongitude(p.key, T);
    const pDist = heliocentricDistance(p.key, T);
    const geoLon = helioToGeoLon(pLon, pDist, earthLon, sunDist);

    const retro = isRetrograde((testJd) => {
      const tT = jdToT(testJd);
      const tPLon = heliocentricLongitude(p.key, tT);
      const tPDist = heliocentricDistance(p.key, tT);
      const tSunLon = solarLongitude(testJd);
      const tEarthLon = normalize360(tSunLon + 180);
      return helioToGeoLon(tPLon, tPDist, tEarthLon, 1.0);
    }, jd);

    planets.push({
      name: p.name, nameCn: p.nameCn, longitude: geoLon,
      retrograde: retro, symbol: p.symbol
    });
  }

  // 冥王星
  const plutoLon = plutoLongitude(jd);
  const plutoRetro = isRetrograde(plutoLongitude, jd);
  planets.push({
    name: 'Pluto', nameCn: '冥王星', longitude: plutoLon,
    retrograde: plutoRetro, symbol: '♇'
  });

  // 月亮北交点
  const nnLon = moonNorthNode(jd);
  planets.push({
    name: 'NorthNode', nameCn: '北交点', longitude: nnLon,
    retrograde: true, // 北交点通常逆行
    symbol: '☊'
  });

  // 月亮南交点
  planets.push({
    name: 'SouthNode', nameCn: '南交点', longitude: normalize360(nnLon + 180),
    retrograde: true,
    symbol: '☋'
  });

  return planets;
}

export { solarLongitude, lunarLongitude, moonNorthNode };
