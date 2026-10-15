/* -------- Core data model -------- */

export interface StackItem {
  id: string
  name: string
  dose: string
  slot: "Morning" | "Pre-gym" | "Evening"
}

export interface Avatar {
  name: string
  skin: number
  hair: number
  style: number
  outfit: string
  head: string
  gear: string
  scene: string
}

export type WeightUnit = "lb" | "kg"

export type SessionType =
  | "push"
  | "speed"
  | "pull"
  | "easy"
  | "legs"
  | "long"
  | "mobility"

export type WeekSchedule = Record<number, SessionType>

export interface Profile {
  kcal: number
  protein: number
  carbs: number
  fat: number
  restKcal: number
  restCarbs: number
  restFat: number
  unit: WeightUnit
  heightCm: number
  week: WeekSchedule
  waterGoal: number
  sleepGoal: number
  stepGoal: number
  stack: StackItem[]
  startBf: number
  goalBf: number
  avatar?: Partial<Avatar>
  plan?: string
}

export interface Food {
  id: string
  meal: string
  name: string
  kcal: number
  p: number
  c: number
  f: number
  qty: number
  plan?: string
}

export interface LiftSet {
  kg: number
  reps: number
}

export interface Lift {
  id: string
  name: string
  sets: LiftSet[]
}

export interface Run {
  id: string
  type: SessionType
  variant?: number | null
  km: number
  min: number
  rpe?: number | null
}

export interface Day {
  date: string
  foods: Food[]
  lifts: Lift[]
  runs: Run[]
  weight: number | null
  supps: Record<string, boolean>
  water: number
  sleep: number | null
  steps: number | null
  rest: boolean | null
  session: SessionType | null
  mob: boolean
  waist: number | null
  neck: number | null
  bf: number | null
  bfSrc: "scan" | "tape" | null
  photo: boolean
}

/* -------- Game rules -------- */

export interface ProgramExercise {
  n: string
  alt?: string
  sets: number
  lo: number
  hi: number
  inc: number
}

export interface ProgramRunOption {
  name: string
  kind: "run"
  goal: string
  time: string
  opts?: string[]
}

export interface ProgramLiftEntry {
  name: string
  kind: "lift"
  goal: string
  time: string
  ex: ProgramExercise[]
}

export interface ProgramRestEntry {
  name: string
  kind: "rest"
  goal: string
  time: string
  list: string[]
}

export type ProgramEntry = ProgramLiftEntry | ProgramRunOption | ProgramRestEntry

export interface Stat {
  name: string
  c: string
  from: string
}

export interface Achievement {
  id: string
  name: string
  desc: string
  val: (G: GameState) => number
  goal: number
  c: string
}

export interface UnlockItem {
  id: string
  slot: "outfit" | "head" | "gear" | "scene"
  name: string
  how: string
  ok: (G: GameState, L: number, goalBf?: number) => boolean
}

export interface Quest {
  id: string
  kind?: "lift" | "run" | "rest"
  stat: string
  xp: number
  name: string
  prog: string
  done: boolean
  go?: string
  bonus?: boolean
}

export interface QuestResult {
  q: Quest[]
  core: Quest[]
  done: number
  need: number
  cleared: boolean
  perfect: boolean
}

export interface DayResult {
  status: "perfect" | "cleared" | "frozen" | "missed" | "open" | "none"
  xp: number
  done: number
  total: number
  pr: number
  rpr: number
  doneIds: string[]
  boss: boolean
}

export interface GameState {
  xp: number
  stat: Record<string, number>
  streak: number
  best: number
  freezes: number
  days: Record<string, DayResult>
  prs: number
  runPrs: number
  perfect: number
  cleared: number
  sets: number
  bfLogged: number | null
  bosses: number
  weekHits: number
  weekLifts: number
  weekRuns: number
  lifts: number
  runs: number
  longMin: number
  longestKm: number
  hybrid: number
  km: number
  counts: Record<string, number>
}

export interface LevelInfo {
  L: number
  into: number
  need: number
}

export interface StatLevel {
  L: number
  pct: number
}

/* -------- Targets -------- */

export interface Targets {
  kcal: number
  protein: number
  carbs: number
  fat: number
  rest: boolean
  long: boolean
  ses: SessionType
}

export interface Totals {
  kcal: number
  p: number
  c: number
  f: number
}

/* -------- Plan foods -------- */

export interface PlanFood {
  name: string
  per: number
  unit: string
  kcal: number
  c: number
  f: number
  p: number
}

export interface PlanMealDef {
  id: string
  meal: string
  name: string
  when?: string
  flex?: boolean
  items: [string, number][]
}

export interface PlanMealResolved extends PlanMealDef {
  list: (Totals & { name: string })[]
  t: Totals
}

/* -------- Vitals -------- */

export type Mood =
  | "late"
  | "sleepy"
  | "hungry"
  | "thirsty"
  | "ecstatic"
  | "happy"
  | "pumped"
  | "content"

export interface Vitals {
  d: Day
  t: Totals
  T: Targets
  h: number
  fuel: number
  hyd: number
  energy: number
  mood: Mood
  r: QuestResult
}

/* -------- Suggestions -------- */

export interface Suggestion {
  kg: number | null
  up: boolean
  txt: string
}

export interface LastTimeResult {
  date: string
  ex: Lift
}
