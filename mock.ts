import { Patient, RiskLevel, TelemetryPoint, XaiMarker } from '@/lib/types';

// Seeded PRNG for deterministic, realistic-looking trajectories
function rng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

type Shape = 'deteriorating' | 'acute' | 'recovering' | 'stable' | 'relapse' | 'volatile';
function genTelemetry(seed: number, shape: Shape): TelemetryPoint[] {
  const r = rng(seed);
  const pts: TelemetryPoint[] = [];
  const today = new Date('2026-09-09');
  for (let d = 1; d <= 30; d++) {
    const t = d / 30;
    let base: number;
    switch (shape) {
      case 'deteriorating': base = 68 - 38 * t; break;
      case 'acute': base = 60 - 45 * Math.pow(t, 3); break;
      case 'recovering': base = 30 + 45 * t; break;
      case 'stable': base = 72; break;
      case 'relapse': base = 65 - 30 * Math.max(0, t - 0.6) * 2.5; break;
      case 'volatile': base = 50 + 22 * Math.sin(d / 2.2); break;
    }
    const noise = () => (r() - 0.5) * 12;
    const mood = clamp(base + noise());
    const date = new Date(today); date.setDate(today.getDate() - (30 - d));
    pts.push({
      day: d,
      date: date.toISOString().slice(5, 10),
      mood,
      sleepDisruption: clamp(100 - mood + noise() * 1.4 - 10),
      withdrawal: clamp(95 - mood + noise() - 15),
      voiceJitter: clamp(90 - mood + noise() * 1.8 - 20),
    });
  }
  return pts;
}
const clamp = (n: number) => Math.round(Math.max(2, Math.min(98, n)));

function velocity(t: TelemetryPoint[]): number {
  const last7 = t.slice(-7).reduce((a, p) => a + p.mood, 0) / 7;
  const prev7 = t.slice(-14, -7).reduce((a, p) => a + p.mood, 0) / 7;
  return Math.round((prev7 - last7) * 10) / 10; // positive => mood falling => deteriorating
}
function riskOf(score: number, vel: number): RiskLevel {
  if (score >= 70 || vel >= 8) return 'high';
  if (score >= 45 || vel >= 3) return 'moderate';
  return 'low';
}

interface Seed { rawName: string; aadhaar: string; age: number; gender: 'F' | 'M' | 'NB'; district: string; block: string; coords: { lat: number; lng: number }; incidentType: string; incidentDate: string; firNumber: string; shape: Shape; pcl5: number; phq9: number; traumaFlags: string[]; markers: XaiMarker[]; counselor: string; nextAction: string; reliefStage: number; legalStage: number; lastCheckIn: string; }

const seeds: Seed[] = [
  { rawName: 'Kavita Meshram', aadhaar: '4821 9034 5512', age: 27, gender: 'F', district: 'Nagpur', block: 'Kamptee', coords: { lat: 21.2181, lng: 79.1945 }, incidentType: 'Caste-based assault (PoA §3(1)(r))', incidentDate: '2026-07-14', firNumber: 'FIR/0231/2026/KMT', shape: 'acute', pcl5: 61, phq9: 21, traumaFlags: ['Hypervigilance', 'Nocturnal distress', 'Ideation screen +'], markers: [ { label: 'Helplessness markers', weight: 89, kind: 'linguistic' }, { label: 'Nocturnal distress spikes (02:00–04:00)', weight: 82, kind: 'behavioral' }, { label: 'Voice pitch variance ↑ 34%', weight: 74, kind: 'acoustic' }, { label: 'PCL-5 trauma correlation 61/80', weight: 70, kind: 'clinical' } ], counselor: 'Dr. R. Iyer', nextAction: 'Crisis intervention within 2 hrs', reliefStage: 1, legalStage: 2, lastCheckIn: '38 min ago' },
  { rawName: 'Sunil Bhoi', aadhaar: '7710 2288 0193', age: 41, gender: 'M', district: 'Kalahandi', block: 'Bhawanipatna', coords: { lat: 19.9067, lng: 83.1649 }, incidentType: 'Land dispossession & intimidation', incidentDate: '2026-06-02', firNumber: 'FIR/0087/2026/BWP', shape: 'deteriorating', pcl5: 48, phq9: 17, traumaFlags: ['Social withdrawal', 'Alcohol-use risk'], markers: [ { label: 'Social withdrawal trend 14d', weight: 78, kind: 'behavioral' }, { label: 'Speech pace ↓ 22%', weight: 66, kind: 'acoustic' }, { label: 'Self-blame lexicon', weight: 61, kind: 'linguistic' } ], counselor: 'Ms. P. Nayak', nextAction: 'Tele-consult today', reliefStage: 2, legalStage: 3, lastCheckIn: '3 hrs ago' },
  { rawName: 'Rekha Valmiki', aadhaar: '3391 6620 8847', age: 19, gender: 'F', district: 'Hathras', block: 'Sadabad', coords: { lat: 27.4384, lng: 78.0396 }, incidentType: 'Sexual violence (PoA §3(2)(v))', incidentDate: '2026-05-20', firNumber: 'FIR/0412/2026/SDB', shape: 'relapse', pcl5: 55, phq9: 19, traumaFlags: ['Flashbacks', 'Avoidance', 'Court-date anxiety'], markers: [ { label: 'Re-experiencing lexicon ↑', weight: 80, kind: 'linguistic' }, { label: 'Court hearing in 4 days (stressor)', weight: 72, kind: 'clinical' }, { label: 'Sleep disruption ↑ 40%', weight: 69, kind: 'behavioral' } ], counselor: 'Dr. R. Iyer', nextAction: 'Pre-hearing support session', reliefStage: 2, legalStage: 3, lastCheckIn: '1 hr ago' },
  { rawName: 'Manoj Paswan', aadhaar: '9902 1145 3378', age: 34, gender: 'M', district: 'Gaya', block: 'Tekari', coords: { lat: 24.9436, lng: 84.8425 }, incidentType: 'Arson of dwelling', incidentDate: '2026-04-11', firNumber: 'FIR/0159/2026/TKR', shape: 'recovering', pcl5: 29, phq9: 9, traumaFlags: ['Displacement stress'], markers: [ { label: 'Future-oriented language ↑', weight: 58, kind: 'linguistic' }, { label: 'Check-in regularity 92%', weight: 55, kind: 'behavioral' } ], counselor: 'Mr. A. Kumar', nextAction: 'Bi-weekly check-in', reliefStage: 3, legalStage: 4, lastCheckIn: 'Yesterday' },
  { rawName: 'Lakshmi Devendra', aadhaar: '5570 4431 9026', age: 52, gender: 'F', district: 'Tumakuru', block: 'Sira', coords: { lat: 13.7416, lng: 76.9042 }, incidentType: 'Social boycott & wage denial', incidentDate: '2026-03-28', firNumber: 'FIR/0044/2026/SIR', shape: 'stable', pcl5: 22, phq9: 6, traumaFlags: [], markers: [ { label: 'Stable affect 30d', weight: 40, kind: 'behavioral' } ], counselor: 'Ms. P. Nayak', nextAction: 'Monthly review', reliefStage: 3, legalStage: 3, lastCheckIn: '2 days ago' },
  { rawName: 'Arjun Madiga', aadhaar: '6108 7723 4491', age: 23, gender: 'M', district: 'Nalgonda', block: 'Miryalaguda', coords: { lat: 16.8722, lng: 79.5626 }, incidentType: 'Custodial harassment', incidentDate: '2026-08-02', firNumber: 'FIR/0301/2026/MRG', shape: 'volatile', pcl5: 44, phq9: 14, traumaFlags: ['Anger dysregulation', 'Trust deficit'], markers: [ { label: 'Affect volatility index 0.71', weight: 70, kind: 'behavioral' }, { label: 'Loudness variance ↑', weight: 62, kind: 'acoustic' } ], counselor: 'Mr. A. Kumar', nextAction: 'Scheduled check-in 48h', reliefStage: 0, legalStage: 1, lastCheckIn: '5 hrs ago' },
  { rawName: 'Sonali Sardar', aadhaar: '2245 8810 6673', age: 30, gender: 'F', district: 'Purulia', block: 'Jhalda', coords: { lat: 23.3653, lng: 85.9743 }, incidentType: 'Witch-branding & assault', incidentDate: '2026-07-30', firNumber: 'FIR/0198/2026/JHL', shape: 'deteriorating', pcl5: 52, phq9: 18, traumaFlags: ['Community ostracism', 'Nocturnal distress'], markers: [ { label: 'Hopelessness markers', weight: 76, kind: 'linguistic' }, { label: 'Late-night app usage ↑ 3.1x', weight: 68, kind: 'behavioral' }, { label: 'Monotone prosody', weight: 60, kind: 'acoustic' } ], counselor: 'Dr. S. Banerjee', nextAction: 'Field social worker visit', reliefStage: 1, legalStage: 2, lastCheckIn: '2 hrs ago' },
  { rawName: 'Ramesh Chamar', aadhaar: '8834 5502 1167', age: 45, gender: 'M', district: 'Jhansi', block: 'Moth', coords: { lat: 25.7195, lng: 78.9574 }, incidentType: 'Denial of temple access & assault', incidentDate: '2026-02-15', firNumber: 'FIR/0021/2026/MTH', shape: 'recovering', pcl5: 26, phq9: 8, traumaFlags: ['Somatic complaints'], markers: [ { label: 'Sleep normalisation 21d', weight: 52, kind: 'behavioral' }, { label: 'Pitch stability ↑', weight: 48, kind: 'acoustic' } ], counselor: 'Dr. R. Iyer', nextAction: 'Bi-weekly check-in', reliefStage: 3, legalStage: 4, lastCheckIn: 'Yesterday' },
  { rawName: 'Priya Bagde', aadhaar: '1193 3376 5548', age: 16, gender: 'F', district: 'Nagpur', block: 'Hingna', coords: { lat: 21.0894, lng: 78.9877 }, incidentType: 'School-based caste abuse', incidentDate: '2026-08-21', firNumber: 'FIR/0344/2026/HNG', shape: 'deteriorating', pcl5: 39, phq9: 15, traumaFlags: ['Minor – guardian consent', 'School avoidance'], markers: [ { label: 'School-avoidance language', weight: 71, kind: 'linguistic' }, { label: 'Withdrawal index ↑', weight: 64, kind: 'behavioral' } ], counselor: 'Dr. S. Banerjee', nextAction: 'Child-psychologist referral', reliefStage: 0, legalStage: 1, lastCheckIn: '6 hrs ago' },
  { rawName: 'Ganesh Dhangar', aadhaar: '4460 2219 7783', age: 38, gender: 'M', district: 'Kalahandi', block: 'Junagarh', coords: { lat: 19.8595, lng: 82.9339 }, incidentType: 'Bonded labour rescue', incidentDate: '2026-06-18', firNumber: 'FIR/0102/2026/JNG', shape: 'stable', pcl5: 31, phq9: 10, traumaFlags: ['Financial insecurity'], markers: [ { label: 'Stable affect 14d', weight: 45, kind: 'behavioral' }, { label: 'Financial stressor lexicon', weight: 50, kind: 'linguistic' } ], counselor: 'Ms. P. Nayak', nextAction: 'Livelihood linkage', reliefStage: 2, legalStage: 2, lastCheckIn: 'Yesterday' },
];

export const PATIENTS: Patient[] = seeds.map((s, i) => {
  const telemetry = genTelemetry(1000 + i * 77, s.shape);
  const last = telemetry[telemetry.length - 1];
  const distressScore = Math.round(100 - last.mood);
  const vel = velocity(telemetry);
  return {
    id: `SURV-${(4210 + i * 137).toString(16).toUpperCase().padStart(4, '0')}`,
    ...s,
    distressScore,
    distressVelocity: vel,
    risk: riskOf(distressScore, vel),
    telemetry,
  };
});

export const DBT_STAGES = ['FIR Registered', 'Medico-Legal Verification', 'District Magistrate Sanction', 'DBT Credited'];
export const LEGAL_STAGES = ['FIR Filed', 'Charge-sheet', 'Special Court Cognizance', 'Trial Ongoing', 'Judgement'];

export const DISTRICTS = [
  { name: 'Nagpur', state: 'MH', incidents: 42, avgRecovery: 61, responseHrs: 3.2, counselors: 6, x: 44, y: 55 },
  { name: 'Hathras', state: 'UP', incidents: 58, avgRecovery: 48, responseHrs: 5.1, counselors: 3, x: 40, y: 30 },
  { name: 'Gaya', state: 'BR', incidents: 37, avgRecovery: 66, responseHrs: 3.8, counselors: 4, x: 66, y: 36 },
  { name: 'Kalahandi', state: 'OD', incidents: 29, avgRecovery: 58, responseHrs: 4.6, counselors: 2, x: 62, y: 53 },
  { name: 'Tumakuru', state: 'KA', incidents: 18, avgRecovery: 74, responseHrs: 2.4, counselors: 4, x: 40, y: 78 },
  { name: 'Nalgonda', state: 'TG', incidents: 26, avgRecovery: 63, responseHrs: 3.5, counselors: 3, x: 48, y: 67 },
  { name: 'Purulia', state: 'WB', incidents: 33, avgRecovery: 55, responseHrs: 4.9, counselors: 2, x: 72, y: 44 },
  { name: 'Jhansi', state: 'UP', incidents: 21, avgRecovery: 70, responseHrs: 2.9, counselors: 3, x: 42, y: 40 },
  { name: 'Sirohi', state: 'RJ', incidents: 15, avgRecovery: 68, responseHrs: 3.1, counselors: 2, x: 24, y: 40 },
  { name: 'Ahmedabad', state: 'GJ', incidents: 24, avgRecovery: 71, responseHrs: 2.7, counselors: 5, x: 20, y: 50 },
];

export const SLA_TREND = Array.from({ length: 12 }, (_, i) => ({
  week: `W${i + 1}`,
  responseHrs: +(6.2 - i * 0.28 + Math.sin(i) * 0.4).toFixed(1),
  target: 4,
  interventions: 40 + Math.round(i * 4 + Math.cos(i) * 6),
}));

export const DBT_FUNNEL = [
  { stage: 'FIR Registered', count: 303, amount: 0 },
  { stage: 'Medico-Legal Verified', count: 241, amount: 0 },
  { stage: 'DM Sanctioned', count: 188, amount: 4.7 },
  { stage: 'DBT Credited', count: 152, amount: 3.9 },
];
