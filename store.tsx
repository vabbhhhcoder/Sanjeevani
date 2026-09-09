import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { AuditEntry, ConsentState, Lang, Role } from './types';
import { appendAudit } from './audit';

interface Store {
  role: Role; setRole: (r: Role) => void;
  lang: Lang; setLang: (l: Lang) => void;
  dark: boolean; setDark: (d: boolean) => void;
  highContrast: boolean; setHighContrast: (v: boolean) => void;
  fontScale: number; setFontScale: (n: number) => void;
  voiceNav: boolean; setVoiceNav: (v: boolean) => void;
  consent: ConsentState | null; setConsent: (c: ConsentState) => void;
  audit: AuditEntry[]; log: (action: string, resource: string) => void;
  stealth: boolean; enterStealth: () => void; exitStealth: (pin: string) => boolean;
  toast: string | null; notify: (m: string) => void;
}

const Ctx = createContext<Store | null>(null);
const MASTER_PIN = '2580'; // demo; production: WebAuthn / device-bound secret
const SENSITIVE_KEYS = ['sanj.checkin', 'sanj.chat', 'sanj.voice'];

const ROLE_ACTOR: Record<Role, string> = { survivor: 'SURV-1076', counselor: 'Dr. R. Iyer (RCI/A-2231)', nodal: 'DNO Nagpur (IAS)' };

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>('survivor');
  const [lang, setLang] = useState<Lang>('en');
  const [dark, setDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [voiceNav, setVoiceNav] = useState(false);
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>(() => {
    let c: AuditEntry[] = [];
    c = appendAudit(c, 'SYSTEM', 'nodal', 'CHAIN_GENESIS', 'audit/ledger');
    c = appendAudit(c, 'Dr. R. Iyer (RCI/A-2231)', 'counselor', 'VIEW_FILE', 'SURV-1076');
    c = appendAudit(c, 'Ms. P. Nayak (RCI/A-1894)', 'counselor', 'ADD_SOAP_NOTE', 'SURV-10E1');
    c = appendAudit(c, 'DNO Nagpur (IAS)', 'nodal', 'EXPORT_AGGREGATE', 'district/nagpur');
    return c;
  });
  const [stealth, setStealth] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const log = useCallback((action: string, resource: string) => {
    setAudit((c) => appendAudit(c, ROLE_ACTOR[role], role, action, resource));
  }, [role]);

  const setRole = useCallback((r: Role) => { setRoleState(r); setAudit((c) => appendAudit(c, ROLE_ACTOR[r], r, 'SESSION_START', `portal/${r}`)); }, []);

  const notify = useCallback((m: string) => { setToast(m); window.setTimeout(() => setToast(null), 3200); }, []);

  const enterStealth = useCallback(() => {
    SENSITIVE_KEYS.forEach((k) => { localStorage.removeItem(k); sessionStorage.removeItem(k); });
    document.title = 'Simple Calculator';
    setStealth(true);
    window.history.replaceState(null, '', '/calc');
  }, []);
  const exitStealth = useCallback((pin: string) => {
    if (pin !== MASTER_PIN) return false;
    document.title = 'SANJEEVANI · Mental Health Support';
    window.history.replaceState(null, '', '/');
    setStealth(false);
    return true;
  }, []);

  // Theme + a11y side-effects
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); }, [dark]);
  useEffect(() => { document.documentElement.classList.toggle('high-contrast', highContrast); }, [highContrast]);
  useEffect(() => { document.documentElement.style.setProperty('--font-scale', String(fontScale)); }, [fontScale]);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  // Double-tap ESC → Quick Exit
  useEffect(() => {
    let last = 0;
    const h = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const now = Date.now();
      if (now - last < 600) enterStealth();
      last = now;
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [enterStealth]);

  const value = useMemo<Store>(() => ({ role, setRole, lang, setLang, dark, setDark, highContrast, setHighContrast, fontScale, setFontScale, voiceNav, setVoiceNav, consent, setConsent, audit, log, stealth, enterStealth, exitStealth, toast, notify }),
    [role, setRole, lang, dark, highContrast, fontScale, voiceNav, consent, audit, log, stealth, enterStealth, exitStealth, toast, notify]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside provider');
  return s;
}

/** Speech synthesis helper (Bhashini TTS simulation via Web Speech API). */
export function speak(text: string, lang: Lang) {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN' }[lang];
    u.rate = 0.92; u.pitch = 1;
    window.speechSynthesis.speak(u);
  } catch { /* non-fatal */ }
}
