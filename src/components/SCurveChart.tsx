import React, { useState } from 'react';
import { SCurveWeekPoint } from '../types';

interface SCurveChartProps {
  data: SCurveWeekPoint[];
  currentWeekDiff: number;
}

export const SCurveChart: React.FC<SCurveChartProps> = ({ data, currentWeekDiff }) => {
  const [hoveredPoint, setHoveredPoint] = useState<SCurveWeekPoint | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        ไม่มีข้อมูลแผนงาน S-Curve
      </div>
    );
  }

  // Dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 30, right: 40, bottom: 50, left: 55 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // The points are ordered from Left (Oldest, e.g. Week -11) to Right (Current, Week 0)
  const totalPoints = data.length;

  const getX = (index: number) => {
    if (totalPoints <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (totalPoints - 1)) * chartWidth;
  };

  const getY = (value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    return padding.top + chartHeight - (clamped / 100) * chartHeight;
  };

  // Generate SVG path for Baseline Plan
  const planPath = data
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.baselinePlan)}`)
    .join(' ');

  // Generate SVG path for Actual Progress (only up to points that have actualProgress)
  const actualPoints = data.filter((p) => p.actualProgress !== null);
  const actualPath = actualPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.actualProgress!)}`)
    .join(' ');

  // Area under actual path
  const lastActualIndex = actualPoints.length - 1;
  const actualAreaPath =
    actualPoints.length > 1
      ? `${actualPath} L ${getX(lastActualIndex)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`
      : '';

  // Actual curve stroke color based on current week diff
  let actualStrokeColor = '#10b981'; // Emerald
  let actualFillGradient = 'url(#actualGradEmerald)';
  if (currentWeekDiff >= 5) {
    actualStrokeColor = '#10b981'; // Emerald
    actualFillGradient = 'url(#actualGradEmerald)';
  } else if (currentWeekDiff >= -5) {
    actualStrokeColor = '#0ea5e9'; // Sky
    actualFillGradient = 'url(#actualGradSky)';
  } else if (currentWeekDiff >= -15) {
    actualStrokeColor = '#f59e0b'; // Amber
    actualFillGradient = 'url(#actualGradAmber)';
  } else {
    actualStrokeColor = '#f43f5e'; // Rose
    actualFillGradient = 'url(#actualGradRose)';
  }

  // Y-axis grid ticks (0, 20, 40, 60, 80, 100)
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div className="relative w-full overflow-hidden bg-slate-900/80 rounded-xl border border-slate-800 p-4 shadow-xl">
      {/* Chart Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              กราฟความคืบหน้าสะสม S-Curve โครงการ
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono border border-slate-700">
              Week 0 (ซ้ายมือ) ➔ Week {totalPoints - 1} วันส่งมอบงาน (ขวามือ)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            เปรียบเทียบแผนงานสะสม Baseline Plan (%) กับผลการประเมินจริง AI Actual Progress (%) ตามระยะเวลาโครงการ
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-sky-400" />
            <span className="text-slate-300">แผนงานสะสม (Baseline Plan)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full border-2" style={{ borderColor: actualStrokeColor, backgroundColor: actualStrokeColor + '40' }} />
            <span className="text-slate-300 font-medium">ความคืบหน้าจริง (AI Actual)</span>
          </div>
        </div>
      </div>

      {/* Responsive SVG Container */}
      <div className="relative w-full aspect-[8/3] min-h-[260px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none"
          preserveAspectRatio="none"
          onMouseLeave={() => {
            setHoveredPoint(null);
            setMousePos(null);
          }}
        >
          <defs>
            {/* Gradients for actual area */}
            <linearGradient id="actualGradEmerald" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="actualGradSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="actualGradAmber" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="actualGradRose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>

            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Grid lines */}
          {yTicks.map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="0.7"
                  strokeDasharray={val === 0 || val === 100 ? 'none' : '4 4'}
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="11"
                  textAnchor="end"
                  fontFamily="sans-serif"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Vertical Week Guidelines */}
          {data.map((point, index) => {
            const x = getX(index);
            const isCurrent = point.isCurrentWeek;
            const isDelivery = point.isDeliveryWeek;
            return (
              <g key={index}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke={isCurrent ? '#0284c7' : isDelivery ? '#10b981' : '#1e293b'}
                  strokeWidth={isCurrent || isDelivery ? '1.5' : '0.8'}
                  strokeDasharray={isCurrent || isDelivery ? 'none' : '3 3'}
                />
                {/* X-axis Week Label */}
                <text
                  x={x}
                  y={height - padding.bottom + 18}
                  fill={isCurrent ? '#38bdf8' : isDelivery ? '#34d399' : '#94a3b8'}
                  fontSize={isCurrent || isDelivery ? '10' : '9'}
                  fontWeight={isCurrent || isDelivery ? 'bold' : 'normal'}
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {point.weekIndex === 0
                    ? 'W0 (เริ่ม)'
                    : isCurrent
                    ? `W${point.weekIndex} (ปัจจุบัน)`
                    : isDelivery
                    ? `W${point.weekIndex} (ส่งมอบ)`
                    : `W${point.weekIndex}`}
                </text>
                {/* Sub Date Label */}
                <text
                  x={x}
                  y={height - padding.bottom + 30}
                  fill="#64748b"
                  fontSize="8"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {point.dateLabel}
                </text>
              </g>
            );
          })}

          {/* Area fill for actual progress */}
          {actualAreaPath && <path d={actualAreaPath} fill={actualFillGradient} />}

          {/* Baseline Plan Line (Dashed Cyan/Slate) */}
          <path
            d={planPath}
            fill="none"
            stroke="#60a5fa"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            strokeLinecap="round"
          />

          {/* Actual Progress Line */}
          {actualPath && (
            <path
              d={actualPath}
              fill="none"
              stroke={actualStrokeColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Baseline Plan Points */}
          {data.map((p, i) => (
            <circle
              key={`plan-${i}`}
              cx={getX(i)}
              cy={getY(p.baselinePlan)}
              r="3.5"
              fill="#1e293b"
              stroke="#60a5fa"
              strokeWidth="2"
            />
          ))}

          {/* Actual Progress Points */}
          {actualPoints.map((p, i) => {
            const isLast = i === actualPoints.length - 1;
            const x = getX(i);
            const y = getY(p.actualProgress!);
            return (
              <g key={`act-${i}`}>
                {isLast && (
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill={actualStrokeColor}
                    opacity="0.3"
                    className="animate-ping"
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isLast ? '6' : '4.5'}
                  fill={actualStrokeColor}
                  stroke="#0f172a"
                  strokeWidth="2.5"
                />
              </g>
            );
          })}

          {/* Interactive Hover Columns */}
          {data.map((point, index) => {
            const x = getX(index);
            const colWidth = chartWidth / (totalPoints - 1 || 1);
            return (
              <rect
                key={`hover-${index}`}
                x={x - colWidth / 2}
                y={padding.top}
                width={colWidth}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer hover:fill-white/5 transition-colors"
                onMouseEnter={(e) => {
                  setHoveredPoint(point);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMousePos({ x: rect.left + rect.width / 2, y: rect.top + 50 });
                }}
              />
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-950/95 border border-slate-700/80 rounded-lg p-2.5 text-xs shadow-2xl backdrop-blur-md min-w-[190px]"
            style={{
              left: `${((data.indexOf(hoveredPoint) / (totalPoints - 1 || 1)) * 85 + 7.5)}%`,
              top: '30%',
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1.5 font-semibold text-slate-200">
              <span>{hoveredPoint.weekLabel}</span>
              <span className="text-slate-400 text-[10px]">{hoveredPoint.dateLabel}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sky-400">
                <span>แผนงานสะสม (Plan):</span>
                <span className="font-mono font-bold">{hoveredPoint.baselinePlan}%</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>ผลจริง (Actual):</span>
                <span className="font-mono font-bold">
                  {hoveredPoint.actualProgress !== null ? `${hoveredPoint.actualProgress}%` : 'ยังไม่ถึงกำหนด'}
                </span>
              </div>
              {hoveredPoint.actualProgress !== null && (
                <div
                  className={`flex justify-between font-semibold pt-1 border-t border-slate-800/80 ${
                    hoveredPoint.actualProgress - hoveredPoint.baselinePlan >= 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  <span>ส่วนต่าง (Variance):</span>
                  <span className="font-mono">
                    {hoveredPoint.actualProgress - hoveredPoint.baselinePlan >= 0 ? '+' : ''}
                    {(hoveredPoint.actualProgress - hoveredPoint.baselinePlan).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Axis Hint footer */}
      <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-800/60 mt-1">
        <span className="text-slate-400 font-medium">◀ สัปดาห์เริ่มต้น (Week 0) แผนงาน 0%</span>
        <span className="text-cyan-400 font-medium">เส้นทางเดินงานก่อสร้าง Shop TFM สะสม (S-Curve)</span>
        <span className="text-emerald-400 font-semibold">วันส่งมอบงาน (Week {totalPoints - 1}) แผนงาน 100% ▶</span>
      </div>
    </div>
  );
};
