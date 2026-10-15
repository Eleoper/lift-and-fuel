import type { Day, GameState, Mood, Profile } from "../types"
import { statLevel, unlockedIds } from "../game/engine"
import { avatar } from "../game/helpers"
import { sessionOf } from "../game/targets"
import { quests } from "../game/quests"
import { PROGRAM } from "../constants/program"
import type { SpriteOpts } from "../sprites/hero"

/* -------- Active speech line (set by DialogueManager) -------- */

export interface ActiveLine {
  pose: string
  expr?: string
  speaker: string | null
  heroPose?: string
  heroExpr?: string
  until: number
  celebrate?: boolean
  xp?: number
}

/* -------- Hero state -------- */

export interface HeroState extends SpriteOpts {
  scene: string
}

/**
 * Compute everything needed to draw the hero sprite on a given frame.
 *
 * Pure function -- no globals, no side effects.
 *
 * @param G        current GameState (from `game()`)
 * @param profile  user profile
 * @param mood     current Mood (from `vitals()`)
 * @param bf       latest body-fat percentage (from `latestBf()`) or null
 * @param act      currently active speech line, or null
 * @param tick     animation tick counter
 * @param blinking true when the blink timer is active
 */
export function heroState(
  G: GameState,
  profile: Profile,
  mood: Mood,
  bf: number | null,
  act: ActiveLine | null,
  tick: number,
  blinking: boolean,
): HeroState {
  const A = avatar(profile)
  const u = unlockedIds(G, profile.goalBf)

  /* muscle mass: grows with strength stat level */
  const sl = statLevel(G.stat["str"] ?? 0).L
  const m = Math.min(4, Math.floor((sl - 1) / 2))

  /* fat: maps body-fat percentage to 0-4 visual level */
  const bfVal = bf ?? profile.startBf ?? 29
  const f =
    bfVal >= 27 ? 4 : bfVal >= 23 ? 3 : bfVal >= 19 ? 2 : bfVal >= 15 ? 1 : 0

  /* defaults */
  let pose = "idle"
  let expr: string | undefined = "smile"
  let sweat = false

  /* mood-driven overrides */
  if (mood === "late" || mood === "sleepy") {
    pose = "sleepy"
    expr = "sleepy"
  } else if (mood === "hungry") {
    pose = "sad"
    expr = "frown"
  } else if (mood === "thirsty") {
    expr = "frown"
    sweat = true
  } else if (mood === "ecstatic") {
    expr = "excited"
    if (tick % 12 < 2) pose = "cheer"
  } else if (mood === "pumped") {
    expr = "happy"
    if (tick % 14 < 2) pose = "flex"
  } else if (mood === "happy") {
    expr = "happy"
  }

  /* active speech line can override pose/expr */
  const now = performance.now()
  if (act && now < act.until && !act.speaker) {
    pose = act.pose
    expr = act.expr || "happy"
    sweat = act.pose === "lift"
  } else if (act && now < act.until && act.heroPose) {
    pose = act.heroPose
    expr = act.heroExpr || "happy"
  }

  /* equipment: fall back to defaults when the item hasn't been unlocked */
  const eq = (id: string, def: string): string =>
    u.has(id) ? id : def

  return {
    m,
    f,
    pose,
    frame: tick,
    blink: blinking,
    expr,
    sweat,
    skin: A.skin,
    hair: A.hair,
    style: A.style,
    outfit: eq(A.outfit, "tee"),
    head: eq(A.head, "none"),
    gear: eq(A.gear, "nogear"),
    scene: eq(A.scene, "quest"),
  }
}

/* -------- Challenger state -------- */

export interface ChallengerState {
  id: "goblin" | "shadow" | "none"
  name: string
  ko: boolean
}

/**
 * Determine the day's challenger and whether it has been KO'd.
 *
 * @param d       the Day data
 * @param profile user profile (for session lookup)
 */
export function challenger(d: Day, profile: Profile): ChallengerState {
  const Pg = PROGRAM[sessionOf(d, profile)]
  const r = quests(d, profile)
  const q = r.q.find((x) => x.id === "train")

  if (Pg.kind === "lift") {
    return { id: "goblin", name: "Heavy Dumbbell Goblin", ko: !!(q && q.done) }
  }
  if (Pg.kind === "run") {
    return { id: "shadow", name: "The Treadmill Shadow", ko: !!(q && q.done) }
  }
  return { id: "none", name: "Rest day", ko: true }
}
