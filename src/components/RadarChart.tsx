interface RadarChartProps {
  labels: string[];
  series1: number[];
  series2: number[];
  label1: string;
  label2: string;
  max: number;
}

export function RadarChart({ labels, series1, series2, label1, label2, max }: RadarChartProps) {
  const size = 360;
  const center = size / 2;
  const radius = 130;
  const n = labels.length;

  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const pointFor = (i: number, value: number) => {
    const r = (value / max) * radius;
    const angle = angleFor(i);
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const polygonPoints = (series: number[]) =>
    series.map((v, i) => {
      const p = pointFor(i, v);
      return `${p.x},${p.y}`;
    }).join(' ');

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full">
        {/* Grid rings */}
        {gridLevels.map((level, gi) => {
          const r = radius * level;
          const pts = labels.map((_, i) => {
            const angle = angleFor(i);
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
          }).join(' ');
          return (
            <polygon
              key={gi}
              points={pts}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={1}
            />
          );
        })}

        {/* Axis lines */}
        {labels.map((_, i) => {
          const angle = angleFor(i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={center + radius * Math.cos(angle)}
              y2={center + radius * Math.sin(angle)}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
          );
        })}

        {/* Series 2 (behind) */}
        <polygon
          points={polygonPoints(series2)}
          fill="rgba(14, 165, 233, 0.12)"
          stroke="#0ea5e9"
          strokeWidth={2}
        />

        {/* Series 1 (front) */}
        <polygon
          points={polygonPoints(series1)}
          fill="rgba(99, 102, 241, 0.12)"
          stroke="#6366f1"
          strokeWidth={2}
        />

        {/* Data points */}
        {series1.map((v, i) => {
          const p = pointFor(i, v);
          return <circle key={`s1-${i}`} cx={p.x} cy={p.y} r={3} fill="#6366f1" />;
        })}
        {series2.map((v, i) => {
          const p = pointFor(i, v);
          return <circle key={`s2-${i}`} cx={p.x} cy={p.y} r={3} fill="#0ea5e9" />;
        })}

        {/* Labels */}
        {labels.map((label, i) => {
          const angle = angleFor(i);
          const labelR = radius + 28;
          const x = center + labelR * Math.cos(angle);
          const y = center + labelR * Math.sin(angle);
          const shortLabel = label.length > 18 ? label.slice(0, 16) + '…' : label;
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-500"
              style={{ fontSize: '9px', fontWeight: 500 }}
            >
              {shortLabel}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-indigo-500" />
          <span className="text-slate-600">{label1}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-sky-500" />
          <span className="text-slate-600">{label2}</span>
        </span>
      </div>
    </div>
  );
}
