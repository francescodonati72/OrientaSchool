import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { DEFAULT_PARAMETERS } from '@/lib/default-parameters';
import type { Parameter } from '@/lib/types';

interface ParametersContextValue {
  parameters: Parameter[];
  loading: boolean;
  refresh: () => Promise<void>;
  addParameter: (title: string, description: string) => Promise<{ error: string | null }>;
  updateParameter: (id: string, title: string, description: string) => Promise<{ error: string | null }>;
  deleteParameter: (id: string) => Promise<{ error: string | null }>;
  reorderParameters: (orderedIds: string[]) => Promise<{ error: string | null }>;
}

const ParametersContext = createContext<ParametersContextValue | undefined>(undefined);

export function ParametersProvider({ children }: { children: ReactNode }) {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from('parameters')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching parameters:', error.message);
      return;
    }

    if (!data || data.length === 0) {
      // Seed defaults
      const inserts = DEFAULT_PARAMETERS.map((p, i) => ({
        title: p.title,
        description: p.description,
        sort_order: i,
        is_default: true,
      }));
      const { data: seeded, error: seedError } = await supabase
        .from('parameters')
        .insert(inserts)
        .select('*');

      if (seedError) {
        console.error('Error seeding default parameters:', seedError.message);
        return;
      }
      setParameters(seeded ?? []);
    } else {
      setParameters(data);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const addParameter: ParametersContextValue['addParameter'] = async (title, description) => {
    const nextOrder = parameters.length > 0 ? Math.max(...parameters.map((p) => p.sort_order)) + 1 : 0;
    const { error } = await supabase
      .from('parameters')
      .insert({ title, description, sort_order: nextOrder, is_default: false });
    if (error) return { error: error.message };
    await refresh();
    return { error: null };
  };

  const updateParameter: ParametersContextValue['updateParameter'] = async (id, title, description) => {
    const { error } = await supabase
      .from('parameters')
      .update({ title, description })
      .eq('id', id);
    if (error) return { error: error.message };
    await refresh();
    return { error: null };
  };

  const deleteParameter: ParametersContextValue['deleteParameter'] = async (id) => {
    const { error } = await supabase
      .from('parameters')
      .delete()
      .eq('id', id);
    if (error) return { error: error.message };
    await refresh();
    return { error: null };
  };

  const reorderParameters: ParametersContextValue['reorderParameters'] = async (orderedIds) => {
    const updates = orderedIds.map((id, index) =>
      supabase.from('parameters').update({ sort_order: index }).eq('id', id)
    );
    const results = await Promise.all(updates);
    const firstError = results.find((r) => r.error);
    if (firstError?.error) return { error: firstError.error.message };
    await refresh();
    return { error: null };
  };

  const value: ParametersContextValue = {
    parameters,
    loading,
    refresh,
    addParameter,
    updateParameter,
    deleteParameter,
    reorderParameters,
  };

  return <ParametersContext.Provider value={value}>{children}</ParametersContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useParameters(): ParametersContextValue {
  const ctx = useContext(ParametersContext);
  if (!ctx) throw new Error('useParameters must be used within ParametersProvider');
  return ctx;
}
