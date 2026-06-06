import { ACHIEVEMENT_DEFS } from '../constants/index.js';

/**
 * Returns IDs of achievements newly earned given the current app state.
 * Called by AppContext.processCheckIn after every save so badges are awarded
 * in real time. Does not mutate inputs.
 *
 * @param {Object} params
 * @param {Array}  params.checkIns - all saved check-ins (already includes latest)
 * @param {number} params.streak   - current streak length after this check-in
 * @param {Array}  params.earned   - IDs already awarded (prevents re-awarding)
 */
export function evaluateAchievements({ checkIns, streak, earned }) {
  // isNew guards against re-awarding — once an achievement ID is in `earned`
  // it will never appear in the returned array again.
  const isNew = (id) => !earned.includes(id);
  const newly = [];

  // Milestone: first ever check-in
  if (isNew('first_step') && checkIns.length >= 1) {
    newly.push('first_step');
  }

  // Streak milestones — evaluated in ascending order so multiple can trigger
  // in the same session (e.g., on day 7 both streak_3 and streak_7 fire if
  // the user had been away for a while and streak_3 was never awarded).
  const streakMilestones = [
    ['streak_3',  3],
    ['streak_7',  7],
    ['streak_14', 14],
    ['streak_30', 30],
  ];
  for (const [id, threshold] of streakMilestones) {
    if (isNew(id) && streak >= threshold) newly.push(id);
  }

  // Milestone: wrote at least one journal entry across all check-ins
  if (isNew('reflective') && checkIns.some(ci => ci.journal?.trim().length > 0)) {
    newly.push('reflective');
  }

  // Milestone: all three wellbeing metrics above 7 on the same day.
  // Threshold is strictly > 7 (not >=) so an 8 is the minimum qualifying value.
  if (isNew('balanced') && checkIns.some(ci => ci.mood > 7 && ci.energy > 7 && ci.sleep > 7)) {
    newly.push('balanced');
  }

  // Milestone: 8+ hours of sleep logged
  if (isNew('early_bird') && checkIns.some(ci => ci.sleep >= 8)) {
    newly.push('early_bird');
  }

  // Milestone: 10+ study hours in a single day
  if (isNew('scholar') && checkIns.some(ci => ci.studyHours >= 10)) {
    newly.push('scholar');
  }

  // Milestone: stress at or below 3 (very relaxed)
  if (isNew('zen') && checkIns.some(ci => ci.stress <= 3)) {
    newly.push('zen');
  }

  return newly;
}

/** Returns the full definition object for a given achievement ID, or null. */
export function getAchievementDef(id) {
  return ACHIEVEMENT_DEFS.find(a => a.id === id) ?? null;
}

/** Returns definition objects for IDs that are in earnedIds. */
export function getEarnedAchievements(earnedIds) {
  return ACHIEVEMENT_DEFS.filter(a => earnedIds.includes(a.id));
}

/** Returns definition objects for IDs that are NOT in earnedIds. */
export function getUnearnedAchievements(earnedIds) {
  return ACHIEVEMENT_DEFS.filter(a => !earnedIds.includes(a.id));
}
