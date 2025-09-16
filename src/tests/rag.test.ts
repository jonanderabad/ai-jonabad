import { describe, it, expect } from 'vitest';
import { cosineSim, rankBySimilarity } from '../lib/rag';

describe('rag utils', () => {
  it('cosineSim = 1.0 en vectores idénticos', () => {
    expect(cosineSim([1, 2, 3], [1, 2, 3])).toBeCloseTo(1.0, 6);
  });

  it('rankBySimilarity ordena por similitud y respeta topK', () => {
    const q = [0, 1];
    const docs = [[1, 0], [0, 1], [1, 1]];
    const order = rankBySimilarity(q, docs, 2);
    expect(order).toEqual([1, 2]);
  });
});
