import { AuditEntry, Role } from './types';
import { fnv1a } from './sanitize';

/** Tamper-evident hash-chained audit trail (Merkle-style linear chain). */
export function appendAudit(chain: AuditEntry[], actor: string, role: Role, action: string, resource: string): AuditEntry[] {
  const prev = chain.length ? chain[chain.length - 1].hash : 'GENESIS';
  const ts = new Date().toISOString();
  const payload = `${prev}|${ts}|${actor}|${role}|${action}|${resource}`;
  const entry: AuditEntry = { id: chain.length + 1, ts, actor, role, action, resource, prevHash: prev, hash: fnv1a(payload) + fnv1a(payload, 'chain-2') };
  return [...chain, entry];
}

export function verifyChain(chain: AuditEntry[]): boolean {
  let prev = 'GENESIS';
  for (const e of chain) {
    if (e.prevHash !== prev) return false;
    const payload = `${e.prevHash}|${e.ts}|${e.actor}|${e.role}|${e.action}|${e.resource}`;
    if (e.hash !== fnv1a(payload) + fnv1a(payload, 'chain-2')) return false;
    prev = e.hash;
  }
  return true;
}
