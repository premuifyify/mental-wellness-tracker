/**
 * Frontend API client — calls our Vercel serverless function.
 * The Anthropic API key never touches this file.
 */

const API_ENDPOINT = '/api/generate-plan';

/**
 * @param {{
 *   cookingTime: string,
 *   budget: number,
 *   people: number,
 *   dietType: string,
 *   cuisinePreference: string,
 *   availableIngredients: string,
 *   calorieGoal: number | null
 * }} userInput
 * @returns {Promise<object>} Full meal plan with budgetAnalysis
 * @throws {Error} with a user-facing message
 */
export async function generateMealPlan(userInput) {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userInput),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}
