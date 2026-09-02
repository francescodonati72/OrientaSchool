interface ParameterBarChartProps {
  labels: string[];
  series1: number[];
  series2: number[];
  label1: string;
  label2: string;
  max: number;
}

export function ParameterBarChart({ labels, series1, series2, label1, label2, max }: ParameterBarChartProps) {
  const barWidth = 14;
  const gap = 6;
  const pairWidth = barWidth * 2 + gap;
  const labelHeight = 56;
  const chartHeight = 200;
  const totalHeight = chartHeight + labelHeight;

  const yScale = (value: number) => {
    if (max <= 0) return 0;
    return (value / max) * chartHeight;
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="flex" style={{ minWidth: labels.length * 80 + 40 }}>
          {/* Y-axis labels */}
          <div className="flex-shrink-0 w-10 flex flex-col justify-end" style={{ height: totalHeight }}>
            <div className="flex flex-col justify-between" style={{ height: chartHeight }}>
              {[10, 7.5, 5, 2.5, 0].map((v) => (
                <div key={v} className="text-[10px] text-slate-400 text-right pr-1 -mb-1.5">
                  {v}
                </div>
              ))}
            </div>
          </div>

          {/* Bars + labels */}
          {labels.map((label, i) => {
            const v1 = series1[i] ?? 0;
            const v2 = series2[i] ?? 0;
            const h1 = yScale(v1);
            const h2 = yScale(v2);
            const shortLabel = label.length > 14 ? label.slice(0, 12) + '…' : label;

            return (
              <div key={i} className="flex-shrink-0 flex flex-col items-center" style={{ width: 80 }}>
                {/* Bar area */}
                <div className="flex items-end justify-center gap-1.5" style={{ height: chartHeight }}>
                  {/* Bar 1 */}
                  <div className="relative group flex flex-col items-center justify-end" style={{ width: barWidth, height: chartHeight }}>
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        v1 === 0 ? 'bg-slate-100' :
                        v1 <= 5 ? 'bg-error-400' :
                        v1 <= 7 ? 'bg-amber-400' : 'bg-success-400'
                      }`}
                      style={{ height: `${h1}px` }}
                    />
                    <span className="absolute -top-5 text-[10px] font-semibold text-slate-600">
                      {v1 || ''}
                    </span>
                  </div>
                  {/* Bar 2 */}
                  <div className="relative group flex flex-col items-center justify-end" style={{ width: barWidth, height: chartHeight }}>
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        v2 === 0 ? 'bg-slate-100' :
                        v2 <= 5 ? 'bg-error-500' :
                        v2 <= 7 ? 'bg-amber-500' : 'bg-success-500'
                      }`}
                      style={{ height: `${h2}px` }}
                    />
                    <span className="absolute -top-5 text-[10px] font-semibold text-slate-600">
                      {v2 || ''}
                    </span>
                  </div>
                </div>

                {/* X-axis label */}
                <div
                  className="mt-2 w-full text-center text-[9px] leading-tight text-slate-500"
                  style={{ height: labelHeight, overflow: 'hidden' }}
                  title={label}
                >
                  {shortLabel}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-2 flex items-center gap-4 text-xs pl-10">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-indigo-400" />
            <span className="text-slate-600">{label1}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-sky-500" />
            <span className="text-slate-600">{label2}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
