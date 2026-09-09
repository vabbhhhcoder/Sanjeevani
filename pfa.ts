import { ChatMessage } from './types';
import { scrubText } from './sanitize';

/**
 * Psychological First Aid (PFA) guard-railed companion engine.
 * Rule-based simulation of a fine-tuned LLM with a safety classifier in front.
 * Order: crisis detection → despair → anxiety → grief → sleep → default reflective.
 */
const CRISIS = [/\b(kill myself|end (it|my life)|suicide|don'?t want to (live|be here)|no reason to live|hurt myself|मरना चाहत|जीना नहीं चाहत|आत्महत्या)\b/i];
const DESPAIR = [/\b(hopeless|worthless|no point|give up|can'?t (go on|do this)|nothing matters|alone|burden|हार गई|हार गया|कोई फायदा नहीं)\b/i];
const FEAR = [/\b(scared|afraid|unsafe|threat|they might come|panic|डर|असुरक्षित)\b/i];
const SLEEP = [/\b(sleep|nightmare|awake|insomnia|नींद|सपने)\b/i];
const ANGER = [/\b(angry|rage|furious|unfair|गुस्सा)\b/i];
const GRATITUDE = [/\b(thank|better|okay today|good day|शुक्रिया|धन्यवाद|ठीक हूँ)\b/i];

export interface PfaResult { reply: ChatMessage; escalate: boolean; breathing: boolean; redactions: number }

let counter = 0;
const mk = (text: string, tone: ChatMessage['tone']): ChatMessage => ({ id: `ai-${++counter}-${Date.now()}`, from: 'ai', text, ts: new Date().toISOString(), tone });

export function respond(userText: string): PfaResult {
  const { clean, redactions } = scrubText(userText);
  const test = (arr: RegExp[]) => arr.some((r) => r.test(clean));

  if (test(CRISIS)) {
    return { escalate: true, breathing: true, redactions, reply: mk(
      "I'm really glad you told me this. What you're feeling is a response to something that should never have happened to you — it is not a weakness. You matter, and you don't have to carry this alone right now.\n\nI'd like to connect you with a trained person immediately — Tele-MANAS (14416) is free, confidential and available 24×7, and your counselor can be alerted silently. While we do that, let's breathe together — I've opened a slow breathing guide below.", 'crisis') };
  }
  if (test(DESPAIR)) {
    return { escalate: false, breathing: true, redactions, reply: mk(
      "That sounds incredibly heavy, and it makes sense that it feels this way after what you've been through. Feeling hopeless is something many survivors experience — it is a symptom, not a truth about you.\n\nCan we take one small moment together? I've opened a breathing guide. When you're ready, tell me one thing — even a tiny one — that got you through today.", 'concern') };
  }
  if (test(FEAR)) {
    return { escalate: false, breathing: false, redactions, reply: mk(
      "Feeling unsafe after what happened is your mind trying to protect you. Right now, let's ground: name 3 things you can see around you, 2 you can touch, and 1 you can hear.\n\nIf the threat is real and present, the discreet SOS button below can silently alert your social worker or dispatch help — you stay in control the whole time. Would you like me to keep your counselor informed?", 'concern') };
  }
  if (test(SLEEP)) {
    return { escalate: false, breathing: true, redactions, reply: mk(
      "Nights can be the hardest part — the body remembers even when we want to rest. You're not doing anything wrong.\n\nA few gentle things that help many people: keeping a dim light on, a 4-7-8 breathing cycle before bed, and writing tomorrow's worry on paper so it's 'held' outside of you. I've opened the breathing guide if you'd like to try now.", 'calm') };
  }
  if (test(ANGER)) {
    return { escalate: false, breathing: false, redactions, reply: mk(
      "Your anger is valid — it's a healthy response to injustice, and it means a part of you knows you deserved better. Let's give it somewhere to go: some people find it helps to write an unsent letter, or to walk briskly for 5 minutes.\n\nYour legal aid tracker also shows the case status — sometimes seeing progress helps the anger feel less stuck. Would you like to look at it together?", 'calm') };
  }
  if (test(GRATITUDE)) {
    return { escalate: false, breathing: false, redactions, reply: mk(
      "I'm really glad to hear that — and I want you to notice it too. Healing isn't a straight line, and good moments count just as much as hard ones. What helped make today feel a little lighter?", 'calm') };
  }
  return { escalate: false, breathing: false, redactions, reply: mk(
    "Thank you for sharing that with me. I'm here and I'm listening — there's no right way to say any of this. Would you like to tell me more about how that felt, or would you prefer we do something calming together for a minute?", 'calm') };
}

export const OPENER: ChatMessage = { id: 'ai-open', from: 'ai', ts: new Date().toISOString(), tone: 'calm', text: "Hello. I'm here with you. This space is private — nothing you type is stored with your name, and personal numbers are automatically removed before anything is processed.\n\nHow is today feeling for you?" };
