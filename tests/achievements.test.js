import { describe, it, expect } from 'vitest';
import {
  evaluateAchievements,
  getAchievementDef,
  getEarnedAchievements,
  getUnearnedAchievements,
} from '../src/utils/achievements.js';
import { ACHIEVEMENT_DEFS } from '../src/constants/index.js';

// ─── evaluateAchievements ─────────────────────────────────────────────────────

describe('evaluateAchievements', () => {
  const base = { earned: [], streak: 0 };

  it('awards first_step on the first check-in', () => {
    const checkIns = [{ id: '1', mood: 7, energy: 7, stress: 3, sleep: 7, studyHours: 6, journal: '' }];
    const result = evaluateAchievements({ ...base, checkIns, streak: 1 });
    expect(result).toContain('first_step');
  });

  it('does not re-award already earned achievements', () => {
    const checkIns = [{ id: '1', mood: 7, energy: 7, stress: 3, sleep: 7, studyHours: 6, journal: '' }];
    const result = evaluateAchievements({
      checkIns, streak: 1, earned: ['first_step'],
    });
    expect(result).not.toContain('first_step');
  });

  it('awards streak_3 at streak = 3', () => {
    const checkIns = Array(3).fill({ id: '1', mood: 5, energy: 5, stress: 5, sleep: 7, studyHours: 6, journal: '' });
    const result = evaluateAchievements({ ...base, checkIns, streak: 3 });
    expect(result).toContain('streak_3');
  });

  it('awards streak_7 at streak = 7', () => {
    const checkIns = Array(7).fill({ id: '1', mood: 5, energy: 5, stress: 5, sleep: 7, studyHours: 6, journal: '' });
    const result = evaluateAchievements({ ...base, checkIns, streak: 7 });
    expect(result).toContain('streak_7');
  });

  it('does not award streak_7 at streak = 6', () => {
    const checkIns = Array(6).fill({ id: '1', mood: 5, energy: 5, stress: 5, sleep: 7, studyHours: 6, journal: '' });
    const result = evaluateAchievements({ ...base, checkIns, streak: 6 });
    expect(result).not.toContain('streak_7');
  });

  it('awards reflective when a check-in has a journal entry', () => {
    const checkIns = [{ id: '1', mood: 5, energy: 5, stress: 5, sleep: 7, studyHours: 6, journal: 'Had a tough day.' }];
    const result = evaluateAchievements({ ...base, checkIns, streak: 1 });
    expect(result).toContain('reflective');
  });

  it('does not award reflective for empty journal', () => {
    const checkIns = [{ id: '1', mood: 5, energy: 5, stress: 5, sleep: 7, studyHours: 6, journal: '' }];
    const result = evaluateAchievements({ ...base, checkIns, streak: 1 });
    expect(result).not.toContain('reflective');
  });

  it('awards balanced when mood, energy, and sleep all exceed 7', () => {
    const checkIns = [{ id: '1', mood: 8, energy: 8, stress: 3, sleep: 8, studyHours: 6, journal: '' }];
    const result = evaluateAchievements({ ...base, checkIns, streak: 1 });
    expect(result).toContain('balanced');
  });

  it('does not award balanced when any metric is ≤ 7', () => {
    const checkIns = [{ id: '1', mood: 7, energy: 8, stress: 3, sleep: 8, studyHours: 6, journal: '' }];
    const result = evaluateAchievements({ ...base, checkIns, streak: 1 });
    expect(result).not.toContain('balanced');
  });

  it('awards zen when stress is ≤ 3', () => {
    const checkIns = [{ id: '1', mood: 5, energy: 5, stress: 3, sleep: 7, studyHours: 6, journal: '' }];
    const result = evaluateAchievements({ ...base, checkIns, streak: 1 });
    expect(result).toContain('zen');
  });

  it('awards scholar when studyHours ≥ 10', () => {
    const checkIns = [{ id: '1', mood: 5, energy: 5, stress: 5, sleep: 7, studyHours: 10, journal: '' }];
    const result = evaluateAchievements({ ...base, checkIns, streak: 1 });
    expect(result).toContain('scholar');
  });

  it('awards early_bird when sleep ≥ 8', () => {
    const checkIns = [{ id: '1', mood: 5, energy: 5, stress: 5, sleep: 8, studyHours: 6, journal: '' }];
    const result = evaluateAchievements({ ...base, checkIns, streak: 1 });
    expect(result).toContain('early_bird');
  });

  it('returns an empty array if no new achievements are earned', () => {
    const checkIns = Array(3).fill({ id: '1', mood: 5, energy: 5, stress: 5, sleep: 7, studyHours: 6, journal: '' });
    const allIds   = ['first_step', 'streak_3', 'reflective', 'balanced', 'early_bird', 'scholar', 'zen',
                      'streak_7', 'streak_14', 'streak_30'];
    const result = evaluateAchievements({ checkIns, streak: 3, earned: allIds });
    expect(result).toEqual([]);
  });
});

// ─── getAchievementDef ────────────────────────────────────────────────────────

describe('getAchievementDef', () => {
  it('returns the correct definition for a valid id', () => {
    const def = getAchievementDef('streak_7');
    expect(def).not.toBeNull();
    expect(def.label).toBeTruthy();
    expect(def.emoji).toBeTruthy();
  });

  it('returns null for an unknown id', () => {
    expect(getAchievementDef('non_existent_id')).toBeNull();
  });
});

// ─── getEarnedAchievements / getUnearnedAchievements ─────────────────────────

describe('getEarnedAchievements', () => {
  it('returns only defs matching the earned IDs', () => {
    const earned = getEarnedAchievements(['first_step', 'streak_3']);
    expect(earned.map(d => d.id)).toEqual(expect.arrayContaining(['first_step', 'streak_3']));
    expect(earned.length).toBe(2);
  });

  it('returns empty array for no earned IDs', () => {
    expect(getEarnedAchievements([])).toEqual([]);
  });
});

describe('getUnearnedAchievements', () => {
  it('excludes earned IDs', () => {
    const unearned = getUnearnedAchievements(['first_step']);
    expect(unearned.map(d => d.id)).not.toContain('first_step');
  });

  it('returns all defs when none earned', () => {
    const unearned = getUnearnedAchievements([]);
    expect(unearned.length).toBe(ACHIEVEMENT_DEFS.length);
  });
});
