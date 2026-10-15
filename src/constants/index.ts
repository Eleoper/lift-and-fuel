import type {
  Avatar,
  Profile,
  SessionType,
  StackItem,
} from "../types"
import { WEEK, PROGRAM, SESS_ORDER, SHORT } from "./program"
import { STATS, TITLES, ACH, ITEMS, PERFECT_BONUS, PR_XP, FREEZE_EVERY, FREEZE_MAX } from "./game"
import { PF, PLAN, LONG_FUEL, DINNER, DINNER_SIZES } from "./plan"

export const LB = 0.45359237
export const CM_IN = 2.54
export const BOSS_HP = 5
export const BOSS_XP = 100

export const MEALS = [
  "Breakfast",
  "Meal 2",
  "Lunch",
  "Meal 4",
  "Pre-workout",
  "Post-workout",
  "Dinner",
  "Snacks",
] as const

export const SLOTS = ["Morning", "Pre-gym", "Evening"] as const

export const DEFAULT_STACK: StackItem[] = [
  { id: "cre", name: "Creatine", dose: "5 g", slot: "Morning" },
  { id: "d3", name: "Vitamin D3", dose: "2,000 IU", slot: "Morning" },
  { id: "o3", name: "Omega-3 (EPA+DHA)", dose: "1–2 g", slot: "Morning" },
  { id: "caf", name: "Caffeine", dose: "150–200 mg", slot: "Pre-gym" },
  { id: "zn", name: "Zinc", dose: "15–25 mg", slot: "Evening" },
  { id: "mg", name: "Magnesium glycinate", dose: "200–350 mg", slot: "Evening" },
]

export const CUT = {
  kcal: 2180,
  protein: 215,
  carbs: 208,
  fat: 50,
  restKcal: 1980,
  restCarbs: 159,
  restFat: 52,
} as const

export const DEFAULT_AVATAR: Avatar = {
  name: "Kai",
  skin: 1,
  hair: 1,
  style: 0,
  outfit: "tee",
  head: "none",
  gear: "nogear",
  scene: "quest",
}

export const DEFAULT_PROFILE: Profile = {
  ...CUT,
  unit: "lb",
  heightCm: 165.1,
  week: WEEK,
  waterGoal: 100,
  sleepGoal: 7,
  stepGoal: 8000,
  stack: DEFAULT_STACK,
  startBf: 29,
  goalBf: 15,
}

export const STARTER_FOODS = [
  { name: "Chicken breast, cooked 4 oz", kcal: 187, p: 35, c: 0, f: 4 },
  { name: "Large egg", kcal: 72, p: 6.3, c: 0.4, f: 4.8 },
  { name: "White rice, cooked 1 cup", kcal: 205, p: 4.3, c: 45, f: 0.4 },
  { name: "Rolled oats, dry ½ cup", kcal: 150, p: 5, c: 27, f: 3 },
  { name: "Banana, medium", kcal: 105, p: 1.3, c: 27, f: 0.4 },
  { name: "Greek yogurt, nonfat 170 g", kcal: 100, p: 17, c: 6, f: 0.7 },
  { name: "Peanut butter 2 tbsp", kcal: 190, p: 7, c: 7, f: 16 },
  { name: "Whey protein, 1 scoop", kcal: 120, p: 24, c: 3, f: 1.5 },
] as const

export const STARTER_LIFTS = [
  "Back squat",
  "Bench press",
  "Deadlift",
  "Overhead press",
  "Barbell row",
  "Pull-up",
  "Romanian deadlift",
  "Incline dumbbell press",
  "Lat pulldown",
  "Leg press",
  "Dumbbell curl",
  "Triceps pushdown",
  "Lateral raise",
  "Hip thrust",
  "Walking lunge",
  "Plank",
] as const

export const SPEAKERS: Record<string, string | null> = {
  hero: null,
  coach: "Coach Brock",
  buddy: "Gym Companion",
  cardio: "Cardio Master",
}

export const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const

export {
  WEEK,
  PROGRAM,
  SESS_ORDER,
  SHORT,
  STATS,
  TITLES,
  ACH,
  ITEMS,
  PERFECT_BONUS,
  PR_XP,
  FREEZE_EVERY,
  FREEZE_MAX,
  PF,
  PLAN,
  LONG_FUEL,
  DINNER,
  DINNER_SIZES,
}

export type { SessionType }
