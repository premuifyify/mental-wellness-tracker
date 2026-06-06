export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Smart Meal Planner';

export const STORAGE_KEYS = {
  HISTORY: 'meal-planner-history',
  THEME:   'meal-planner-theme',
};

export const DIET_TYPES = [
  { value: 'non-vegetarian', label: 'Non-Vegetarian' },
  { value: 'vegetarian',     label: 'Vegetarian'     },
  { value: 'vegan',          label: 'Vegan'           },
];

export const CUISINE_OPTIONS = [
  { value: 'any',            label: 'Any / Surprise me' },
  { value: 'italian',        label: 'Italian'           },
  { value: 'mexican',        label: 'Mexican'           },
  { value: 'indian',         label: 'Indian'            },
  { value: 'asian',          label: 'Asian'             },
  { value: 'mediterranean',  label: 'Mediterranean'     },
  { value: 'american',       label: 'American'          },
  { value: 'middle-eastern', label: 'Middle Eastern'    },
  { value: 'japanese',       label: 'Japanese'          },
  { value: 'thai',           label: 'Thai'              },
];

export const COOKING_TIME_OPTIONS = [
  { value: '15',  label: '15 minutes' },
  { value: '30',  label: '30 minutes' },
  { value: '45',  label: '45 minutes' },
  { value: '60',  label: '1 hour'     },
  { value: '90',  label: '90 minutes' },
  { value: '120', label: '2 hours'    },
];

export const MEAL_HISTORY_LIMIT = 5;

export const INGREDIENT_CHAR_LIMIT = 500;

export const TOAST_MESSAGES = {
  PLAN_SUCCESS:   'Meal plan generated!',
  PLAN_ERROR:     'Failed to generate plan. Please try again.',
  COPY_SUCCESS:   'Grocery list copied to clipboard!',
  EXPORT_SUCCESS: 'Grocery list exported!',
  GENERIC_ERROR:  'Something went wrong. Please try again.',
};

export const MEAL_LABELS = {
  breakfast: { label: 'Breakfast', emoji: '🌅', color: 'amber'   },
  lunch:     { label: 'Lunch',     emoji: '☀️',  color: 'emerald' },
  dinner:    { label: 'Dinner',    emoji: '🌙', color: 'indigo'  },
};
