/**
 * 星盘排盘核心天文算法
 * 
 * 第一步：时间处理与儒略日计算
 * 第二步：计算关键辅助参数（恒星时、黄赤交角）
 */

// 角度/弧度转换
export const DEG = Math.PI / 180;
export const RAD = 180 / Math.PI;

export function degToRad(d: number): number { return d * DEG; }
export function radToDeg(r: number): number { return r * RAD; }

// 归一化角度到 0-360
export function normalize360(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

// 归一化角度到 0-24 小时
export function normalizeHours(h: number): number {
  let hr = h % 24;
  if (hr < 0) hr += 24;
  return hr;
}

/**
 * 第一步：Gregorian日历 → 儒略日（JD）
 * 使用标准天文算法 (Meeus, Astronomical Algorithms)
 */
export function dateToJD(year: number, month: number, day: number, hour: number = 0, minute: number = 0): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const dayFraction = day + (hour + minute / 60) / 24;
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + dayFraction + B - 1524.5;
}

/**
 * 将本地时间转换为UTC
 * 支持传入精确时区偏移（小时），如未传入则根据经度估算
 */
export function localToUTC(
  year: number, month: number, day: number,
  hour: number, minute: number, longitude: number, tzOffset?: number
): { year: number; month: number; day: number; hour: number; minute: number } {
  const offset = tzOffset !== undefined ? tzOffset : Math.round(longitude / 15);
  let utcHour = hour - offset;
  let utcDay = day;
  let utcMonth = month;
  let utcYear = year;

  if (utcHour < 0) {
    utcHour += 24;
    utcDay -= 1;
    if (utcDay < 1) {
      utcMonth -= 1;
      if (utcMonth < 1) {
        utcMonth = 12;
        utcYear -= 1;
      }
      utcDay = daysInMonth(utcYear, utcMonth);
    }
  } else if (utcHour >= 24) {
    utcHour -= 24;
    utcDay += 1;
    if (utcDay > daysInMonth(utcYear, utcMonth)) {
      utcDay = 1;
      utcMonth += 1;
      if (utcMonth > 12) {
        utcMonth = 1;
        utcYear += 1;
      }
    }
  }

  return { year: utcYear, month: utcMonth, day: utcDay, hour: utcHour, minute };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * 第二步：计算儒略世纪数 T（从J2000.0起算）
 */
export function jdToT(jd: number): number {
  return (jd - 2451545.0) / 36525.0;
}

/**
 * 格林尼治平恒星时（GMST）- 单位：度
 * Meeus, Astronomical Algorithms, Chapter 12
 */
export function gmst(jd: number): number {
  const T = jdToT(jd);
  // 以度为单位的GMST
  let theta = 280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    T * T * T / 38710000.0;
  return normalize360(theta);
}

/**
 * 本地恒星时（LST）- 单位：度
 */
export function lst(jd: number, longitude: number): number {
  return normalize360(gmst(jd) + longitude);
}

/**
 * 真黄赤交角 ε（Obliquity of the Ecliptic）
 * Meeus, Chapter 22
 */
export function trueObliquity(jd: number): number {
  const T = jdToT(jd);
  // 平黄赤交角
  const eps0 = 23.439291111 - 0.013004167 * T - 1.638889e-7 * T * T + 5.036111e-7 * T * T * T;
  // 章动修正（简化）
  const omega = 125.04 - 1934.136 * T;
  const L0 = 280.4665 + 36000.7698 * T;
  const Lp = 218.3165 + 481267.8813 * T;
  const deltaEps = 0.002555556 * Math.cos(degToRad(omega))
    + 0.000158333 * Math.cos(degToRad(2 * L0))
    + 0.000027778 * Math.cos(degToRad(2 * Lp))
    - 0.000025 * Math.cos(degToRad(2 * omega));
  return eps0 + deltaEps;
}

/**
 * 章动（Nutation in longitude）- 单位：度
 */
export function nutationInLongitude(jd: number): number {
  const T = jdToT(jd);
  const omega = 125.04 - 1934.136 * T;
  const L0 = 280.4665 + 36000.7698 * T;
  const Lp = 218.3165 + 481267.8813 * T;
  return -0.004777778 * Math.sin(degToRad(omega))
    - 0.000363889 * Math.sin(degToRad(2 * L0))
    - 0.000063889 * Math.sin(degToRad(2 * Lp))
    + 0.000058333 * Math.sin(degToRad(2 * omega));
}
