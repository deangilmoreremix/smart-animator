import React from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  showDots?: boolean;
  showGrid?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 200,
  color = '#3b82f6',
  showDots = true,
  showGrid = true
}) => {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const range = maxValue - minValue || 1;

  const padding = 20;
  const width = 100;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;

  const points = data.map((point, i) => {
    const x = (i / (data.length - 1)) * chartWidth + padding;
    const y = height - ((point.value - minValue) / range * chartHeight + padding);
    return { x, y, value: point.value, label: point.label };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height: `${height}px` }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {showGrid && (
          <g className="opacity-10">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = height - (ratio * chartHeight + padding);
              return (
                <line
                  key={i}
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              );
            })}
          </g>
        )}

        <path
          d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`}
          fill={`url(#${gradientId})`}
        />

        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {showDots && points.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill={color}
              className="transition-all hover:r-6"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill={color}
              opacity="0.2"
            />
          </g>
        ))}
      </svg>

      <div className="flex justify-between mt-2 px-4">
        {data.map((point, i) => (
          <span key={i} className="text-xs text-slate-500">
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default LineChart;
