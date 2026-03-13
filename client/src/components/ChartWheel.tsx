/**
 * 星盘可视化组件 — Canvas绘制
 * Art Deco风格的星盘图
 */
import { useEffect, useRef } from 'react';
import { ChartData } from '@/lib/astro/chart';

const ZODIAC_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const ELEMENT_COLORS: Record<string, string> = {
  fire: '#c47830',
  earth: '#7a8a5c',
  air: '#b8963e',
  water: '#5a7a8a',
};
const SIGN_ELEMENTS = ['fire', 'earth', 'air', 'water', 'fire', 'earth', 'air', 'water', 'fire', 'earth', 'air', 'water'];

interface Props {
  chart: ChartData;
  size?: number;
}

export default function ChartWheel({ chart, size = 500 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    drawChart(ctx, chart, size);
  }, [chart, size]);

  return (
    <canvas
      ref={canvasRef}
      className="max-w-full h-auto"
    />
  );
}

function drawChart(ctx: CanvasRenderingContext2D, chart: ChartData, size: number) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.46;
  const zodiacR = size * 0.40;
  const innerR = size * 0.32;
  const planetR = size * 0.25;
  const centerR = size * 0.08;

  // Clear
  ctx.clearRect(0, 0, size, size);

  // Background
  ctx.fillStyle = '#1c1f26';
  ctx.fillRect(0, 0, size, size);

  // ASC offset (rotate chart so ASC is at left/9 o'clock)
  const ascOffset = chart.houses.ascendant;

  // ---- Outer ring ----
  ctx.strokeStyle = 'rgba(184, 150, 62, 0.4)';
  ctx.lineWidth = 1;
  drawCircle(ctx, cx, cy, outerR);
  drawCircle(ctx, cx, cy, zodiacR);
  drawCircle(ctx, cx, cy, innerR);
  drawCircle(ctx, cx, cy, centerR);

  // ---- Zodiac sign sectors ----
  for (let i = 0; i < 12; i++) {
    const startAngle = i * 30;
    const midAngle = startAngle + 15;

    // Zodiac divider lines
    const angle = degToCanvasAngle(startAngle, ascOffset);
    const x1 = cx + zodiacR * Math.cos(angle);
    const y1 = cy - zodiacR * Math.sin(angle);
    const x2 = cx + outerR * Math.cos(angle);
    const y2 = cy - outerR * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = 'rgba(184, 150, 62, 0.25)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Zodiac symbol
    const symAngle = degToCanvasAngle(midAngle, ascOffset);
    const symR = (zodiacR + outerR) / 2;
    const sx = cx + symR * Math.cos(symAngle);
    const sy = cy - symR * Math.sin(symAngle);

    const element = SIGN_ELEMENTS[i];
    ctx.fillStyle = ELEMENT_COLORS[element] || '#b8963e';
    ctx.font = `${size * 0.035}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ZODIAC_SYMBOLS[i], sx, sy);
  }

  // ---- House cusps ----
  for (let i = 0; i < 12; i++) {
    const cuspAngle = degToCanvasAngle(chart.houses.cusps[i], ascOffset);
    const isCardinal = [0, 3, 6, 9].includes(i);

    // Cusp lines
    const lineStart = centerR;
    const lineEnd = isCardinal ? zodiacR : innerR;
    const x1 = cx + lineStart * Math.cos(cuspAngle);
    const y1 = cy - lineStart * Math.sin(cuspAngle);
    const x2 = cx + lineEnd * Math.cos(cuspAngle);
    const y2 = cy - lineEnd * Math.sin(cuspAngle);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = isCardinal ? 'rgba(184, 150, 62, 0.5)' : 'rgba(184, 150, 62, 0.15)';
    ctx.lineWidth = isCardinal ? 1.5 : 0.5;
    ctx.stroke();

    // House number
    const nextCusp = chart.houses.cusps[(i + 1) % 12];
    let midDeg = chart.houses.cusps[i];
    let diff = nextCusp - chart.houses.cusps[i];
    if (diff < 0) diff += 360;
    midDeg = midDeg + diff / 2;
    const numAngle = degToCanvasAngle(midDeg, ascOffset);
    const numR = (centerR + innerR) / 2;
    const nx = cx + numR * Math.cos(numAngle);
    const ny = cy - numR * Math.sin(numAngle);

    ctx.fillStyle = 'rgba(184, 150, 62, 0.3)';
    ctx.font = `${size * 0.022}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), nx, ny);
  }

  // ---- Aspect lines ----
  const wealthPlanets = new Set(['Venus', 'Jupiter', 'Moon', 'Sun']);
  for (const aspect of chart.aspects) {
    const p1 = chart.planets.find(p => p.name === aspect.planet1);
    const p2 = chart.planets.find(p => p.name === aspect.planet2);
    if (!p1 || !p2) continue;

    // Only draw aspects involving wealth-relevant planets or major aspects
    const isWealth = wealthPlanets.has(p1.name) || wealthPlanets.has(p2.name);
    if (!isWealth && aspect.type !== 'conjunction' && aspect.type !== 'opposition') continue;

    const a1 = degToCanvasAngle(p1.longitude, ascOffset);
    const a2 = degToCanvasAngle(p2.longitude, ascOffset);
    const r = innerR * 0.9;
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy - r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy - r * Math.sin(a2);

    let color = 'rgba(184, 150, 62, 0.08)';
    let lineW = 0.3;
    if (aspect.nature === 'harmonious') { color = 'rgba(122, 138, 92, 0.3)'; lineW = 0.6; }
    else if (aspect.nature === 'challenging') { color = 'rgba(196, 120, 48, 0.3)'; lineW = 0.6; }
    else { color = 'rgba(184, 150, 62, 0.2)'; lineW = 0.5; }

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineW;
    ctx.stroke();
  }

  // ---- Planets with overlap prevention ----
  const visiblePlanets = chart.planets.filter(p => p.name !== 'SouthNode');
  const spreadResult = spreadPlanets(visiblePlanets.map(p => p.longitude), ascOffset, 10);

  visiblePlanets.forEach((planet, i) => {
    const displayAngle = spreadResult[i];
    const r = planetR;
    const px = cx + r * Math.cos(displayAngle);
    const py = cy - r * Math.sin(displayAngle);

    // Tick mark from inner ring to planet position
    const dotAngle = degToCanvasAngle(planet.longitude, ascOffset);
    const tickStart = innerR + 1;
    const tickEnd = innerR + size * 0.025;
    const tx1 = cx + tickStart * Math.cos(dotAngle);
    const ty1 = cy - tickStart * Math.sin(dotAngle);
    const tx2 = cx + tickEnd * Math.cos(dotAngle);
    const ty2 = cy - tickEnd * Math.sin(dotAngle);
    ctx.beginPath();
    ctx.moveTo(tx1, ty1);
    ctx.lineTo(tx2, ty2);
    ctx.strokeStyle = 'rgba(184, 150, 62, 0.4)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Planet symbol
    let symbolColor = '#e0d5c1';
    if (['Venus', 'Jupiter'].includes(planet.name)) symbolColor = '#b8963e';
    if (['Saturn', 'Mars', 'Pluto'].includes(planet.name)) symbolColor = '#c47830';
    if (planet.name === 'Moon') symbolColor = '#c0c0c0';
    if (planet.name === 'Sun') symbolColor = '#e8c84a';
    if (planet.name === 'NorthNode') symbolColor = 'rgba(184, 150, 62, 0.5)';

    ctx.fillStyle = symbolColor;
    ctx.font = `${size * 0.032}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(planet.symbol, px, py);

    // Degree text below symbol
    ctx.fillStyle = 'rgba(224, 213, 193, 0.45)';
    ctx.font = `${size * 0.016}px sans-serif`;
    ctx.fillText(`${planet.signDegree}°`, px, py + size * 0.025);

    // Retrograde indicator
    if (planet.retrograde && planet.name !== 'NorthNode') {
      ctx.fillStyle = 'rgba(196, 120, 48, 0.6)';
      ctx.font = `${size * 0.014}px sans-serif`;
      ctx.fillText('R', px + size * 0.018, py - size * 0.012);
    }
  });

  // ---- ASC / MC labels ----
  const ascAngle = degToCanvasAngle(chart.houses.ascendant, ascOffset);
  const ascLx = cx + (outerR + size * 0.04) * Math.cos(ascAngle);
  const ascLy = cy - (outerR + size * 0.04) * Math.sin(ascAngle);
  ctx.fillStyle = '#b8963e';
  ctx.font = `bold ${size * 0.025}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ASC', ascLx, ascLy);

  const mcAngle = degToCanvasAngle(chart.houses.midheaven, ascOffset);
  const mcLx = cx + (outerR + size * 0.04) * Math.cos(mcAngle);
  const mcLy = cy - (outerR + size * 0.04) * Math.sin(mcAngle);
  ctx.fillText('MC', mcLx, mcLy);
}

function drawCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
}

function degToCanvasAngle(eclipticDeg: number, ascOffset: number): number {
  // In canvas: 0° is right (3 o'clock), counter-clockwise
  // We want ASC at left (9 o'clock = π)
  const adjusted = eclipticDeg - ascOffset;
  return (180 + adjusted) * Math.PI / 180;
}

/**
 * Spread overlapping planet positions to avoid visual collision
 * Uses iterative relaxation algorithm
 */
function spreadPlanets(longitudes: number[], ascOffset: number, minGapDeg: number): number[] {
  // Convert to canvas angles
  const items = longitudes.map((lon, i) => ({
    index: i,
    originalAngle: degToCanvasAngle(lon, ascOffset),
    displayAngle: degToCanvasAngle(lon, ascOffset),
  }));

  // Sort by angle
  items.sort((a, b) => a.originalAngle - b.originalAngle);

  const minGapRad = (minGapDeg * Math.PI) / 180;

  // Iterative relaxation
  for (let iter = 0; iter < 30; iter++) {
    let moved = false;
    for (let i = 0; i < items.length; i++) {
      const j = (i + 1) % items.length;
      let diff = items[j].displayAngle - items[i].displayAngle;
      if (diff < 0) diff += 2 * Math.PI;
      if (diff < minGapRad && diff > 0) {
        const push = (minGapRad - diff) / 2;
        items[i].displayAngle -= push * 0.5;
        items[j].displayAngle += push * 0.5;
        moved = true;
      }
    }
    if (!moved) break;
  }

  // Restore original order
  const result = new Array<number>(longitudes.length);
  for (const item of items) {
    result[item.index] = item.displayAngle;
  }
  return result;
}
