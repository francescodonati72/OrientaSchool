interface ParameterBarChartProps {
  labels: string[];
  series1: number[];
  series2: number[];
  label1: string;
  label2: string;
  max: number;
}

export function ParameterBarChart({ labels, series1, series2, label1, label2, max }: ParameterBarChartProps) {
  const pct = (v: number) => `${Math.min(Math.max((v / max) * 100, 0), 100)}%`;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full" style={{ borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ borderBottom: '1.5px solid #334155' }}>
            <th className="text-left text-xs text-slate-500 font-medium" style={{ padding: '6px 8px', width: '35%' }}>Parametro</th>
            <th className="text-left text-xs text-slate-500 font-medium" style={{ padding: '6px 8px' }}>Voti</th>
          </tr>
        </thead>
        <tbody>
          {labels.map((label, i) => {
            const v1 = Math.min(Math.max(series1[i] ?? 0, 0), max);
            const v2 = Math.min(Math.max(series2[i] ?? 0, 0), max);
            return (
              <tr key={i} style={{ borderBottom: '0.5px solid #e2e8f0' }}>
                <td className="text-sm font-medium text-slate-700" style={{ padding: '8px', verticalAlign: 'middle' }}>
                  {label}
                </td>
                <td style={{ padding: '8px', verticalAlign: 'middle' }}>
                  <div className="flex flex-col gap-1">
                    {/* Barra scuola A */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 rounded overflow-hidden" style={{ height: '12px' }}>
                        <div className="absolute inset-0" style={{
                          background: 'linear-gradient(to right, #fee2e2 0%, #fee2e2 50%, #fef9c3 50%, #fef9c3 70%, #dcfce7 70%, #dcfce7 100%)'
                        }} />
                        <div className="absolute top-0 left-0 h-full rounded" style={{ width: pct(v1), background: 'rgba(129,140,248,0.9)' }} />
                      </div>
                      <span className="text-[11px] font-semibold text-right" style={{ minWidth: '16px', color: '#4338ca' }}>{v1 || '–'}</span>
                    </div>
                    {/* Barra scuola B */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 rounded overflow-hidden" style={{ height: '12px' }}>
                        <div className="absolute inset-0" style={{
                          background: 'linear-gradient(to right, #fee2e2 0%, #fee2e2 50%, #fef9c3 50%, #fef9c3 70%, #dcfce7 70%, #dcfce7 100%)'
                        }} />
                        <div className="absolute top-0 left-0 h-full rounded" style={{ width: pct(v2), background: 'rgba(56,189,248,0.9)' }} />
                      </div>
                      <span className="text-[11px] font-semibold text-right" style={{ minWidth: '16px', color: '#0284c7' }}>{v2 || '–'}</span>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Legenda */}
      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: '#818cf8' }} />
          {label1}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: '#38bdf8' }} />
          {label2}
       
      </div>
    </div>
  );
}