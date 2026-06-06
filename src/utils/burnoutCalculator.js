/**
 * Deterministic burnout risk calculator.
 * AI is NOT involved in this computation — rule-based logic only.
 *
 * Score breakdown (max 100):
 *   Stress     → up to 30 pts
 *   Sleep      → up to 25 pts
 *   Mood       → up to 20 pts
 *   Energy     → up to 15 pts
 *   StudyHours → up to 10 pts
 */
export function calculateBurnoutScore({ stress, sleep, mood, energy, studyHours }) {
  let score = 0;

  // Stress: high stress = high risk
  if (stress >= 9)      score += 30;
  else if (stress >= 7) score += 20;
  else if (stress >= 5) score += 10;

  // Sleep: low sleep = high risk
  if (sleep <= 4)      score += 25;
  else if (sleep <= 5) score += 18;
  else if (sleep <= 6) score += 10;

  // Mood: low mood = high risk
  if (mood <= 3)      score += 20;
  else if (mood <= 5) score += 12;
  else if (mood <= 6) score += 5;

  // Energy: low energy = high risk
  if (energy <= 3)      score += 15;
  else if (energy <= 5) score += 8;
  else if (energy <= 6) score += 3;

  // Study hours: excessive studying = risk
  if (studyHours >= 14)      score += 10;
  else if (studyHours >= 12) score += 7;
  else if (studyHours >= 10) score += 4;

  const normalized = Math.min(Math.max(score, 0), 100);

  let risk;
  if (normalized >= 60)      risk = 'high';
  else if (normalized >= 30) risk = 'moderate';
  else                        risk = 'low';

  return { score: normalized, risk };
}

export const BURNOUT_META = {
  low: {
    label:  'Low Risk',
    color:  'emerald',
    icon:   '✓',
    advice: 'Great balance! Keep up your healthy routines.',
    bgClass:   'bg-emerald-500/10 border-emerald-500/20',
    textClass: 'text-emerald-400',
  },
  moderate: {
    label:  'Moderate Risk',
    color:  'amber',
    icon:   '!',
    advice: 'Consider adding short breaks and protecting your sleep schedule.',
    bgClass:   'bg-amber-500/10 border-amber-500/20',
    textClass: 'text-amber-400',
  },
  high: {
    label:  'High Risk',
    color:  'red',
    icon:   '⚠',
    advice: 'Please rest. Talk to a trusted teacher, family member, or counselor.',
    bgClass:   'bg-red-500/10 border-red-500/20',
    textClass: 'text-red-400',
  },
};
