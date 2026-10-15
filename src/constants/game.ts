import type { Achievement, GameState, Stat, UnlockItem } from "../types"

export const STATS: Record<string, Stat> = {
  str: { name: "Strength", c: "--str", from: "Workouts and PRs" },
  fuel: { name: "Fuel", c: "--fuel", from: "Protein and calories" },
  dis: { name: "Discipline", c: "--dis", from: "Stack and check-ins" },
  vit: { name: "Vitality", c: "--vit", from: "Water, sleep, mobility" },
  end: { name: "Endurance", c: "--end", from: "Runs and distance PRs" },
}

export const TITLES: [number, string][] = [
  [1, "Novice"],
  [3, "Apprentice"],
  [6, "Lifter"],
  [10, "Iron Initiate"],
  [15, "Athlete"],
  [20, "Iron Disciple"],
  [30, "Elite"],
  [45, "Legend"],
]

export const PERFECT_BONUS = 50
export const PR_XP = 50
export const FREEZE_EVERY = 7
export const FREEZE_MAX = 2

export const ACH: Achievement[] = [
  { id: "first", name: "First Rep", desc: "Finish your first lift session", val: (G: GameState) => G.lifts, goal: 1, c: "--str" },
  { id: "miles", name: "First Miles", desc: "Log your first run", val: (G: GameState) => G.runs, goal: 1, c: "--end" },
  { id: "hybrid", name: "Hybrid Week", desc: "3 runs and 3 lifts in one week", val: (G: GameState) => G.hybrid, goal: 1, c: "--end" },
  { id: "long", name: "Long Hauler", desc: "Run 60+ minutes in one go", val: (G: GameState) => G.longMin, goal: 60, c: "--end" },
  { id: "flaw", name: "Flawless", desc: "Finish every quest in one day", val: (G: GameState) => G.perfect, goal: 1, c: "--vit" },
  { id: "wk", name: "Week Warrior", desc: "Reach a 7-day streak", val: (G: GameState) => G.best, goal: 7, c: "--flame" },
  { id: "pro", name: "Protein Machine", desc: "Hit protein on 20 days", val: (G: GameState) => G.counts["protein"] ?? 0, goal: 20, c: "--fuel" },
  { id: "pr", name: "PR Hunter", desc: "Set 10 personal records", val: (G: GameState) => G.prs, goal: 10, c: "--str" },
  { id: "stk", name: "Stack Loyal", desc: "Take your full stack on 14 days", val: (G: GameState) => G.counts["supps"] ?? 0, goal: 14, c: "--dis" },
  { id: "h2o", name: "Hydrated", desc: "Hit your water goal on 21 days", val: (G: GameState) => G.counts["water"] ?? 0, goal: 21, c: "--frost" },
  { id: "mo", name: "Iron Month", desc: "Reach a 30-day streak", val: (G: GameState) => G.best, goal: 30, c: "--flame" },
  { id: "boss", name: "Colossus Slayer", desc: "Defeat the weekly boss", val: (G: GameState) => G.bosses, goal: 1, c: "--accent" },
]

// Note: ITEMS use `ok` callbacks that reference profile state, so the goalBf comparison
// takes the profile goalBf as an additional parameter. We make them accept (G, L, goalBf).
// The original `S.profile.goalBf` reference is replaced by the caller providing it.
export const ITEMS: UnlockItem[] = [
  { id: "tee", slot: "outfit", name: "Novice tee", how: "Starter", ok: () => true },
  { id: "tank", slot: "outfit", name: "Warrior tank", how: "Reach level 3", ok: (_G, L) => L >= 3 },
  { id: "runner", slot: "outfit", name: "Speed Runner kit", how: "Log 10 runs", ok: (G) => G.runs >= 10 },
  { id: "hoodie", slot: "outfit", name: "Hoodie", how: "Reach a 7-day streak", ok: (G) => G.best >= 7 },
  { id: "stringer", slot: "outfit", name: "Stringer", how: "Reach level 15", ok: (_G, L) => L >= 15 },
  { id: "singlet", slot: "outfit", name: "Meet singlet", how: "Reach a 30-day streak", ok: (G) => G.best >= 30 },
  { id: "none", slot: "head", name: "Nothing", how: "Starter", ok: () => true },
  { id: "band", slot: "head", name: "Sweatband", how: "Set your first PR", ok: (G) => G.prs >= 1 },
  { id: "cap", slot: "head", name: "Backwards cap", how: "Reach level 8", ok: (_G, L) => L >= 8 },
  { id: "phones", slot: "head", name: "Headphones", how: "Finish every quest in one day", ok: (G) => G.perfect >= 1 },
  { id: "crown", slot: "head", name: "Crown", how: "Clear 90 days", ok: (G) => G.cleared >= 90 },
  { id: "nogear", slot: "gear", name: "Nothing", how: "Starter", ok: () => true },
  { id: "wraps", slot: "gear", name: "Wrist wraps", how: "Log 50 working sets", ok: (G) => G.sets >= 50 },
  { id: "shaker", slot: "gear", name: "Shaker bottle", how: "Hit protein on 20 days", ok: (G) => (G.counts["protein"] ?? 0) >= 20 },
  { id: "belt", slot: "gear", name: "Lifting belt", how: "Set 10 PRs", ok: (G) => G.prs >= 10 },
  { id: "quest", slot: "scene", name: "Quest room", how: "Starter", ok: () => true },
  { id: "gym", slot: "scene", name: "Big-box gym", how: "Reach level 5", ok: (_G, L) => L >= 5 },
  { id: "roof", slot: "scene", name: "Rooftop at sunset", how: "Reach level 12", ok: (_G, L) => L >= 12 },
  { id: "beach", slot: "scene", name: "Beach", how: "Reach level 20", ok: (_G, L) => L >= 20 },
  { id: "stage", slot: "scene", name: "Competition stage", how: "Log a body fat at or below your goal", ok: (G, _L, goalBf) => G.bfLogged != null && G.bfLogged <= (goalBf ?? 15) },
]
