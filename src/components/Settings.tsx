import { useState, useRef, type DragEvent } from 'react';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import {
  Plus, GripVertical, Pencil, Trash2, ArrowLeft, AlertTriangle,
  Check, X, Settings as SettingsIcon, Loader2,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { useAuth } from '@/context/AuthContext';
import { useParameters } from '@/context/ParametersContext';
import { getInitials } from '@/lib/utils';
import type { Parameter } from '@/lib/types';

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  const { user, signOut } = useAuth();
  const { parameters, loading, addParameter, updateParameter, deleteParameter, reorderParameters } = useParameters();

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Parameter | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Parameter | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Drag-and-drop state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [localOrder, setLocalOrder] = useState<Parameter[] | null>(null);
  const [reordering, setReordering] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dragEnabled, setDragEnabled] = useState(false);

  const fullName = user
    ? `${(user.user_metadata?.first_name as string) ?? ''} ${(user.user_metadata?.last_name as string) ?? ''}`.trim()
    : '';
  const displayEmail = user?.email ?? '';

  const displayParams = localOrder ?? parameters;

  const handleAdd = async () => {
    if (!newTitle.trim() || !newDescription.trim()) {
      setFormError('Inserisci titolo e descrizione');
      return;
    }
    setActionLoading(true);
    setFormError(null);
    const { error } = await addParameter(newTitle.trim(), newDescription.trim());
    if (error) {
      setFormError(error);
    } else {
      setAddOpen(false);
      setNewTitle('');
      setNewDescription('');
    }
    setActionLoading(false);
  };

  const handleEdit = async () => {
    if (!editTarget || !editTitle.trim() || !editDescription.trim()) {
      setFormError('Inserisci titolo e descrizione');
      return;
    }
    setActionLoading(true);
    setFormError(null);
    const { error } = await updateParameter(editTarget.id, editTitle.trim(), editDescription.trim());
    if (error) {
      setFormError(error);
    } else {
      setEditTarget(null);
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    setFormError(null);
    const { error } = await deleteParameter(deleteTarget.id);
    if (error) {
      setFormError(error);
    } else {
      setDeleteTarget(null);
    }
    setActionLoading(false);
  };

  // Drag handlers
  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    if (!dragEnabled) {
      e.preventDefault();
      return;
    }
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragIndex !== null && dragIndex !== index) {
      setDragOverIndex(index);
      const items = [...displayParams];
      const [moved] = items.splice(dragIndex, 1);
      items.splice(index, 0, moved);
      setLocalOrder(items);
      setDragIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDragEnabled(false);
    setDragIndex(null);
    setDragOverIndex(null);
    if (localOrder) {
      const orderedIds = localOrder.map((p) => p.id);
      setReordering(true);
      reorderParameters(orderedIds).finally(() => {
        setReordering(false);
        setLocalOrder(null);
      });
    }
  };

  const handleHoldStart = (index: number, isTouch: boolean) => {
    const delay = isTouch ? 600 : 200;
    holdTimer.current = setTimeout(() => {
      setDragEnabled(true);
      setDragIndex(index);
    }, delay);
  };

  const handleHoldEnd = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Logo size="sm" />
            <div className="flex items-center gap-3">
              <WhatsAppButton />
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-sm font-medium text-slate-700">{fullName || 'Utente'}</span>
                <span className="text-xs text-slate-400">{displayEmail}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-sky-400 flex items-center justify-center text-sm font-semibold text-white shadow-md">
                {getInitials(fullName || displayEmail || 'U')}
              </div>
              <Button variant="ghost" size="sm" onClick={signOut} title="Esci">
                <span className="hidden sm:inline">Esci</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna alle analisi
        </button>

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <SettingsIcon className="h-6 w-6 text-brand-600" />
              <h1 className="text-3xl font-bold text-slate-800">Impostazioni</h1>
            </div>
            <p className="text-sm text-slate-500">
              Gestisci i parametri di valutazione delle tue analisi di orientamento
            </p>
          </div>
          <Button onClick={() => { setNewTitle(''); setNewDescription(''); setFormError(null); setAddOpen(true); }}>
            <Plus className="h-4 w-4" />
            Aggiungi Parametro
          </Button>
        </div>

        {/* Info banner */}
        <div className="mb-6 rounded-xl bg-brand-50 border border-brand-200 px-4 py-3">
          <p className="text-sm text-brand-700">
            <span className="font-medium">Suggerimento:</span> Tieni premuto sull'icona ☰ per trascinare e riordinare i parametri. Da mobile tieni premuto 1 secondi, da computer è immediato.
          </p>
        </div>

        {/* Parameters list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card p-4 flex items-center gap-4">
                <div className="h-5 w-5 skeleton rounded" />
                <div className="flex-1">
                  <div className="h-5 w-1/3 skeleton rounded mb-2" />
                  <div className="h-4 w-2/3 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : reordering ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
            <span className="ml-2 text-sm text-slate-500">Salvataggio nuovo ordine...</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayParams.map((param, index) => (
              <div
                key={param.id}
                draggable={dragEnabled}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onMouseUp={handleHoldEnd}
                onMouseLeave={handleHoldEnd}
                onTouchEnd={handleHoldEnd}
                className={`card p-4 flex items-center gap-3 transition-all duration-200 ${
                  dragEnabled ? 'cursor-grab' : 'cursor-default'
                } ${
                  dragOverIndex === index ? 'border-brand-400 ring-2 ring-brand-200' : ''
                } ${
                  dragEnabled && dragIndex === index ? 'opacity-60 shadow-lg' : ''
                } ${dragEnabled ? 'border-brand-300' : ''}`}
              >
                <div
                  className={`flex-shrink-0 cursor-grab ${dragEnabled ? 'text-brand-500' : 'text-slate-300'}`}
                  onMouseDown={() => handleHoldStart(index, false)}
                  onTouchStart={() => handleHoldStart(index, true)}
                >
                  <GripVertical className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold text-slate-800 truncate">{param.title}</h3>
                    {param.is_default ? (
                      <span className="flex-shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                        Default
                      </span>
                    ) : (
                      <span className="flex-shrink-0 rounded-md bg-lime-100 px-1.5 py-0.5 text-[10px] font-medium text-lime-700">
                        Personalizzato
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{param.description}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => {
                      setEditTitle(param.title);
                      setEditDescription(param.description);
                      setEditTarget(param);
                      setFormError(null);
                    }}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    title="Modifica"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => { setDeleteTarget(param); setFormError(null); }}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-error-50 hover:text-error-600"
                    title="Elimina"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Aggiungi Parametro">
        <div className="space-y-4">
          <Input
            label="Titolo"
            placeholder="es. Laboratori pratici"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            error={formError}
            autoFocus
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Descrizione</label>
            <textarea
              className="input-field min-h-[80px] resize-y"
              placeholder="es. La scuola offre laboratori pratici?"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Annulla</Button>
            <Button onClick={handleAdd} loading={actionLoading}>
              <Plus className="h-4 w-4" />
              Aggiungi
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Modifica Parametro">
        <div className="space-y-4">
          <Input
            label="Titolo"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            error={formError}
            autoFocus
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Descrizione</label>
            <textarea
              className="input-field min-h-[80px] resize-y"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setEditTarget(null)}>Annulla</Button>
            <Button onClick={handleEdit} loading={actionLoading}>
              <Check className="h-4 w-4" />
              Salva
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Elimina parametro">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-error-50 border border-error-200 p-4">
            <AlertTriangle className="h-5 w-5 text-error-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-error-800">
                Eliminare questo parametro?
              </p>
              <p className="text-sm text-error-600 mt-1">
                Il parametro <span className="font-medium">"{deleteTarget?.title}"</span> verrà rimosso da tutte le tue future analisi. Le analisi esistenti non verranno modificate.
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