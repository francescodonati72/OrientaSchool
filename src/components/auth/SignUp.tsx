import { useState, type FormEvent } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuth } from '@/context/AuthContext';
import type { AuthView } from '@/lib/types';

interface SignUpProps {
  onNavigate: (view: AuthView) => void;
  onSignedUp: (email: string) => void;
}

export function SignUp({ onNavigate, onSignedUp }: SignUpProps) {
  const { signUp } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordChecks = [
    { label: 'Almeno 8 caratteri', met: password.length >= 8 },
    { label: 'Una lettera maiuscola', met: /[A-Z]/.test(password) },
    { label: 'Un numero', met: /\d/.test(password) },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('La password deve avere almeno 8 caratteri');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email.trim(), password, {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
    });
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      onSignedUp(email.trim());
    }
  };

  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Crea il tuo account</h2>
        <p className="text-sm text-slate-500">Inizia il tuo percorso di orientamento</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nome"
            type="text"
            placeholder="Mario"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            icon={<User className="h-4 w-4" />}
            required
            autoComplete="given-name"
          />
          <Input
            label="Cognome"
            type="text"
            placeholder="Rossi"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            autoComplete="family-name"
          />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="nome@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="h-4 w-4" />}
          required
          autoComplete="email"
        />

        <div className="relative">
          <Input
            label="Password"
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

        {password.length > 0 && (
          <div className="flex flex-wrap gap-2 animate-fade-in">
            {passwordChecks.map((check) => (
              <div
                key={check.label}
                className={`flex items-center gap-1 text-xs ${check.met ? 'text-success-600' : 'text-slate-400'}`}
              >
                <Check className={`h-3 w-3 ${check.met ? 'opacity-100' : 'opacity-30'}`} />
                {check.label}
              </div>
            ))}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Registrati
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Hai già un account?{' '}
        <button
          onClick={() => onNavigate('login')}
          className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          Accedi
        </button>
      </p>
    </AuthLayout>
  );
}
