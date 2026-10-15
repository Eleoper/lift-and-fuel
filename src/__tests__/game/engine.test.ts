import { describe, it, expect } from "vitest"
import { game, levelOf, titleOf, statLevel, unlockedIds } from "../../game/engine"
import { e1rm, navyBf } from "../../game/records"
import type { Day } from "../../types"
import { DEFAULT_PROFILE } from "../../constants"

function makeDay(date: string, overrides: Partial<Day> = {}): Partial<Day> {
  return {
    date,
    foods: [],
    lifts: [],
    runs: [],
    weight: null,
    supps: {},
    water: 0,
    sleep: null,
    steps: null,
    rest: null,
    session: null,
    mob: false,
    waist: null,
    neck: null,
    bf: null,
    bfSrc: null,
    photo: false,
    ...overrides,
  }
}

function fullDay(date: string): Partial<Day> {
  return makeDay(date, {
    foods: [{ id: "f1", meal: "Lunch", name: "Chicken", kcal: 2180, p: 220, c: 200, f: 50, qty: 1 }],
    lifts: [
      { id: "l1", name: "Bench press", sets: Array.from({ length: 4 }, () => ({ kg: 60, reps: 8 })) },
      { id: "l2", name: "Incline DB press", sets: Array.from({ length: 3 }, () => ({ kg: 20, reps: 10 })) },
      { id: "l3", name: "Shoulder press", sets: Array.from({ length: 3 }, () => ({ kg: 30, reps: 8 })) },
      { id: "l4", name: "Triceps pushdown", sets: Array.from({ length: 3 }, () => ({ kg: 25, reps: 12 })) },
      { id: "l5", name: "Lateral raise", sets: Array.from({ length: 3 }, () => ({ kg: 8, reps: 15 })) },
    ],
    supps: { cre: true, d3: true, o3: true, caf: true, zn: true, mg: true },
    water: 100,
    sleep: 8,
    steps: 10000,
    weight: 80,
    session: "push",
  })
}

describe("levelOf", () => {
  it("level 1 at 0 XP", () => {
    const lv = levelOf(0)
    expect(lv.L).toBe(1)
    expect(lv.into).toBe(0)
    expect(lv.need).toBe(150)
  })

  it("level 2 at 150 XP", () => {
    const lv = levelOf(150)
    expect(lv.L).toBe(2)
    expect(lv.into).toBe(0)
    expect(lv.need).toBe(200)
  })

  it("handles partial progress", () => {
    const lv = levelOf(100)
    expect(lv.L).toBe(1)
    expect(lv.into).toBe(100)
    expect(lv.need).toBe(150)
  })

  it("level 3 at 350 XP (150 + 200)", () => {
    const lv = levelOf(350)
    expect(lv.L).toBe(3)
    expect(lv.into).toBe(0)
  })
})

describe("titleOf", () => {
  it("returns correct titles for levels", () => {
    expect(titleOf(1)).toBe("Novice")
    expect(titleOf(2)).toBe("Novice")
    expect(titleOf(3)).toBe("Apprentice")
    expect(titleOf(6)).toBe("Lifter")
    expect(titleOf(10)).toBe("Iron Initiate")
    expect(titleOf(15)).toBe("Athlete")
    expect(titleOf(20)).toBe("Iron Disciple")
    expect(titleOf(30)).toBe("Elite")
    expect(titleOf(45)).toBe("Legend")
    expect(titleOf(100)).toBe("Legend")
  })
})

describe("statLevel", () => {
  it("level 1 at 0 XP", () => {
    const sl = statLevel(0)
    expect(sl.L).toBe(1)
    expect(sl.pct).toBe(0)
  })

  it("level 2 at 40 XP (sqrt(40/40)+1 = 2)", () => {
    const sl = statLevel(40)
    expect(sl.L).toBe(2)
  })
})

describe("e1rm", () => {
  it("returns weight for 1 rep", () => {
    expect(e1rm(100, 1)).toBe(100)
  })

  it("calculates Epley estimate", () => {
    // 100kg × 5 reps: 100 * (1 + 5/30) = 100 * 7/6 ≈ 116.67
    expect(e1rm(100, 5)).toBeCloseTo(116.67, 1)
  })

  it("returns 0 for 0 weight", () => {
    expect(e1rm(0, 10)).toBe(0)
  })
})

describe("navyBf", () => {
  it("calculates body fat from circumference measurements", () => {
    // Typical male: waist 86cm, neck 38cm, height 177cm
    const bf = navyBf(86, 38, 177)
    expect(bf).not.toBeNull()
    expect(bf!).toBeGreaterThan(10)
    expect(bf!).toBeLessThan(30)
  })

  it("returns null for invalid input", () => {
    expect(navyBf(30, 38, 177)).toBeNull() // waist < neck
    expect(navyBf(86, 38, 0)).toBeNull() // no height
  })
})

describe("game", () => {
  it("returns empty state for no data", () => {
    const G = game({}, DEFAULT_PROFILE)
    expect(G.xp).toBe(0)
    expect(G.streak).toBe(0)
    expect(G.prs).toBe(0)
  })

  it("awards XP for completed quests", () => {
    // Use a date that is today so it counts
    const today = new Date()
    const k = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

    const days: Record<string, Partial<Day>> = {
      [k]: fullDay(k),
    }
    const G = game(days, DEFAULT_PROFILE)
    expect(G.xp).toBeGreaterThan(0)
  })

  it("tracks streak correctly", () => {
    const today = new Date()
    const k = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

    const days: Record<string, Partial<Day>> = {
      [k]: fullDay(k),
    }
    const G = game(days, DEFAULT_PROFILE)
    // If enough quests are cleared, streak should be 1
    if (G.days[k]?.status === "cleared" || G.days[k]?.status === "perfect") {
      expect(G.streak).toBeGreaterThanOrEqual(1)
    }
  })

  it("tracks lift PRs", () => {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`

    const days: Record<string, Partial<Day>> = {
      [yesterdayStr]: makeDay(yesterdayStr, {
        lifts: [{ id: "l1", name: "Bench press", sets: [{ kg: 60, reps: 5 }] }],
        session: "push",
      }),
      [todayStr]: makeDay(todayStr, {
        lifts: [{ id: "l2", name: "Bench press", sets: [{ kg: 70, reps: 5 }] }],
        session: "push",
      }),
    }
    const G = game(days, DEFAULT_PROFILE)
    expect(G.prs).toBe(1) // Second day has higher 1RM
  })
})

describe("unlockedIds", () => {
  it("always includes starter items", () => {
    const G = game({}, DEFAULT_PROFILE)
    const ids = unlockedIds(G, DEFAULT_PROFILE.goalBf)
    expect(ids.has("tee")).toBe(true)
    expect(ids.has("none")).toBe(true)
    expect(ids.has("nogear")).toBe(true)
    expect(ids.has("quest")).toBe(true)
  })

  it("does not include locked items at level 1", () => {
    const G = game({}, DEFAULT_PROFILE)
    const ids = unlockedIds(G, DEFAULT_PROFILE.goalBf)
    expect(ids.has("tank")).toBe(false) // requires level 3
    expect(ids.has("cap")).toBe(false) // requires level 8
  })
})
