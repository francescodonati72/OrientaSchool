import { useState, useEffect, useMemo } from 'react';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import {
  ArrowLeft, Settings as SettingsIcon, LogOut, BarChart3, Sparkles,
  Trophy, TrendingUp, TrendingDown, Minus, Loader2, School as SchoolIcon,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Analisi non trovata</p>
          <Button onClick={onBack}>Torna alle analisi</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Logo size="sm" />
            </div>
            <div className="flex items-center gap-3">
              <WhatsAppButton />
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

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
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
            {/* School selectors */}
            <div className="mb-8 card p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Seleziona le scuole da confrontare</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Scuola A</label>
                  <select
                    value={schoolAId}
                    onChange={(e) => setSchoolAId(e.target.value)}
                    className="input-field"
                  >
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}{s.location ? ` — ${s.location}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Scuola B</label>
                  <select
                    value={schoolBId}
                    onChange={(e) => setSchoolBId(e.target.value)}
                    className="input-field"
                  >
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}{s.location ? ` — ${s.location}` : ''}
                      </option>
                    ))}
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
                {/* Summary cards */}
                <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SummaryCard
                    label="Scuola A"
                    school={compA.school}
                    total={compA.total}
                    maxPossible={compA.maxPossible}
                    average={compA.average}
                    filled={compA.filledCount}
                    totalParams={parameters.length}
                    color="indigo"
                  />
                  <SummaryCard
                    label="Scuola B"
                    school={compB.school}
                    total={compB.total}
                    maxPossible={compB.maxPossible}
                    average={compB.average}
                    filled={compB.filledCount}
                    totalParams={parameters.length}
                    color="sky"
                  />
                </div>

                {/* Chart 1: Radar */}
                <div className="mb-8 card p-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">Confronto Radar</h2>
                    <p className="text-sm text-slate-500">Voti per parametro (1–10) delle due scuole a confronto</p>
                  </div>
                  <div className="flex justify-center overflow-x-auto">
                    <RadarChart
                      labels={parameters.map((p) => p.title)}
                      series1={parameters.map((p) => compA.paramGrades[p.id] ?? 0)}
                      series2={parameters.map((p) => compB.paramGrades[p.id] ?? 0)}
                      label1={compA.school.name}
                      label2={compB.school.name}
                      max={10}
                    />
                  </div>
                </div>

                {/* Chart 2: Bar chart per parameter */}
                <div className="mb-8 card p-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">Dettaglio Parametro per Parametro</h2>
                    <p className="text-sm text-slate-500">Confronto affiancato dei voti (1–10) su ciascun parametro</p>
                  </div>
                  <ParameterBarChart
                    labels={parameters.map((p) => p.title)}
                    series1={parameters.map((p) => compA.paramGrades[p.id] ?? 0)}
                    series2={parameters.map((p) => compB.paramGrades[p.id] ?? 0)}
                    label1={compA.school.name}
                    label2={compB.school.name}
                    max={10}
                  />
                </div>

                {/* AI Evaluation card */}
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
                      {/* Winner badge */}
                      {aiEval.winner && (
                        <div className="flex items-center gap-3 rounded-xl bg-success-50 border border-success-200 p-4">
                          <Trophy className="h-6 w-6 text-success-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-success-800">
                              Scuola vincitrice: {aiEval.winner.name}
                            </p>
                            {aiEval.runnerUp && (
                              <p className="text-xs text-success-600">
                                Seconda classificata: {aiEval.runnerUp.name} (scarto: {aiEval.scoreGap} punti)
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Summary */}
                      <div className="rounded-xl bg-white/60 border border-slate-200 p-4">
                        <p className="text-sm text-slate-700 leading-relaxed">{aiEval.summary}</p>
                      </div>

                      {/* Strengths comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {aiEval.winner && (
                          <div className="rounded-xl bg-white/60 border border-slate-200 p-4">
                            <div className="flex items-center gap-1.5 mb-3">
                              <TrendingUp className="h-4 w-4 text-success-600" />
                              <h3 className="text-sm font-semibold text-slate-700">
                                Punti di forza — {aiEval.winner.name}
                              </h3>
                            </div>
                            <ul className="space-y-1.5">
                              {aiEval.strengthsWinner.map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                  <span className="h-1.5 w-1.5 rounded-full bg-success-500 mt-1.5 flex-shrink-0" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {aiEval.runnerUp && (
                          <div className="rounded-xl bg-white/60 border border-slate-200 p-4">
                            <div className="flex items-center gap-1.5 mb-3">
                              <TrendingDown className="h-4 w-4 text-amber-600" />
                              <h3 className="text-sm font-semibold text-slate-700">
                                Punti di forza — {aiEval.runnerUp.name}
                              </h3>
                            </div>
                            <ul className="space-y-1.5">
                              {aiEval.strengthsRunnerUp.map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Recommendation */}
                      <div className="rounded-xl bg-brand-50 border border-brand-200 p-4">
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-brand-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-brand-700 leading-relaxed">
                            <span className="font-semibold">Consiglio: </span>
                            {aiEval.recommendation}
                          </p>
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
          <WhatsAppButton />
        </div>
      </main>
    </div>
  );
}

function SummaryCard({
  label, school, total, maxPossible, average, filled, totalParams, color,
}: {
  label: string;
  school: School;
  total: number;
  maxPossible: number;
  average: number;
  filled: number;
  totalParams: number;
  color: 'indigo' | 'sky';
}) {
  const colorClasses = {
    indigo: { bg: 'from-indigo-500 to-indigo-400', text: 'text-indigo-600', light: 'bg-indigo-50' },
    sky: { bg: 'from-sky-500 to-sky-400', text: 'text-sky-600', light: 'bg-sky-50' },
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
        <span className="flex items-center gap-1">
          <span className="font-medium text-slate-700">{average.toFixed(1)}</span> media
        </span>
        <span className="flex items-center gap-1">
          <span className="font-medium text-slate-700">{filled}/{totalParams}</span> compilati
        </span>
        {filled < totalParams && (
          <span className={`flex items-center gap-1 ${colorClasses[color].text}`}>
            <Minus className="h-3 w-3" />
            {totalParams - filled} mancanti
          </span>
        )}
      </div>
    </div>
  );
}
