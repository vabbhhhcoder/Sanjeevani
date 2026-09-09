/**
 * Real-time speech capture: Web Speech API (STT) + Web Audio feature extraction.
 * Bhashini ASR would replace SpeechRecognition in production via the same interface.
 */
import { Lang } from './types';

export const BCP47: Record<Lang, string> = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN' };

type SR = typeof window extends { SpeechRecognition: infer T } ? T : any; // eslint-disable-line @typescript-eslint/no-explicit-any
export function getRecognition(): SR | null {
  const w = window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface AcousticFrame { rms: number; pitchHz: number | null }

/** Autocorrelation pitch detector (80–400 Hz band) on a time-domain frame. */
export function detectPitch(buf: Float32Array, sampleRate: number): number | null {
  let rms = 0; for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / buf.length);
  if (rms < 0.01) return null;
  const minLag = Math.floor(sampleRate / 400), maxLag = Math.floor(sampleRate / 80);
  let best = -1, bestCorr = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let c = 0; for (let i = 0; i < buf.length - lag; i++) c += buf[i] * buf[i + lag];
    if (c > bestCorr) { bestCorr = c; best = lag; }
  }
  return best > 0 && bestCorr > 0.3 ? sampleRate / best : null;
}

export function rms(buf: Float32Array): number {
  let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
  return Math.sqrt(s / buf.length);
}

export interface Prosody { wpm: number; pitchMeanHz: number; pitchVar: number; energy: number; pauseRatio: number; tone: string }
export function summarise(frames: AcousticFrame[], words: number, seconds: number): Prosody {
  const voiced = frames.filter((f) => f.pitchHz);
  const pitches = voiced.map((f) => f.pitchHz as number);
  const mean = pitches.length ? pitches.reduce((a, b) => a + b, 0) / pitches.length : 0;
  const sd = pitches.length ? Math.sqrt(pitches.reduce((a, p) => a + (p - mean) ** 2, 0) / pitches.length) : 0;
  const pitchVar = mean ? Math.min(100, Math.round((sd / mean) * 300)) : 0;
  const energy = Math.min(100, Math.round((frames.reduce((a, f) => a + f.rms, 0) / Math.max(1, frames.length)) * 900));
  const pauseRatio = frames.length ? Math.round((frames.filter((f) => f.rms < 0.01).length / frames.length) * 100) : 0;
  const wpm = seconds > 0 ? Math.round((words / seconds) * 60) : 0;
  let tone = 'Steady';
  if (pitchVar > 40 && energy > 45) tone = 'Agitated / anxious';
  else if (energy < 20 && wpm < 90) tone = 'Low / withdrawn';
  else if (pauseRatio > 55) tone = 'Hesitant / burdened';
  else if (pitchVar > 30) tone = 'Emotionally strained';
  return { wpm, pitchMeanHz: Math.round(mean), pitchVar, energy, pauseRatio, tone };
}
