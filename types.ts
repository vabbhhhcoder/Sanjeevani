export type Role = 'survivor' | 'counselor' | 'nodal';
export type RiskLevel = 'low' | 'moderate' | 'high';
export type Lang = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'bn';

export interface TelemetryPoint {
  day: number;           // 1..30
  date: string;
  mood: number;          // 0-100 (higher = better)
  sleepDisruption: number; // 0-100 (higher = worse)
  withdrawal: number;    // 0-100 (higher = worse)
  voiceJitter: number;   // 0-100 (higher = worse)
}

export interface XaiMarker {
  label: string;
  weight: number; // 0-100
  kind: 'linguistic' | 'acoustic' | 'behavioral' | 'clinical';
}

export interface Patient {
  id: string;             // SURV-XXXX (already anonymized)
  rawName: string;        // present ONLY to demonstrate sanitizer; never displayed
  aadhaar: string;        // raw, masked by sanitizer
  age: number;
  gender: 'F' | 'M' | 'NB';
  district: string;
  block: string;
  coords: { lat: number; lng: number };
  incidentType: string;
  incidentDate: string;
  firNumber: string;
  distressScore: number;  // 0-100 current
  distressVelocity: number; // delta per week; positive = deteriorating
  risk: RiskLevel;
  pcl5: number;           // 0-80
  phq9: number;           // 0-27
  traumaFlags: string[];
  markers: XaiMarker[];
  telemetry: TelemetryPoint[];
  lastCheckIn: string;
  counselor: string;
  nextAction: string;
  reliefStage: number;   // 0..3 index into DBT stages
  legalStage: number;    // 0..4
}

export interface AuditEntry {
  id: number;
  ts: string;
  actor: string;
  role: Role;
  action: string;
  resource: string;
  prevHash: string;
  hash: string;
}

export interface ConsentState {
  voiceProsody: boolean;
  longitudinal: boolean;
  geoDispatch: boolean;
  acceptedAt?: string;
}

export interface ChatMessage {
  id: string;
  from: 'user' | 'ai';
  text: string;
  ts: string;
  tone?: 'calm' | 'concern' | 'crisis';
}
