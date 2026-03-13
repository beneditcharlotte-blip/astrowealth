/**
 * 星盘计算主模块
 * 整合六步计算流程，输出完整星盘数据
 */

import { dateToJD, localToUTC } from './core';
import { calculatePlanets } from './planets';
import { calculateHouses, getHousePosition, HouseSystem } from './houses';
import { calculateAspects, Aspect } from './aspects';
import { longitudeToSign, getPlanetDignity, DignityStatus, ZodiacSign } from './zodiac';

export interface PlanetData {
  name: string;
  nameCn: string;
  symbol: string;
  longitude: number;
  sign: ZodiacSign;
  signDegree: number;
  signMinute: number;
  house: number;
  dignity: DignityStatus;
  dignityCn: string;
  retrograde: boolean;
}

export interface ChartData {
  birthInfo: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    latitude: number;
    longitude: number;
    city: string;
  };
  julianDay: number;
  houses: HouseSystem;
  planets: PlanetData[];
  aspects: Aspect[];
  ascSign: { sign: ZodiacSign; degree: number; minute: number };
  mcSign: { sign: ZodiacSign; degree: number; minute: number };
}

const DIGNITY_CN: Record<DignityStatus, string> = {
  domicile: '入庙',
  exaltation: '耀升',
  detriment: '失势',
  fall: '落陷',
  neutral: '中性'
};

/**
 * 计算完整星盘
 */
export function calculateChart(
  year: number, month: number, day: number,
  hour: number, minute: number,
  latitude: number, longitude: number,
  city: string, timezone?: number
): ChartData {
  // 第一步：时间处理与儒略日
  const utc = localToUTC(year, month, day, hour, minute, longitude, timezone);
  const jd = dateToJD(utc.year, utc.month, utc.day, utc.hour, utc.minute);

  // 第三步：计算宫位
  const houses = calculateHouses(jd, latitude, longitude);

  // 第四步：计算行星位置
  const rawPlanets = calculatePlanets(jd);

  // 第六步：星座、宫位映射与状态判定
  const planets: PlanetData[] = rawPlanets.map(p => {
    const signInfo = longitudeToSign(p.longitude);
    const house = getHousePosition(p.longitude, houses.cusps);
    const dignity = getPlanetDignity(p.name, signInfo.sign.name);

    return {
      name: p.name,
      nameCn: p.nameCn,
      symbol: p.symbol,
      longitude: p.longitude,
      sign: signInfo.sign,
      signDegree: signInfo.degree,
      signMinute: signInfo.minute,
      house,
      dignity,
      dignityCn: DIGNITY_CN[dignity],
      retrograde: p.retrograde
    };
  });

  // 第五步：计算相位（包含行星 + ASC + MC）
  const aspectBodies = [
    ...planets
      .filter(p => !['NorthNode', 'SouthNode'].includes(p.name))
      .map(p => ({ name: p.name, nameCn: p.nameCn, longitude: p.longitude })),
    { name: 'ASC', nameCn: '上升点', longitude: houses.ascendant },
    { name: 'MC', nameCn: '中天', longitude: houses.midheaven },
  ];

  const aspects = calculateAspects(aspectBodies);

  // ASC和MC的星座信息
  const ascSign = longitudeToSign(houses.ascendant);
  const mcSign = longitudeToSign(houses.midheaven);

  return {
    birthInfo: { year, month, day, hour, minute, latitude, longitude, city },
    julianDay: jd,
    houses,
    planets,
    aspects,
    ascSign,
    mcSign
  };
}

/**
 * 获取特定行星数据
 */
export function getPlanet(chart: ChartData, name: string): PlanetData | undefined {
  return chart.planets.find(p => p.name === name);
}

/**
 * 获取某宫内的所有行星
 */
export function getPlanetsInHouse(chart: ChartData, house: number): PlanetData[] {
  return chart.planets.filter(p => p.house === house);
}

/**
 * 获取某宫的宫头星座
 */
export function getHouseCuspSign(chart: ChartData, house: number): ZodiacSign {
  const cuspLon = chart.houses.cusps[house - 1];
  return longitudeToSign(cuspLon).sign;
}
