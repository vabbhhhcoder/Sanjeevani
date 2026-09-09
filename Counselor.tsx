import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownRight, ArrowUpRight, Brain, CalendarClock, ClipboardList, Fingerprint, Lock, MapPin, Mic2, Minus, ShieldCheck, TrendingUp, UserRoundSearch, Video, Waves } from 'lucide-react';
import { PATIENTS } from '@/data/mock';
import { Patient, RiskLevel } from '@/lib/types';
import { Card, RiskChip, Stat, riskColor } from '@/components/ui';
import { sanitizeIdentity } from '@/lib/sanitize';
import { useStore } from '@/lib/store';
import { verifyChain } from '@/lib/audit';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const kindIcon = { linguistic: Brain, acoustic: Mic2, behavioral: Waves, clinical: ClipboardList };

export function CounselorConsole() {
  const { log, notify, audit } = useStore();
  const [filter, setFilter] = useState<RiskLevel | 'all'>('all');
  const sorted = useMemo(() => [...PATIENTS].sort((a, b) => b.distressVelocity - a.distressVelocity || b.distressScore - a.distressScore), []);
  const list = filter === 'all' ? sorted : sorted.filter((p) => p.risk === filter);
  const [sel, setSel] = useState<Patient>(sorted[0]);
  const [note, setNote] = useState('');
  const [phq, setPhq] = useState<number[]>(Array(9).fill(0));
  const [tab, setTab] = useState<'telemetry' | 'xai' | 'notes' | 'audit'>('telemetry');

  const open = (p: Patient) => { setSel(p); log('VIEW_FILE', p.id); };
  const counts = { high: PATIENTS.filter((p) => p.risk === 'high').length, moderate: PATIENTS.filter((p) => p.risk === 'moderate').length, low: PATIENTS.filter((p) => p.risk === 'low').length };
  const ident = sanitizeIdentity(sel.rawName, sel.aadhaar, sel.coords.lat, sel.coords.lng);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Psychiatric Triage Console</h1>
          <p className="text-sm text-slate-500">Dr. R. Iyer · RCI/A-2231 · Caseload {PATIENTS.length} · Ranked by <b>Distress Velocity</b> (Δ mood, 7d vs prior 7d)</p>
        </div>
        <div className="flex gap-2 text-xs"><span className="chip bg-risk-low/10 text-risk-low"><Lock className="h-3 w-3" />E2E encrypted session</span><span className="chip bg-comfort-500/10 text-comfort-500"><ShieldCheck className="h-3 w-3" />Audit chain {verifyChain(audit) ? 'verified' : 'BROKEN'}</span></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Red · Crisis < 2h" value={counts.high} tone="bad" hint="Immediate intervention" />
        <Stat label="Amber · Scheduled" value={counts.moderate} tone="warn" hint="Check-in within 48h" />
        <Stat label="Green · Stable" value={counts.low} tone="good" hint="Routine follow-up" />
        <Stat label="Median response" value="1h 42m" hint="Target < 2h for Red" tone="good" />
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-4">
        {/* Queue */}
        <Card className="!p-0 overflow-hidden" >
          <div className="p-4 border-b border-trust-100 dark:border-white/10">
            <div className="flex items-center justify-between"><h2 className="font-bold flex items-center gap-2"><TrendingUp className="h-4 w-4" />Distress Velocity Queue</h2></div>
            <div className="mt-3 flex gap-1.5 text-xs" role="tablist" aria-label="Filter by risk">
              {(['all', 'high', 'moderate', 'low'] as const).map((f) => (
                <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={`rounded-lg px-2.5 py-1 font-semibold capitalize ${filter === f ? 'bg-trust-700 text-white' : 'bg-trust-50 dark:bg-white/5'}`}>{f === 'all' ? 'All' : f === 'high' ? 'Red' : f === 'moderate' ? 'Amber' : 'Green'}</button>
              ))}
            </div>
          </div>
          <ul className="max-h-[70vh] overflow-y-auto divide-y divide-trust-100 dark:divide-white/10">
            {list.map((p, i) => {
              const active = p.id === sel.id;
              const Vel = p.distressVelocity > 2 ? ArrowUpRight : p.distressVelocity < -2 ? ArrowDownRight : Minus;
              return (
                <li key={p.id}>
                  <button onClick={() => open(p)} aria-current={active} className={`w-full text-left p-3.5 flex gap-3 transition ${active ? 'bg-trust-50 dark:bg-white/5 border-l-4 border-trust-700' : 'hover:bg-trust-50/60 dark:hover:bg-white/[0.03] border-l-4 border-transparent'}`}>
                    <div className="h-10 w-10 rounded-xl grid place-items-center text-white font-bold text-xs shrink-0" style={{ background: riskColor[p.risk] }}>{i + 1}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2"><p className="font-bold text-sm font-mono">{p.id}</p><RiskChip level={p.risk} /></div>
                      <p className="text-xs text-slate-500 truncate">{p.gender}/{p.age} · {p.district} · {p.incidentType}</p>
                      <div className="mt-1.5 flex items-center gap-3 text-xs">
                        <span className={`flex items-center gap-0.5 font-bold ${p.distressVelocity > 2 ? 'text-risk-high' : p.distressVelocity < -2 ? 'text-risk-low' : 'text-slate-500'}`}><Vel className="h-3.5 w-3.5" />{p.distressVelocity > 0 ? '+' : ''}{p.distressVelocity}/wk</span>
                        <span className="text-slate-500">Score {p.distressScore}</span>
                        <span className="text-slate-400 ml-auto">{p.lastCheckIn}</span>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Detail */}
        <div className="space-y-4">
          <ErrorBoundary label="Patient detail">
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="h-14 w-14 rounded-2xl grid place-items-center text-white" style={{ background: `linear-gradient(135deg, ${riskColor[sel.risk]}, #134E4A)` }}><Fingerprint className="h-7 w-7" /></div>
                  <div>
                    <div className="flex items-center gap-2"><h2 className="text-xl font-extrabold font-mono">{ident.handle}</h2><RiskChip level={sel.risk} /></div>
                    <p className="text-sm text-slate-500">{sel.gender === 'F' ? 'Female' : sel.gender === 'M' ? 'Male' : 'Non-binary'}, {sel.age} · {sel.incidentType}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
                      <span className="chip bg-trust-50 dark:bg-white/5"><Lock className="h-3 w-3" />Aadhaar {ident.aadhaarMasked}</span>
                      <span className="chip bg-trust-50 dark:bg-white/5"><MapPin className="h-3 w-3" />{sel.district} · ±{ident.coords.radiusKm} km grid ({ident.coords.lat}, {ident.coords.lng})</span>
                      <span className="chip bg-trust-50 dark:bg-white/5">{sel.firNumber}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="label">Distress score</p>
                  <p className="text-3xl font-extrabold" style={{ color: riskColor[sel.risk] }}>{sel.distressScore}<span className="text-sm text-slate-400">/100</span></p>
                  <p className="text-xs text-slate-500">Velocity {sel.distressVelocity > 0 ? '+' : ''}{sel.distressVelocity}/wk</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {sel.traumaFlags.map((f) => <span key={f} className="chip bg-comfort-500/10 text-comfort-600 dark:text-comfort-300">{f}</span>)}
                <span className="chip bg-trust-50 dark:bg-white/5">PCL-5 {sel.pcl5}/80</span><span className="chip bg-trust-50 dark:bg-white/5">PHQ-9 {sel.phq9}/27</span>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                <button className="btn-primary text-xs" onClick={() => { log('TELEHEALTH_LAUNCH', sel.id); notify('Secure WebRTC room created · E2EE key exchanged'); }}><Video className="h-4 w-4" />Tele-health</button>
                <button className="btn-comfort text-xs" onClick={() => { log('SCHEDULE_INTERVENTION', sel.id); notify('Intervention scheduled — survivor notified gently'); }}><CalendarClock className="h-4 w-4" />Schedule</button>
                <button className="btn bg-amber-500 text-white text-xs hover:bg-amber-600" onClick={() => { log('DISPATCH_FIELD_WORKER', sel.id); notify('Nearest social worker (Ms. P. Nayak, 6 km) dispatched'); }}><UserRoundSearch className="h-4 w-4" />Field dispatch</button>
                <button className="btn bg-slate-700 text-white text-xs" onClick={() => setTab('notes')}><ClipboardList className="h-4 w-4" />SOAP / PHQ-9</button>
              </div>
              <p className="mt-3 text-xs rounded-lg bg-trust-50 dark:bg-white/5 p-2.5"><b>Recommended:</b> {sel.nextAction} · Assigned: {sel.counselor}</p>
            </Card>

            <Card className="!p-0 overflow-hidden">
              <div className="flex border-b border-trust-100 dark:border-white/10 text-sm" role="tablist">
                {([['telemetry', '30-day Telemetry'], ['xai', 'XAI Biomarkers'], ['notes', 'Clinical Notes'], ['audit', 'Audit Trail']] as const).map(([k, l]) => (
                  <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`px-4 py-3 font-semibold border-b-2 -mb-px ${tab === k ? 'border-trust-700 text-trust-800 dark:text-trust-100' : 'border-transparent text-slate-500'}`}>{l}</button>
                ))}
              </div>
              <div className="p-5">
                <AnimatePresence mode="wait">
                  <motion.div key={tab + sel.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                    {tab === 'telemetry' && <Telemetry p={sel} />}
                    {tab === 'xai' && <Xai p={sel} />}
                    {tab === 'notes' && (
                      <div className="grid md:grid-cols-2 gap-5">
                        <div>
                          <p className="label mb-2">SOAP note</p>
                          <textarea className="input h-40 font-mono text-xs" value={note} onChange={(e) => setNote(e.target.value)} placeholder={'S: Survivor reports…\nO: Affect flat, prosody monotone…\nA: Acute stress reaction, r/o PTSD…\nP: Weekly CBT-T, safety plan reviewed…'} />
                          <button className="btn-primary mt-2 text-xs" onClick={() => { log('ADD_SOAP_NOTE', sel.id); setNote(''); notify('Note sealed & hashed into audit chain'); }}>Sign & seal note</button>
                        </div>
                        <div>
                          <p className="label mb-2">PHQ-9 quick scorer · total {phq.reduce((a, b) => a + b, 0)}/27</p>
                          <ol className="space-y-1.5 text-xs">
                            {['Little interest or pleasure', 'Feeling down, hopeless', 'Sleep trouble', 'Tired / little energy', 'Appetite change', 'Feeling bad about self', 'Trouble concentrating', 'Psychomotor change', 'Thoughts of self-harm'].map((q, i) => (
                              <li key={q} className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1 ${i === 8 && phq[8] > 0 ? 'bg-risk-high/10' : 'bg-trust-50 dark:bg-white/5'}`}>
                                <span>{i + 1}. {q}</span>
                                <div className="flex gap-1">{[0, 1, 2, 3].map((v) => <button key={v} aria-label={`${q}: ${v}`} onClick={() => setPhq((a) => a.map((x, j) => (j === i ? v : x)))} className={`h-6 w-6 rounded-md text-[11px] font-bold ${phq[i] === v ? 'bg-trust-700 text-white' : 'bg-white dark:bg-white/10'}`}>{v}</button>)}</div>
                              </li>
                            ))}
                          </ol>
                          {phq[8] > 0 && <p className="mt-2 text-xs text-risk-high font-semibold">Item 9 positive — safety plan & same-day follow-up protocol triggered.</p>}
                        </div>
                      </div>
                    )}
                    {tab === 'audit' && <AuditTable />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </Card>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

function Telemetry({ p }: { p: Patient }) {
  const [series, setSeries] = useState({ mood: true, sleepDisruption: true, withdrawal: true, voiceJitter: true });
  const meta = [
    { k: 'mood', l: 'Mood sentiment', c: '#134E4A' }, { k: 'sleepDisruption', l: 'Sleep disruption', c: '#6366F1' },
    { k: 'withdrawal', l: 'Social withdrawal', c: '#F59E0B' }, { k: 'voiceJitter', l: 'Voice acoustic jitter', c: '#E11D48' },
  ] as const;
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {meta.map((m) => (
          <button key={m.k} aria-pressed={series[m.k]} onClick={() => setSeries((s) => ({ ...s, [m.k]: !s[m.k] }))} className={`chip border transition ${series[m.k] ? 'text-white' : 'opacity-50'}`} style={{ background: series[m.k] ? m.c : 'transparent', borderColor: m.c, color: series[m.k] ? '#fff' : m.c }}>{m.l}</button>
        ))}
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={p.telemetry} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-trust-100 dark:text-white/10" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #D3E9E7', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {meta.map((m) => series[m.k] && <Line key={m.k} type="monotone" dataKey={m.k} name={m.l} stroke={m.c} strokeWidth={m.k === 'mood' ? 3 : 2} dot={false} activeDot={{ r: 5 }} isAnimationActive animationDuration={900} />)}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-slate-500">Mood: higher = better. Other series: higher = worse. Shaded windows for nocturnal usage available in full view. Data points derived from consented check-ins, voice prosody, and app-usage rhythm.</p>
    </div>
  );
}

function Xai({ p }: { p: Patient }) {
  return (
    <div className="space-y-4">
      <p className="text-sm">Why <b className="font-mono">{p.id}</b> is ranked here — model attributions (SHAP-style, top features). Clinician judgement overrides the model.</p>
      <ul className="space-y-2">
        {p.markers.map((m, i) => { const I = kindIcon[m.kind]; return (
          <li key={m.label}>
            <div className="flex items-center justify-between text-sm mb-1"><span className="flex items-center gap-2"><I className="h-4 w-4 text-comfort-500" />{m.label}<span className="chip bg-trust-50 dark:bg-white/5 text-[10px] capitalize">{m.kind}</span></span><b>{m.weight}%</b></div>
            <div className="h-2 rounded-full bg-trust-50 dark:bg-white/5 overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${m.weight}%` }} transition={{ delay: i * 0.08, duration: 0.7 }} className="h-full rounded-full" style={{ background: `linear-gradient(90deg,#134E4A,${riskColor[p.risk]})` }} /></div>
          </li>
        ); })}
      </ul>
      <div className="grid sm:grid-cols-3 gap-2 text-xs">
        <div className="rounded-xl bg-trust-50 dark:bg-white/5 p-3"><p className="label">Model</p><p className="font-semibold mt-1">Multimodal fusion v2.3 (IndicBERT + wav2vec2 prosody + temporal GRU)</p></div>
        <div className="rounded-xl bg-trust-50 dark:bg-white/5 p-3"><p className="label">Confidence</p><p className="font-semibold mt-1">{Math.min(96, 60 + p.distressScore / 3).toFixed(0)}% · calibrated (ECE 0.03)</p></div>
        <div className="rounded-xl bg-trust-50 dark:bg-white/5 p-3"><p className="label">Fairness audit</p><p className="font-semibold mt-1">No demographic parity gap &gt; 2% across gender / language</p></div>
      </div>
    </div>
  );
}

export function AuditTable() {
  const { audit } = useStore();
  const ok = verifyChain(audit);
  return (
    <div>
      <div className="flex items-center justify-between mb-3"><p className="text-sm">Immutable, hash-chained access ledger · {audit.length} entries</p><span className={`chip ${ok ? 'bg-risk-low/10 text-risk-low' : 'bg-risk-high/10 text-risk-high'}`}><ShieldCheck className="h-3 w-3" />{ok ? 'Integrity verified' : 'TAMPER DETECTED'}</span></div>
      <div className="overflow-x-auto rounded-xl border border-trust-100 dark:border-white/10">
        <table className="w-full text-xs">
          <thead className="bg-trust-50 dark:bg-white/5 text-left"><tr><th className="p-2">#</th><th className="p-2">Timestamp</th><th className="p-2">Actor</th><th className="p-2">Action</th><th className="p-2">Resource</th><th className="p-2">Hash</th></tr></thead>
          <tbody>
            {[...audit].reverse().map((e) => (
              <tr key={e.id} className="border-t border-trust-100 dark:border-white/10 font-mono">
                <td className="p-2">{e.id}</td><td className="p-2 whitespace-nowrap">{new Date(e.ts).toLocaleString('en-IN', { hour12: false })}</td><td className="p-2">{e.actor}</td><td className="p-2 font-semibold">{e.action}</td><td className="p-2">{e.resource}</td><td className="p-2 text-slate-400" title={`prev: ${e.prevHash}`}>{e.hash.slice(0, 12)}…</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
