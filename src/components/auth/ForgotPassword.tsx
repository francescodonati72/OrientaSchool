import { useState, type FormEvent } from 'react';
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuth } from '@/context/AuthContext';
import type { AuthView } from '@/lib/types';

interface ForgotPasswordProps {
  onNavigate: (view: AuthView) => void;
}

export function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await resetPassword(email.trim());
    if (error) {
      setError(error);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <AuthLayout>
        <div className="text-center py-4">
          <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-success-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-success-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Controlla la tua email</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Abbiamo inviato un link per reimpostare la password a <span className="font-medium text-slate-700">{email}</span>.
            Segui le istruzioni nell'email per continuare.
          </p>
          <Button variant="secondary" onClick={() => onNavigate('login')} className="w-full">
            <ArrowLeft className="h-4 w-4" />
            Torna al login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-6">
        <button
          onClick={() => onNavigate('login')}
          className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna al login
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Password dimenticata</h2>
        <p className="text-sm text-slate-500">Inserisci la tua email per ricevere un link di reset</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="nome@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="h-4 w-4" />}
          error={error}
          required
          autoComplete="email"
        />

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Invia link di reset
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </AuthLayout>
  );
}
