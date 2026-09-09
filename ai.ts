/**
 * Live LLM connector for the Safe Harbor companion.
 * Supports Google Gemini and any OpenAI-compatible endpoint (OpenAI, Groq, Together, Ollama…).
 * Key lives only in the browser (localStorage) for the demo; production routes via a server-side proxy.
 * Every message passes scrubText() BEFORE leaving the device and the local crisis classifier ALWAYS runs first.
 */
import { ChatMessage } from './types';
import { scrubText } from './sanitize';

export type Provider = 'gemini' | 'openai';
export interface AiConfig { provider: Provider; apiKey: string; baseUrl: string; model: string }
const KEY = 'sanj.ai.config';

export const PRESETS: Record<string, Partial<AiConfig>> = {
  gemini: { provider: 'gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-3.6-flash' },
  openai: { provider: 'openai', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  groq: { provider: 'openai', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.1-8b-instant' },
  ollama: { provider: 'openai', baseUrl: 'http://localhost:11434/v1', model: 'llama3.1' },
};

/** Default config baked in from .env (VITE_AI_*). */
export function envConfig(): AiConfig | null {
  const key = (import.meta.env.VITE_AI_API_KEY ?? '').trim();
  if (!key || key.includes('your-key-here')) return null;
  const provider: Provider = (import.meta.env.VITE_AI_PROVIDER as Provider) || detectProvider(key);
  const preset = provider === 'gemini' ? PRESETS.gemini : PRESETS.openai;
  return { provider, apiKey: key, model: (import.meta.env.VITE_AI_MODEL || preset.model)!, baseUrl: (import.meta.env.VITE_AI_BASE_URL || preset.baseUrl)! };
}

/** User override in localStorage wins; otherwise the .env default. */
export function loadAiConfig(): AiConfig | null {
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw) as AiConfig; } catch { /* ignore */ }
  return envConfig();
}
export function saveAiConfig(c: AiConfig | null) { c ? localStorage.setItem(KEY, JSON.stringify(c)) : localStorage.removeItem(KEY); }
export function detectProvider(key: string): Provider { return key.startsWith('AIza') ? 'gemini' : 'openai'; }

export const PFA_SYSTEM = `You are "Safe Harbor", a Psychological First Aid (PFA) companion inside SANJEEVANI, an Indian government-backed platform for survivors of caste-based atrocities and violence (SC/ST Prevention of Atrocities Act). 
Principles: trauma-informed, non-judgemental, validate feelings, never blame, never interrogate about the incident, never give legal/medical diagnoses, never promise outcomes. Use warm, simple language; short paragraphs; at most ~120 words. Mirror the user's language (English, Hindi, Marathi, Tamil, Telugu, Bengali, Hinglish).
Offer grounding (5-4-3-2-1), slow breathing, or one small next step. Mention that a human counselor and Tele-MANAS 14416 (free, 24x7) are available when distress is high. If the user expresses intent to harm themselves or others, or immediate danger: respond with care, urge contacting Tele-MANAS 14416 or emergency 112, and encourage using the app's SOS button. Never store or ask for names, Aadhaar, phone numbers or addresses.
End with one gentle open question unless the user asked to just be heard.`;

export interface LiveReply { text: string; provider: Provider; model: string }

export async function askLive(cfg: AiConfig, history: ChatMessage[], userText: string, signal?: AbortSignal): Promise<LiveReply> {
  const { clean } = scrubText(userText);
  const turns = history.slice(-10).map((m) => ({ role: m.from === 'user' ? 'user' : 'assistant', content: scrubText(m.text).clean }));
  turns.push({ role: 'user', content: clean });

  if (cfg.provider === 'gemini') {
    const chain = [cfg.model, ...GEMINI_FALLBACKS.filter((m) => m !== cfg.model)];
    let lastErr: Error | null = null;
    for (const model of chain) {
      try { return await geminiOnce({ ...cfg, model }, turns, signal); }
      catch (e) { lastErr = e as Error; if (!/(404|503|no longer available|high demand)/i.test(lastErr.message)) throw lastErr; }
    }
    throw lastErr ?? new Error('Gemini unavailable');
  }

  const r = await fetch(`${cfg.baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}) },
    body: JSON.stringify({ model: cfg.model, temperature: 0.6, max_tokens: 400, messages: [{ role: 'system', content: PFA_SYSTEM }, ...turns] }),
  });
  if (!r.ok) throw new Error(`API ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  const text = j?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Empty response');
  return { text, provider: 'openai', model: cfg.model };
}

const GEMINI_FALLBACKS = ['gemini-3.6-flash', 'gemini-3-flash-preview', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

async function geminiOnce(cfg: AiConfig, turns: { role: string; content: string }[], signal?: AbortSignal): Promise<LiveReply> {
  {
    const url = `${cfg.baseUrl}/models/${cfg.model}:generateContent?key=${encodeURIComponent(cfg.apiKey)}`;
    const body = {
      systemInstruction: { parts: [{ text: PFA_SYSTEM }] },
      contents: turns.map((t) => ({ role: t.role === 'assistant' ? 'model' : 'user', parts: [{ text: t.content }] })),
      generationConfig: { temperature: 0.6, maxOutputTokens: 400 },
      safetySettings: ['HARM_CATEGORY_HARASSMENT', 'HARM_CATEGORY_HATE_SPEECH', 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'HARM_CATEGORY_DANGEROUS_CONTENT'].map((c) => ({ category: c, threshold: 'BLOCK_ONLY_HIGH' })),
    };
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal });
    if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const j = await r.json();
    const text = j?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
    if (!text) throw new Error('Empty response from Gemini');
    return { text: text.trim(), provider: 'gemini', model: cfg.model };
  }
}

/** Ask the model for a short, structured emotional-tone read of a voice transcript. */
export async function analyseTranscript(cfg: AiConfig, transcript: string, features: { wpm: number; pitchVar: number; energy: number }): Promise<string> {
  const { clean } = scrubText(transcript);
  const prompt = `A survivor recorded a voice journal. Transcript (PII removed): "${clean}". Acoustic features: ${features.wpm} words/min, pitch variability ${features.pitchVar}%, vocal energy ${features.energy}%.
Reply in 2 short sentences, in the same language as the transcript: (1) name the emotional tone you sense, gently; (2) one supportive, non-clinical reflection. No diagnosis, no lists.`;
  const res = await askLive(cfg, [], prompt);
  return res.text;
}
