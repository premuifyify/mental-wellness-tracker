import Anthropic from '@anthropic-ai/sdk';
import { buildMealPrompt } from '../src/services/promptBuilder.js';
import { calculateBudget } from '../src/utils/budgetCalculator.js';

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://smart-meal-planner.vercel.app',
];

function setCorsHeaders(req, res) {
  const origin = req.headers.origin || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allowed);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
}

function validateRequestBody(body) {
  const errors = [];

  if (!body.cookingTime) errors.push('cookingTime is required');

  const budget = parseFloat(body.budget);
  if (isNaN(budget) || budget <= 0) errors.push('budget must be a positive number');

  const people = parseInt(body.people, 10);
  if (isNaN(people) || people < 1 || people > 20)
    errors.push('people must be between 1 and 20');

  if (!body.dietType) errors.push('dietType is required');
  if (!body.cuisinePreference) errors.push('cuisinePreference is required');

  if (body.calorieGoal !== null && body.calorieGoal !== undefined && body.calorieGoal !== '') {
    const cal = parseInt(body.calorieGoal, 10);
    if (isNaN(cal) || cal < 500) errors.push('calorieGoal must be at least 500 if provided');
  }

  return errors;
}

function parseMealPlanJson(rawText) {
  // Strip markdown code fences that some models add despite instructions
  const cleaned = rawText
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/\s*```$/, '');

  return JSON.parse(cleaned);
}

function validateMealPlanShape(plan) {
  const requiredMeals = ['breakfast', 'lunch', 'dinner'];
  for (const meal of requiredMeals) {
    if (!plan[meal] || typeof plan[meal].dish !== 'string') {
      throw new Error(`Missing or invalid meal: ${meal}`);
    }
  }
  if (!Array.isArray(plan.groceryList)) throw new Error('groceryList must be an array');
  if (!Array.isArray(plan.substitutions)) throw new Error('substitutions must be an array');
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body;
  const validationErrors = validateRequestBody(body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: validationErrors });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set');
    return res.status(500).json({ error: 'Server configuration error. API key not set.' });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = buildMealPrompt({
      ...body,
      budget: parseFloat(body.budget),
      people: parseInt(body.people, 10),
      calorieGoal: body.calorieGoal ? parseInt(body.calorieGoal, 10) : null,
    });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system:
        'You are a professional nutritionist and chef. Return ONLY valid JSON — no markdown, no prose, no code fences.',
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = message.content[0]?.text ?? '';
    let mealPlan;

    try {
      mealPlan = parseMealPlanJson(rawText);
      validateMealPlanShape(mealPlan);
    } catch (parseErr) {
      console.error('Failed to parse AI response:', parseErr.message, '\nRaw:', rawText);
      return res.status(502).json({
        error: 'The AI returned an unexpected response. Please try again.',
      });
    }

    const budgetAnalysis = calculateBudget(
      mealPlan,
      parseFloat(body.budget)
    );

    return res.status(200).json({ ...mealPlan, budgetAnalysis });
  } catch (err) {
    console.error('generate-plan error:', err);

    if (err.status === 401) {
      return res.status(500).json({ error: 'API authentication failed. Check your API key.' });
    }
    if (err.status === 429) {
      return res
        .status(429)
        .json({ error: 'Rate limit reached. Please wait a moment and try again.' });
    }
    if (err.status === 529 || err.code === 'overloaded_error') {
      return res.status(503).json({ error: 'AI service is temporarily overloaded. Try again shortly.' });
    }

    return res.status(500).json({ error: 'Failed to generate meal plan. Please try again.' });
  }
}
