/**
 * Pure utility functions for ingredient list manipulation.
 */

/**
 * Parses a raw textarea string of available ingredients into a normalised array.
 * Handles comma-separated, newline-separated, or mixed input.
 */
export function parseAvailableIngredients(raw) {
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(/[\n,]+/)
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Removes ingredients from the grocery list that the user already has.
 * @param {string[]} groceryList
 * @param {string[]} availableIngredients — already normalised (lowercase, trimmed)
 * @returns {string[]}
 */
export function filterAvailableIngredients(groceryList, availableIngredients) {
  if (!availableIngredients.length) return groceryList;
  return groceryList.filter(
    item => !availableIngredients.some(avail => item.toLowerCase().includes(avail))
  );
}

/**
 * Removes duplicate entries from an ingredient array (case-insensitive).
 * @param {string[]} ingredients
 * @returns {string[]}
 */
export function deduplicateIngredients(ingredients) {
  const seen = new Set();
  return ingredients.filter(item => {
    const key = item.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Formats a grocery list as a plain-text string for clipboard / file export.
 * @param {string[]} items
 * @param {string}   title
 * @returns {string}
 */
export function formatGroceryListAsText(items, title = 'Grocery List') {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const lines = items.map(item => `  • ${item}`).join('\n');
  return `${title}\nGenerated on ${date}\n${'─'.repeat(40)}\n${lines}\n`;
}
