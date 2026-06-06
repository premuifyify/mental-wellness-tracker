import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `You are ExamMind's wellness companion — a supportive, empathetic AI assistant for Indian students preparing for competitive exams like JEE, NEET, CUET, CAT, GATE, UPSC, and Board Exams.

CRITICAL GUIDELINES:
- You are NOT a therapist. You do NOT diagnose mental illness. You do NOT provide medical advice.
- Use supportive, practical, warm, student-friendly language in everyday English.
- Keep all responses concise and actionable — students are busy.
- Use qualifying language: "Based on your recent patterns...", "You may benefit from...", "It might help to...", "It sounds like..."
- When burnout risk is high, gently encourage rest, talking to a trusted family member, teacher, or counsellor.
- Celebrate effort and small wins — not just outcomes.
- Be culturally aware: Indian exam pressure, family expectations, peer comparison are real stressors.
- NEVER claim certainty about a student's mental state.

You understand the unique pressures of Indian competitive exam preparation:
- 10–14 hour study days, coaching institute culture
- JEE/NEET rank anxiety, parental expectations
- Syllabus pressure, mock test performance anxiety
- Board exams and cut-off stress`;

function daysUntil(examDate) {
  if (!examDate) return null;
  const diff = new Date(examDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mood, energy, stress, sleep, studyHours, emotion, exam, examDate, journal, burnout } =
    req.body ?? {};

  if (typeof mood !== 'number' || typeof stress !== 'number' || typeof energy !== 'number') {
    return res.status(400).json({
      error: 'Invalid check-in data: mood, stress, and energy are required numbers.',
    });
  }

  const days = daysUntil(examDate);
  const context = [
    `Mood: ${mood}/10`,
    `Energy: ${energy}/10`,
    `Stress: ${stress}/10`,
    `Sleep: ${sleep ?? '?'}h`,
    `Study hours today: ${studyHours ?? '?'}h`,
    `Current emotion: ${emotion ?? 'not specified'}`,
    exam ? `Exam: ${exam}` : null,
    days !== null ? `Days until exam: ${days}` : null,
    burnout ? `Burnout risk: ${burnout.risk} (score ${burnout.score}/100)` : null,
    journal?.trim() ? `\nJournal entry:\n"${journal.trim()}"` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const prompt = `${SYSTEM_INSTRUCTION}

---
Student check-in data:
${context}

Respond ONLY with a JSON object matching this exact schema (no markdown, no prose outside JSON):

{
  "reflection": {
    "summary": "2–3 sentences: empathetic summary of how the student seems to be doing, referencing specific patterns.",
    "encouragement": "1–2 sentences: warm, specific encouragement referencing their exam or effort.",
    "focusSuggestion": "1 sentence: actionable study or focus tip for today.",
    "selfCareSuggestion": "1 sentence: self-care suggestion relevant to their current metrics.",
    "positiveReminder": "1 sentence: short, uplifting affirmation for their journey."
  },
  "triggers": [
    { "trigger": "<trigger name>", "confidence": <0.0–1.0> }
  ],
  "suggestions": {
    "breakSuggestion": "1 sentence: specific break activity to recharge.",
    "hydrationReminder": "1 sentence: gentle hydration or nutrition nudge.",
    "tomorrowGoal": "1 sentence: small, realistic goal for tomorrow.",
    "quote": "An inspiring quote relevant to exam preparation or perseverance."
  }
}

Valid trigger names (include only if genuinely relevant, max 3):
"Lack of sleep", "Mock test performance", "Fear of results",
"Comparison with friends", "Time pressure", "Family expectations", "Burnout"

Return ONLY valid JSON.`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    // Strip potential markdown code fences
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();
    const jsonStr = cleaned.match(/\{[\s\S]*\}/)?.[0];

    if (!jsonStr) throw new Error('No JSON found in model response');

    const parsed = JSON.parse(jsonStr);

    if (!parsed.reflection || !parsed.suggestions) {
      throw new Error('Incomplete response structure from model');
    }

    // Sanitize triggers
    if (!Array.isArray(parsed.triggers)) parsed.triggers = [];
    parsed.triggers = parsed.triggers
      .filter(t => t && typeof t.trigger === 'string' && typeof t.confidence === 'number')
      .slice(0, 3);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('[wellness-companion] Error:', err.message);
    return res.status(500).json({
      error: 'Failed to generate wellness response',
      message: err.message,
    });
  }
}
