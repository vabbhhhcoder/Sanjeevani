/**
 * Zero-Knowledge PII Sanitization Layer
 * Every piece of survivor data that leaves the local trust boundary
 * (rendered to UI, or sent to a mock AI model) passes through here.
 */

// Deterministic, non-reversible short hash (FNV-1a) – demo stand-in for salted SHA-256 via WebCrypto
export function fnv1a(input: string, salt = 'sanjeevani-v1'): string {
  let h = 0x811c9dc5;
  const s = salt + input;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export async function sha256(text: string): Promise<string> {
  if (typeof crypto?.subtle?.digest !== 'function') return fnv1a(text);
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Name → pseudonymous survivor handle. */
export function pseudonymize(name: string): string {
  return `SURV-${fnv1a(name).slice(0, 4).toUpperCase()}`;
}

/** Mask Aadhaar: XXXX-XXXX-1234 */
export function maskAadhaar(a: string): string {
  const digits = a.replace(/\D/g, '');
  if (digits.length !== 12) return 'XXXX-XXXX-XXXX';
  return `XXXX-XXXX-${digits.slice(-4)}`;
}

/** Generalise coordinates to ~5 km grid (0.045° ≈ 5 km). */
export function generalizeCoords(lat: number, lng: number, kmRadius = 5) {
  const step = kmRadius * 0.009;
  return { lat: +(Math.round(lat / step) * step).toFixed(3), lng: +(Math.round(lng / step) * step).toFixed(3), radiusKm: kmRadius };
}

const AADHAAR_RE = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
const PHONE_RE = /(\+91[\s-]?)?[6-9]\d{9}\b/g;
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.]+/g;

/** Scrub free text (chat, voice transcript) before it reaches any model. */
export function scrubText(text: string): { clean: string; redactions: number } {
  let n = 0;
  const clean = text
    .replace(AADHAAR_RE, () => (n++, '[AADHAAR-REDACTED]'))
    .replace(EMAIL_RE, () => (n++, '[EMAIL-REDACTED]'))
    .replace(PHONE_RE, () => (n++, '[PHONE-REDACTED]'));
  return { clean, redactions: n };
}

export interface SanitizedView {
  handle: string;
  aadhaarMasked: string;
  coords: ReturnType<typeof generalizeCoords>;
}
export function sanitizeIdentity(rawName: string, aadhaar: string, lat: number, lng: number): SanitizedView {
  return { handle: pseudonymize(rawName), aadhaarMasked: maskAadhaar(aadhaar), coords: generalizeCoords(lat, lng) };
}
