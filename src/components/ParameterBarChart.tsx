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
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ borderBottom: '1.5px solid #334155' }}>
            <th style={{ textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '500', padding: '6px 8px', width: '35%' }}>Parametro</th>
            <th style={{ textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '500', padding: '6px 8px', width: '65%' }}>Voti</th>
          </tr>
        </thead>
        <tbody>
          {labels.map((label, i) => {
            const v1 = Math.min(Math.max(series1[i] ?? 0, 0), max);
            const v2 = Math.min(Math.max(series2[i] ?? 0, 0), max);
            return (
              <tr key={i} style={{ borderBottom: '0.5px solid #e2e8f0' }}>
                <td style={{ padding: '8px', fontSize: '12px', fontWeight: '500', color: '#334155', verticalAlign: 'middle', wordBreak: 'break-word' }}>
                  {label}
                </td>
                <td style={{ padding: '8px', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {/* Barra scuola A */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ position: 'relative', flex: 1, height: '12px', borderRadius: '4px', overflow: 'hidden', minWidth: 0 }}>
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          background: 'linear-gradient(to right, #fee2e2 0%, #fee2e2 50%, #fef9c3 50%, #fef9c3 70%, #dcfce7 70%, #dcfce7 100%)'
                        }} />
                        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: pct(v1), background: 'rgba(129,140,248,0.9)', borderRadius: '4px' }} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '600', minWidth: '16px', textAlign: 'right', color: '#4338ca' }}>{v1 || '–'}</span>
                    </div>
                    {/* Barra scuola B */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ position: 'relative', flex: 1, height: '12px', borderRadius: '4px', overflow: 'hidden', minWidth: 0 }}>
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          background: 'linear-gradient(to right, #fee2e2 0%, #fee2e2 50%, #fef9c3 50%, #fef9c3 70%, #dcfce7 70%, #dcfce7 100%)'
                        }} />
                        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: pct(v2), background: 'rgba(56,189,248,0.9)', borderRadius: '4px' }} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '600', minWidth: '16px', textAlign: 'right', color: '#0284c7' }}>{v2 || '–'}</span>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Legenda */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px', fontSize: '11px', color: '#64748b', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#818cf8', display: 'inline-block' }} />
          {label1}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#38bdf8', display: 'inline-block' }} />
          {label2}
        </span>
      </div>
    </div>
  );
}