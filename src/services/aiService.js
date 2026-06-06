const API_URL = '/api/wellness-companion';

/**
 * Calls the ExamMind wellness companion API.
 * Returns: { reflection, triggers, suggestions }
 */
export async function getWellnessCompanion(checkInData) {
  const res = await fetch(API_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(checkInData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error ?? `API error: ${res.status}`);
  }

  return res.json();
}
