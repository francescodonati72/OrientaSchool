import { useState } from 'react';
import { MailCheck, ArrowLeft, RefreshCw, ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import type { AuthView } from '@/lib/types';

interface VerifyEmailProps {
  email: string;
  onNavigate: (view: AuthView) => void;
}

export function VerifyEmail({ email, onNavigate }: VerifyEmailProps) {
  const { resendVerification } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setError(null);
    setLoading(true);
    const { error } = await resendVerification(email);
    if (error) {
      setError(error);
    } else {
      setResent(true);
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div className="text-center py-2">
        <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center">
          <MailCheck className="h-8 w-8 text-brand-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Verifica la tua email</h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-1">
          Abbiamo inviato un'email di conferma a
        </p>
        <p className="font-semibold text-slate-700 mb-6">{email}</p>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Clicca sul link nell'email per attivare il tuo account. Se non trovi l'email,
          controlla anche la cartella spam.
        </p>

        {resent && (
          <div className="mb-4 rounded-lg bg-success-50 border border-success-200 px-4 py-3 text-sm text-success-700 animate-fade-in">
            Email reinviata con successo. Controlla la tua casella di posta.
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-error-50 border border-error-200 px-4 py-3 text-sm text-error-700">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Button variant="secondary" onClick={handleResend} loading={loading} className="w-full">
            <RefreshCw className="h-4 w-4" />
            Reinvia email
          </Button>
          <Button variant="ghost" onClick={() => onNavigate('login')} className="w-full">
            <ArrowLeft className="h-4 w-4" />
            Torna al login
            <ArrowRight className="h-4 w-4 opacity-0" />
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
