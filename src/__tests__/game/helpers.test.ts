import { describe, it, expect } from "vitest"
import {
  keyOf,
  dateOf,
  shift,
  esc,
  uid,
  n,
  fmt,
  totals,
  weekOf,
  getDay,
  U,
  LU,
  DU,
  toKg,
  fromKg,
  toKm,
  fromKm,
  toCm,
  fromCm,
  w1,
} from "../../game/helpers"
import type { Day, Profile } from "../../types"
import { DEFAULT_PROFILE } from "../../constants"

describe("keyOf", () => {
  it("formats a date as YYYY-MM-DD", () => {
    expect(keyOf(new Date(2025, 0, 5))).toBe("2025-01-05")
    expect(keyOf(new Date(2025, 11, 25))).toBe("2025-12-25")
  })
})

describe("dateOf", () => {
  it("parses a YYYY-MM-DD string into a Date", () => {
    const d = dateOf("2025-03-15")
    expect(d.getFullYear()).toBe(2025)
    expect(d.getMonth()).toBe(2) // 0-indexed
    expect(d.getDate()).toBe(15)
  })
})

describe("shift", () => {
  it("shifts a date key forward", () => {
    expect(shift("2025-01-30", 1)).toBe("2025-01-31")
    expect(shift("2025-01-31", 1)).toBe("2025-02-01")
  })

  it("shifts a date key backward", () => {
    expect(shift("2025-02-01", -1)).toBe("2025-01-31")
  })
})

describe("esc", () => {
  it("escapes HTML special characters", () => {
    expect(esc('<script>"alert"</script>')).toBe(
      "&lt;script&gt;&quot;alert&quot;&lt;/script&gt;",
    )
    expect(esc("O'Brien & Co")).toBe("O&#39;Brien &amp; Co")
  })

  it("handles null/undefined", () => {
    expect(esc(null)).toBe("")
    expect(esc(undefined)).toBe("")
  })
})

describe("uid", () => {
  it("returns a string of length 8", () => {
    const id = uid()
    expect(typeof id).toBe("string")
    expect(id.length).toBe(8)
  })

  it("returns unique values", () => {
    const ids = new Set(Array.from({ length: 100 }, () => uid()))
    expect(ids.size).toBe(100)
  })
})

describe("n", () => {
  it("parses valid numbers", () => {
    expect(n("42")).toBe(42)
    expect(n("3.14")).toBe(3.14)
    expect(n(0)).toBe(0)
  })

  it("returns 0 for invalid input", () => {
    expect(n("abc")).toBe(0)
    expect(n("")).toBe(0)
    expect(n(null)).toBe(0)
    expect(n(undefined)).toBe(0)
    expect(n(NaN)).toBe(0)
    expect(n(Infinity)).toBe(0)
  })
})

describe("fmt", () => {
  it("formats numbers with locale", () => {
    expect(fmt(1234)).toBe("1,234")
    expect(fmt(3.14159, 2)).toBe("3.14")
  })
})

describe("unit conversions", () => {
  const lbProfile: Profile = { ...DEFAULT_PROFILE, unit: "lb" }
  const kgProfile: Profile = { ...DEFAULT_PROFILE, unit: "kg" }

  it("U returns correct unit", () => {
    expect(U(lbProfile)).toBe("lb")
    expect(U(kgProfile)).toBe("kg")
  })

  it("LU returns correct length unit", () => {
    expect(LU(lbProfile)).toBe("in")
    expect(LU(kgProfile)).toBe("cm")
  })

  it("DU returns correct distance unit", () => {
    expect(DU(lbProfile)).toBe("mi")
    expect(DU(kgProfile)).toBe("km")
  })

  it("toKg converts from display unit to kg", () => {
    expect(toKg(100, lbProfile)).toBeCloseTo(45.36, 1)
    expect(toKg(100, kgProfile)).toBe(100)
  })

  it("fromKg converts from kg to display unit", () => {
    expect(fromKg(45.36, lbProfile)).toBeCloseTo(100, 0)
    expect(fromKg(45.36, kgProfile)).toBe(45.36)
  })

  it("toKm / fromKm handle mi/km", () => {
    expect(toKm(1, lbProfile)).toBeCloseTo(1.609, 2)
    expect(toKm(1, kgProfile)).toBe(1)
    expect(fromKm(1.609344, lbProfile)).toBeCloseTo(1, 2)
  })

  it("toCm / fromCm handle in/cm", () => {
    expect(toCm(1, lbProfile)).toBeCloseTo(2.54, 2)
    expect(toCm(1, kgProfile)).toBe(1)
    expect(fromCm(2.54, lbProfile)).toBeCloseTo(1, 2)
  })

  it("w1 rounds to 1 decimal in display unit", () => {
    expect(w1(45.3592, lbProfile)).toBeCloseTo(100, 0)
  })
})

describe("totals", () => {
  it("sums food macros with quantities", () => {
    const d: Day = {
      date: "2025-01-01",
      foods: [
        { id: "1", meal: "Breakfast", name: "Eggs", kcal: 140, p: 12, c: 1, f: 10, qty: 2 },
        { id: "2", meal: "Lunch", name: "Chicken", kcal: 250, p: 45, c: 0, f: 5, qty: 1 },
      ],
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
    }
    const t = totals(d)
    expect(t.kcal).toBe(140 * 2 + 250)
    expect(t.p).toBe(12 * 2 + 45)
    expect(t.c).toBe(1 * 2 + 0)
    expect(t.f).toBe(10 * 2 + 5)
  })

  it("returns zeroes for empty foods", () => {
    const d: Day = {
      date: "2025-01-01",
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
    }
    const t = totals(d)
    expect(t.kcal).toBe(0)
    expect(t.p).toBe(0)
  })
})

describe("weekOf", () => {
  it("returns the Monday of the week containing the date", () => {
    // 2025-01-06 is a Monday
    expect(weekOf("2025-01-06")).toBe("2025-01-06")
    // 2025-01-12 is a Sunday
    expect(weekOf("2025-01-12")).toBe("2025-01-06")
    // 2025-01-09 is a Thursday
    expect(weekOf("2025-01-09")).toBe("2025-01-06")
  })
})

describe("getDay", () => {
  it("returns a full Day with defaults for missing fields", () => {
    const d = getDay({}, "2025-01-01")
    expect(d.date).toBe("2025-01-01")
    expect(d.foods).toEqual([])
    expect(d.water).toBe(0)
    expect(d.weight).toBeNull()
    expect(d.mob).toBe(false)
  })

  it("uses existing data when present", () => {
    const d = getDay(
      { "2025-01-01": { water: 64, weight: 80 } },
      "2025-01-01",
    )
    expect(d.water).toBe(64)
    expect(d.weight).toBe(80)
  })
})
