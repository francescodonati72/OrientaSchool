import { useState, useEffect, Component, type ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ParametersProvider } from '@/context/ParametersContext';
import { Login } from '@/components/auth/Login';
import { SignUp } from '@/components/auth/SignUp';
import { ForgotPassword } from '@/components/auth/ForgotPassword';
import { ResetPassword } from '@/components/auth/ResetPassword';
import { VerifyEmail } from '@/components/auth/VerifyEmail';
import { Home } from '@/components/Home';
import { Settings } from '@/components/Settings';
import { AnalysisEditor } from '@/components/AnalysisEditor';
import { Dashboard } from '@/components/Dashboard';
import { Logo } from '@/components/Logo';
import type { AuthView, AppView } from '@/lib/types';

function AppContent() {
  const { session, loading } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('login');
  const [pendingEmail, setPendingEmail] = useState('');
  const [appView, setAppView] = useState<AppView>('home');
  const [activeAnalysisId, setActiveAnalysisId] = useState<string | null>(null);

  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash.includes('reset-password')) {
        setAuthView('reset-password');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" />
          <div className="h-1 w-32 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full w-1/2 bg-brand-500 rounded-full animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    const navigate = (view: AuthView) => setAuthView(view);
    const handleSignedUp = (email: string) => {
      setPendingEmail(email);
      setAuthView('verify-email');
    };

    switch (authView) {
      case 'login':
        return <Login onNavigate={navigate} />;
      case 'signup':
        return <SignUp onNavigate={navigate} onSignedUp={handleSignedUp} />;
      case 'forgot-password':
        return <ForgotPassword onNavigate={navigate} />;
      case 'reset-password':
        return <ResetPassword onNavigate={navigate} />;
      case 'verify-email':
        return <VerifyEmail email={pendingEmail} onNavigate={navigate} />;
      default:
        return <Login onNavigate={navigate} />;
    }
  }

  const openAnalysis = (id: string) => {
    setActiveAnalysisId(id);
    setAppView('editor');
  };

  const openSettings = () => setAppView('settings');
  const openDashboard = () => setAppView('dashboard');
  const backToHome = () => setAppView('home');

  if (appView === 'settings') {
    return <Settings onBack={backToHome} />;
  }

  if (appView === 'dashboard' && activeAnalysisId) {
    return (
      <Dashboard
        analysisId={activeAnalysisId}
        onBack={() => setAppView('editor')}
        onOpenSettings={openSettings}
      />
    );
  }

  if (appView === 'editor' && activeAnalysisId) {
    return (
      <AnalysisEditor
        analysisId={activeAnalysisId}
        onBack={backToHome}
        onOpenSettings={openSettings}
        onOpenDashboard={openDashboard}
      />
    );
  }

  return <Home onOpenAnalysis={openAnalysis} onOpenSettings={openSettings} />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ParametersProvider>
          <AppContent />
        </ParametersProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  state = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error('App error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md text-center">
            <h1 className="text-xl font-bold text-slate-800 mb-2">Qualcosa è andato storto</h1>
            <p className="text-sm text-slate-500 mb-4">{this.state.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Ricarica
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
