import type { ReactNode } from 'react';
import { Logo } from '@/components/Logo';
import { Compass, GraduationCap, MapPinned, Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-sky-600">
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-5%] h-[400px] w-[400px] rounded-full bg-lime-400/15 blur-3xl" />
          <div className="absolute top-[40%] right-[10%] h-[300px] w-[300px] rounded-full bg-brand-300/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center">
              <Compass className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-xl font-bold">OrientaSchool</span>
              <span className="ml-2 text-xs font-medium tracking-widest uppercase text-white/60">by Doonati</span>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Trova la tua strada scolastica
            </h1>
            <p className="text-lg text-white/70 leading-relaxed mb-8">
              La piattaforma che aiuta gli studenti a orientarsi verso il proprio futuro con analisi personalizzate.
            </p>
            <div className="space-y-4">
              {[
                { icon: GraduationCap, text: 'Analisi dettagliate per ogni studente' },
                { icon: MapPinned, text: 'Percorsi personalizzati e salvabili' },
                { icon: Sparkles, text: 'Risultati chiari e actionable' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-5 w-5 text-lime-300" />
                  </div>
                  <span className="text-sm text-white/80">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/40">
            © 2026 OrientaSchool by Doonati. Tutti i diritti riservati.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo size="md" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
