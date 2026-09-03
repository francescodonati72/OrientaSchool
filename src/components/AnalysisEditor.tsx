import { useState, useEffect, useCallback, useRef } from 'react';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import {
  ArrowLeft, Plus, Settings as SettingsIcon, LogOut, MoreVertical,
  Pencil, Trash2, MapPin, School as SchoolIcon, AlertTriangle, X,
  Loader2, Table as TableIcon, BarChart3,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { useAuth } from '@/context/AuthContext';
import { useParameters } from '@/context/ParametersContext';
import { EvaluationMatrix } from '@/components/EvaluationMatrix';
import { supabase } from '@/lib/supabase';
import { getInitials, formatDate } from '@/lib/utils';
import type { Analysis, AnalysisData, School } from '@/lib/types';

interface AnalysisEditorProps {
  analysisId: string;
  onBack: () => void;
  onOpenSettings: () => void;
  onOpenDashboard: () => void;
}

export function AnalysisEditor({ analysisId, onBack, onOpenSettings, onOpenDashboard }: AnalysisEditorProps) {
  const { user, signOut } = useAuth();
  const { parameters } = useParameters();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // School modals
  const [addSchoolOpen, setAddSchoolOpen] = useState(false);
  const [editSchool, setEditSchool] = useState<School | null>(null);
  const [deleteSchool, setDeleteSchool] = useState<School | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Form state
  const [schoolName, setSchoolName] = useState('');
  const [schoolLocation, setSchoolLocation] = useState('');
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Debounced save for matrix changes
  const pendingDataRef = useRef<AnalysisData | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fullName = user
    ? `${(user.user_metadata?.first_name as string) ?? ''} ${(user.user_metadata?.last_name as string) ?? ''}`.trim()
    : '';
  const displayEmail = user?.email ?? '';

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching analysis:', error.message);
    } else if (data) {
      setAnalysis(data as Analysis);
    }
    setLoading(false);
  }, [analysisId]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  useEffect(() => {
    const handleClick = () => setMenuOpenId(null);
    if (menuOpenId) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [menuOpenId]);

  // Cleanup pending save on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const getData = (): AnalysisData => {
    return (analysis?.data as AnalysisData) ?? {};
  };

  const getSchools = (): School[] => getData().schools ?? [];

  const saveData = useCallback(async (newData: AnalysisData) => {
    setSaving(true);
    const { error } = await supabase
      .from('analyses')
      .update({ data: newData, updated_at: new Date().toISOString() })
      .eq('id', analysisId);
    if (error) {
      console.error('Error saving analysis:', error.message);
    } else {
      setAnalysis((prev) => prev ? { ...prev, data: newData, updated_at: new Date().toISOString() } : prev);
    }
    setSaving(false);
  }, [analysisId]);

  const saveDataImmediate = useCallback(async (newData: AnalysisData) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    pendingDataRef.current = null;
    await saveData(newData);
  }, [saveData]);

  const scheduleSave = useCallback((newData: AnalysisData) => {
    pendingDataRef.current = newData;
    setAnalysis((prev) => prev ? { ...prev, data: newData } : prev);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      if (pendingDataRef.current) {
        await saveData(pendingDataRef.current);
        pendingDataRef.current = null;
      }
      saveTimerRef.current = null;
    }, 800);
  }, [saveData]);

  const handleGradeChange = (schoolId: string, paramId: string, value: number | null) => {
    const data = getData();
    const grades = { ...data.grades };
    if (!grades[schoolId]) grades[schoolId] = {};
    if (value === null) {
      delete grades[schoolId][paramId];
    } else {
      grades[schoolId][paramId] = value;
    }
    scheduleSave({ ...data, grades });
  };

  const handleNoteChange = (schoolId: string, paramId: string, value: string) => {
    const data = getData();
    const notes = { ...data.notes };
    if (!notes[schoolId]) notes[schoolId] = {};
    if (value === '') {
      delete notes[schoolId][paramId];
    } else {
      notes[schoolId][paramId] = value;
    }
    scheduleSave({ ...data, notes });
  };

  const handleAddSchool = async () => {
    if (!schoolName.trim()) {
      setFormError('Inserisci il nome della scuola');
      return;
    }
    setActionLoading(true);
    setFormError(null);
    const schools = getSchools();
    const newSchool: School = {
      id: crypto.randomUUID(),
      name: schoolName.trim(),
      location: schoolLocation.trim(),
    };
    const newData: AnalysisData = { ...getData(), schools: [...schools, newSchool] };
    await saveDataImmediate(newData);
    setAddSchoolOpen(false);
    setSchoolName('');
    setSchoolLocation('');
    setActionLoading(false);
  };

  const handleEditSchool = async () => {
    if (!editSchool || !editName.trim()) {
      setFormError('Inserisci il nome della scuola');
      return;
    }
    setActionLoading(true);
    setFormError(null);
    const schools = getSchools().map((s) =>
      s.id === editSchool.id ? { ...s, name: editName.trim(), location: editLocation.trim() } : s
    );
    const newData: AnalysisData = { ...getData(), schools };
    await saveDataImmediate(newData);
    setEditSchool(null);
    setActionLoading(false);
  };

  const handleDeleteSchool = async () => {
    if (!deleteSchool) return;
    setActionLoading(true);
    setFormError(null);
    const schools = getSchools().filter((s) => s.id !== deleteSchool.id);
    const grades = { ...getData().grades };
    const notes = { ...getData().notes };
    delete grades[deleteSchool.id];
    delete notes[deleteSchool.id];
    const newData: AnalysisData = { ...getData(), schools, grades, notes };
    await saveDataImmediate(newData);
    setDeleteSchool(null);
    setActionLoading(false);
  };

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

  const schools = getSchools();
  const data = getData();

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
                         <button onClick={onBack} title="Torna alla Home">
                <Logo size="sm" />
              </button>
            </div>
            <div className="flex items-center gap-3">
                           <WhatsAppButton fullName={fullName} email={displayEmail} />
              <Button variant="ghost" size="sm" onClick={onOpenDashboard} title="Dashboard">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
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
          <h1 className="text-3xl font-bold text-slate-800 mb-1">{analysis.name}</h1>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>Creata il {formatDate(analysis.created_at)}</span>
            {saving && (
              <span className="flex items-center gap-1 text-brand-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                Salvataggio...
              </span>
            )}
          </div>
        </div>

                {/* Alert 1 sola scuola */}
        {schools.length === 1 && !alertDismissed && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
            <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
            <p className="text-sm text-amber-700 flex-1">
              Inserisci almeno una seconda scuola se vuoi fare il confronto.
            </p>
            <button
              onClick={() => setAlertDismissed(true)}
              className="flex-shrink-0 text-amber-400 hover:text-amber-600 transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        {/* Schools section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Scuole</h2>
              <p className="text-sm text-slate-500">Inserisci minimo 2 scuole per fare il confronto nell'analisi corrente</p>
            </div>
            <Button onClick={() => { setSchoolName(''); setSchoolLocation(''); setFormError(null); setAddSchoolOpen(true); }}>
              <Plus className="h-4 w-4" />
              Aggiungi Scuola
            </Button>
          </div>

          {schools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
              <div className="mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-100 to-sky-100 flex items-center justify-center">
                <SchoolIcon className="h-8 w-8 text-brand-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">Nessuna scuola aggiunta</h3>
              <p className="text-sm text-slate-500 mb-5 max-w-sm">
                Aggiungi le scuole che vuoi confrontare in questa analisi di orientamento.
              </p>
              <Button onClick={() => { setSchoolName(''); setSchoolLocation(''); setFormError(null); setAddSchoolOpen(true); }}>
                <Plus className="h-4 w-4" />
                Aggiungi Scuola
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {schools.map((school) => (
                <div key={school.id} className="card p-5 group hover:shadow-lg hover:border-brand-200 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-100 to-sky-100 flex items-center justify-center">
                      <SchoolIcon className="h-5 w-5 text-brand-600" />
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === school.id ? null : school.id); }}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {menuOpenId === school.id && (
                        <div className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-slate-200 bg-white shadow-lg z-20 animate-scale-in py-1">
                          <button
                            onClick={() => {
                              setEditName(school.name);
                              setEditLocation(school.location);
                              setEditSchool(school);
                              setFormError(null);
                              setMenuOpenId(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Pencil className="h-4 w-4 text-slate-400" />
                            Modifica
                          </button>
                          <div className="my-1 border-t border-slate-100" />
                          <button
                            onClick={() => { setDeleteSchool(school); setMenuOpenId(null); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            Elimina
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-slate-800 mb-1">{school.name}</h3>
                  {school.location && (
                    <p className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" />
                      {school.location}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Evaluation Matrix */}
        {schools.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <TableIcon className="h-5 w-5 text-brand-600" />
                  <h2 className="text-xl font-semibold text-slate-800">Matrice di Valutazione e Confronto (min. 2 scuole) </h2>
                </div>
                <p className="text-sm text-slate-500">
                  Righe: parametri · Colonne: scuole · Voti da 1 a 10
                </p>
              </div>
            </div>

            <div className="card overflow-hidden p-0">
              <EvaluationMatrix
                parameters={parameters}
                schools={schools}
                data={data}
                onGradeChange={handleGradeChange}
                onNoteChange={handleNoteChange}
              />
            </div>

            {/* Legend */}
            
            <div className="mt-6">
              <p className="text-sm text-slate-500 text-center mb-3">
                Quando hai finito, clicca qui per vedere i risultati dell'analisi nella Dashboard
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={onOpenDashboard}>
                  <BarChart3 className="h-4 w-4" />
                  Vai alla Dashboard
                </Button>
                           <WhatsAppButton fullName={fullName} email={displayEmail} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add School Modal */}
      <Modal open={addSchoolOpen} onClose={() => setAddSchoolOpen(false)} title="Aggiungi Scuola">
        <div className="space-y-4">
          <Input
            label="Nome Scuola"
            placeholder="es. TURISTICO"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            error={formError}
            autoFocus
          />
          <Input
            label="Luogo / Città"
            placeholder="es. Vittorio Veneto"
            value={schoolLocation}
            onChange={(e) => setSchoolLocation(e.target.value)}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setAddSchoolOpen(false)}>Annulla</Button>
            <Button onClick={handleAddSchool} loading={actionLoading}>Aggiungi</Button>
          </div>
        </div>
      </Modal>

      {/* Edit School Modal */}
      <Modal open={!!editSchool} onClose={() => setEditSchool(null)} title="Modifica Scuola">
        <div className="space-y-4">
          <Input
            label="Nome Scuola"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            error={formError}
            autoFocus
          />
          <Input
            label="Luogo / Città"
            value={editLocation}
            onChange={(e) => setEditLocation(e.target.value)}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setEditSchool(null)}>Annulla</Button>
            <Button onClick={handleEditSchool} loading={actionLoading}>Salva</Button>
          </div>
        </div>
      </Modal>

      {/* Delete School Modal */}
      <Modal open={!!deleteSchool} onClose={() => setDeleteSchool(null)} title="Elimina scuola">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-error-50 border border-error-200 p-4">
            <AlertTriangle className="h-5 w-5 text-error-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-error-800">
                Eliminare questa scuola dall'analisi?
              </p>
              <p className="text-sm text-error-600 mt-1">
                La scuola <span className="font-medium">"{deleteSchool?.name}"</span> e tutti i relativi voti e note verranno rimossi da questa analisi.
              </p>
            </div>
          </div>
          {formError && <p className="text-sm text-error-600">{formError}</p>}
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setDeleteSchool(null)}>Annulla</Button>
            <Button variant="danger" onClick={handleDeleteSchool} loading={actionLoading}>
              <Trash2 className="h-4 w-4" />
              Elimina
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
