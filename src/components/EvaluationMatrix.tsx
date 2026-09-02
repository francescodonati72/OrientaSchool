import { useRef, useEffect, useState } from 'react';
import type { Parameter, School, AnalysisData } from '@/lib/types';

interface EvaluationMatrixProps {
  parameters: Parameter[];
  schools: School[];
  data: AnalysisData;
  onGradeChange: (schoolId: string, paramId: string, value: number | null) => void;
  onNoteChange: (schoolId: string, paramId: string, value: string) => void;
}

function gradeColorClass(grade: number | null | undefined): string {
  if (grade === null || grade === undefined) return '';
  if (grade <= 5) return 'bg-error-100 text-error-700 border-error-300';
  if (grade <= 7) return 'bg-amber-100 text-amber-700 border-amber-300';
  return 'bg-success-100 text-success-700 border-success-300';
}

function gradeBadgeClass(grade: number | null | undefined): string {
  if (grade === null || grade === undefined) return 'bg-slate-100 text-slate-400';
  if (grade <= 5) return 'bg-error-500 text-white';
  if (grade <= 7) return 'bg-amber-500 text-white';
  return 'bg-success-500 text-white';
}

function totalColorClass(total: number): string {
  if (total <= 0) return 'text-slate-400';
  const maxPossible = 10 * 17;
  const ratio = total / maxPossible;
  if (ratio < 0.4) return 'text-error-600';
  if (ratio < 0.6) return 'text-amber-600';
  return 'text-success-600';
}

function GradeInput({
  grade,
  onGradeChange,
}: {
  grade: number | null;
  onGradeChange: (value: number | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');

  const handleBadgeClick = () => {
    setInputVal(grade !== null ? String(grade) : '');
    setEditing(true);
  };

  const handleInputBlur = () => {
    const n = parseInt(inputVal, 10);
    if (!isNaN(n) && n >= 1 && n <= 10) {
      onGradeChange(n);
    } else if (inputVal === '') {
      onGradeChange(null);
    }
    setEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') {
      setEditing(false);
    }
  };

  return (
    <div className="flex items-center gap-1 mb-2">
      <button
        type="button"
        onClick={() => onGradeChange(Math.max(1, (grade ?? 1) - 1))}
        className="h-7 w-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 transition-colors flex items-center justify-center text-sm font-medium flex-shrink-0"
      >
        −
      </button>
      {editing ? (
        <input
          type="number"
          min={1}
          max={10}
          autoFocus
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className="h-7 w-8 sm:w-10 rounded-lg border-2 border-brand-400 bg-white text-center text-sm font-bold text-slate-700 focus:outline-none"
        />
      ) : (
        <div
          onClick={handleBadgeClick}
          className={`h-7 w-8 sm:w-10 rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity ${gradeBadgeClass(grade)}`}
          title="Clicca per digitare il voto"
        >
          {grade ?? '–'}
        </div>
      )}
      <button
        type="button"
        onClick={() => onGradeChange(Math.min(10, (grade ?? 0) + 1))}
        className="h-7 w-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 transition-colors flex items-center justify-center text-sm font-medium flex-shrink-0"
      >
        +
      </button>
    </div>
  );
}

export function EvaluationMatrix({
  parameters,
  schools,
  data,
  onGradeChange,
  onNoteChange,
}: EvaluationMatrixProps) {
  if (schools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-slate-500 max-w-sm">
          Aggiungi almeno una scuola per visualizzare la matrice di valutazione.
        </p>
      </div>
    );
  }

  if (parameters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-slate-500 max-w-sm">
          Nessun parametro disponibile. Vai nelle Impostazioni per configurare i parametri di valutazione.
        </p>
      </div>
    );
  }

  const getGrade = (schoolId: string, paramId: string): number | null => {
    return data.grades?.[schoolId]?.[paramId] ?? null;
  };

  const getNote = (schoolId: string, paramId: string): string => {
    return data.notes?.[schoolId]?.[paramId] ?? '';
  };

  const computeTotal = (schoolId: string): number => {
    const schoolGrades = data.grades?.[schoolId] ?? {};
    return parameters.reduce((sum, p) => {
      const g = schoolGrades[p.id];
      return sum + (typeof g === 'number' ? g : 0);
    }, 0);
  };

  const paramColW = 'w-28 sm:w-48';
  const schoolColW = 'w-32 sm:w-44';

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col min-w-full">

        {/* Header row */}
        <div className="flex border-b-2 border-slate-200 bg-white sticky top-0 z-20">
          <div className={`${paramColW} flex-shrink-0 px-2 sm:px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sticky left-0 z-30 bg-white border-r border-slate-200`}>
            Parametro
          </div>
          {schools.map((school) => (
            <div
              key={school.id}
              className={`${schoolColW} flex-shrink-0 px-2 sm:px-3 py-3 border-l border-slate-200`}
            >
              <div className="text-xs sm:text-sm font-semibold text-slate-800 truncate">{school.name}</div>
              {school.location && (
                <div className="text-[10px] sm:text-xs text-slate-400 truncate">{school.location}</div>
              )}
            </div>
          ))}
        </div>

        {/* Parameter rows */}
        {parameters.map((param, paramIndex) => (
          <div
            key={param.id}
            className={`flex border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
              paramIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
            }`}
          >
            {/* Sticky parameter label */}
            <div className={`${paramColW} flex-shrink-0 px-2 sm:px-4 py-3 sticky left-0 z-10 border-r border-slate-200 ${
              paramIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'
            }`}>
              <div className="text-xs sm:text-sm font-medium text-slate-700 leading-snug line-clamp-2">{param.title}</div>
              <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">{param.description}</div>
            </div>

            {/* School cells */}
            {schools.map((school) => {
              const grade = getGrade(school.id, param.id);
              const note = getNote(school.id, param.id);
              return (
                <div
                  key={school.id}
                  className={`${schoolColW} flex-shrink-0 px-2 sm:px-3 py-3 border-l border-slate-200 ${gradeColorClass(grade)}`}
                >
                  <GradeInput
                    grade={grade}
                    onGradeChange={(value) => onGradeChange(school.id, param.id, value)}
                  />
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => onNoteChange(school.id, param.id, e.target.value)}
                    placeholder="Nota..."
                    className="w-full h-8 rounded-lg border border-slate-200 bg-white px-1.5 sm:px-2.5 text-xs text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-colors"
                  />
                </div>
              );
            })}
          </div>
        ))}

        {/* Totals row */}
        <div className="flex border-t-2 border-slate-300 bg-slate-50">
          <div className={`${paramColW} flex-shrink-0 px-2 sm:px-4 py-3.5 sticky left-0 z-10 bg-slate-50 border-r border-slate-200`}>
            <div className="text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-700">
              Totale
            </div>
          </div>
          {schools.map((school) => {
            const total = computeTotal(school.id);
            return (
              <div
                key={school.id}
                className={`${schoolColW} flex-shrink-0 px-2 sm:px-3 py-3.5 border-l border-slate-200 flex items-center justify-between`}
              >
                <span className="hidden sm:inline text-xs text-slate-500">Totale:</span>
                <span className={`text-xl sm:text-2xl font-bold ${totalColorClass(total)}`}>
                  {total}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}