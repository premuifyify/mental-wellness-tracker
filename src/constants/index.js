// ─── Supported exams ─────────────────────────────────────────────────────────
// Shown in the CheckIn exam selector. Add new entries here to extend coverage.
export const EXAMS = [
  'JEE', 'NEET', 'CUET', 'CAT', 'GATE', 'UPSC', 'Board Exams',
];

// ─── Emotion options ──────────────────────────────────────────────────────────
// Each emotion has a Tailwind color key used by EmotionPicker for the selected
// border/background highlight. Colors must exist in tailwind.config.js safelist
// or be used elsewhere so they aren't purged.
export const EMOTIONS = [
  { id: 'calm',        label: 'Calm',        emoji: '😌', color: 'blue' },
  { id: 'happy',       label: 'Happy',       emoji: '😊', color: 'yellow' },
  { id: 'motivated',   label: 'Motivated',   emoji: '💪', color: 'green' },
  { id: 'nervous',     label: 'Nervous',     emoji: '😰', color: 'orange' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '😵', color: 'red' },
  { id: 'anxious',     label: 'Anxious',     emoji: '😟', color: 'purple' },
  { id: 'burned_out',  label: 'Burned Out',  emoji: '🔥', color: 'rose' },
];

// ─── Achievement definitions ──────────────────────────────────────────────────
// Source of truth for all badge metadata. evaluateAchievements() uses the `id`
// fields to determine what's newly earned; the UI uses the rest for display.
// To add a new achievement: append here AND add the evaluation logic in
// src/utils/achievements.js.
export const ACHIEVEMENT_DEFS = [
  {
    id: 'first_step',
    label: 'First Step',
    description: 'Completed your first check-in',
    emoji: '🌱',
    type: 'milestone',
  },
  {
    id: 'streak_3',
    label: 'On a Roll',
    description: '3 days in a row — keep going!',
    emoji: '🔥',
    type: 'streak',
    threshold: 3,
  },
  {
    id: 'streak_7',
    label: 'Week Warrior',
    description: '7-day streak — impressive dedication!',
    emoji: '⚡',
    type: 'streak',
    threshold: 7,
  },
  {
    id: 'streak_14',
    label: 'Fortnight Focus',
    description: '14 days of consistent check-ins',
    emoji: '🌟',
    type: 'streak',
    threshold: 14,
  },
  {
    id: 'streak_30',
    label: 'Monthly Master',
    description: '30-day streak — truly remarkable!',
    emoji: '🏆',
    type: 'streak',
    threshold: 30,
  },
  {
    id: 'reflective',
    label: 'Reflective Mind',
    description: 'Wrote your first journal entry',
    emoji: '📝',
    type: 'milestone',
  },
  {
    id: 'balanced',
    label: 'Balanced Day',
    description: 'Mood, energy and sleep all above 7',
    emoji: '⚖️',
    type: 'milestone',
  },
  {
    id: 'early_bird',
    label: 'Well Rested',
    description: 'Logged 8+ hours of sleep',
    emoji: '🌙',
    type: 'milestone',
  },
  {
    id: 'scholar',
    label: 'Scholar Mode',
    description: 'Logged 10+ study hours in a day',
    emoji: '📚',
    type: 'milestone',
  },
  {
    id: 'zen',
    label: 'Zen State',
    description: 'Stress level of 3 or below',
    emoji: '🧘',
    type: 'milestone',
  },
];

// ─── localStorage keys ────────────────────────────────────────────────────────
// Namespaced with "examMind_" to avoid collisions if this domain hosts other
// apps. Changing a key name will effectively reset that slice of data for
// existing users — treat as a breaking change.
export const STORAGE_KEYS = {
  CHECK_INS:    'examMind_checkIns',
  ACHIEVEMENTS: 'examMind_achievements',
  THEME:        'examMind_theme',
};

// ─── View identifiers ─────────────────────────────────────────────────────────
// Used by AppContext.currentView and NavBar to control which page is shown.
// The app uses client-side state routing (no URL router) so these are plain
// string constants rather than URL paths.
export const VIEWS = {
  DASHBOARD:    'dashboard',
  CHECKIN:      'checkin',
  TIMELINE:     'timeline',
  JOURNAL:      'journal',
  ACHIEVEMENTS: 'achievements',
};

// ─── Mood label map ───────────────────────────────────────────────────────────
// Maps integer slider values (1–10) to human-readable labels used for
// aria-valuetext on sliders and tooltips.
export const MOOD_LABELS = {
  1: 'Very Low', 2: 'Low', 3: 'Below Average', 4: 'Fair',
  5: 'Average', 6: 'Decent', 7: 'Good', 8: 'Very Good',
  9: 'Excellent', 10: 'Outstanding',
};
