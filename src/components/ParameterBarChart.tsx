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
                        <div className="absolute inset-0 flex">
                          <div style={{ width: '50%', background: '#fee2e2' }} />
                          <div style={{ width: '20%', background: '#fef9c3' }} />
                          <div style={{ width: '30%', background: '#dcfce7' }} />