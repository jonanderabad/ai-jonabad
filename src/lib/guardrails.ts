// src/lib/guardrails.ts
export const OFF_TOPIC = 0.23;
export const NEEDS_CLARIFY = 0.30;

export type GuardDecision = 'ON_TOPIC' | 'NEEDS_CLARIFY' | 'OFF_TOPIC';

export interface Scores {
  onTopic: number;      // 0..1
  needsClarify: number; // 0..1
}

// Regla determinista y testeable
export function classify(scores: Scores): GuardDecision {
  if (scores.onTopic < OFF_TOPIC) return 'OFF_TOPIC';
  if (scores.needsClarify >= NEEDS_CLARIFY) return 'NEEDS_CLARIFY';
  return 'ON_TOPIC';
}
