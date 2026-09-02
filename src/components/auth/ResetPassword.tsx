import { useState, type FormEvent } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { supabase } from '@/lib/supabase';
import type { AuthView } from '@/lib/types';

interface ResetPasswordProps {
  onNavigate: (view: AuthView) => void;
}

export function ResetPassword({ onNavigate }: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('La password deve avere almeno 8 caratteri');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthLayout>
        <div className="text-center py-4">
          <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-success-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-success-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Password aggiornata</h2>
          <p className="text-sm text-slate-500 mb-6">
            La tua password è stata reimpostata con successo. Puoi ora accedere con la nuova password.
          </p>
          <Button onClick={() => onNavigate('login')} className="w-full" size="lg">
            Vai al login
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Reimposta password</h2>
        <p className="text-sm text-slate-500">Inserisci la tua nuova password</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            label="Nuova password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="h-4 w-4" />}
            error={error}
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-[38px] text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Reimposta password
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </AuthLayout>
  );
}
