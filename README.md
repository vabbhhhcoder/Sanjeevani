# SANJEEVANI — AI-Powered Dynamic Mental Health Monitoring & Distress Prediction for Survivors of Atrocities
Smart India Hackathon prototype · React 18 + Vite + TypeScript · Tailwind · Framer Motion · Recharts · Lucide

## Run
npm install && npm run dev   →  http://localhost:5173

## Demo cheat-sheet
- Role switcher (header): Survivor ↔ Counselor ↔ Nodal Officer
- Quick Exit: header button or press **Esc twice** → calculator decoy. Long-press `=` (1.5 s) → PIN pad → **2580**
- Safe Harbor companion: type "I feel hopeless" (breathing guide) or "I don't want to live" (crisis escalation)
- Type an Aadhaar/phone number in chat → auto-redacted before processing
- SOS button (bottom-right, survivor view): 10-second cancellable countdown
- Counselor: click patients in Distress Velocity queue → telemetry / XAI / SOAP+PHQ-9 / audit tabs
- Accessibility drawer: voice nav (Web Speech), high contrast, text scaling, dark mode

## Architecture
src/lib/sanitize.ts   Zero-knowledge PII layer (pseudonymisation, Aadhaar masking, 5 km geo-generalisation, free-text scrubbing)
src/lib/audit.ts      Hash-chained tamper-evident audit ledger + verifier
src/lib/pfa.ts        Psychological-First-Aid guard-railed companion engine (crisis classifier first)
src/lib/store.tsx     Global state, RBAC context, stealth mode, a11y prefs, consent
src/lib/i18n.ts       6 Indic languages
src/data/mock.ts      10 seeded survivor trajectories, districts, SLA & DBT data
src/portals/*         Survivor / Counselor / Nodal portals
src/components/*      Shell, Consent banner, Decoy calculator, UI primitives, ErrorBoundary
