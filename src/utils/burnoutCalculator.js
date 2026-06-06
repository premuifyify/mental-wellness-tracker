/**
 * Deterministic burnout risk calculator — no AI, no network calls.
 * Run client-side immediately on form submit so the score is available
 * before the Gemini response arrives.
 *
 * Score breakdown (max 100 pts):
 *   Stress     → up to 30 pts  (highest weight — stress is the #1 predictor)
 *   Sleep      → up to 25 pts  (chronic sleep loss compounds all other risks)
 *   Mood       → up to 20 pts
 *   Energy     → up to 15 pts
 *   StudyHours → up to 10 pts  (excessive studying, not low — a JEE-specific risk)
 *
 * Risk bands:
 *   score >= 60  → high      (immediate self-care advice)
 *   score >= 30  → moderate  (gentle suggestions)
 *   score <  30  → low       (positive reinforcement)
 */
export function calculateBurnoutScore({ stress, sleep, mood, energy, studyHours }) {
  let score = 0;

  // Stress — 3-tier scale; 9-10 triggers maximum penalty because at that
  // level physiological symptoms (headache, panic) are common.
  if (stress >= 9)      score += 30;
  else if (stress >= 7) score += 20;
  else if (stress >= 5) score += 10;

  // Sleep — penalty kicks in below 6h because below that threshold
  // cognitive performance degrades measurably for exam prep.
  if (sleep <= 4)      score += 25;
  else if (sleep <= 5) score += 18;
  else if (sleep <= 6) score += 10;

  // Mood — low mood amplifies all other stressors.
  if (mood <= 3)      score += 20;
  else if (mood <= 5) score += 12;
  else if (mood <= 6) score += 5;

  // Energy — separate from mood because a student can feel emotionally okay
  // but still be physically drained (common after consecutive all-nighters).
  if (energy <= 3)      score += 15;
  else if (energy <= 5) score += 8;
  else if (energy <= 6) score += 3;

  // Study hours — penalty for excessive hours, not low hours.
  // 14h+ is associated with diminishing returns and injury risk;
  // normal healthy study (6–10h) contributes zero points.
  if (studyHours >= 14)      score += 10;
  else if (studyHours >= 12) score += 7;
  else if (studyHours >= 10) score += 4;

  // Clamp to [0, 100] in case future weight changes push it over.
  const normalized = Math.min(Math.max(score, 0), 100);

  let risk;
  if (normalized >= 60)      risk = 'high';
  else if (normalized >= 30) risk = 'moderate';
  else                        risk = 'low';

  return { score: normalized, risk };
}

// Display metadata keyed by risk level — used by BurnoutCard and exportUtils.
// bgClass / textClass are Tailwind utility strings; they must be written in
// full (not constructed dynamically) so Tailwind's class scanner detects them.
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
