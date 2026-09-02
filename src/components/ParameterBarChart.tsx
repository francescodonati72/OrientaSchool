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
  const labelHeight = 56;
  const chartHeight = 200;
  const numberHeight = 20;

  const yScale = (value: number) => {
    if (max <= 0) return 0;
    const clamped = Math.min(Math.max(value, 0), max);
    return (clamped / max) * chartHeight;
  };

  // Fasce sfondo: rosso 1-5 (50%), giallo 6-7 (20%), verde 8-10 (30%)
  const redHeight = (5 / 10) * chartHeight;
  const yellowHeight = (2 / 10) * chartHeight;
  const greenHeight = (3 / 10) * chartHeight;

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="flex" style={{ minWidth: labels.length * 80 + 40 }}>
          {/* Y-axis */}
          <div className="flex-shrink-0 w-10" style={{ paddingTop: numberHeight }}>
            <div className="flex flex-col justify-between" style={{ height: chartHeight }}>
              {[10, 8, 6, 4, 2, 0].map((v) => (
                <div key={v} className="text-[10px] text-slate-400 text-right pr-1 -mb-1.5">
                  {v}
                </div>
              ))}
            </div>
          </div>

          {/* Bars + labels */}
          {labels.map((label, i) => {
            const v1 = Math.min(Math.max(series1[i] ?? 0, 0), max);
            const v2 = Math.min(Math.max(series2[i] ?? 0, 0), max);
            const h1 = yScale(v1);
            const h2 = yScale(v2);
            const shortLabel = label.length > 14 ? label.slice(0, 12) + '…' : label;

            return (
              <div key={i} className="flex-shrink-0 flex flex-col items-center" style={{ width: 80 }}>
                {/* Number row */}
                <div className="flex justify-center gap-1.5" style={{ height: numberHeight }}>
                  <div style={{ width: barWidth }} className="flex items-end justify-center">
                    <span className="text-[10px] font-semibold text-slate-600">{v1 || ''}</span>
                  </div>
                  <div style={{ width: barWidth }} className="flex items-end justify-center">
                    <span className="text-[10px] font-semibold text-slate-600">{v2 || ''}</span>
                  </div>
                </div>

                {/* Bar area con sfondo a fasce */}
                <div
                  className="flex items-end justify-center gap-1.5 relative"
                  style={{ height: chartHeight, width: '100%' }}
                >
                  {/* Sfondo fasce */}
                  <div className="absolute inset-0 flex flex-col pointer-events-none">
                    <div style={{ height: greenHeight, backgroundColor: '#dcfce7' }} />
                    <div style={{ height: yellowHeight, backgroundColor: '#fef9c3' }} />
                    <div style={{ height: redHeight, backgroundColor: '#fee2e2' }} />
                  </div>

                  {/* Bar 1 - viola */}
                  <div style={{ width: barWidth, height: chartHeight }} className="relative flex flex-col justify-end overflow-hidden z-10">
                    <div
                      className="w-full rounded-t-md transition-all duration-500"
                      style={{ height: `${h1}px`, backgroundColor: '#818cf8' }}
                    />
                  </div>

                  {/* Bar 2 - azzurro */}
                  <div style={{ width: barWidth, height: chartHeight }} className="relative flex flex-col justify-end overflow-hidden z-10">
                    <div
                      className="w-full rounded-t-md transition-all duration-500"
                      style={{ height: `${h2}px`, backgroundColor: '#38bdf8' }}
                    />
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
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: '#818cf8' }} />
            <span className="text-slate-600">{label1}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: '#38bdf8' }} />
            <span className="text-slate-600">{label2}</span>
          </span>
        </div>
      </div>
    </div>
  );
}