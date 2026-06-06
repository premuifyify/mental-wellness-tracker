import { useState } from 'react';
import { ChefHat, Clock, Users, Wallet, Salad, Globe, Flame } from 'lucide-react';
import {
  DIET_TYPES,
  CUISINE_OPTIONS,
  COOKING_TIME_OPTIONS,
  INGREDIENT_CHAR_LIMIT,
} from '@/constants';

const INITIAL_FORM = {
  cookingTime:          '30',
  budget:               '',
  people:               '2',
  dietType:             'non-vegetarian',
  cuisinePreference:    'any',
  availableIngredients: '',
  calorieGoal:          '',
};

function validate(data) {
  const errors = {};

  const budget = parseFloat(data.budget);
  if (!data.budget || isNaN(budget) || budget <= 0) {
    errors.budget = 'Enter a valid budget greater than $0.';
  }

  const people = parseInt(data.people, 10);
  if (!data.people || isNaN(people) || people < 1 || people > 20) {
    errors.people = 'Number of people must be between 1 and 20.';
  }

  if (data.calorieGoal) {
    const cal = parseInt(data.calorieGoal, 10);
    if (isNaN(cal) || cal < 500 || cal > 10000) {
      errors.calorieGoal = 'Calorie goal must be between 500 and 10,000 kcal.';
    }
  }

  if (data.availableIngredients.length > INGREDIENT_CHAR_LIMIT) {
    errors.availableIngredients = `Maximum ${INGREDIENT_CHAR_LIMIT} characters.`;
  }

  return errors;
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-xs text-red-500 dark:text-red-400">
      {message}
    </p>
  );
}

function Label({ icon: Icon, children, htmlFor, required }) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
    >
      {Icon && <Icon size={14} className="text-brand-600 dark:text-brand-400" />}
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

const inputBase =
  'w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 ' +
  'text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm shadow-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ' +
  'transition-colors placeholder-gray-400 dark:placeholder-gray-500';

const inputError =
  'border-red-400 dark:border-red-500 focus:ring-red-400';

export default function InputForm({ onSubmit, isLoading }) {
  const [form, setForm]     = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit({
      cookingTime:          form.cookingTime,
      budget:               parseFloat(form.budget),
      people:               parseInt(form.people, 10),
      dietType:             form.dietType,
      cuisinePreference:    form.cuisinePreference,
      availableIngredients: form.availableIngredients.trim(),
      calorieGoal:          form.calorieGoal ? parseInt(form.calorieGoal, 10) : null,
    });
  }

  const ingredientLen = form.availableIngredients.length;
  const atLimit       = ingredientLen >= INGREDIENT_CHAR_LIMIT;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Meal planner input form"
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Tell us about your day
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Fill in your preferences and we&apos;ll craft a personalised meal plan instantly.
        </p>
      </div>

      {/* Row 1: Cooking Time + Budget */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label icon={Clock} htmlFor="cookingTime" required>
            Available cooking time
          </Label>
          <select
            id="cookingTime"
            name="cookingTime"
            value={form.cookingTime}
            onChange={handleChange}
            className={inputBase}
          >
            {COOKING_TIME_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label icon={Wallet} htmlFor="budget" required>
            Daily food budget (USD)
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              $
            </span>
            <input
              id="budget"
              name="budget"
              type="number"
              min="1"
              step="0.01"
              placeholder="e.g. 25.00"
              value={form.budget}
              onChange={handleChange}
              aria-invalid={!!errors.budget}
              aria-describedby={errors.budget ? 'budget-error' : undefined}
              className={`${inputBase} pl-7 ${errors.budget ? inputError : ''}`}
            />
          </div>
          <FieldError message={errors.budget} />
        </div>
      </div>

      {/* Row 2: People + Diet Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label icon={Users} htmlFor="people" required>
            Number of people
          </Label>
          <input
            id="people"
            name="people"
            type="number"
            min="1"
            max="20"
            placeholder="e.g. 2"
            value={form.people}
            onChange={handleChange}
            aria-invalid={!!errors.people}
            className={`${inputBase} ${errors.people ? inputError : ''}`}
          />
          <FieldError message={errors.people} />
        </div>

        <div>
          <Label icon={Salad} htmlFor="dietType" required>
            Diet type
          </Label>
          <select
            id="dietType"
            name="dietType"
            value={form.dietType}
            onChange={handleChange}
            className={inputBase}
          >
            {DIET_TYPES.map(d => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 3: Cuisine + Calorie Goal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label icon={Globe} htmlFor="cuisinePreference" required>
            Cuisine preference
          </Label>
          <select
            id="cuisinePreference"
            name="cuisinePreference"
            value={form.cuisinePreference}
            onChange={handleChange}
            className={inputBase}
          >
            {CUISINE_OPTIONS.map(c => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label icon={Flame} htmlFor="calorieGoal">
            Calorie goal (optional)
          </Label>
          <div className="relative">
            <input
              id="calorieGoal"
              name="calorieGoal"
              type="number"
              min="500"
              max="10000"
              placeholder="e.g. 2000"
              value={form.calorieGoal}
              onChange={handleChange}
              aria-invalid={!!errors.calorieGoal}
              className={`${inputBase} pr-12 ${errors.calorieGoal ? inputError : ''}`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
              kcal
            </span>
          </div>
          <FieldError message={errors.calorieGoal} />
        </div>
      </div>

      {/* Available Ingredients */}
      <div>
        <Label icon={ChefHat} htmlFor="availableIngredients">
          Ingredients already available
        </Label>
        <textarea
          id="availableIngredients"
          name="availableIngredients"
          rows={3}
          placeholder="e.g. eggs, rice, onions, olive oil (comma or newline separated)"

          value={form.availableIngredients}
          onChange={handleChange}
          maxLength={INGREDIENT_CHAR_LIMIT}
          aria-invalid={!!errors.availableIngredients}
          className={`${inputBase} resize-none ${errors.availableIngredients ? inputError : ''}`}
        />
        <div className="flex justify-between mt-1">
          <FieldError message={errors.availableIngredients} />
          <span
            className={`text-xs ml-auto ${
              atLimit ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {ingredientLen}/{INGREDIENT_CHAR_LIMIT}
          </span>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className={
          'w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white text-sm ' +
          'bg-brand-600 hover:bg-brand-700 active:scale-[0.98] ' +
          'disabled:opacity-60 disabled:cursor-not-allowed ' +
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ' +
          'transition-all duration-150 shadow-md'
        }
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Generating your plan…
          </>
        ) : (
          <>
            <ChefHat size={16} />
            Generate Meal Plan
          </>
        )}
      </button>
    </form>
  );
}
