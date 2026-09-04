import { Compass } from 'lucide-react';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { icon: 'h-7 w-7', text: 'text-base sm:text-lg' },
    md: { icon: 'h-9 w-9', text: 'text-xl' },
    lg: { icon: 'h-12 w-12', text: 'text-3xl' },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-500 to-sky-400 blur-md opacity-40" />
        <div className={`relative ${s.icon} rounded-xl bg-gradient-to-br from-brand-600 to-sky-500 flex items-center justify-center shadow-lg shadow-brand-600/30`}>
          <Compass className="h-1/2 w-1/2 text-white" strokeWidth={2.5} />
        </div>
      </div>
      <div className="flex flex-col leading-none min-w-0">
        <span className={`${s.text} font-bold tracking-tight text-slate-800 whitespace-nowrap`}>
          Orienta<span className="text-brand-600">School</span>
        </span>
        {size !== 'sm' && (
          <span className="text-[10px] font-medium tracking-widest uppercase text-slate-400">
            by Doonati
          </span>
        )}
      </div>
    </div>
  );
}
