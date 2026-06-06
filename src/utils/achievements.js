import { ACHIEVEMENT_DEFS } from '../constants/index.js';

/**
 * Returns IDs of achievements newly earned given the current app state.
 * Does not mutate inputs.
 */
export function evaluateAchievements({ checkIns, streak, earned }) {
  const isNew = (id) => !earned.includes(id);
  const newly = [];

  if (isNew('first_step') && checkIns.length >= 1) {
    newly.push('first_step');
  }

  const streakMilestones = [
    ['streak_3',  3],
    ['streak_7',  7],
    ['streak_14', 14],
    ['streak_30', 30],
  ];
  for (const [id, threshold] of streakMilestones) {
    if (isNew(id) && streak >= threshold) newly.push(id);
  }

  if (isNew('reflective') && checkIns.some(ci => ci.journal?.trim().length > 0)) {
    newly.push('reflective');
  }

  if (isNew('balanced') && checkIns.some(ci => ci.mood > 7 && ci.energy > 7 && ci.sleep > 7)) {
    newly.push('balanced');
  }

  if (isNew('early_bird') && checkIns.some(ci => ci.sleep >= 8)) {
    newly.push('early_bird');
  }

  if (isNew('scholar') && checkIns.some(ci => ci.studyHours >= 10)) {
    newly.push('scholar');
  }

  if (isNew('zen') && checkIns.some(ci => ci.stress <= 3)) {
    newly.push('zen');
  }

  return newly;
}

export function getAchievementDef(id) {
  return ACHIEVEMENT_DEFS.find(a => a.id === id) ?? null;
}

export function getEarnedAchievements(earnedIds) {
  return ACHIEVEMENT_DEFS.filter(a => earnedIds.includes(a.id));
}

export function getUnearnedAchievements(earnedIds) {
  return ACHIEVEMENT_DEFS.filter(a => !earnedIds.includes(a.id));
}
