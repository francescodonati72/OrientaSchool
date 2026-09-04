import { useState, useEffect } from 'react';
import {
  ArrowLeft, Menu as MenuIcon, X, Settings as SettingsIcon,
  LogOut, BarChart3, Printer,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/lib/utils';

export type HeaderPage = 'home' | 'editor' | 'dashboard' | 'settings';

interface HeaderProps {
  page: HeaderPage;
  onBack?: () => void;
  onHome: () => void;
  onOpenSettings: () => void;
  onOpenDashboard?: () => void;
  onPrint?: () => void;
}

export function Header({ page, onBack, onHome, onOpenSettings, onOpenDashboard, onPrint }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fullName = user
    ? `${(user.user_metadata?.first_name as string) ?? ''} ${(user.user_metadata?.last_name as string) ?? ''}`.trim()
    : '';
  const displayEmail = user?.email ?? '';

  const showBack = page !== 'home' && !!onBack;
  const showPrint = page === 'dashboard' && !!onPrint;
  const showDashboard = page !== 'dashboard' && !!onOpenDashboard;

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleDrawerNav = (action?: () => void) => {
    setDrawerOpen(false);
    action?.();
  };

  return (
    <>
      <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-2 min-w-0">
            {/* Left side */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              {showBack && (
                <button
                  onClick={onBack}
                  className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 flex-shrink-0"
                  title="Indietro"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <button onClick={onHome} title="Vai alla Home" className="min-w-0">
                <Logo size="sm" />
              </button>
            </div>

            {/* Desktop right side */}
            <div className="hidden sm:flex items-center gap-3">
              <WhatsAppButton />
              {showDashboard && onOpenDashboard && (
                <Button variant="ghost" size="sm" onClick={onOpenDashboard} title="Dashboard">
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              )}
              {showPrint && onPrint && (
                <Button variant="ghost" size="sm" onClick={onPrint} title="Stampa / Salva PDF">
                  <Printer className="h-4 w-4" />
                  <span>Stampa PDF</span>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onOpenSettings} title="Impostazioni">
                <SettingsIcon className="h-4 w-4" />
                <span>Impostazioni</span>
              </Button>
              <div className="flex flex-col items-end leading-tight">
                <span className="text-sm font-medium text-slate-700">{fullName || 'Utente'}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-sky-400 flex items-center justify-center text-sm font-semibold text-white shadow-md">
                {getInitials(fullName || displayEmail || 'U')}
              </div>
              <Button variant="ghost" size="sm" onClick={signOut} title="Esci">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile right side */}
            <div className="flex sm:hidden items-center gap-2 flex-shrink-0">
              <WhatsAppButton iconOnly />
              <button
                onClick={() => setDrawerOpen(true)}
                className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
                title="Menu"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[80%] max-w-sm bg-white shadow-2xl flex flex-col animate-slide-in-right">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 flex-shrink-0">
              <Logo size="sm" />
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer items */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {onOpenDashboard && (
                <button
                  onClick={() => handleDrawerNav(onOpenDashboard)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <BarChart3 className="h-5 w-5 text-slate-400" />
                  Dashboard
                </button>
              )}
              {showPrint && onPrint && (
                <button
                  onClick={() => handleDrawerNav(onPrint)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Printer className="h-5 w-5 text-slate-400" />
                  Stampa PDF
                </button>
              )}
              <button
                onClick={() => handleDrawerNav(onOpenSettings)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <SettingsIcon className="h-5 w-5 text-slate-400" />
                Impostazioni
              </button>

              <div className="my-3 border-t border-slate-100" />

              <div className="flex items-center gap-3 px-3 py-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-sky-400 flex items-center justify-center text-sm font-semibold text-white shadow-md flex-shrink-0">
                  {getInitials(fullName || displayEmail || 'U')}
                </div>
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="text-sm font-medium text-slate-700 truncate">{fullName || 'Utente'}</span>
                  <span className="text-xs text-slate-400 truncate">{displayEmail}</span>
                </div>
              </div>
            </nav>

            {/* Drawer footer */}
            <div className="px-3 py-4 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={() => handleDrawerNav(() => signOut())}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-error-600 hover:bg-error-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Esci
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
