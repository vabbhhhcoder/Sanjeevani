import { ReactNode, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Accessibility, Contrast, DoorOpen, Globe, Heart, Landmark, Moon, ShieldCheck, Stethoscope, Sun, Type, Volume2, X } from 'lucide-react';
import { useStore, speak } from '@/lib/store';
import { Role } from '@/lib/types';
import { LANGS, t } from '@/lib/i18n';
import { Toggle } from './ui';

const ROLES: { id: Role; label: string; icon: typeof Heart; desc: string }[] = [
  { id: 'survivor', label: 'Survivor', icon: Heart, desc: 'Citizen Portal' },
  { id: 'counselor', label: 'Counselor', icon: Stethoscope, desc: 'Triage Console' },
  { id: 'nodal', label: 'Nodal Officer', icon: Landmark, desc: 'Authority Dashboard' },
];

export function Shell({ children }: { children: ReactNode }) {
  const s = useStore();
  const [a11y, setA11y] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-lg focus:bg-trust-700 focus:px-3 focus:py-2 focus:text-white">Skip to content</a>
      <header className="sticky top-0 z-40 border-b border-trust-100/60 dark:border-white/10 bg-alabaster/80 dark:bg-obsidian/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-trust-700 to-comfort-500 grid place-items-center shadow-soft" aria-hidden>
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight min-w-0">
              <p className="font-extrabold tracking-tight text-trust-800 dark:text-trust-100">SANJEEVANI</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 truncate hidden sm:block">Dignity · Safety · Recovery</p>
            </div>
          </div>

          {/* Role switcher */}
          <nav aria-label="Portal switcher" className="hidden md:flex items-center rounded-2xl bg-trust-50 dark:bg-white/5 p-1">
            {ROLES.map((r) => {
              const active = s.role === r.id;
              return (
                <button key={r.id} onClick={() => s.setRole(r.id)} aria-current={active ? 'page' : undefined}
                  className={`relative flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold transition ${active ? 'text-white' : 'text-trust-700 dark:text-trust-200 hover:bg-white/60 dark:hover:bg-white/5'}`}>
                  {active && <motion.span layoutId="role-pill" className="absolute inset-0 rounded-xl bg-trust-700" transition={{ type: 'spring', stiffness: 350, damping: 30 }} />}
                  <r.icon className="relative h-4 w-4" /><span className="relative">{r.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <div className="relative">
              <button className="btn-ghost px-2.5" aria-label={t(s.lang, 'language')} aria-expanded={langOpen} onClick={() => setLangOpen((v) => !v)}>
                <Globe className="h-4 w-4" /><span className="text-xs hidden sm:inline">{LANGS.find((l) => l.code === s.lang)?.native}</span>
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.ul initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} role="listbox" className="absolute right-0 mt-2 w-44 card p-1.5 z-50">
                    {LANGS.map((l) => (
                      <li key={l.code}>
                        <button role="option" aria-selected={l.code === s.lang} onClick={() => { s.setLang(l.code); setLangOpen(false); if (s.voiceNav) speak(t(l.code, 'welcome'), l.code); }}
                          className={`w-full text-left rounded-lg px-3 py-2 text-sm flex justify-between ${l.code === s.lang ? 'bg-trust-700 text-white' : 'hover:bg-trust-50 dark:hover:bg-white/5'}`}>
                          <span>{l.native}</span><span className="opacity-60 text-xs">{l.name}</span>
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
            <button className="btn-ghost px-2.5" aria-label="Accessibility options" aria-expanded={a11y} onClick={() => setA11y(true)}><Accessibility className="h-4 w-4" /></button>
            <button className="btn-ghost px-2.5" aria-label={s.dark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => s.setDark(!s.dark)}>{s.dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
            <button onClick={s.enterStealth} className="btn bg-slate-800 dark:bg-white text-white dark:text-slate-900 px-3 hover:bg-slate-700" aria-label="Quick exit — replaces the screen with a calculator. Also: press Escape twice." title="Press ESC twice">
              <DoorOpen className="h-4 w-4" /><span className="hidden sm:inline">{t(s.lang, 'quickExit')}</span>
            </button>
          </div>
        </div>
        {/* Mobile role switcher */}
        <nav aria-label="Portal switcher (mobile)" className="md:hidden flex border-t border-trust-100/60 dark:border-white/10">
          {ROLES.map((r) => (
            <button key={r.id} onClick={() => s.setRole(r.id)} aria-current={s.role === r.id ? 'page' : undefined}
              className={`flex-1 py-2 text-xs font-semibold flex flex-col items-center gap-0.5 ${s.role === r.id ? 'text-trust-700 dark:text-trust-200 border-b-2 border-trust-700' : 'text-slate-500'}`}>
              <r.icon className="h-4 w-4" />{r.label}
            </button>
          ))}
        </nav>
      </header>

      <main id="main" className="flex-1 mx-auto w-full max-w-7xl px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={s.role} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-trust-100/60 dark:border-white/10 py-4 text-center text-xs text-slate-500">
        Data processed under DPDP Act 2023 · Encrypted at rest (AES-256) & in transit (TLS 1.3) · Tele-MANAS 14416 · Emergency 112
      </footer>

      {/* Accessibility drawer */}
      <AnimatePresence>
        {a11y && (
          <>
            <motion.div className="fixed inset-0 bg-black/30 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setA11y(false)} />
            <motion.aside role="dialog" aria-label="Accessibility settings" initial={{ x: 320 }} animate={{ x: 0 }} exit={{ x: 320 }} transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="fixed right-0 top-0 h-full w-80 max-w-full z-50 bg-alabaster dark:bg-obsidian border-l border-trust-100 dark:border-white/10 p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2"><Accessibility className="h-5 w-5" />Accessibility</h2>
                <button className="btn-ghost px-2" onClick={() => setA11y(false)} aria-label="Close"><X className="h-4 w-4" /></button>
              </div>
              <Toggle label="Voice navigation" desc="Reads prompts aloud (Bhashini TTS)" checked={s.voiceNav} onChange={(v) => { s.setVoiceNav(v); if (v) speak(t(s.lang, 'welcome'), s.lang); }} />
              <Toggle label="High contrast" desc="Stronger borders & contrast ratio ≥ 7:1" checked={s.highContrast} onChange={s.setHighContrast} />
              <Toggle label="Dark mode" desc="Lower brightness, warmer surface" checked={s.dark} onChange={s.setDark} />
              <div className="py-3">
                <p className="text-sm font-semibold flex items-center gap-2"><Type className="h-4 w-4" />Text size</p>
                <div className="mt-2 flex gap-2">
                  {[0.9, 1, 1.15, 1.3].map((f) => (
                    <button key={f} onClick={() => s.setFontScale(f)} aria-pressed={s.fontScale === f} className={`flex-1 rounded-lg py-2 text-sm font-semibold border ${s.fontScale === f ? 'bg-trust-700 text-white border-trust-700' : 'border-trust-100 dark:border-white/10'}`}>{Math.round(f * 100)}%</button>
                  ))}
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-trust-50 dark:bg-white/5 p-3 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                <p className="flex gap-2"><Contrast className="h-3.5 w-3.5 mt-0.5" />WCAG 2.1 AAA colour targets, focus rings, reduced-motion respected.</p>
                <p className="flex gap-2"><Volume2 className="h-3.5 w-3.5 mt-0.5" />Screen-reader landmarks & live regions enabled.</p>
                <p className="flex gap-2"><DoorOpen className="h-3.5 w-3.5 mt-0.5" />Press <kbd className="px-1 rounded bg-white dark:bg-white/10">Esc</kbd> twice for Quick Exit. Restore PIN (demo): 2580</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <div aria-live="polite" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <AnimatePresence>
          {s.toast && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-xl bg-trust-800 text-white px-4 py-2.5 text-sm shadow-soft">{s.toast}</motion.div>}
        </AnimatePresence>
      </div>
    </div>
  );
}
