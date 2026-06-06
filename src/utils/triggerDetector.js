/**
 * Detects likely stress triggers from journal text + check-in metrics.
 * Fully client-side, pattern-based — no AI or network call involved.
 *
 * How confidence is calculated per trigger (max 1.0):
 *   Keyword score  → up to 0.6 — (matched keywords / total keywords) × 0.6
 *   Metric score   → up to 0.4 — +0.4 if the metric condition is true
 *
 * A trigger must score ≥ 0.15 to be included in results.
 * Final output: top 3 triggers sorted by confidence descending.
 *
 * The 0.6 / 0.4 split means a trigger can appear from keywords alone
 * (if ≥ ~25% of its keywords match) without needing a metric signal,
 * and vice-versa (metric alone contributes 0.4 which is above the threshold).
 */

const TRIGGER_PATTERNS = {
  'Lack of sleep': {
    keywords: [
      'sleep', 'tired', 'exhausted', 'insomnia', 'awake', 'fatigue',
      'rest', 'slept', 'drowsy', 'yawn', 'sleepy', 'no sleep',
    ],
    // Metric fires when sleep is below the 6h healthy threshold
    metricCheck: ({ sleep }) => typeof sleep === 'number' && sleep < 6,
  },
  'Mock test performance': {
    keywords: [
      'test', 'mock', 'score', 'marks', 'failed', 'performance', 'exam',
      'wrong', 'mistake', 'paper', 'question', 'attempt', 'rank',
    ],
    metricCheck: ({ stress }) => typeof stress === 'number' && stress >= 7,
  },
  'Fear of results': {
    keywords: [
      'result', 'rank', 'scared', 'afraid', 'fear', 'worry', 'what if',
      'fail', 'pass', 'selection', 'nervous', 'tension', 'cut-off',
    ],
    metricCheck: ({ mood }) => typeof mood === 'number' && mood <= 5,
  },
  'Comparison with friends': {
    keywords: [
      'friend', 'classmate', 'others', 'peers', 'topper', 'better than',
      'compare', 'behind', 'ahead', 'batch', 'coaching', 'they',
    ],
    metricCheck: ({ mood }) => typeof mood === 'number' && mood <= 6,
  },
  'Time pressure': {
    keywords: [
      'time', 'deadline', 'pressure', 'syllabus', 'pending', 'behind',
      'not enough', 'running out', 'revision', 'complete', 'rushing',
    ],
    metricCheck: ({ stress }) => typeof stress === 'number' && stress >= 6,
  },
  'Family expectations': {
    keywords: [
      'family', 'parents', 'mom', 'dad', 'expectations', 'disappoint',
      'proud', 'home', 'relatives', 'pressure from', 'they want',
    ],
    metricCheck: ({ stress }) => typeof stress === 'number' && stress >= 6,
  },
  'Burnout': {
    keywords: [
      'burnout', 'burn out', 'done', 'give up', 'quit', 'anymore',
      "can't", 'no motivation', 'pointless', 'exhausted', 'empty',
    ],
    // Both energy AND mood must be very low — single-metric dips are
    // more likely fatigue or bad day than actual burnout.
    metricCheck: ({ energy, mood }) =>
      typeof energy === 'number' && typeof mood === 'number' &&
      energy <= 4 && mood <= 4,
  },
};

/**
 * @param {Object} params
 * @param {string} params.journal      - free-text journal entry (may be empty)
 * @param {number} params.mood         - 1–10
 * @param {number} params.stress       - 1–10
 * @param {number} params.energy       - 1–10
 * @param {number} params.sleep        - hours
 * @param {number} params.studyHours   - hours
 * @returns {{ trigger: string, confidence: number }[]} up to 3 items, sorted desc
 */
export function detectTriggers({ journal = '', mood, stress, energy, sleep, studyHours }) {
  const text   = journal.toLowerCase();
  const results = [];

  for (const [trigger, { keywords, metricCheck }] of Object.entries(TRIGGER_PATTERNS)) {
    let confidence = 0;

    // Keyword matching — only runs when there's actual journal text.
    // Substring matching (includes) catches "tired" inside "overtired", etc.
    if (text.trim().length > 0) {
      const matched = keywords.filter(kw => text.includes(kw)).length;
      confidence += (matched / keywords.length) * 0.6;
    }

    // Metric condition — wrapped in try/catch because partial check-in data
    // (e.g., missing sleep field) would otherwise throw and discard results.
    try {
      if (metricCheck({ mood, stress, energy, sleep, studyHours })) {
        confidence += 0.4;
      }
    } catch {
      // partial metrics — skip metric check for this trigger
    }

    if (confidence >= 0.15) {
      results.push({
        trigger,
        confidence: Math.round(confidence * 100) / 100,
      });
    }
  }

  // Sort descending and cap at 3 — showing more than 3 triggers at once
  // would overwhelm the student rather than helping them focus.
  return results
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
}
