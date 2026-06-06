// Thin wrapper around the Vercel serverless function /api/wellness-companion.
// The actual Gemini API call happens on the server — the API key is never
// exposed to the browser. This module only handles the HTTP transport.
const API_URL = '/api/wellness-companion';

/**
 * Calls the ExamMind wellness companion API with today's check-in data.
 *
 * @param {Object} checkInData - the full check-in object including burnout score
 * @returns {Promise<{ reflection: Object, triggers: Array, suggestions: Object }>}
 * @throws {Error} with a human-readable message on HTTP error or bad JSON
 */
export async function getWellnessCompanion(checkInData) {
  const res = await fetch(API_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(checkInData),
  });

  if (!res.ok) {
    // Attempt to parse the server's error message for better DX in the toast.
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error ?? `API error: ${res.status}`);
  }

  return res.json();
}
