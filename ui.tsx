import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { RiskLevel } from '@/lib/types';

export const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } };

export function Card({ children, className = '', title, subtitle, action }: { children: ReactNode; className?: string; title?: string; subtitle?: string; action?: ReactNode }) {
  return (
    <motion.section {...fadeUp} className={`card p-5 ${className}`}>
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-base font-bold text-trust-800 dark:text-trust-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </motion.section>
  );
}

export const riskColor: Record<RiskLevel, string> = { low: '#10B981', moderate: '#F59E0B', high: '#E11D48' };
export const riskLabel: Record<RiskLevel, string> = { low: 'Stable', moderate: 'Watch', high: 'Priority' };

export function RiskChip({ level }: { level: RiskLevel }) {
  const c = riskColor[level];
  return (
    <span className="chip" style={{ background: c + '1A', color: c }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} aria-hidden />
      {riskLabel[level]}
    </span>
  );
}

export function Stat({ label, value, hint, tone }: { label: string; value: string | number; hint?: string; tone?: 'good' | 'warn' | 'bad' }) {
  const col = tone === 'good' ? 'text-risk-low' : tone === 'warn' ? 'text-risk-mod' : tone === 'bad' ? 'text-risk-high' : 'text-trust-800 dark:text-trust-100';
  return (
    <div className="card p-4">
      <p className="label">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold tracking-tight ${col}`}>{value}</p>
      {hint && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

export function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <label className="flex items-start justify-between gap-4 py-2 cursor-pointer">
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {desc && <span className="block text-xs text-slate-500 dark:text-slate-400">{desc}</span>}
      </span>
      <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-trust-600' : 'bg-slate-300 dark:bg-white/20'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </label>
  );
}

export function Pipeline({ stages, current }: { stages: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-1" aria-label="Progress pipeline">
      {stages.map((s, i) => {
        const done = i < current, active = i === current;
        return (
          <li key={s} className="flex-1 min-w-0">
            <div className={`h-2 rounded-full ${done ? 'bg-trust-600' : active ? 'bg-comfort-400 animate-pulse' : 'bg-slate-200 dark:bg-white/10'}`} />
            <p className={`mt-1.5 text-[11px] leading-tight truncate ${active ? 'font-bold text-comfort-500' : done ? 'text-trust-700 dark:text-trust-200' : 'text-slate-400'}`} title={s}>{s}</p>
          </li>
        );
      })}
    </ol>
  );
}

export function BreathingBubble({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center ${compact ? 'py-2' : 'py-8'}`} role="img" aria-label="Slow breathing guide: breathe in for four seconds, out for four seconds">
      <div className="relative flex items-center justify-center">
        <div className={`${compact ? 'h-24 w-24' : 'h-40 w-40'} rounded-full bg-comfort-400/20 animate-breathe`} />
        <div className={`absolute ${compact ? 'h-14 w-14' : 'h-24 w-24'} rounded-full bg-gradient-to-br from-comfort-400 to-trust-500 animate-breathe opacity-90`} style={{ animationDelay: '0.2s' }} />
        <motion.span className="absolute text-white text-sm font-semibold" animate={{ opacity: [0, 1, 1, 0, 0, 1, 1, 0] }} transition={{ duration: 8, repeat: Infinity, times: [0, 0.1, 0.4, 0.5, 0.5, 0.6, 0.9, 1] }}>
          breathe
        </motion.span>
      </div>
      {!compact && <p className="mt-4 font-serif italic text-sm text-slate-600 dark:text-slate-300">In for 4 · Hold for 4 · Out for 4</p>}
    </div>
  );
}
