import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';

/** Fully functional scientific calculator decoy. Long-press "=" (1.5s) reveals PIN pad. */
export function Decoy() {
  const { exitStealth } = useStore();
  const [expr, setExpr] = useState('');
  const [out, setOut] = useState('0');
  const [pinMode, setPinMode] = useState(false);
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);
  const [pressT, setPressT] = useState<number | null>(null);

  useEffect(() => { document.title = 'Simple Calculator'; }, []);

  const evalSafe = () => {
    try {
      const s = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/π/g, 'Math.PI').replace(/√\(/g, 'Math.sqrt(').replace(/sin\(/g, 'Math.sin(').replace(/cos\(/g, 'Math.cos(').replace(/tan\(/g, 'Math.tan(').replace(/log\(/g, 'Math.log10(').replace(/ln\(/g, 'Math.log(').replace(/\^/g, '**');
      if (!/^[0-9+\-*/().\sMathPIsqrtincoalg0-9e*]+$/.test(s)) throw new Error();
      // eslint-disable-next-line no-new-func
      const v = Function(`"use strict";return (${s})`)() as number;
      setOut(Number.isFinite(v) ? String(+v.toFixed(10)) : 'Error');
    } catch { setOut('Error'); }
  };

  const keys = ['sin(', 'cos(', 'tan(', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '(', ')', 'π', '√(', '^', 'log('];

  const tryPin = (d: string) => {
    const p = pin + d;
    if (p.length < 4) { setPin(p); return; }
    if (!exitStealth(p)) { setErr(true); setPin(''); setTimeout(() => setErr(false), 800); }
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-neutral-800 shadow-2xl p-5">
        <h1 className="text-sm font-semibold text-neutral-500 mb-3">Calculator</h1>
        {!pinMode ? (
          <>
            <div className="rounded-2xl bg-neutral-100 dark:bg-neutral-700 p-4 text-right mb-3 min-h-[92px]">
              <div className="text-xs text-neutral-500 break-all min-h-[16px]">{expr || ' '}</div>
              <div className="text-3xl font-bold text-neutral-900 dark:text-white break-all">{out}</div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button className="col-span-2 rounded-xl bg-red-100 text-red-700 py-3 font-semibold" onClick={() => { setExpr(''); setOut('0'); }}>AC</button>
              <button className="col-span-2 rounded-xl bg-neutral-200 dark:bg-neutral-700 dark:text-white py-3 font-semibold" onClick={() => setExpr((e) => e.slice(0, -1))}>⌫</button>
              {keys.map((k) => (
                <button key={k} className="rounded-xl bg-neutral-100 dark:bg-neutral-700 dark:text-white py-3 font-medium text-sm hover:bg-neutral-200" onClick={() => setExpr((e) => e + k)}>{k.replace('(', '')}</button>
              ))}
              <button className="col-span-4 rounded-xl bg-blue-600 text-white py-3 font-bold select-none"
                onPointerDown={() => setPressT(Date.now())}
                onPointerUp={() => { if (pressT && Date.now() - pressT > 1500) setPinMode(true); else evalSafe(); setPressT(null); }}
                onPointerLeave={() => setPressT(null)}>=</button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-sm text-neutral-500 mb-4">Enter PIN</p>
            <div className={`flex justify-center gap-3 mb-5 ${err ? 'animate-pulse' : ''}`}>
              {[0, 1, 2, 3].map((i) => <span key={i} className={`h-3 w-3 rounded-full ${i < pin.length ? (err ? 'bg-red-500' : 'bg-blue-600') : 'bg-neutral-300'}`} />)}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '←'].map((k, i) => (
                <button key={i} disabled={!k} className="rounded-xl bg-neutral-100 dark:bg-neutral-700 dark:text-white py-3 font-semibold disabled:opacity-0"
                  onClick={() => (k === '←' ? setPin((p) => p.slice(0, -1)) : tryPin(k))}>{k}</button>
              ))}
            </div>
            <button className="mt-4 text-xs text-neutral-400" onClick={() => { setPinMode(false); setPin(''); }}>Back</button>
          </div>
        )}
      </div>
    </div>
  );
}
