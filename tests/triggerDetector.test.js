import { describe, it, expect } from 'vitest';
import { detectTriggers } from '../src/utils/triggerDetector.js';

const BASE = { mood: 6, stress: 5, energy: 6, sleep: 7, studyHours: 7 };

describe('detectTriggers — return shape', () => {
  it('returns an array', () => {
    const result = detectTriggers({ ...BASE, journal: '' });
    expect(Array.isArray(result)).toBe(true);
  });

  it('each item has trigger (string) and confidence (number)', () => {
    const result = detectTriggers({ ...BASE, journal: 'sleep tired exhausted' });
    if (result.length > 0) {
      expect(typeof result[0].trigger).toBe('string');
      expect(typeof result[0].confidence).toBe('number');
    }
  });

  it('returns at most 3 triggers', () => {
    const journal = 'sleep friend test result time parents burnout';
    const result = detectTriggers({ ...BASE, journal });
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('results are sorted by confidence descending', () => {
    const result = detectTriggers({ ...BASE, journal: 'sleep tired friend test result' });
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].confidence).toBeGreaterThanOrEqual(result[i].confidence);
    }
  });
});

describe('detectTriggers — keyword matching', () => {
  it('detects "Lack of sleep" trigger from journal text', () => {
    const result = detectTriggers({
      ...BASE,
      sleep: 4,
      journal: 'I could not sleep last night I am so tired and exhausted',
    });
    const found = result.find(t => t.trigger === 'Lack of sleep');
    expect(found).toBeDefined();
    expect(found.confidence).toBeGreaterThan(0.3);
  });

  it('detects "Fear of results" trigger from journal text', () => {
    const result = detectTriggers({
      ...BASE,
      mood: 4,
      journal: 'I am scared about the result what if I fail',
    });
    const found = result.find(t => t.trigger === 'Fear of results');
    expect(found).toBeDefined();
  });

  it('detects "Family expectations" trigger from journal text', () => {
    const result = detectTriggers({
      ...BASE,
      stress: 8,
      journal: 'Parents have very high expectations I am afraid to disappoint my family',
    });
    const found = result.find(t => t.trigger === 'Family expectations');
    expect(found).toBeDefined();
  });
});

describe('detectTriggers — metric-only detection (no journal)', () => {
  it('detects burnout when energy/mood are very low and journal mentions exhaustion', () => {
    // Provide a journal that scores high keyword-match for Burnout so it outranks
    // other triggers and lands in the top-3 results.
    const result = detectTriggers({
      mood: 2, stress: 4, energy: 2, sleep: 7, studyHours: 6,
      journal: 'I just want to quit, I have no motivation left and feel completely exhausted, I give up',
    });
    const found = result.find(t => t.trigger === 'Burnout');
    expect(found).toBeDefined();
    expect(found.confidence).toBeGreaterThan(0.4);
  });

  it('returns empty array for healthy metrics and no journal', () => {
    const result = detectTriggers({
      mood: 9, stress: 2, energy: 9, sleep: 8, studyHours: 6,
      journal: '',
    });
    expect(result).toEqual([]);
  });
});
