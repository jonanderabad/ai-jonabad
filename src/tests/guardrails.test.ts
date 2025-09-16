import { describe, it, expect } from 'vitest';
import { classify, OFF_TOPIC, NEEDS_CLARIFY } from '../lib/guardrails';

describe('guardrails.classify', () => {
  it('OFF_TOPIC si onTopic < OFF_TOPIC', () => {
    const d = classify({ onTopic: OFF_TOPIC - 0.01, needsClarify: 0 });
    expect(d).toBe('OFF_TOPIC');
  });

  it('NEEDS_CLARIFY si onTopic >= OFF_TOPIC y needsClarify >= threshold', () => {
    const d = classify({ onTopic: OFF_TOPIC + 0.1, needsClarify: NEEDS_CLARIFY });
    expect(d).toBe('NEEDS_CLARIFY');
  });

  it('ON_TOPIC en el resto', () => {
    const d = classify({ onTopic: OFF_TOPIC + 0.1, needsClarify: NEEDS_CLARIFY - 0.01 });
    expect(d).toBe('ON_TOPIC');
  });
});
