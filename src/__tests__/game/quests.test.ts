import { describe, it, expect } from "vitest"
import { quests, hasAny } from "../../game/quests"
import { targets } from "../../game/targets"
import type { Day } from "../../types"
import { DEFAULT_PROFILE } from "../../constants"

function emptyDay(date: string, session: string | null = null): Day {
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
    session: session as Day["session"],
    mob: false,
    waist: null,
    neck: null,
    bf: null,
    bfSrc: null,
    photo: false,
  }
}

describe("hasAny", () => {
  it("returns false for a completely empty day", () => {
    expect(hasAny(emptyDay("2025-01-06"))).toBe(false)
  })

  it("returns true if any data is logged", () => {
    expect(hasAny({ ...emptyDay("2025-01-06"), water: 8 })).toBe(true)
    expect(hasAny({ ...emptyDay("2025-01-06"), weight: 80 })).toBe(true)
    expect(hasAny({ ...emptyDay("2025-01-06"), sleep: 7 })).toBe(true)
    expect(
      hasAny({
        ...emptyDay("2025-01-06"),
        foods: [{ id: "1", meal: "Lunch", name: "Test", kcal: 100, p: 10, c: 10, f: 5, qty: 1 }],
      }),
    ).toBe(true)
  })
})

describe("quests", () => {
  // 2025-01-06 is a Monday = push (lift day)
  const profile = DEFAULT_PROFILE

  it("returns 8+ quests for a training day", () => {
    const d = emptyDay("2025-01-06", "push") // Monday
    const r = quests(d, profile)
    expect(r.q.length).toBeGreaterThanOrEqual(8)
    expect(r.core.length).toBeGreaterThanOrEqual(7) // excluding bonus
  })

  it("training quest is lift kind on push day", () => {
    const d = emptyDay("2025-01-06", "push")
    const r = quests(d, profile)
    const train = r.q.find((q) => q.id === "train")
    expect(train).toBeDefined()
    expect(train!.kind).toBe("lift")
    expect(train!.stat).toBe("str")
    expect(train!.xp).toBe(40)
  })

  it("training quest is run kind on speed day", () => {
    const d = emptyDay("2025-01-07", "speed")
    const r = quests(d, profile)
    const train = r.q.find((q) => q.id === "train")
    expect(train!.kind).toBe("run")
  })

  it("training quest is rest kind on mobility day", () => {
    const d = emptyDay("2025-01-12", "mobility") // Sunday
    const r = quests(d, profile)
    const train = r.q.find((q) => q.id === "train")
    expect(train!.kind).toBe("rest")
    expect(train!.xp).toBe(20)
  })

  describe("protein quest", () => {
    it("not done when protein is below 95%", () => {
      const d: Day = {
        ...emptyDay("2025-01-06", "push"),
        foods: [{ id: "1", meal: "Lunch", name: "Chicken", kcal: 500, p: 200, c: 10, f: 5, qty: 1 }],
      }
      const r = quests(d, profile)
      const pq = r.q.find((q) => q.id === "protein")
      // 200 / 215 = 93%, below 95%
      expect(pq!.done).toBe(false)
    })

    it("done when protein >= 95% of target", () => {
      const d: Day = {
        ...emptyDay("2025-01-06", "push"),
        foods: [{ id: "1", meal: "Lunch", name: "Chicken", kcal: 500, p: 205, c: 10, f: 5, qty: 1 }],
      }
      const r = quests(d, profile)
      const pq = r.q.find((q) => q.id === "protein")
      // 205 / 215 = 95.3%, at or above 95%
      expect(pq!.done).toBe(true)
    })
  })

  describe("calorie quest", () => {
    it("uses wider of ±10% or ±220 kcal tolerance", () => {
      const T = targets(emptyDay("2025-01-06", "push"), profile)
      const tol = Math.max(T.kcal * 0.1, 220)
      // 2180 * 0.1 = 218, 220 > 218, so tolerance is 220
      expect(tol).toBe(220)
    })

    it("done when calories within tolerance range", () => {
      const d: Day = {
        ...emptyDay("2025-01-06", "push"),
        foods: [{ id: "1", meal: "Lunch", name: "Meal", kcal: 2100, p: 50, c: 200, f: 50, qty: 1 }],
      }
      const r = quests(d, profile)
      const cq = r.q.find((q) => q.id === "kcal")
      // 2100 within 1960-2400, so done
      expect(cq!.done).toBe(true)
    })

    it("not done when calories are too low", () => {
      const d: Day = {
        ...emptyDay("2025-01-06", "push"),
        foods: [{ id: "1", meal: "Lunch", name: "Meal", kcal: 1500, p: 50, c: 200, f: 50, qty: 1 }],
      }
      const r = quests(d, profile)
      const cq = r.q.find((q) => q.id === "kcal")
      expect(cq!.done).toBe(false)
    })
  })

  describe("supplement quest", () => {
    it("skips pre-gym items on rest days", () => {
      const d: Day = {
        ...emptyDay("2025-01-12", "mobility"), // Sunday = rest
        supps: { cre: true, d3: true, o3: true, zn: true, mg: true },
      }
      const r = quests(d, profile)
      const sq = r.q.find((q) => q.id === "supps")
      // Pre-gym (caf) is skipped on rest, so 5 out of 5 required
      expect(sq!.done).toBe(true)
    })

    it("requires pre-gym items on training days", () => {
      const d: Day = {
        ...emptyDay("2025-01-06", "push"),
        supps: { cre: true, d3: true, o3: true, zn: true, mg: true },
      }
      const r = quests(d, profile)
      const sq = r.q.find((q) => q.id === "supps")
      // Missing caf (Pre-gym), so 5 of 6
      expect(sq!.done).toBe(false)
    })
  })

  describe("clear threshold", () => {
    it("requires 75% of core quests", () => {
      const d = emptyDay("2025-01-06", "push")
      const r = quests(d, profile)
      expect(r.need).toBe(Math.ceil(r.core.length * 0.75))
    })

    it("cleared when enough quests done", () => {
      const d: Day = {
        ...emptyDay("2025-01-06", "push"),
        foods: [{ id: "f1", meal: "Lunch", name: "Food", kcal: 2180, p: 220, c: 200, f: 50, qty: 1 }],
        lifts: [
          { id: "l1", name: "Bench press", sets: Array.from({ length: 10 }, () => ({ kg: 60, reps: 8 })) },
        ],
        supps: { cre: true, d3: true, o3: true, caf: true, zn: true, mg: true },
        water: 100,
        sleep: 8,
        steps: 10000,
        weight: 80,
      }
      const r = quests(d, profile)
      // With all these logged, most quests should be done
      expect(r.cleared).toBe(true)
      expect(r.perfect).toBe(true)
    })
  })
})

describe("targets", () => {
  it("uses training day values for push session", () => {
    const d = emptyDay("2025-01-06", "push")
    const T = targets(d, DEFAULT_PROFILE)
    expect(T.kcal).toBe(2180)
    expect(T.protein).toBe(215)
    expect(T.rest).toBe(false)
    expect(T.long).toBe(false)
  })

  it("uses rest day values for mobility session", () => {
    const d = emptyDay("2025-01-12", "mobility")
    const T = targets(d, DEFAULT_PROFILE)
    expect(T.kcal).toBe(1980)
    expect(T.rest).toBe(true)
  })

  it("adds fuel for long run day", () => {
    const d = emptyDay("2025-01-11", "long")
    const T = targets(d, DEFAULT_PROFILE)
    expect(T.kcal).toBe(2180 + 325)
    expect(T.carbs).toBe(208 + 82)
    expect(T.long).toBe(true)
  })
})
