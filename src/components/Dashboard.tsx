import { useState, useEffect, useMemo } from 'react';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import {
  ArrowLeft, Settings as SettingsIcon, LogOut, BarChart3, Sparkles,
  Trophy, TrendingUp, TrendingDown, Minus, Loader2, School as SchoolIcon, Printer,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { useParameters } from '@/context/ParametersContext';
import { RadarChart } from '@/components/RadarChart';
import { ParameterBarChart } from '@/components/ParameterBarChart';
import { supabase } from '@/lib/supabase';
import { getInitials } from '@/lib/utils';
import { computeSchoolData, generateAIEvaluation } from '@/lib/ai-evaluation';
import type { Analysis, AnalysisData, School } from '@/lib/types';

interface DashboardProps {
  analysisId: string;
  onBack: () => void;
  onOpenSettings: () => void;
}

export function Dashboard({ analysisId, onBack, onOpenSettings }: DashboardProps) {
  const { user, signOut } = useAuth();
  const { parameters } = useParameters();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [schoolAId, setSchoolAId] = useState<string>('');
  const [schoolBId, setSchoolBId] = useState<string>('');

  const fullName = user
    ? `${(user.user_metadata?.first_name as string) ?? ''} ${(user.user_metadata?.last_name as string) ?? ''}`.trim()
    : '';
  const displayEmail = user?.email ?? '';

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', analysisId)
        .maybeSingle();
      if (error) {
        console.error('Error fetching analysis:', error.message);
      } else if (data) {
        setAnalysis(data as Analysis);
        const schools = ((data.data as AnalysisData)?.schools ?? []) as School[];
        if (schools.length >= 1) setSchoolAId(schools[0].id);
        if (schools.length >= 2) setSchoolBId(schools[1].id);
      }
      setLoading(false);
    })();
  }, [analysisId]);

  const data: AnalysisData = (analysis?.data as AnalysisData) ?? {};
  const schools: School[] = data.schools ?? [];
  const schoolA = schools.find((s) => s.id === schoolAId) ?? null;
  const schoolB = schools.find((s) => s.id === schoolBId) ?? null;

  const compA = useMemo(
    () => schoolA ? computeSchoolData(schoolA, parameters, data) : null,
    [schoolA, parameters, data]
  );
  const compB = useMemo(
    () => schoolB ? computeSchoolData(schoolB, parameters, data) : null,
    [schoolB, parameters, data]
  );
  const aiEval = useMemo(
    () => (compA && compB) ? generateAIEvaluation(compA, compB) : null,
    [compA, compB]
  );

  const handlePrint = () => window.print();
  const printDate = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
    </div>
  );

  if (!analysis) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-slate-500 mb-4">Analisi non trovata</p>
        <Button onClick={onBack}>Torna alle analisi</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ===== SCHERMO ===== */}
      <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button onClick={onBack} title="Torna alla Home">
                <Logo size="sm" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <WhatsAppButton fullName={fullName} email={displayEmail} />
              {compA && compB && (
                <Button variant="ghost" size="sm" onClick={handlePrint} title="Stampa / Salva PDF">
                  <Printer className="h-4 w-4" />
                  <span className="hidden sm:inline">Stampa PDF</span>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onOpenSettings} title="Impostazioni">
                <SettingsIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Impostazioni</span>
              </Button>
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-sm font-medium text-slate-700">{fullName || 'Utente'}</span>
                <span className="text-xs text-slate-400">{displayEmail}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-sky-400 flex items-center justify-center text-sm font-semibold text-white shadow-md">
                {getInitials(fullName || displayEmail || 'U')}
              </div>
              <Button variant="ghost" size="sm" onClick={signOut} title="Esci">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="no-print mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-6 w-6 text-brand-600" />
            <h1 className="text-3xl font-bold text-slate-800">Dashboard Comparativa</h1>
          </div>
          <p className="text-sm text-slate-500">{analysis.name}</p>
        </div>

        {schools.length < 2 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-100 to-sky-100 flex items-center justify-center">
              <SchoolIcon className="h-8 w-8 text-brand-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">Servono almeno 2 scuole</h3>
            <p className="text-sm text-slate-500 mb-5 max-w-sm">
              Aggiungi almeno due scuole nell'analisi per visualizzare il confronto comparativo.
            </p>
            <Button onClick={onBack}>Torna all'analisi</Button>
          </div>
        ) : (
          <>
            <div className="mb-8 card p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Seleziona le scuole da confrontare</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Scuola A</label>
                  <select value={schoolAId} onChange={(e) => setSchoolAId(e.target.value)} className="input-field">
                    {schools.map((s) => <option key={s.id} value={s.id}>{s.name}{s.location ? ` — ${s.location}` : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Scuola B</label>
                  <select value={schoolBId} onChange={(e) => setSchoolBId(e.target.value)} className="input-field">
                    {schools.map((s) => <option key={s.id} value={s.id}>{s.name}{s.location ? ` — ${s.location}` : ''}</option>)}
                  </select>
                </div>
              </div>
              {schoolAId === schoolBId && (
                <p className="mt-3 text-xs text-amber-600">
                  ⚠️ Stai confrontando la stessa scuola con se stessa. Seleziona due scuole diverse.
                </p>
              )}
            </div>

            {compA && compB && (
              <>
                <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SummaryCard label="Scuola A" school={compA.school} total={compA.total} maxPossible={compA.maxPossible} average={compA.average} filled={compA.filledCount} totalParams={parameters.length} color="indigo" />
                  <SummaryCard label="Scuola B" school={compB.school} total={compB.total} maxPossible={compB.maxPossible} average={compB.average} filled={compB.filledCount} totalParams={parameters.length} color="sky" />
                </div>

                <div className="mb-8 card p-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">Confronto Radar</h2>
                    <p className="text-sm text-slate-500">Voti per parametro (1–10) delle due scuole a confronto</p>
                  </div>
                  <div className="flex justify-center overflow-x-auto">
                    <RadarChart labels={parameters.map((p) => p.title)} series1={parameters.map((p) => compA.paramGrades[p.id] ?? 0)} series2={parameters.map((p) => compB.paramGrades[p.id] ?? 0)} label1={compA.school.name} label2={compB.school.name} max={10} />
                  </div>
                </div>

                <div className="mb-8 card p-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">Dettaglio Parametro per Parametro</h2>
                    <p className="text-sm text-slate-500">Confronto affiancato dei voti (1–10) su ciascun parametro</p>
                  </div>
                  <ParameterBarChart labels={parameters.map((p) => p.title)} series1={parameters.map((p) => compA.paramGrades[p.id] ?? 0)} series2={parameters.map((p) => compB.paramGrades[p.id] ?? 0)} label1={compA.school.name} label2={compB.school.name} max={10} />
                </div>

                <div className="mb-8 card p-6 border-2 border-dashed border-brand-300 bg-gradient-to-br from-brand-50/50 to-sky-50/50">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-sky-400 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-800">Considerazioni Finali AI</h2>
                      <p className="text-xs text-slate-500">Valutazione intelligente delle opzioni</p>
                    </div>
                  </div>

                  {aiEval && !aiEval.hasEnoughData ? (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                      <p className="text-sm text-amber-700">{aiEval.summary}</p>
                    </div>
                  ) : aiEval ? (
                    <div className="space-y-5">
                      {aiEval.winner && (
                        <div className="flex items-center gap-3 rounded-xl bg-success-50 border border-success-200 p-4">
                          <Trophy className="h-6 w-6 text-success-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-success-800">Scuola vincitrice: {aiEval.winner.name}</p>
                            {aiEval.runnerUp && (
                              <p className="text-xs text-success-600">Seconda classificata: {aiEval.runnerUp.name} (scarto: {aiEval.scoreGap} punti)</p>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="rounded-xl bg-white/60 border border-slate-200 p-4">
                        <p className="text-sm text-slate-700 leading-relaxed">{aiEval.summary}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {aiEval.winner && (
                          <div className="rounded-xl bg-white/60 border border-slate-200 p-4">
                            <div className="flex items-center gap-1.5 mb-3">
                              <TrendingUp className="h-4 w-4 text-success-600" />
                              <h3 className="text-sm font-semibold text-slate-700">Punti di forza — {aiEval.winner.name}</h3>
                            </div>
                            <ul className="space-y-1.5">
                              {aiEval.strengthsWinner.map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                  <span className="h-1.5 w-1.5 rounded-full bg-success-500 mt-1.5 flex-shrink-0" />{s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {aiEval.runnerUp && (
                          <div className="rounded-xl bg-white/60 border border-slate-200 p-4">
                            <div className="flex items-center gap-1.5 mb-3">
                              <TrendingDown className="h-4 w-4 text-amber-600" />
                              <h3 className="text-sm font-semibold text-slate-700">Punti di forza — {aiEval.runnerUp.name}</h3>
                            </div>
                            <ul className="space-y-1.5">
                              {aiEval.strengthsRunnerUp.map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />{s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="rounded-xl bg-brand-50 border border-brand-200 p-4">
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-brand-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-brand-700 leading-relaxed">
                            <span className="font-semibold">Consiglio: </span>{aiEval.recommendation}
                          </p>
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">
                        <p className="text-sm text-slate-600 mb-4">
                          Se vuoi approfondire, o se vuoi un ulteriore aiuto per chiarire qual'è la scelta che per te oggi è più utile, chiedi supporto al coach: clicca il bottone verde qui sotto.
                        </p>
                        <div className="flex justify-center">
                          <WhatsAppButton fullName={fullName} email={displayEmail} />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </>
        )}
        <div className="flex justify-center mt-6 mb-4">
          <WhatsAppButton fullName={fullName} email={displayEmail} />
        </div>
      </main>

      {/* ===== LAYOUT DI STAMPA ===== */}
      {compA && compB && schoolA && schoolB && (
        <div className="print-only hidden" style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', padding: '0' }}>
          <div style={{ borderBottom: '2px solid #334155', paddingBottom: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 4px' }}>{analysis.name}</h1>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0' }}>
                  {fullName && <>{fullName} · </>}{displayEmail}
                </p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '11px', color: '#94a3b8' }}>
                <p style={{ margin: '0' }}>Stampato il {printDate}</p>
                <p style={{ margin: '4px 0 0' }}>OrientaSchool</p>
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>Matrice di Valutazione</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #334155' }}>
                <th style={{ textAlign: 'left', padding: '8px 10px', fontWeight: '600', width: '40%' }}>Parametro</th>
                <th style={{ textAlign: 'center', padding: '8px 10px', fontWeight: '600', width: '30%' }}>{schoolA.name}{schoolA.location ? ` — ${schoolA.location}` : ''}</th>
                <th style={{ textAlign: 'center', padding: '8px 10px', fontWeight: '600', width: '30%' }}>{schoolB.name}{schoolB.location ? ` — ${schoolB.location}` : ''}</th>
              </tr>
            </thead>
            <tbody>
              {parameters.map((param, i) => {
                const gradeA = data.grades?.[schoolAId]?.[param.id] ?? null;
                const gradeB = data.grades?.[schoolBId]?.[param.id] ?? null;
                const noteA = data.notes?.[schoolAId]?.[param.id] ?? '';
                const noteB = data.notes?.[schoolBId]?.[param.id] ?? '';
                const colorA = gradeA === null ? '#94a3b8' : gradeA <= 5 ? '#ef4444' : gradeA <= 7 ? '#f59e0b' : '#22c55e';
                const colorB = gradeB === null ? '#94a3b8' : gradeB <= 5 ? '#ef4444' : gradeB <= 7 ? '#f59e0b' : '#22c55e';
                return (
                  <tr key={param.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                    <td style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: '600', fontSize: '11px' }}>{param.title}</div>
                      <div style={{ color: '#94a3b8', fontSize: '10px', marginTop: '2px' }}>{param.description}</div>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: '700', fontSize: '15px', color: colorA }}>{gradeA ?? '–'}</div>
                      {noteA && <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>{noteA}</div>}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: '700', fontSize: '15px', color: colorB }}>{gradeB ?? '–'}</div>
                      {noteB && <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>{noteB}</div>}
                    </td>
                  </tr>
                );
              })}
              <tr style={{ borderTop: '2px solid #334155', backgroundColor: '#f1f5f9' }}>
                <td style={{ padding: '10px', fontWeight: '700', fontSize: '12px' }}>TOTALE PUNTI</td>
                <td style={{ padding: '10px', textAlign: 'center', fontWeight: '700', fontSize: '18px', color: '#1e293b' }}>{compA.total}</td>
                <td style={{ padding: '10px', textAlign: 'center', fontWeight: '700', fontSize: '18px', color: '#1e293b' }}>{compB.total}</td>
              </tr>
            </tbody>
          </table>

          <div className="print-page-break" />

          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px' }}>Dashboard Comparativa</h2>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '0' }}>{analysis.name}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {[{ comp: compA, label: 'Scuola A', color: '#6366f1' }, { comp: compB, label: 'Scuola B', color: '#0ea5e9' }].map(({ comp, label, color }) => (
              <div key={comp.school.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <p style={{ fontSize: '10px', color: '#94a3b8', margin: '0' }}>{label}</p>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '2px 0' }}>{comp.school.name}</h3>
                    {comp.school.location && <p style={{ fontSize: '10px', color: '#94a3b8', margin: '0' }}>{comp.school.location}</p>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color }}>{comp.total}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>su {comp.maxPossible}</div>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '12px' }}>
                  <span><strong>{comp.average.toFixed(1)}</strong> media</span>
                  <span><strong>{comp.filledCount}/{parameters.length}</strong> compilati</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: 'white', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 4px' }}>Confronto Radar</h3>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 12px' }}>Voti per parametro (1–10) delle due scuole a confronto</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <RadarChart labels={parameters.map((p) => p.title)} series1={parameters.map((p) => compA.paramGrades[p.id] ?? 0)} series2={parameters.map((p) => compB.paramGrades[p.id] ?? 0)} label1={compA.school.name} label2={compB.school.name} max={10} />
            </div>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: 'white', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 4px' }}>Dettaglio Parametro per Parametro</h3>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 12px' }}>Confronto affiancato dei voti (1–10) su ciascun parametro</p>
            <ParameterBarChart labels={parameters.map((p) => p.title)} series1={parameters.map((p) => compA.paramGrades[p.id] ?? 0)} series2={parameters.map((p) => compB.paramGrades[p.id] ?? 0)} label1={compA.school.name} label2={compB.school.name} max={10} />
          </div>

          {aiEval && (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#fafafa' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 12px' }}>Considerazioni Finali</h3>
              {aiEval.winner && (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px', marginBottom: '12px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#166534', margin: '0' }}>🏆 Scuola vincitrice: {aiEval.winner.name}</p>
                  {aiEval.runnerUp && <p style={{ fontSize: '11px', color: '#16a34a', margin: '4px 0 0' }}>Seconda classificata: {aiEval.runnerUp.name} (scarto: {aiEval.scoreGap} punti)</p>}
                </div>
              )}
              <p style={{ fontSize: '12px', color: '#334155', margin: '0 0 12px', lineHeight: '1.6' }}>{aiEval.summary}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                {aiEval.winner && (
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '600', margin: '0 0 6px', color: '#166534' }}>Punti di forza — {aiEval.winner.name}</p>
                    {aiEval.strengthsWinner.map((s, i) => <p key={i} style={{ fontSize: '11px', color: '#475569', margin: '0 0 3px' }}>• {s}</p>)}
                  </div>
                )}
                {aiEval.runnerUp && (
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '600', margin: '0 0 6px', color: '#92400e' }}>Punti di forza — {aiEval.runnerUp.name}</p>
                    {aiEval.strengthsRunnerUp.map((s, i) => <p key={i} style={{ fontSize: '11px', color: '#475569', margin: '0 0 3px' }}>• {s}</p>)}
                  </div>
                )}
              </div>
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px' }}>
                <p style={{ fontSize: '11px', color: '#1d4ed8', margin: '0', lineHeight: '1.6' }}>
                  <strong>Consiglio: </strong>{aiEval.recommendation}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, school, total, maxPossible, average, filled, totalParams, color }: {
  label: string; school: School; total: number; maxPossible: number; average: number; filled: number; totalParams: number; color: 'indigo' | 'sky';
}) {
  const colorClasses = {
    indigo: { bg: 'from-indigo-500 to-indigo-400', text: 'text-indigo-600' },
    sky: { bg: 'from-sky-500 to-sky-400', text: 'text-sky-600' },
  };
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${colorClasses[color].bg} flex items-center justify-center`}>
            <SchoolIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-slate-400">{label}</p>
            <h3 className="text-sm font-semibold text-slate-800">{school.name}</h3>
            {school.location && <p className="text-xs text-slate-400">{school.location}</p>}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${colorClasses[color].text}`}>{total}</div>
          <div className="text-xs text-slate-400">su {maxPossible}</div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1"><span className="font-medium text-slate-700">{average.toFixed(1)}</span> media</span>
        <span className="flex items-center gap-1"><span className="font-medium text-slate-700">{filled}/{totalParams}</span> compilati</span>
        {filled < totalParams && (
          <span className={`flex items-center gap-1 ${colorClasses[color].text}`}>
            <Minus className="h-3 w-3" />{totalParams - filled} mancanti
          </span>
        )}
      </div>
    </div>
  );
}