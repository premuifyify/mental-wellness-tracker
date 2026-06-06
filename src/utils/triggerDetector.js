/**
 * Detects likely stress triggers from journal text and check-in metrics.
 * Pattern-based — no AI involved.
 * Returns top triggers sorted by confidence, max 3.
 */

const TRIGGER_PATTERNS = {
  'Lack of sleep': {
    keywords: [
      'sleep', 'tired', 'exhausted', 'insomnia', 'awake', 'fatigue',
      'rest', 'slept', 'drowsy', 'yawn', 'sleepy', 'no sleep',
    ],
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
    metricCheck: ({ energy, mood }) =>
      typeof energy === 'number' && typeof mood === 'number' &&
      energy <= 4 && mood <= 4,
  },
};

export function detectTriggers({ journal = '', mood, stress, energy, sleep, studyHours }) {
  const text   = journal.toLowerCase();
  const results = [];

  for (const [trigger, { keywords, metricCheck }] of Object.entries(TRIGGER_PATTERNS)) {
    let confidence = 0;

    // Keyword matching contributes up to 0.6
    if (text.trim().length > 0) {
      const matched = keywords.filter(kw => text.includes(kw)).length;
      confidence += (matched / keywords.length) * 0.6;
    }

    // Metric conditions contribute up to 0.4
    try {
      if (metricCheck({ mood, stress, energy, sleep, studyHours })) {
        confidence += 0.4;
      }
    } catch {
      // partial metrics — skip condition check
    }

    if (confidence >= 0.15) {
      results.push({
        trigger,
        confidence: Math.round(confidence * 100) / 100,
      });
    }
  }

  return results
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
}
