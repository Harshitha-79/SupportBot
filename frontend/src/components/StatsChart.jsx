import React from 'react';

// Lightweight SVG bar chart. Props:
// - data: [{ label: 'Resolved', value: 10 }, ...]
// - height, width, barColor
export default function StatsChart({ data = [], width = 600, height = 160, barColor = '#7c3aed' }) {
  if (!data || data.length === 0) return <div className="text-sm muted">No chart data</div>;

  const max = Math.max(...data.map(d => d.value), 1);
  const padding = 8;
  const barWidth = (width - padding * 2) / data.length - 8;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="160" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={barColor} stopOpacity="0.95" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* background grid lines */}
      {[0,1,2,3,4].map(i => (
        <line key={i} x1={padding} x2={width-padding} y1={(height/5)*i + 20} y2={(height/5)*i + 20} stroke="rgba(255,255,255,0.04)" />
      ))}

      {/* bars */}
      {data.map((d, i) => {
        const x = padding + i * (barWidth + 8) + 12;
        const h = Math.max(6, (d.value / max) * (height - 60));
        const y = height - h - 28;
        return (
          <g key={`${d.label}-${i}`}>
            <rect x={x} y={y} width={barWidth} height={h} rx="6" fill="url(#g1)" />
            <text x={x + barWidth/2} y={y - 8} textAnchor="middle" fontSize="11" fill="#dbeafe">{d.value}</text>
            <text x={x + barWidth/2} y={height - 8} textAnchor="middle" fontSize="11" fill="#94a3b8">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
