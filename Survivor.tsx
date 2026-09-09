import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, AlertTriangle, BellRing, Check, FileText, Heart, Mic, MessageCircleHeart, Moon, Phone, Scale, Send, Shield, Siren, Sparkles, Wallet, X } from 'lucide-react';
import { useStore, speak } from '@/lib/store';
import { t } from '@/lib/i18n';
import { BreathingBubble, Card, Pipeline } from '@/components/ui';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ChatMessage } from '@/lib/types';
import { OPENER, respond } from '@/lib/pfa';
import { DBT_STAGES, LEGAL_STAGES, PATIENTS } from '@/data/mock';
import { scrubText } from '@/lib/sanitize';
import { AiConfig, analyseTranscript, askLive, loadAiConfig } from '@/lib/ai';
import { AcousticFrame, BCP47, Prosody, detectPitch, getRecognition, rms, summarise } from '@/lib/speech';
import { AiSettings } from '@/components/AiSettings';

type Tab = 'home' | 'checkin' | 'voice' | 'companion' | 'relief';

export function SurvivorPortal() {
  const { lang, voiceNav } = useStore();
  const [tab, setTab] = useState<Tab>('home');
  useEffect(() => { if (voiceNav) speak(t(lang, 'welcome'), lang); }, [lang, voiceNav]);

  const tabs: { id: Tab; label: string; icon: typeof Heart }[] = [
    { id: 'home', label: 'Home', icon: Heart },
    { id: 'checkin', label: t(lang, 'checkin'), icon: Activity },
    { id: 'voice', label: t(lang, 'voiceJournal'), icon: Mic },
    { id: 'companion', label: t(lang, 'companion'), icon: MessageCircleHeart },
    { id: 'relief', label: t(lang, 'relief'), icon: Scale },
  ];

  return (
    <div className="mx-auto max-w-3xl pb-28">
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.3 }}>
          <ErrorBoundary label="Survivor section">
            {tab === 'home' && <Home go={setTab} />}
            {tab === 'checkin' && <CheckIn done={() => setTab('home')} />}
            {tab === 'voice' && <VoiceJournal />}
            {tab === 'companion' && <Companion />}
            {tab === 'relief' && <Relief />}
          </ErrorBoundary>
        </motion.div>
      </AnimatePresence>

      <SOS />

      {/* Bottom nav (mobile-first) */}
      <nav aria-label="Survivor navigation" className="fixed bottom-0 inset-x-0 z-30 border-t border-trust-100 dark:border-white/10 bg-alabaster/95 dark:bg-obsidian/95 backdrop-blur">
        <div className="mx-auto max-w-3xl flex">
          {tabs.map((tb) => (
            <button key={tb.id} onClick={() => setTab(tb.id)} aria-current={tab === tb.id ? 'page' : undefined}
              className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 text-[11px] font-semibold ${tab === tb.id ? 'text-trust-700 dark:text-trust-200' : 'text-slate-500'}`}>
              <tb.icon className={`h-5 w-5 ${tab === tb.id ? 'scale-110' : ''} transition`} />
              <span className="truncate max-w-[70px]">{tb.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function Home({ go }: { go: (t: Tab) => void }) {
  const { lang } = useStore();
  const me = PATIENTS[0];
  const streak = 6;
  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-trust-800 via-trust-700 to-comfort-500 p-6 text-white shadow-soft">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 animate-breathe" aria-hidden />
        <p className="text-xs uppercase tracking-widest text-white/70">Good evening</p>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight">{t(lang, 'welcome')}</h1>
        <p className="mt-2 text-sm text-white/85 max-w-md">{t(lang, 'subtitle')}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="chip bg-white/15 text-white"><Shield className="h-3 w-3" />Identity: {me.id}</span>
          <span className="chip bg-white/15 text-white"><Sparkles className="h-3 w-3" />{streak}-day check-in streak</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'checkin' as Tab, icon: Activity, title: t(lang, 'checkin'), desc: '2 minutes · 3 gentle questions', c: 'from-trust-500 to-trust-700' },
          { id: 'voice' as Tab, icon: Mic, title: t(lang, 'voiceJournal'), desc: 'Say how you feel, in your language', c: 'from-comfort-400 to-comfort-600' },
          { id: 'companion' as Tab, icon: MessageCircleHeart, title: t(lang, 'companion'), desc: 'Always here, never judging', c: 'from-emerald-400 to-trust-600' },
          { id: 'relief' as Tab, icon: Scale, title: t(lang, 'relief'), desc: 'FIR · Legal aid · Compensation', c: 'from-amber-400 to-orange-500' },
        ].map((a, i) => (
          <motion.button key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i }} onClick={() => go(a.id)}
            className="card p-4 text-left hover:-translate-y-0.5 transition group">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${a.c} grid place-items-center text-white mb-3 group-hover:scale-105 transition`}><a.icon className="h-5 w-5" /></div>
            <p className="font-bold text-sm">{a.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{a.desc}</p>
          </motion.button>
        ))}
      </div>

      <Card title="Your week, gently" subtitle="Only you and your counselor can see this">
        <div className="flex items-end gap-1.5 h-20" role="img" aria-label="Seven day mood sparkline">
          {me.telemetry.slice(-7).map((p, i) => (
            <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${p.mood}%` }} transition={{ delay: i * 0.05, duration: 0.6 }} className="flex-1 rounded-t-lg bg-gradient-to-t from-trust-600 to-comfort-400" title={`${p.date}: ${p.mood}`} />
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-comfort-500/10 p-3 text-sm flex gap-2">
          <BellRing className="h-4 w-4 text-comfort-500 shrink-0 mt-0.5" />
          <p>Your counselor <b>Dr. R. Iyer</b> noticed the last few nights have been hard and has set a check-in for <b>today, 6:30 PM</b>. You can reschedule anytime.</p>
        </div>
      </Card>

      <blockquote className="text-center px-6 py-4 font-serif italic text-trust-700 dark:text-trust-200">"{t(lang, 'quote')}"</blockquote>
    </div>
  );
}

function CheckIn({ done }: { done: () => void }) {
  const { lang, notify, log, voiceNav } = useStore();
  const [sleep, setSleep] = useState(3);
  const [safety, setSafety] = useState(3);
  const [weight, setWeight] = useState(3);
  const [mood, setMood] = useState<string | null>(null);
  const moods = [{ e: '🌧️', l: 'Heavy' }, { e: '🌫️', l: 'Foggy' }, { e: '⛅', l: 'Mixed' }, { e: '🌤️', l: 'Lighter' }, { e: '☀️', l: 'Bright' }];
  useEffect(() => { if (voiceNav) speak(t(lang, 'sleep'), lang); }, [lang, voiceNav]);

  const submit = () => {
    sessionStorage.setItem('sanj.checkin', JSON.stringify({ sleep, safety, weight, mood, ts: Date.now() }));
    log('CHECKIN_SUBMITTED', 'self/pulse');
    notify('Thank you. Your check-in is saved privately.');
    done();
  };

  const Slider = ({ label, icon: Icon, value, set, lo, hi }: { label: string; icon: typeof Moon; value: number; set: (n: number) => void; lo: string; hi: string }) => (
    <div>
      <label className="flex items-center gap-2 font-semibold text-sm mb-2"><Icon className="h-4 w-4 text-trust-600" />{label}</label>
      <input type="range" min={1} max={5} value={value} onChange={(e) => set(+e.target.value)} aria-valuetext={`${value} of 5`} className="w-full accent-trust-600 h-2" />
      <div className="flex justify-between text-[11px] text-slate-500 mt-1"><span>{lo}</span><span>{hi}</span></div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card title={t(lang, 'checkin')} subtitle="There are no wrong answers. Take your time.">
        <p className="label mb-2">Mood wheel</p>
        <div className="grid grid-cols-5 gap-2 mb-6" role="radiogroup" aria-label="Mood">
          {moods.map((m) => (
            <button key={m.l} role="radio" aria-checked={mood === m.l} onClick={() => setMood(m.l)}
              className={`rounded-2xl py-3 flex flex-col items-center gap-1 border transition ${mood === m.l ? 'border-comfort-500 bg-comfort-500/10 scale-105' : 'border-trust-100 dark:border-white/10 hover:bg-trust-50 dark:hover:bg-white/5'}`}>
              <span className="text-2xl" aria-hidden>{m.e}</span><span className="text-[11px] font-semibold">{m.l}</span>
            </button>
          ))}
        </div>
        <div className="space-y-6">
          <Slider label={t(lang, 'sleep')} icon={Moon} value={sleep} set={setSleep} lo="Barely slept" hi="Rested" />
          <Slider label={t(lang, 'safety')} icon={Shield} value={safety} set={setSafety} lo="Not at all" hi="Very safe" />
          <Slider label={t(lang, 'weight')} icon={Heart} value={weight} set={setWeight} lo="Very heavy" hi="Light" />
        </div>
        <button className="btn-primary w-full mt-6 py-3" onClick={submit}><Check className="h-4 w-4" />{t(lang, 'submit')}</button>
      </Card>
      {safety <= 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-4 border-l-4 border-risk-mod">
          <p className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-risk-mod" />You said you don't feel very safe.</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">If there is an immediate threat, the SOS button (bottom-right) can quietly reach your social worker. You decide.</p>
        </motion.div>
      )}
    </div>
  );
}

/** Real-time voice journal: live STT (Web Speech API) + acoustic feature extraction (Web Audio) */
function VoiceJournal() {
  const { lang, consent, log, notify } = useStore();
  const [rec, setRec] = useState(false);
  const [secs, setSecs] = useState(0);
  const [finalText, setFinalText] = useState('');
  const [interim, setInterim] = useState('');
  const [livePitch, setLivePitch] = useState<number | null>(null);
  const [result, setResult] = useState<null | (Prosody & { transcript: string; redactions: number })>(null);
  const [aiRead, setAiRead] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [sttSupported] = useState(() => !!getRecognition());
  const [micError, setMicError] = useState<string | null>(null);
  const [aiCfg, setAiCfg] = useState<AiConfig | null>(() => loadAiConfig());

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>();
  const analyser = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const recog = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const frames = useRef<AcousticFrame[]>([]);
  const startedAt = useRef(0);
  const finalRef = useRef('');

  useEffect(() => () => teardown(), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!rec) return; const id = setInterval(() => setSecs((s) => s + 1), 1000); return () => clearInterval(id); }, [rec]);

  const draw = () => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const W = c.width, H = c.height; ctx.clearRect(0, 0, W, H);
    const bars = 48, gap = 3, bw = (W - gap * (bars - 1)) / bars;
    let data: number[] = [];
    const an = analyser.current;
    if (an) {
      const freq = new Uint8Array(an.frequencyBinCount); an.getByteFrequencyData(freq);
      data = Array.from({ length: bars }, (_, i) => freq[Math.floor((i * freq.length) / bars / 2)] / 255);
      const td = new Float32Array(an.fftSize); an.getFloatTimeDomainData(td);
      const f = { rms: rms(td), pitchHz: detectPitch(td, ctxRef.current?.sampleRate ?? 48000) };
      frames.current.push(f);
      if (frames.current.length % 6 === 0) setLivePitch(f.pitchHz ? Math.round(f.pitchHz) : null);
    } else { data = Array.from({ length: bars }, () => 0.05); }
    const grad = ctx.createLinearGradient(0, 0, W, 0); grad.addColorStop(0, '#134E4A'); grad.addColorStop(1, '#818CF8'); ctx.fillStyle = grad;
    data.forEach((v, i) => { const h = Math.max(4, v * H); ctx.beginPath(); ctx.roundRect(i * (bw + gap), (H - h) / 2, bw, h, 3); ctx.fill(); });
    raf.current = requestAnimationFrame(draw);
  };

  const teardown = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    try { recog.current?.stop(); } catch { /* noop */ }
    recog.current = null;
    stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null;
    ctxRef.current?.close().catch(() => undefined); ctxRef.current = null; analyser.current = null;
  };

  const start = async () => {
    setResult(null); setAiRead(null); setFinalText(''); setInterim(''); finalRef.current = ''; frames.current = []; setMicError(null); setSecs(0);
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const ac = new AudioContext(); ctxRef.current = ac;
      const an = ac.createAnalyser(); an.fftSize = 2048; an.smoothingTimeConstant = 0.6;
      ac.createMediaStreamSource(stream.current).connect(an); analyser.current = an;
    } catch (e) {
      const err = e as DOMException;
      const framed = window.self !== window.top;
      const insecure = !window.isSecureContext;
      setMicError(
        framed ? 'Microphone is blocked inside the embedded preview frame. Open this app in its own browser tab (use the “open in new tab” button) and try again.'
        : insecure ? 'Microphone needs a secure (https) page. Open the app over https or on localhost.'
        : err?.name === 'NotFoundError' ? 'No microphone was found on this device.'
        : err?.name === 'NotAllowedError' ? 'Microphone permission was denied. Click the lock/camera icon in the address bar → allow Microphone → reload.'
        : `Microphone unavailable: ${err?.message ?? 'unknown error'}`);
      return;
    }
    const SR = getRecognition();
    if (SR) {
      const r = new SR(); r.lang = BCP47[lang]; r.continuous = true; r.interimResults = true;
      r.onresult = (ev: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        let inter = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) { const t = ev.results[i][0].transcript; if (ev.results[i].isFinal) { finalRef.current += t + ' '; setFinalText(finalRef.current); } else inter += t; }
        setInterim(inter);
      };
      r.onerror = (ev: any) => { if (ev.error !== 'no-speech' && ev.error !== 'aborted') setMicError(`Speech recognition: ${ev.error}`); }; // eslint-disable-line @typescript-eslint/no-explicit-any
      r.onend = () => { if (recog.current === r && stream.current) { try { r.start(); } catch { /* noop */ } } };
      recog.current = r; try { r.start(); } catch { /* noop */ }
    }
    startedAt.current = Date.now(); setRec(true); draw();
  };

  const finish = async () => {
    const seconds = (Date.now() - startedAt.current) / 1000;
    const transcriptRaw = (finalRef.current + ' ' + interim).trim();
    teardown(); setRec(false); setInterim('');
    const { clean, redactions } = scrubText(transcriptRaw);
    const words = clean ? clean.split(/\s+/).length : 0;
    const pros = summarise(frames.current, words, seconds);
    const res = { ...pros, transcript: clean || (sttSupported ? '(no speech detected)' : '(live transcription not supported in this browser — acoustic features only)'), redactions };
    setResult(res);
    log('VOICE_JOURNAL', `prosody=${consent?.voiceProsody ? 'Y' : 'N'};stt=${sttSupported ? 'Y' : 'N'};dur=${Math.round(seconds)}s;redact=${redactions}`);
    if (redactions) notify(`${redactions} personal identifier(s) removed from transcript.`);
    if (aiCfg && clean) {
      setAiBusy(true);
      try { setAiRead(await analyseTranscript(aiCfg, clean, { wpm: pros.wpm, pitchVar: pros.pitchVar, energy: pros.energy })); }
      catch (e) { setAiRead(`Live model unavailable (${(e as Error).message.slice(0, 80)}). Showing on-device read only.`); }
      finally { setAiBusy(false); }
    }
  };

  return (
    <div className="space-y-4">
      <Card title={t(lang, 'voiceJournal')} subtitle="Speak in your language. Transcription & tone analysis happen live." action={<AiSettings onChange={setAiCfg} />}>
        <div className="rounded-2xl bg-trust-50 dark:bg-white/5 p-4">
          <canvas ref={canvasRef} width={600} height={120} className="w-full h-24" aria-hidden />
          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            <span aria-live="polite">{rec ? `● Recording ${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}` : 'Ready'}{rec && livePitch ? ` · pitch ${livePitch} Hz` : ''}</span>
            <span>{sttSupported ? 'Live STT' : 'STT unavailable'} · {BCP47[lang]}</span>
          </div>
        </div>
        <div className="mt-3 min-h-[56px] rounded-xl border border-dashed border-trust-200 dark:border-white/10 p-3 text-sm" aria-live="polite">
          {rec || finalText ? (<p>{finalText}<span className="text-slate-400">{interim}</span>{rec && <span className="inline-block w-1.5 h-4 bg-comfort-500 ml-0.5 animate-pulse align-middle" />}</p>) : <p className="text-slate-400">Your words will appear here as you speak…</p>}
        </div>
        <div className="mt-5 grid place-items-center">
          <motion.button whileTap={{ scale: 0.95 }} onClick={rec ? finish : start} aria-pressed={rec}
            className={`relative h-20 w-20 rounded-full grid place-items-center text-white shadow-soft ${rec ? 'bg-risk-high' : 'bg-gradient-to-br from-trust-600 to-comfort-500'}`}>
            {rec && <span className="absolute inset-0 rounded-full bg-risk-high/40 animate-ping" />}
            {rec ? <X className="h-7 w-7 relative" /> : <Mic className="h-7 w-7" />}
          </motion.button>
          <p className="mt-3 text-sm font-semibold">{rec ? t(lang, 'recording') : t(lang, 'startRecording')}</p>
        </div>
        {micError && <p className="mt-3 text-xs text-center text-risk-high" role="alert">{micError}</p>}
        {!micError && window.self !== window.top && <p className="mt-3 text-xs text-center text-risk-mod">Heads-up: embedded previews block the microphone. Open the app in a new tab for live recording.</p>}
        {!sttSupported && <p className="mt-3 text-xs text-center text-risk-mod">Live transcription needs Chrome / Edge / Safari. Acoustic analysis still works here.</p>}
        {!consent?.voiceProsody && <p className="mt-3 text-xs text-center text-risk-mod">Voice tone processing is switched off in your consent settings.</p>}
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card title="What we heard" subtitle="Computed on this device from your actual voice · shared with your counselor only">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                {[{ l: 'Speech pace', v: `${result.wpm} wpm` }, { l: 'Mean pitch', v: result.pitchMeanHz ? `${result.pitchMeanHz} Hz` : '—' }, { l: 'Pitch variance', v: `${result.pitchVar}%` }, { l: 'Vocal energy', v: `${result.energy}%` }, { l: 'Pause ratio', v: `${result.pauseRatio}%` }].map((m) => (
                  <div key={m.l} className="rounded-xl bg-trust-50 dark:bg-white/5 p-3"><p className="text-base font-extrabold text-trust-800 dark:text-trust-100">{m.v}</p><p className="text-[11px] text-slate-500">{m.l}</p></div>
                ))}
              </div>
              <p className="mt-3 text-sm"><span className="label">Acoustic tone: </span><span className="font-semibold">{result.tone}</span></p>
              <div className="mt-3 rounded-xl border border-dashed border-trust-200 dark:border-white/10 p-3 text-sm">
                <p className="label mb-1">Transcript {result.redactions > 0 && `· ${result.redactions} PII redaction(s)`}</p>
                <p className="font-serif italic">"{result.transcript}"</p>
              </div>
              <div className="mt-3 rounded-xl bg-comfort-500/10 p-3 text-sm">
                <p className="label mb-1 flex items-center gap-1"><Sparkles className="h-3 w-3" />{aiCfg ? `Reflection · ${aiCfg.model}` : 'Reflection · on-device'}</p>
                {aiBusy ? <p className="text-slate-500 animate-pulse">Listening back to what you shared…</p>
                  : aiRead ? <p>{aiRead}</p>
                  : <p>{result.tone === 'Steady' ? 'You sound fairly steady today. Thank you for taking a moment to check in.' : `It sounds like today carries some weight — your voice tells us that gently. Would you like to talk with the companion, or breathe together for a minute?`}{!aiCfg && <span className="block text-xs text-slate-500 mt-1">Connect a live model (top-right) for a personalised reflection on your words.</span>}</p>}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Companion() {
  const { log, notify } = useStore();
  const [msgs, setMsgs] = useState<ChatMessage[]>([OPENER]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [crisis, setCrisis] = useState(false);
  const [aiCfg, setAiCfg] = useState<AiConfig | null>(() => loadAiConfig());
  const [lastErr, setLastErr] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing, breathing]);

  const send = async (text = input) => {
    if (!text.trim() || typing) return;
    const { clean, redactions } = scrubText(text);
    const history = msgs;
    setMsgs((m) => [...m, { id: `u-${Date.now()}`, from: 'user', text: clean, ts: new Date().toISOString() }]);
    setInput(''); setTyping(true); setLastErr(null);
    if (redactions) notify(`${redactions} personal identifier(s) removed before processing.`);

    // 1) Deterministic safety classifier ALWAYS runs first (guardrail, not model-dependent)
    const local = respond(clean);
    if (local.escalate) {
      setCrisis(true); setBreathing(true); log('PFA_ESCALATION', 'companion/crisis-classifier');
      setTimeout(() => { setMsgs((m) => [...m, local.reply]); setTyping(false); }, 600);
      return;
    }
    // 2) Live model when configured
    if (aiCfg) {
      abort.current?.abort(); abort.current = new AbortController();
      try {
        const r = await askLive(aiCfg, history, clean, abort.current.signal);
        setMsgs((m) => [...m, { id: `ai-${Date.now()}`, from: 'ai', text: r.text, ts: new Date().toISOString(), tone: local.breathing ? 'concern' : 'calm' }]);
        if (local.breathing) setBreathing(true);
        log('PFA_LIVE_REPLY', `${r.provider}/${r.model}`);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') { setLastErr((e as Error).message); setMsgs((m) => [...m, local.reply]); if (local.breathing) setBreathing(true); }
      } finally { setTyping(false); }
      return;
    }
    // 3) Offline PFA engine fallback
    setTimeout(() => { setMsgs((m) => [...m, local.reply]); setTyping(false); if (local.breathing) setBreathing(true); }, 900 + Math.random() * 600);
  };

  const quick = ["I couldn't sleep again", "I feel scared they'll come back", 'I feel hopeless', 'Today was a bit better'];

  return (
    <div className="space-y-3">
      <Card className="!p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-trust-100 dark:border-white/10 flex items-center gap-3 flex-wrap">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-comfort-400 to-trust-600 grid place-items-center"><MessageCircleHeart className="h-5 w-5 text-white" /></div>
          <div><p className="font-bold text-sm">Safe Harbor</p><p className="text-[11px] text-slate-500">PFA-guided · Human handoff always available</p></div>
          <div className="ml-auto flex gap-1.5 flex-wrap"><span className="chip bg-risk-low/10 text-risk-low"><Shield className="h-3 w-3" />PII shield on</span><AiSettings onChange={setAiCfg} /></div>
        </div>
        <div className="h-[46vh] overflow-y-auto p-4 space-y-3" role="log" aria-live="polite">
          {msgs.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line leading-relaxed ${m.from === 'user' ? 'bg-trust-700 text-white rounded-br-md' : m.tone === 'crisis' ? 'bg-risk-high/10 border border-risk-high/30 rounded-bl-md' : 'bg-trust-50 dark:bg-white/5 rounded-bl-md'}`}>{m.text}</div>
            </motion.div>
          ))}
          {typing && <div className="flex gap-1 pl-2" aria-label="Companion is typing">{[0, 1, 2].map((i) => <motion.span key={i} className="h-2 w-2 rounded-full bg-trust-400" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }} />)}</div>}
          {lastErr && <p className="text-[11px] text-risk-mod pl-2">Live model error — fell back to on-device engine: {lastErr.slice(0, 120)}</p>}
          <AnimatePresence>
            {breathing && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="rounded-2xl bg-comfort-500/10 p-2 relative">
                <button className="absolute right-2 top-2 btn-ghost px-2 py-1 text-xs" onClick={() => setBreathing(false)}>Done</button>
                <BreathingBubble />
              </motion.div>
            )}
            {crisis && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-risk-high/30 p-4 space-y-2">
                <p className="text-sm font-bold flex items-center gap-2"><Heart className="h-4 w-4 text-risk-high" />You deserve a human by your side right now</p>
                <div className="grid sm:grid-cols-3 gap-2">
                  <a href="tel:14416" className="btn-primary text-xs"><Phone className="h-4 w-4" />Tele-MANAS 14416</a>
                  <button className="btn-comfort text-xs" onClick={() => { log('COUNSELOR_ALERT', 'silent'); notify('Dr. R. Iyer has been alerted silently.'); }}><BellRing className="h-4 w-4" />Alert my counselor</button>
                  <a href="tel:112" className="btn bg-risk-high text-white text-xs"><Siren className="h-4 w-4" />Emergency 112</a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={endRef} />
        </div>
        <div className="p-3 border-t border-trust-100 dark:border-white/10">
          <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
            {quick.map((q) => <button key={q} onClick={() => send(q)} className="chip whitespace-nowrap bg-trust-50 dark:bg-white/5 hover:bg-trust-100 border border-trust-100 dark:border-white/10">{q}</button>)}
          </div>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} className="input" placeholder={aiCfg ? `Talk to Safe Harbor (live · ${aiCfg.model})…` : 'Type anything… (connect a model above for live replies)'} aria-label="Message" />
            <button className="btn-primary px-3" aria-label="Send" disabled={typing}><Send className="h-4 w-4" /></button>
          </form>
        </div>
      </Card>
      <p className="text-[11px] text-center text-slate-500">Safe Harbor is not a replacement for a clinician. In an emergency, call 112.</p>
    </div>
  );
}

function Relief() {
  const me = PATIENTS[0];
  const timeline = [
    { d: '14 Jul', t: 'FIR registered u/s 3(1)(r) SC/ST (PoA) Act', ok: true },
    { d: '16 Jul', t: 'Case referred to DSP-rank Investigating Officer (Rule 7)', ok: true },
    { d: '21 Jul', t: 'First instalment of relief (25%) sanctioned — ₹1,00,000', ok: true },
    { d: '02 Aug', t: 'Medico-legal verification completed', ok: true },
    { d: 'Pending', t: 'District Magistrate sanction for 2nd instalment (50%)', ok: false },
    { d: '—', t: 'DBT credit to Aadhaar-linked account', ok: false },
  ];
  return (
    <div className="space-y-4">
      <Card title="Legal aid · SC/ST (PoA) Act 1989" subtitle={`${me.firNumber} · Special Court, ${me.district}`} action={<span className="chip bg-comfort-500/10 text-comfort-500"><Scale className="h-3 w-3" />DLSA advocate assigned</span>}>
        <Pipeline stages={LEGAL_STAGES} current={me.legalStage} />
        <div className="mt-4 rounded-xl bg-trust-50 dark:bg-white/5 p-3 text-sm flex gap-3">
          <FileText className="h-4 w-4 text-trust-600 shrink-0 mt-0.5" />
          <div><p className="font-semibold">Next hearing: 18 Sep 2026, 11:00 AM</p><p className="text-xs text-slate-500 mt-0.5">Adv. Meena Kamble (DLSA) will accompany you. Travel & maintenance allowance under Rule 11 is claimable — tap to pre-fill.</p></div>
        </div>
      </Card>
      <Card title="Victim Compensation & Relief (DBT)" subtitle="Under Rule 12(4) & State Victim Compensation Scheme" action={<span className="chip bg-risk-low/10 text-risk-low"><Wallet className="h-3 w-3" />₹1,00,000 credited</span>}>
        <Pipeline stages={DBT_STAGES} current={me.reliefStage + 1} />
        <ol className="mt-5 space-y-3">
          {timeline.map((e, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className={`mt-1 h-3 w-3 rounded-full shrink-0 ${e.ok ? 'bg-trust-600' : 'bg-slate-300 dark:bg-white/20'}`} />
              <div><p className={e.ok ? '' : 'text-slate-500'}>{e.t}</p><p className="text-[11px] text-slate-400">{e.d}</p></div>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-slate-500">Delay flagged: DM sanction pending 38 days (SLA 30). Nodal officer has been auto-notified.</p>
      </Card>
    </div>
  );
}

/** Silent SOS Beacon with 10s cancellation grace window */
function SOS() {
  const { lang, log, notify, consent } = useStore();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<null | 'silent' | 'dispatch'>(null);
  const [count, setCount] = useState(10);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!mode || sent) return;
    if (count <= 0) { setSent(true); log(mode === 'silent' ? 'SOS_SILENT_ALERT' : 'SOS_EMERGENCY_DISPATCH', consent?.geoDispatch ? 'geo=5km-generalised' : 'geo=withheld'); return; }
    const id = setTimeout(() => setCount((c) => c - 1), 1000); return () => clearTimeout(id);
  }, [mode, count, sent, log, consent]);

  const reset = () => { setMode(null); setCount(10); setSent(false); setOpen(false); };

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label={t(lang, 'sos')} className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full bg-gradient-to-br from-rose-500 to-risk-high text-white shadow-soft grid place-items-center hover:scale-105 transition">
        <Siren className="h-6 w-6" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 bg-trust-900/50 backdrop-blur-sm grid place-items-end sm:place-items-center p-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={reset}>
            <motion.div role="dialog" aria-modal="true" aria-label="Emergency options" onClick={(e) => e.stopPropagation()} initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} className="card w-full max-w-md p-5">
              {!mode ? (
                <>
                  <h2 className="font-bold text-lg">{t(lang, 'sos')}</h2>
                  <p className="text-sm text-slate-500 mt-1">Choose what feels right. Nothing is sent until a 10-second countdown ends — you can cancel anytime.</p>
                  <button onClick={() => setMode('silent')} className="mt-4 w-full card p-4 text-left hover:border-comfort-400 flex gap-3">
                    <BellRing className="h-6 w-6 text-comfort-500 shrink-0" />
                    <div><p className="font-bold text-sm">Silent alert to social worker</p><p className="text-xs text-slate-500">No sound, no visible change. Ms. P. Nayak gets a discreet ping and calls you back as a "friend".</p></div>
                  </button>
                  <button onClick={() => setMode('dispatch')} className="mt-2 w-full card p-4 text-left hover:border-risk-high flex gap-3">
                    <Siren className="h-6 w-6 text-risk-high shrink-0" />
                    <div><p className="font-bold text-sm">Emergency police & medical dispatch</p><p className="text-xs text-slate-500">ERSS 112 + nearest PHC alerted with your approximate (5 km) location{consent?.geoDispatch ? '' : ' — location sharing is currently off'}.</p></div>
                  </button>
                  <button className="btn-ghost w-full mt-3" onClick={reset}>Not now</button>
                </>
              ) : !sent ? (
                <div className="text-center py-2">
                  <div className="relative mx-auto h-28 w-28">
                    <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90"><circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" className="text-trust-100 dark:text-white/10" strokeWidth="8" /><motion.circle cx="50" cy="50" r="44" fill="none" stroke={mode === 'silent' ? '#6366F1' : '#E11D48'} strokeWidth="8" strokeLinecap="round" strokeDasharray={276} animate={{ strokeDashoffset: 276 * (1 - count / 10) }} transition={{ duration: 1, ease: 'linear' }} /></svg>
                    <span className="absolute inset-0 grid place-items-center text-3xl font-extrabold" aria-live="assertive">{count}</span>
                  </div>
                  <p className="mt-3 font-semibold">{mode === 'silent' ? 'Sending silent alert…' : 'Dispatching emergency services…'}</p>
                  <button className="btn bg-slate-200 dark:bg-white/10 w-full mt-4 py-3" onClick={reset}><X className="h-4 w-4" />Cancel — I'm okay</button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="mx-auto h-14 w-14 rounded-full bg-risk-low/15 grid place-items-center"><Check className="h-7 w-7 text-risk-low" /></div>
                  <p className="mt-3 font-bold">{mode === 'silent' ? 'Ms. P. Nayak has been alerted.' : 'Help is on the way.'}</p>
                  <p className="text-sm text-slate-500 mt-1">{mode === 'silent' ? 'Expect a call within 10 minutes. Screen will look normal.' : 'ERSS ref #DL-2026-88213 · ETA ≈ 14 min. Stay where you feel safest.'}</p>
                  <button className="btn-primary w-full mt-4" onClick={() => { reset(); notify('You can reach out again anytime.'); }}>Close</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
