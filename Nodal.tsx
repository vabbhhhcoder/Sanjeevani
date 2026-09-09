import { useState } from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertOctagon, Banknote, Clock, Download, Landmark, MapPinned, Users } from 'lucide-react';
import { DBT_FUNNEL, DISTRICTS, PATIENTS, SLA_TREND } from '@/data/mock';
import { Card, Stat } from '@/components/ui';
import { useStore } from '@/lib/store';
import { AuditTable } from './Counselor';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function NodalDashboard() {
  const { log, notify } = useStore();
  const [hover, setHover] = useState<typeof DISTRICTS[number] | null>(null);
  const totalInc = DISTRICTS.reduce((a, d) => a + d.incidents, 0);
  const avgResp = (DISTRICTS.reduce((a, d) => a + d.responseHrs, 0) / DISTRICTS.length).toFixed(1);
  const ratio = Math.round(totalInc / DISTRICTS.reduce((a, d) => a + d.counselors, 0));
  const bottlenecks = DISTRICTS.filter((d) => d.responseHrs > 4 || d.incidents / d.counselors > 12);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2"><Landmark className="h-6 w-6 text-trust-700" />District Nodal Officer Dashboard</h1>
          <p className="text-sm text-slate-500">Aggregated & k-anonymised (k ≥ 5) · No individual records accessible at this tier · FY 2026-27 Q2</p>
        </div>
        <button className="btn-primary text-xs" onClick={() => { log('EXPORT_AGGREGATE', 'state/all-districts'); notify('Aggregate report queued · watermarked PDF'); }}><Download className="h-4 w-4" />Export for NCSC/NCST review</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat label="Registered survivors" value={totalInc} hint="10 districts · 4 states" />
        <Stat label="Avg first response" value={`${avgResp} h`} hint="Target < 4 h" tone={+avgResp <= 4 ? 'good' : 'warn'} />
        <Stat label="Survivor : counselor" value={`${ratio} : 1`} hint="Recommended ≤ 10 : 1" tone={ratio > 10 ? 'warn' : 'good'} />
        <Stat label="Active crisis cases" value={PATIENTS.filter((p) => p.risk === 'high').length} tone="bad" hint="Under 2h protocol" />
        <Stat label="DBT disbursed" value="₹3.9 Cr" hint="of ₹4.7 Cr sanctioned" tone="good" />
      </div>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4">
        <ErrorBoundary label="Heatmap">
          <Card title="Geospatial Distress Heatmap" subtitle="Bubble = incident density · colour = average recovery trajectory · positions generalised to district centroid" action={<span className="chip bg-trust-50 dark:bg-white/5"><MapPinned className="h-3 w-3" />k-anon</span>}>
            <div className="relative aspect-[4/3] rounded-2xl bg-gradient-to-br from-trust-50 to-comfort-500/10 dark:from-white/5 dark:to-comfort-500/10 overflow-hidden">
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" role="img" aria-label="Stylised India map with district distress bubbles">
                <path d="M30 8 L45 6 L58 10 L66 16 L78 20 L84 30 L80 40 L74 48 L70 58 L64 66 L58 74 L52 84 L48 94 L44 88 L40 78 L34 70 L28 62 L22 54 L16 44 L18 34 L22 24 Z" fill="currentColor" className="text-trust-100/70 dark:text-white/[0.06]" stroke="currentColor" strokeWidth="0.4" />
                <defs><radialGradient id="g"><stop offset="0%" stopColor="#E11D48" stopOpacity="0.55" /><stop offset="100%" stopColor="#E11D48" stopOpacity="0" /></radialGradient></defs>
                {DISTRICTS.map((d) => { const r = 3 + d.incidents / 6; const col = d.avgRecovery >= 68 ? '#10B981' : d.avgRecovery >= 58 ? '#F59E0B' : '#E11D48'; return (
                  <g key={d.name} onMouseEnter={() => setHover(d)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(d)} onBlur={() => setHover(null)} tabIndex={0} aria-label={`${d.name}: ${d.incidents} incidents, recovery ${d.avgRecovery}%`} className="cursor-pointer outline-none">
                    <circle cx={d.x} cy={d.y} r={r * 2.2} fill={col} opacity="0.12"><animate attributeName="r" values={`${r * 1.8};${r * 2.6};${r * 1.8}`} dur="5s" repeatCount="indefinite" /></circle>
                    <circle cx={d.x} cy={d.y} r={r} fill={col} opacity="0.85" stroke="#fff" strokeWidth="0.5" />
                    <text x={d.x} y={d.y + r + 3} fontSize="2.6" textAnchor="middle" fill="currentColor" className="text-slate-700 dark:text-slate-200 font-semibold">{d.name}</text>
                  </g>
                ); })}
              </svg>
              {hover && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="absolute left-3 top-3 card p-3 text-xs w-52">
                  <p className="font-bold text-sm">{hover.name}, {hover.state}</p>
                  <p>Incidents (90d): <b>{hover.incidents}</b></p><p>Avg recovery: <b>{hover.avgRecovery}%</b></p><p>First response: <b>{hover.responseHrs} h</b></p><p>Counselors: <b>{hover.counselors}</b> ({Math.round(hover.incidents / hover.counselors)}:1)</p>
                </motion.div>
              )}
              <div className="absolute bottom-3 right-3 flex gap-2 text-[10px]">{[['#10B981', 'Recovering'], ['#F59E0B', 'Plateau'], ['#E11D48', 'Deteriorating']].map(([c, l]) => <span key={l} className="chip bg-white/80 dark:bg-black/40"><span className="h-2 w-2 rounded-full" style={{ background: c }} />{l}</span>)}</div>
            </div>
          </Card>
        </ErrorBoundary>

        <div className="space-y-4">
          <Card title="Rehabilitation SLA" subtitle="Weekly avg first-response time vs 4h target" action={<Clock className="h-4 w-4 text-slate-400" />}>
            <div className="h-44">
              <ResponsiveContainer><AreaChart data={SLA_TREND} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs><linearGradient id="sla" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#134E4A" stopOpacity={0.5} /><stop offset="100%" stopColor="#134E4A" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-trust-100 dark:text-white/10" /><XAxis dataKey="week" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} domain={[0, 8]} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="target" stroke="#F59E0B" strokeDasharray="4 4" fill="none" name="Target (h)" />
                <Area type="monotone" dataKey="responseHrs" stroke="#134E4A" strokeWidth={2.5} fill="url(#sla)" name="Response (h)" />
              </AreaChart></ResponsiveContainer>
            </div>
          </Card>
          <Card title="Bottleneck warnings" subtitle="Auto-generated from SLA & allocation ratios" action={<AlertOctagon className="h-4 w-4 text-risk-mod" />}>
            <ul className="space-y-2 text-xs">
              {bottlenecks.map((d) => (
                <li key={d.name} className="flex items-start gap-2 rounded-lg bg-risk-mod/10 p-2.5"><Users className="h-4 w-4 text-risk-mod shrink-0" /><span><b>{d.name}</b>: {d.responseHrs > 4 ? `response ${d.responseHrs}h > 4h SLA` : ''}{d.responseHrs > 4 && d.incidents / d.counselors > 12 ? ' · ' : ''}{d.incidents / d.counselors > 12 ? `${Math.round(d.incidents / d.counselors)}:1 counselor load` : ''} → recommend +{Math.ceil(d.incidents / 10 - d.counselors)} counselor(s)</span></li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="DBT Relief Fund Monitor" subtitle="Stage-wise pipeline · Rule 12(4) SC/ST (PoA) Rules 1995" action={<Banknote className="h-4 w-4 text-slate-400" />}>
          <div className="h-56">
            <ResponsiveContainer><BarChart data={DBT_FUNNEL} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
              <XAxis type="number" hide /><YAxis type="category" dataKey="stage" tick={{ fontSize: 11 }} width={130} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v: number, n: string) => (n === 'count' ? [`${v} cases`, 'Cases'] : [v, n])} />
              <Bar dataKey="count" radius={[0, 10, 10, 0]} isAnimationActive label={{ position: 'right', fontSize: 11 }}>{DBT_FUNNEL.map((_, i) => <Cell key={i} fill={['#134E4A', '#1F6F69', '#6366F1', '#10B981'][i]} />)}</Bar>
            </BarChart></ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs mt-2">
            <div className="rounded-xl bg-trust-50 dark:bg-white/5 p-2.5"><p className="label">Conversion</p><p className="font-bold text-base">{Math.round(152 / 303 * 100)}%</p><p className="text-slate-500">FIR → credited</p></div>
            <div className="rounded-xl bg-trust-50 dark:bg-white/5 p-2.5"><p className="label">Median cycle</p><p className="font-bold text-base">41 d</p><p className="text-slate-500">target 30 d</p></div>
            <div className="rounded-xl bg-risk-mod/10 p-2.5"><p className="label">Stuck &gt; 30 d</p><p className="font-bold text-base text-risk-mod">36</p><p className="text-slate-500">at DM sanction</p></div>
          </div>
        </Card>
        <Card title="District league table" subtitle="Sorted by first-response SLA">
          <div className="overflow-x-auto"><table className="w-full text-xs">
            <thead className="text-left text-slate-500"><tr><th className="py-1.5">District</th><th>Cases</th><th>Response</th><th>Ratio</th><th>Recovery</th></tr></thead>
            <tbody>{[...DISTRICTS].sort((a, b) => a.responseHrs - b.responseHrs).map((d) => (
              <tr key={d.name} className="border-t border-trust-100 dark:border-white/10"><td className="py-1.5 font-semibold">{d.name} <span className="text-slate-400">{d.state}</span></td><td>{d.incidents}</td><td className={d.responseHrs > 4 ? 'text-risk-high font-bold' : 'text-risk-low font-bold'}>{d.responseHrs} h</td><td>{Math.round(d.incidents / d.counselors)}:1</td>
                <td><div className="flex items-center gap-1.5"><div className="h-1.5 w-16 rounded-full bg-trust-50 dark:bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-trust-600" style={{ width: `${d.avgRecovery}%` }} /></div>{d.avgRecovery}%</div></td></tr>
            ))}</tbody>
          </table></div>
        </Card>
      </div>

      <Card title="Tamper-evident audit ledger" subtitle="Every clinical file access across the district — read-only at this tier"><AuditTable /></Card>
    </div>
  );
}
