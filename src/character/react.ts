import type { Day, GameState, Profile } from "../types"
import {
  fmt,
  fromKg,
  fromKm,
  getDay,
  paceStr,
  pick,
  todayKey,
  totals,
  U,
  DU,
} from "../game/helpers"
import { targets, sessionOf, isTrainDay } from "../game/targets"
import { quests } from "../game/quests"
import { avgWeight } from "../game/records"
import { nextPlanMeal } from "../game/plan"
import { levelOf, titleOf, unlockedIds } from "../game/engine"
import {
  BOSS_XP,
  DINNER_SIZES,
  FREEZE_EVERY,
  ITEMS,
  PERFECT_BONUS,
  PR_XP,
  PROGRAM,
} from "../constants"
import type { SpeechLine } from "./useDialogue"

/* ---------- Event types ---------- */

/*
 * These are loosely typed because event payloads come from many different
 * UI actions.  Each branch of `eventLine` narrows on `evt.type`.
 */

export interface FoodEvent {
  type: "food"
  item: { name: string; p: number }
}

export interface DinnerEvent {
  type: "dinner"
  size: keyof typeof DINNER_SIZES
}

export interface PlanEvent {
  type: "plan"
  name: string
}

export interface SetEvent {
  type: "set"
  ex: string
  w: number
  reps: number
}

export interface WaterEvent {
  type: "water"
  amt: number
}

export interface SuppEvent {
  type: "supp"
  on: boolean
  name: string
}

export interface WeighEvent {
  type: "weigh"
}

export interface SleepEvent {
  type: "sleep"
}

export interface StepsEvent {
  type: "steps"
}

export interface CheckEvent {
  type: "check"
  msg?: string
}

export interface SessionEvent {
  type: "session"
}

export interface RunEvent {
  type: "run"
  km: number
  min: number
  rtype: string
}

export interface LoadEvent {
  type: "load"
}

export interface MobEvent {
  type: "mob"
}

export type GameEvent =
  | FoodEvent
  | DinnerEvent
  | PlanEvent
  | SetEvent
  | WaterEvent
  | SuppEvent
  | WeighEvent
  | SleepEvent
  | StepsEvent
  | CheckEvent
  | SessionEvent
  | RunEvent
  | LoadEvent
  | MobEvent

/* ---------- eventLine ---------- */

/**
 * Generate the immediate character reaction to a user action.
 *
 * Returns a SpeechLine (without `low`/`now` -- the caller decides priority),
 * or null when no reaction is appropriate.
 */
export function eventLine(
  evt: GameEvent,
  k: string,
  days: Record<string, Partial<Day>>,
  profile: Profile,
): SpeechLine | null {
  const d = getDay(days, k)
  const T = targets(d, profile)
  const t = totals(d)

  if (evt.type === "food") {
    const it = evt.item
    const left = T.protein - t.p
    const kl = T.kcal - t.kcal
    return {
      speaker: "buddy",
      pose: "wave",
      heroPose: "eat",
      heroExpr: "chew",
      text:
        it.p >= 20
          ? `${it.name}: +${fmt(it.p)} g protein. ${left > 0 ? `${fmt(left)} g to go.` : "Protein target hit!"}`
          : `Logged ${it.name}. ${kl >= 0 ? fmt(kl) + " kcal left." : fmt(-kl) + " kcal over."}`,
    }
  }

  if (evt.type === "dinner") {
    const z = DINNER_SIZES[evt.size]
    const left = Math.round(T.protein - t.p)
    const kl = Math.round(T.kcal - t.kcal)
    return {
      speaker: "buddy",
      pose: "wave",
      heroPose: "eat",
      heroExpr: "chew",
      text: `Mom's cooking, ${z.label.toLowerCase()}: about ${z.kcal} kcal. ${left > 10 ? `${left} g protein to go. A Greek yogurt or a shake closes it.` : "Protein's covered."}${kl < -150 ? " A little over today, that's fine." : ""}`,
    }
  }

  if (evt.type === "plan") {
    const nx = nextPlanMeal(d, profile)
    return {
      speaker: "buddy",
      pose: "wave",
      heroPose: "eat",
      heroExpr: "chew",
      text: `${evt.name} logged. ${nx ? `Next up: ${nx.name}.` : "That's the whole plan for today."}`,
    }
  }

  if (evt.type === "set") {
    return {
      speaker: "coach",
      pose: "point",
      heroPose: "lift",
      heroExpr: "strain",
      text: `${evt.ex}: ${evt.w > 0 ? `${fmt(evt.w, 1)} ${U(profile)} \u00d7 ` : ""}${evt.reps}. ${pick(["Good set.", "Control the negative.", "Again.", "That's how we do it."])}`,
    }
  }

  if (evt.type === "water") {
    if (evt.amt <= 0) return null
    return {
      speaker: "buddy",
      pose: "drink",
      heroPose: "drink",
      heroExpr: "smile",
      text: `Hydration check: ${fmt(d.water)} / ${fmt(profile.waterGoal)} oz.`,
    }
  }

  if (evt.type === "supp") {
    if (!evt.on) return null
    const req = (profile.stack || []).filter(
      (s) => isTrainDay(d, profile) || s.slot !== "Pre-gym",
    )
    const all = req.every((s) => d.supps[s.id])
    return {
      speaker: "buddy",
      pose: "wave",
      heroPose: "drink",
      text: all ? "Full stack taken. Nice." : `${evt.name}, check.`,
    }
  }

  if (evt.type === "weigh") {
    const a = avgWeight(days, k)
    return {
      speaker: "coach",
      pose: "point",
      text: `Weigh-in logged.${a ? ` 7-day average: ${fmt(fromKg(a, profile), 1)} ${U(profile)}. The average is what counts.` : ""}`,
    }
  }

  if (evt.type === "sleep") {
    if (d.sleep != null && d.sleep >= profile.sleepGoal) {
      return {
        speaker: "buddy",
        pose: "wave",
        heroPose: "flex",
        text: `${fmt(d.sleep, 2)} h of sleep. Fully charged.`,
      }
    }
    return {
      speaker: "buddy",
      pose: "idle",
      heroPose: "sleepy",
      heroExpr: "sleepy",
      text: `${fmt(d.sleep ?? 0, 2)} h. Take it easy and aim for an earlier night.`,
    }
  }

  if (evt.type === "steps") {
    return {
      speaker: "cardio",
      pose: "cheer",
      heroPose: "cheer",
      heroExpr: "excited",
      text: `${fmt(d.steps ?? 0)} steps! Keep those legs moving.`,
    }
  }

  if (evt.type === "check") {
    return {
      speaker: "coach",
      pose: "point",
      heroPose: "flex",
      text: `Check-in saved. ${evt.msg || "Same time next week."}`,
    }
  }

  if (evt.type === "session") {
    const Pg = PROGRAM[sessionOf(d, profile)]
    if (Pg.kind === "lift") {
      return {
        speaker: "coach",
        pose: "point",
        heroPose: "flex",
        text: `Switched to ${Pg.name}. The goblin's waiting.`,
      }
    }
    if (Pg.kind === "run") {
      return {
        speaker: "cardio",
        pose: "flex",
        text: `Switched to ${Pg.name}. Let's go!`,
      }
    }
    return {
      speaker: "buddy",
      pose: "wave",
      text: "Recovery day it is. Mobility, an easy walk, and sleep.",
    }
  }

  if (evt.type === "run") {
    const dist = fromKm(evt.km, profile)
    return {
      speaker: "cardio",
      pose: "cheer",
      heroPose: "cheer",
      heroExpr: "excited",
      text: `${fmt(dist, 2)} ${DU(profile)} in ${fmt(evt.min)} min: ${paceStr(evt.min, evt.km, profile)} per ${DU(profile)}. ${evt.rtype === "easy" ? "Easy is the point. Nice." : evt.rtype === "long" ? "Big engine day." : "Fast feet!"}`,
    }
  }

  if (evt.type === "load") {
    const Pg = PROGRAM[sessionOf(d, profile)]
    if (Pg.kind === "lift") {
      const e = Pg.ex[0]!
      return {
        speaker: "coach",
        pose: "point",
        heroPose: "flex",
        text: `${Pg.name} loaded. First up: ${e.n.toLowerCase()}, ${e.sets}\u00d7${e.lo}${e.hi > e.lo ? "\u2013" + e.hi : ""}. Leave 1\u20132 in the tank.`,
      }
    }
    return null
  }

  if (evt.type === "mob") {
    return {
      speaker: "buddy",
      pose: "wave",
      heroPose: "flex",
      text: "Mobility done. Your joints say thanks.",
    }
  }

  return null
}

/* ---------- react ---------- */

/**
 * Diff two GameStates and return an array of speech lines announcing
 * everything that changed: PRs, quest completions, challengers KO'd,
 * day cleared / perfect, boss defeats, streak freezes, level-ups, unlocks.
 *
 * Does NOT call `say()` -- the caller queues the returned lines.
 */
export function react(
  prev: GameState,
  cur: GameState,
  k: string,
  days: Record<string, Partial<Day>>,
  profile: Profile,
  evt?: GameEvent,
): SpeechLine[] {
  const a = prev.days[k] ?? {
    doneIds: [] as string[],
    pr: 0,
    rpr: 0,
    status: "none" as const,
  }
  const b = cur.days[k] ?? {
    doneIds: [] as string[],
    pr: 0,
    rpr: 0,
    status: "none" as const,
  }

  const msgs: SpeechLine[] = []

  /* immediate event reaction */
  const line = evt ? eventLine(evt, k, days, profile) : null

  /* lift PR */
  if ((b.pr ?? 0) > (a.pr ?? 0)) {
    msgs.push({
      speaker: "coach",
      pose: "cheer",
      heroPose: "cheer",
      heroExpr: "excited",
      text: `New PR${evt && "ex" in evt ? ` on ${(evt as SetEvent).ex}` : ""}! +${PR_XP} XP`,
      celebrate: true,
      xp: PR_XP,
    })
  } else if (line) {
    msgs.push({ ...line, low: true })
  }

  /* newly completed quests */
  const prevDone = a.doneIds ?? []
  const curDone = b.doneIds ?? []
  const newQ = curDone.filter((id) => !prevDone.includes(id))
  const isToday = k === todayKey()
  const d = getDay(days, k)

  if (newQ.length) {
    const qs = quests(d, profile).q.filter((x) => newQ.includes(x.id))
    const tq = qs.find((x) => x.id === "train")

    if (isToday && tq) {
      if (tq.kind === "lift") {
        msgs.push({
          speaker: "coach",
          pose: "cheer",
          heroPose: "cheer",
          heroExpr: "excited",
          text: `${PROGRAM[sessionOf(d, profile)].name} done. The Heavy Dumbbell Goblin is down! +40 XP`,
          celebrate: true,
          xp: 40,
        })
      } else if (tq.kind === "run") {
        msgs.push({
          speaker: "cardio",
          pose: "cheer",
          heroPose: "cheer",
          heroExpr: "excited",
          text: "Run's in. You outran the Treadmill Shadow! +40 XP",
          celebrate: true,
          xp: 40,
        })
      } else {
        msgs.push({
          speaker: "buddy",
          pose: "wave",
          heroPose: "flex",
          text: "Recovery logged. This is where the gains show up. +20 XP",
          xp: 20,
        })
      }
    }

    const rest = qs.filter((x) => !(isToday && x.id === "train"))
    if (rest.length) {
      const restXp = rest.reduce((s, x) => s + x.xp, 0)
      msgs.push({
        pose: line ? "idle" : "highfive",
        expr: "happy",
        heroPose: "highfive",
        text: `Quest done: ${rest.map((x) => x.name).join(", ")}. +${restXp} XP`,
        xp: restXp,
      })
    }
  }

  /* day status transitions */
  if (b.status === "perfect" && a.status !== "perfect") {
    msgs.push({
      speaker: "coach",
      pose: "cheer",
      heroPose: "cheer",
      heroExpr: "excited",
      text: `Perfect day! Every quest done. +${PERFECT_BONUS} XP`,
      celebrate: true,
    })
  } else if (
    b.status === "cleared" &&
    a.status !== "cleared" &&
    a.status !== "perfect"
  ) {
    msgs.push({
      pose: "cheer",
      expr: "excited",
      text: `Day cleared! That's a hit on the Iron Colossus. Streak: ${cur.streak}.`,
    })
  }

  /* distance PR */
  if ((b.rpr ?? 0) > (a.rpr ?? 0)) {
    msgs.push({
      speaker: "cardio",
      pose: "cheer",
      heroPose: "cheer",
      heroExpr: "excited",
      text: `New distance PR! +${PR_XP} XP`,
      celebrate: true,
      xp: PR_XP,
    })
  }

  /* hybrid week */
  if (cur.hybrid > prev.hybrid) {
    msgs.push({
      speaker: "coach",
      pose: "cheer",
      heroPose: "flex",
      heroExpr: "excited",
      text: "Hybrid week complete: 3 runs and 3 lifts. That's the sweet spot.",
      celebrate: true,
    })
  }

  /* boss kill */
  if (cur.bosses > prev.bosses) {
    msgs.push({
      speaker: "coach",
      pose: "cheer",
      heroPose: "cheer",
      heroExpr: "excited",
      text: `Iron Colossus defeated! +${BOSS_XP} XP. It'll be back Monday.`,
      celebrate: true,
    })
  }

  /* streak freeze earned */
  if (cur.freezes > prev.freezes) {
    msgs.push({
      pose: "flex",
      expr: "happy",
      text: `${FREEZE_EVERY} days straight. I earned a streak freeze.`,
    })
  }

  /* level up */
  const L0 = levelOf(prev.xp).L
  const L1 = levelOf(cur.xp).L
  if (L1 > L0) {
    msgs.push({
      speaker: "coach",
      pose: "cheer",
      heroPose: "cheer",
      heroExpr: "excited",
      text: `Level ${L1}! New title: ${titleOf(L1)}.`,
      celebrate: true,
    })
  }

  /* unlocks */
  const u0 = unlockedIds(prev, profile.goalBf)
  const u1 = unlockedIds(cur, profile.goalBf)
  for (const it of ITEMS) {
    if (u1.has(it.id) && !u0.has(it.id)) {
      msgs.push({
        pose: "cheer",
        expr: "excited",
        text: `Unlocked: ${it.name}! It's in the Wardrobe.`,
        celebrate: true,
      })
    }
  }

  return msgs
}
