import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Toggle } from './ui';
import { t } from '@/lib/i18n';

export function ConsentBanner() {
  const { setConsent, lang, log } = useStore();
  const [c, setC] = useState({ voiceProsody: true, longitudinal: true, geoDispatch: false });
  const accept = () => { setConsent({ ...c, acceptedAt: new Date().toISOString() }); log('CONSENT_RECORDED', `voice=${c.voiceProsody};long=${c.longitudinal};geo=${c.geoDispatch}`); };
  return (
    <motion.div role="dialog" aria-modal="true" aria-labelledby="consent-title" className="fixed inset-0 z-[60] grid place-items-end sm:place-items-center bg-trust-900/40 backdrop-blur-sm p-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }} className="card w-full max-w-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-trust-700 grid place-items-center"><ShieldCheck className="h-5 w-5 text-white" /></div>
          <div>
            <h2 id="consent-title" className="font-bold text-lg">{t(lang, 'consentTitle')}</h2>
            <p className="text-xs text-slate-500">Granular consent · DPDP Act 2023 §6 · Withdraw anytime</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">We only process what you allow. Each purpose is separate and can be switched off later from Settings without affecting the others.</p>
        <div className="divide-y divide-trust-100 dark:divide-white/10">
          <Toggle label="Voice tone processing" desc="Analyse pace & tone of voice journals on-device; audio is never uploaded raw." checked={c.voiceProsody} onChange={(v) => setC({ ...c, voiceProsody: v })} />
          <Toggle label="Longitudinal behavioural analytics" desc="Track 30-day patterns to predict distress early and alert your counselor." checked={c.longitudinal} onChange={(v) => setC({ ...c, longitudinal: v })} />
          <Toggle label="Emergency geo-dispatch" desc="Share approximate location (5 km) only when you trigger SOS." checked={c.geoDispatch} onChange={(v) => setC({ ...c, geoDispatch: v })} />
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500 flex items-center gap-1"><Lock className="h-3 w-3" />Data Fiduciary: NCSK / Dept. of Social Justice</p>
          <button className="btn-primary" onClick={accept}>Continue securely</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
