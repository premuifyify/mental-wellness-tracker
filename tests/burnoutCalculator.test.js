import { describe, it, expect } from 'vitest';
import { calculateBurnoutScore, BURNOUT_META } from '../src/utils/burnoutCalculator.js';

const BASE = { mood: 7, energy: 7, stress: 3, sleep: 8, studyHours: 6 };

describe('calculateBurnoutScore — risk classification', () => {
  it('returns low risk for a well-rested, low-stress student', () => {
    const { risk, score } = calculateBurnoutScore(BASE);
    expect(risk).toBe('low');
    expect(score).toBeLessThan(30);
  });

  it('returns high risk for extreme burnout indicators', () => {
    const { risk, score } = calculateBurnoutScore({
      stress: 10, sleep: 3, mood: 2, energy: 2, studyHours: 16,
    });
    expect(risk).toBe('high');
    expect(score).toBeGreaterThanOrEqual(60);
  });

  it('returns moderate risk for mid-range indicators', () => {
    const { risk } = calculateBurnoutScore({
      stress: 7, sleep: 6, mood: 5, energy: 5, studyHours: 8,
    });
    expect(risk).toBe('moderate');
  });

  it('score is always between 0 and 100', () => {
    const worst = { stress: 10, sleep: 0, mood: 1, energy: 1, studyHours: 20 };
    const best  = { stress: 1,  sleep: 12, mood: 10, energy: 10, studyHours: 0 };
    expect(calculateBurnoutScore(worst).score).toBeLessThanOrEqual(100);
    expect(calculateBurnoutScore(best).score).toBeGreaterThanOrEqual(0);
  });

  it('high stress alone pushes toward higher risk', () => {
    const lowStress  = calculateBurnoutScore({ ...BASE, stress: 2 });
    const highStress = calculateBurnoutScore({ ...BASE, stress: 9 });
    expect(highStress.score).toBeGreaterThan(lowStress.score);
  });

  it('poor sleep increases score', () => {
    const goodSleep = calculateBurnoutScore({ ...BASE, sleep: 8 });
    const poorSleep = calculateBurnoutScore({ ...BASE, sleep: 4 });
    expect(poorSleep.score).toBeGreaterThan(goodSleep.score);
  });

  it('excessive study hours increase score', () => {
    const normalStudy    = calculateBurnoutScore({ ...BASE, studyHours: 6 });
    const excessiveStudy = calculateBurnoutScore({ ...BASE, studyHours: 14 });
    expect(excessiveStudy.score).toBeGreaterThan(normalStudy.score);
  });

  it('stress threshold boundary: score 7 gives moderate, 9 gives high contribution', () => {
    const at7 = calculateBurnoutScore({ ...BASE, stress: 7 });
    const at9 = calculateBurnoutScore({ ...BASE, stress: 9 });
    expect(at9.score - at7.score).toBe(10); // 30 - 20 = 10 extra pts
  });
});

describe('calculateBurnoutScore — return shape', () => {
  it('always returns { score: number, risk: string }', () => {
    const result = calculateBurnoutScore(BASE);
    expect(typeof result.score).toBe('number');
    expect(['low', 'moderate', 'high']).toContain(result.risk);
  });
});

describe('BURNOUT_META', () => {
  it('has entries for all three risk levels', () => {
    expect(BURNOUT_META.low).toBeDefined();
    expect(BURNOUT_META.moderate).toBeDefined();
    expect(BURNOUT_META.high).toBeDefined();
  });

  it('each entry has label, advice, bgClass, textClass', () => {
    for (const key of ['low', 'moderate', 'high']) {
      const m = BURNOUT_META[key];
      expect(m.label).toBeTruthy();
      expect(m.advice).toBeTruthy();
      expect(m.bgClass).toBeTruthy();
      expect(m.textClass).toBeTruthy();
    }
  });
});
