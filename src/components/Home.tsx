import { useState, useEffect, useCallback } from 'react';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import {
  Plus, MoreVertical, Copy, Trash2, Pencil, FileText, LogOut, Search,
  FolderOpen, AlertTriangle, X, Settings as SettingsIcon,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Analysis } from '@/lib/types';
import { formatDate, relativeTime, getInitials } from '@/lib/utils';

interface HomeProps {
  onOpenAnalysis: (id: string) => void;
  onOpenSettings: () => void;
}

export function Home({ onOpenAnalysis, onOpenSettings }: HomeProps) {
  const { user, signOut } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Analysis | null>(null);
  const [duplicateTarget, setDuplicateTarget] = useState<Analysis | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Analysis | null>(null);

  const [newName, setNewName] = useState('');
  const [duplicateName, setDuplicateName] = useState('');
  const [renameName, setRenameName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAnalyses = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching analyses:', error.message);
    } else {
      setAnalyses(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  useEffect(() => {
    const handleClick = () => setMenuOpenId(null);
    if (menuOpenId) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [menuOpenId]);

  const fullName = user
    ? `${(user.user_metadata?.first_name as string) ?? ''} ${(user.user_metadata?.last_name as string) ?? ''}`.trim()
    : '';
  const displayEmail = user?.email ?? '';

  const filtered = analyses.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newName.trim()) {
      setFormError('Inserisci un nome per l\'analisi');
      return;
    }
    setActionLoading(true);
    setFormError(null);
    const { error } = await supabase
      .from('analyses')
      .insert({ name: newName.trim() });
    if (error) {
      setFormError(error.message);
    } else {
      setCreateOpen(false);
      setNewName('');
      fetchAnalyses();
    }
    setActionLoading(false);
  };

  const handleRename = async () => {
    if (!renameTarget || !renameName.trim()) {
      setFormError('Inserisci un nome per l\'analisi');
      return;
    }
    setActionLoading(true);
    setFormError(null);
    const { error } = await supabase
      .from('analyses')
      .update({ name: renameName.trim(), updated_at: new Date().toISOString() })
      .eq('id', renameTarget.id);
    if (error) {
      setFormError(error.message);
    } else {
      setRenameTarget(null);
      setRenameName('');
      fetchAnalyses();
    }
    setActionLoading(false);
  };

  const handleDuplicate = async () => {
    if (!duplicateTarget || !duplicateName.trim()) {
      setFormError('Inserisci un nome per la nuova analisi');
      return;
    }
    setActionLoading(true);
    setFormError(null);
    const { error } = await supabase
      .from('analyses')
      .insert({
        name: duplicateName.trim(),
        data: duplicateTarget.data,
      });
    if (error) {
      setFormError(error.message);
    } else {
      setDuplicateTarget(null);
      setDuplicateName('');
      fetchAnalyses();
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    setFormError(null);
    const { error } = await supabase
      .from('analyses')
      .delete()
      .eq('id', deleteTarget.id);
    if (error) {
      setFormError(error.message);
    } else {
      setDeleteTarget(null);
      fetchAnalyses();
    }
    setActionLoading(false);
  };

  const openRename = (analysis: Analysis) => {
    setRenameName(analysis.name);
    setRenameTarget(analysis);
    setMenuOpenId(null);
  };

  const openDuplicate = (analysis: Analysis) => {
    setDuplicateName(`${analysis.name} (copia)`);
    setDuplicateTarget(analysis);
    setMenuOpenId(null);
  };

  const openDelete = (analysis: Analysis) => {
    setDeleteTarget(analysis);
    setMenuOpenId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Logo size="sm" />
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
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-1">Le mie analisi</h1>
            <p className="text-sm text-slate-500">
              Gestisci le tue analisi di orientamento scolastico
            </p>
          </div>
          <Button onClick={() => { setNewName(''); setFormError(null); setCreateOpen(true); }}>
            <Plus className="h-4 w-4" />
            Crea Nuova Analisi
          </Button>
        </div>

        {analyses.length > 0 && (
          <div className="mb-6 relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="input-field pl-11"
              placeholder="Cerca analisi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-5">
                <div className="h-5 w-3/4 skeleton rounded mb-3" />
                <div className="h-4 w-1/2 skeleton rounded mb-6" />
                <div className="h-9 w-full skeleton rounded-xl" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 && analyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
            <div className="mb-5 h-20 w-20 rounded-2xl bg-gradient-to-br from-brand-100 to-sky-100 flex items-center justify-center">
              <FolderOpen className="h-10 w-10 text-brand-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Crea la tua prima analisi</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm">
              Inizia creando una nuova analisi di orientamento.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Nessuna analisi trovata</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Prova a modificare la ricerca per trovare quello che cerchi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((analysis) => (
              <AnalysisCard
                key={analysis.id}
                analysis={analysis}
                menuOpen={menuOpenId === analysis.id}
                onMenuToggle={() => setMenuOpenId(menuOpenId === analysis.id ? null : analysis.id)}
                onRename={() => openRename(analysis)}
                onDuplicate={() => openDuplicate(analysis)}
                onDelete={() => openDelete(analysis)}
                onOpen={() => onOpenAnalysis(analysis.id)}
              />
            ))}
          </div>
        )}

        {/* Istruzioni — sempre visibili */}
        {!loading && (
          <div className="mt-10 max-w-sm bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-4">🎯 Benvenuti in OrientaSchool.<br />Per iniziare:</p>
            <ol className="space-y-4">
              <li className="text-sm text-slate-600">
                <p className="font-semibold text-slate-800 mb-1">1. Clicca "Crea Nuova Analisi" in alto a destra:</p>
                <p>dai un nome alla tua analisi (es. "Scuola Superiore", oppure "Scuola di tennis" ecc. in base a quello che stai cercando di analizzare). Poi seleziona l'analisi per entrare.</p>
              </li>
              <li className="text-sm text-slate-600">
                <p className="font-semibold text-slate-800 mb-1">2. Dentro l'analisi, Aggiungi almeno 2 (o più) opzioni/scuole che vuoi confrontare:</p>
                <p>ogni scuola che hai aggiunto è una colonna della matrice, nelle righe della matrice hai i parametri di valutazione: inserisci la valutazione di ogni parametro con un voto da 1 a 10 PPI (Personal Perceived Index - il tuo indice di percezione personale); puoi anche aggiungere delle note in ogni cella della matrice. Procedi finché hai completato tutti i parametri, per ogni scuola.</p>
              </li>
              <li className="text-sm text-slate-600">
                <p className="font-semibold text-slate-800 mb-1">3. Quando hai finito, vai nella Dashboard (icona in alto):</p>
                <p>qui puoi vedere i grafici finali, confrontare le scuole 2 alla volta, e avere uno schema chiaro che ti sarà di aiuto nell'orientamento alla scelta.</p>
              </li>
            </ol>
            <p className="mt-4 text-xs text-slate-500 border-t border-slate-100 pt-4">
              <span className="font-semibold text-slate-600">PARAMETRI:</span> all'inizio trovi già dei parametri inseriti, come riferimento iniziale. Ma li puoi anche modificare, eliminare, o aggiungere i parametri che vuoi: ti basta andare nelle Impostazioni (icona ingranaggio in alto a destra). 
            </p>
          </div>
        )}
      </main>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Crea Nuova Analisi">
        <div className="space-y-4">
          <Input
            label="Nome dell'analisi"
            placeholder="es. Scuole Superiori Mario 2026"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            error={formError}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Annulla</Button>
            <Button onClick={handleCreate} loading={actionLoading}>Crea</Button>
          </div>
        </div>
      </Modal>

      {/* Rename Modal */}
      <Modal open={!!renameTarget} onClose={() => setRenameTarget(null)} title="Rinomina analisi">
        <div className="space-y-4">
          <Input
            label="Nuovo nome"
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            error={formError}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setRenameTarget(null)}>Annulla</Button>
            <Button onClick={handleRename} loading={actionLoading}>Salva</Button>
          </div>
        </div>
      </Modal>

      {/* Duplicate Modal */}
      <Modal open={!!duplicateTarget} onClose={() => setDuplicateTarget(null)} title="Duplica analisi">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Verrà creata una copia esatta dell'analisi <span className="font-medium text-slate-700">"{duplicateTarget?.name}"</span>, inclusi voti e note.
          </p>
          <Input
            label="Nome della nuova analisi"
            value={duplicateName}
            onChange={(e) => setDuplicateName(e.target.value)}
            error={formError}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleDuplicate()}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setDuplicateTarget(null)}>Annulla</Button>
            <Button onClick={handleDuplicate} loading={actionLoading}>
              <Copy className="h-4 w-4" />
              Duplica
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Elimina analisi">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-error-50 border border-error-200 p-4">
            <AlertTriangle className="h-5 w-5 text-error-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-error-800">
                Sei sicuro di voler eliminare questa analisi?
              </p>
              <p className="text-sm text-error-600 mt-1">
                L'analisi <span className="font-medium">"{deleteTarget?.name}"</span> e tutti i suoi dati verranno eliminati definitivamente. Questa azione non può essere annullata.
              </p>
            </div>
          </div>
          {formError && <p className="text-sm text-error-600">{formError}</p>}
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Annulla</Button>
            <Button variant="danger" onClick={handleDelete} loading={actionLoading}>
              <Trash2 className="h-4 w-4" />
              Elimina
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AnalysisCard({
  analysis,
  menuOpen,
  onMenuToggle,
  onRename,
  onDuplicate,
  onDelete,
  onOpen,
}: {
  analysis: Analysis;
  menuOpen: boolean;
  onMenuToggle: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onOpen: () => void;
}) {
  return (
    <div
      onClick={onOpen}
      className="card p-5 group hover:shadow-lg hover:border-brand-200 hover:-translate-y-0.5 cursor-pointer transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-100 to-sky-100 flex items-center justify-center">
            <FileText className="h-5 w-5 text-brand-600" />
          </div>
        </div>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-slate-200 bg-white shadow-lg z-20 animate-scale-in py-1">
              <button
                onClick={onRename}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Pencil className="h-4 w-4 text-slate-400" />
                Rinomina
              </button>
              <button
                onClick={onDuplicate}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Copy className="h-4 w-4 text-slate-400" />
                Duplica
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={onDelete}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Elimina
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="text-base font-semibold text-slate-800 mb-1 line-clamp-2">{analysis.name}</h3>
      <p className="text-xs text-slate-400 mb-4">
        Creata il {formatDate(analysis.created_at)}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
          Ultimo salvataggio: {relativeTime(analysis.updated_at)}
        </div>
      </div>
    </div>
  );
}