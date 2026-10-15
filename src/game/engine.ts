import type { Day, GameState, LevelInfo, Profile, StatLevel } from "../types"
import {
  BOSS_HP,
  BOSS_XP,
  FREEZE_EVERY,
  FREEZE_MAX,
  ITEMS,
  PERFECT_BONUS,
  PR_XP,
  TITLES,
} from "../constants"
import { getDay, shift, sortedKeys, todayKey, weekOf } from "./helpers"
import { hasAny, quests } from "./quests"
import { e1rm } from "./records"

export function levelOf(xp: number): LevelInfo {
  let L = 1
  let need = 150
  let remaining = xp
  while (remaining >= need) {
    remaining -= need
    L++
    need = 150 + 50 * (L - 1)
  }
  return { L, into: remaining, need }
}

export function titleOf(L: number): string {
  let t = TITLES[0]![1]
  for (const [l, name] of TITLES) {
    if (L >= l) t = name
  }
  return t
}

export function statLevel(xp: number): StatLevel {
  const L = Math.floor(Math.sqrt(xp / 40)) + 1
  const lo = 40 * (L - 1) * (L - 1)
  const hi = 40 * L * L
  return { L, pct: ((xp - lo) / (hi - lo)) * 100 }
}

export function unlockedIds(G: GameState, goalBf?: number): Set<string> {
  const L = levelOf(G.xp).L
  return new Set(
    ITEMS.filter((it) => it.ok(G, L, goalBf)).map((it) => it.id),
  )
}

export function game(
  days: Record<string, Partial<Day>>,
  profile: Profile,
): GameState {
  const today = todayKey()
  const G: GameState = {
    xp: 0,
    stat: { str: 0, fuel: 0, dis: 0, vit: 0, end: 0 },
    streak: 0,
    best: 0,
    freezes: 0,
    days: {},
    prs: 0,
    runPrs: 0,
    perfect: 0,
    cleared: 0,
    sets: 0,
    bfLogged: null,
    bosses: 0,
    weekHits: 0,
    weekLifts: 0,
    weekRuns: 0,
    lifts: 0,
    runs: 0,
    longMin: 0,
    longestKm: 0,
    hybrid: 0,
    km: 0,
    counts: { train: 0, protein: 0, supps: 0, water: 0, steps: 0 },
  }

  const keys = sortedKeys(days).filter(
    (k) => k <= today && hasAny(getDay(days, k)),
  )
  if (!keys.length) return G

  const best: Record<string, number> = {}
  const hits: Record<string, number> = {}
  const curWeek = weekOf(today)
  const wl: Record<string, number> = {}
  const wr: Record<string, number> = {}
  const hyb: Record<string, number> = {}

  for (let k = keys[0]!; k <= today; k = shift(k, 1)) {
    const d = getDay(days, k)
    const r = quests(d, profile)
    let xp = 0
    const doneIds: string[] = []

    for (const x of r.q) {
      if (x.done) {
        G.stat[x.stat] = (G.stat[x.stat] ?? 0) + x.xp
        xp += x.xp
        doneIds.push(x.id)
        if (x.id in G.counts) G.counts[x.id] = (G.counts[x.id] ?? 0) + 1
      }
    }

    let pr = 0
    for (const ex of d.lifts) {
      G.sets += ex.sets.length
      const key = ex.name.trim().toLowerCase()
      let top = 0
      for (const s of ex.sets) {
        if (s.kg) top = Math.max(top, e1rm(s.kg, s.reps))
      }
      if (!top) continue
      if (best[key] != null && top > best[key]! + 1e-6) pr++
      best[key] = Math.max(best[key] ?? 0, top)
    }
    if (pr) {
      G.prs += pr
      G.stat["str"] = (G.stat["str"] ?? 0) + PR_XP * pr
      xp += PR_XP * pr
    }

    let rpr = 0
    for (const rn of d.runs) {
      G.runs++
      G.km += rn.km || 0
      G.longMin = Math.max(G.longMin, rn.min || 0)
      if (G.longestKm > 0 && (rn.km || 0) > G.longestKm + 1e-6) rpr++
      G.longestKm = Math.max(G.longestKm, rn.km || 0)
    }
    if (rpr) {
      G.runPrs += rpr
      G.stat["end"] = (G.stat["end"] ?? 0) + PR_XP
      xp += PR_XP
    }

    const tq = r.q.find((x) => x.id === "train")
    const wk0 = weekOf(k)
    if (tq?.done && tq.kind === "lift") {
      G.lifts++
      wl[wk0] = (wl[wk0] ?? 0) + 1
    }
    if (d.runs.length) wr[wk0] = (wr[wk0] ?? 0) + 1
    if (!hyb[wk0] && (wl[wk0] ?? 0) >= 3 && (wr[wk0] ?? 0) >= 3) {
      hyb[wk0] = 1
      G.hybrid++
    }

    if (r.perfect) {
      xp += PERFECT_BONUS
      G.perfect++
    }
    if (d.bf != null) G.bfLogged = d.bf

    G.xp += xp

    let status: string
    if (r.cleared) {
      G.streak++
      G.cleared++
      G.best = Math.max(G.best, G.streak)
      if (G.streak % FREEZE_EVERY === 0 && G.freezes < FREEZE_MAX) G.freezes++
      status = r.perfect ? "perfect" : "cleared"
    } else if (k === today) {
      status = "open"
    } else if (G.freezes > 0) {
      G.freezes--
      status = "frozen"
    } else {
      G.streak = 0
      status = "missed"
    }

    const wk = weekOf(k)
    const h0 = hits[wk] ?? 0
    const h1 = h0 + (r.perfect ? 2 : r.cleared ? 1 : 0)
    hits[wk] = h1

    let boss = false
    if (h0 < BOSS_HP && h1 >= BOSS_HP) {
      G.bosses++
      G.xp += BOSS_XP
      xp += BOSS_XP
      boss = true
    }

    G.days[k] = {
      status: status as "perfect" | "cleared" | "frozen" | "missed" | "open",
      xp,
      done: r.done,
      total: r.core.length,
      pr,
      rpr,
      doneIds,
      boss,
    }
  }

  G.weekHits = hits[curWeek] ?? 0
  G.weekLifts = wl[curWeek] ?? 0
  G.weekRuns = wr[curWeek] ?? 0

  return G
}
