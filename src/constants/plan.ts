import type { PlanFood, PlanMealDef } from "../types"

export const PF: Record<string, PlanFood> = {
  egg_white: { name: "Egg whites", per: 100, unit: "g", kcal: 52, c: 1, f: 0, p: 11 },
  egg: { name: "Whole eggs", per: 1, unit: "", kcal: 72, c: 0, f: 5, p: 6 },
  spinach: { name: "Spinach, cooked", per: 100, unit: "g", kcal: 23, c: 4, f: 0, p: 3 },
  banana: { name: "Banana, small", per: 1, unit: "", kcal: 72, c: 19, f: 0, p: 1 },
  beef: { name: "Lean beef mince 10%, cooked", per: 130, unit: "g", kcal: 208, c: 4, f: 11, p: 27 },
  rice: { name: "Basmati rice, cooked", per: 100, unit: "g", kcal: 130, c: 28.5, f: 0.3, p: 2.7 },
  broccoli: { name: "Broccoli, air-fried", per: 50, unit: "g", kcal: 16, c: 1, f: 1, p: 1 },
  chicken: { name: "Chicken breast, cooked", per: 150, unit: "g", kcal: 249, c: 0, f: 5, p: 49 },
  stirfry: { name: "Veg stir-fry", per: 50, unit: "g", kcal: 18, c: 2, f: 0, p: 1 },
  avocado: { name: "Avocado", per: 100, unit: "g", kcal: 160, c: 8.5, f: 14.7, p: 2 },
  cor: { name: "Cream of rice, dry", per: 100, unit: "g", kcal: 370, c: 82, f: 0.5, p: 6 },
  whey: { name: "Whey protein", per: 1, unit: "scoop", kcal: 120, c: 3, f: 1.5, p: 24 },
  salmon: { name: "Smoked salmon", per: 170, unit: "g", kcal: 279, c: 2, f: 11, p: 36 },
  banana_m: { name: "Banana, medium", per: 1, unit: "", kcal: 105, c: 27, f: 0.4, p: 1.3 },
  drink: { name: "Sports drink", per: 500, unit: "ml", kcal: 120, c: 30, f: 0, p: 0 },
  gel: { name: "Energy gel", per: 1, unit: "", kcal: 100, c: 25, f: 0, p: 0 },
}

export const LONG_FUEL: PlanMealDef = {
  id: "m8",
  meal: "Snacks",
  name: "Long-run fuel",
  when: "before and during runs over 75 min",
  items: [
    ["banana_m", 1],
    ["drink", 500],
    ["gel", 1],
  ],
}

export const DINNER_SIZES = {
  light: { label: "Light plate", kcal: 400, p: 35, c: 35, f: 13 },
  reg: { label: "Regular plate", kcal: 600, p: 40, c: 60, f: 22 },
  big: { label: "Big plate", kcal: 800, p: 45, c: 85, f: 31 },
} as const

export const DINNER: PlanMealDef = {
  id: "m7",
  meal: "Dinner",
  name: "Mom's dinner",
  flex: true,
  when: "400–800 kcal budget",
  items: [],
}

export const PLAN = {
  train: [
    { id: "m1", meal: "Breakfast", name: "Breakfast", items: [["egg_white", 150], ["egg", 2], ["spinach", 100], ["banana", 1]] },
    { id: "m2", meal: "Meal 2", name: "Meal 2", items: [["beef", 130], ["rice", 70], ["broccoli", 100]] },
    { id: "m3", meal: "Lunch", name: "Lunch", items: [["chicken", 130], ["rice", 100], ["stirfry", 100]] },
    { id: "m4", meal: "Pre-workout", name: "Pre-workout meal", when: "2–2.5 h before your lift or run", items: [["chicken", 120], ["rice", 85]] },
    { id: "m5", meal: "Pre-workout", name: "20 min before", items: [["cor", 30]] },
    { id: "m6", meal: "Post-workout", name: "Post-workout shake", items: [["whey", 1]] },
    DINNER,
  ] as PlanMealDef[],
  rest: [
    { id: "m1", meal: "Breakfast", name: "Breakfast", items: [["egg_white", 150], ["egg", 2], ["spinach", 100], ["banana", 1]] },
    { id: "m2", meal: "Meal 2", name: "Meal 2", items: [["beef", 130], ["rice", 70], ["broccoli", 100]] },
    { id: "m3", meal: "Lunch", name: "Lunch", items: [["chicken", 130], ["rice", 100], ["stirfry", 100]] },
    { id: "m4", meal: "Meal 4", name: "Meal 4", items: [["chicken", 120], ["broccoli", 100]] },
    { id: "m6", meal: "Snacks", name: "Protein shake", items: [["whey", 1]] },
    DINNER,
  ] as PlanMealDef[],
} as const
