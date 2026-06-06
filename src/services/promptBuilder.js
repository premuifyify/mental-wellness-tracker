/**
 * Builds the Claude prompt from validated user input.
 * Keeping prompt logic isolated from both the UI and the API handler
 * makes it easy to iterate on without touching either side.
 *
 * Imported by: api/generate-plan.js (server-side only)
 */

/**
 * @param {{
 *   cookingTime: string,
 *   budget: number,
 *   people: number,
 *   dietType: string,
 *   cuisinePreference: string,
 *   availableIngredients: string,
 *   calorieGoal: number | null
 * }} input
 * @returns {string}
 */
export function buildMealPrompt(input) {
  const {
    cookingTime,
    budget,
    people,
    dietType,
    cuisinePreference,
    availableIngredients,
    calorieGoal,
  } = input;

  const peopleLabel = `${people} ${people === 1 ? 'person' : 'people'}`;
  const cuisine = cuisinePreference === 'any' ? 'any cuisine you choose' : `${cuisinePreference} cuisine`;
  const hasIngredients = availableIngredients && availableIngredients.trim();

  const lines = [
    `Create a full-day meal plan with the following requirements:`,
    ``,
    `- Cooking time budget: ${cookingTime} minutes total across all meals`,
    `- Daily food budget: $${budget.toFixed(2)} for ${peopleLabel}`,
    `- Diet type: ${dietType} (strictly enforced — no exceptions)`,
    `- Cuisine preference: ${cuisine}`,
    hasIngredients
      ? `- Ingredients already available (exclude from grocery list): ${availableIngredients}`
      : `- No ingredients are pre-available`,
    calorieGoal
      ? `- Target calorie goal: approximately ${calorieGoal} kcal per day`
      : `- No specific calorie target`,
    ``,
    `Return ONLY the following JSON structure. No markdown, no prose, no code fences:`,
    ``,
    `{`,
    `  "breakfast": { "dish": "", "ingredients": [], "cookTime": "", "estimatedCost": 0 },`,
    `  "lunch":     { "dish": "", "ingredients": [], "cookTime": "", "estimatedCost": 0 },`,
    `  "dinner":    { "dish": "", "ingredients": [], "cookTime": "", "estimatedCost": 0 },`,
    `  "groceryList": [],`,
    `  "substitutions": [{ "ingredient": "", "alternatives": [] }]`,
    `}`,
    ``,
    `Rules:`,
    `- estimatedCost is in USD and covers ${peopleLabel}`,
    `- groceryList must exclude ingredients already available`,
    `- Provide 3–5 substitutions for expensive or hard-to-find ingredients`,
    `- Each meal's cookTime is a human-friendly string (e.g. "20 mins")`,
    `- Respect the ${cookingTime}-minute total cooking constraint across all three meals`,
    `- Dish names should be appealing and specific (e.g. "Creamy Tuscan Chicken" not "Chicken Dish")`,
  ];

  return lines.join('\n');
}
