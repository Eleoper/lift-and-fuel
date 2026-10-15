import type { Day, Profile, Quest, QuestResult } from "../types"
import { LB, CM_IN, PROGRAM } from "../constants"
import { dateOf, DU, fmt, fromKm, totals } from "./helpers"
import { targets } from "./targets"

export function hasAny(d: Day): boolean {
  return !!(
    d.foods.length ||
    d.lifts.length ||
    d.runs.length ||
    d.mob ||
    d.weight != null ||
    Object.values(d.supps).some(Boolean) ||
    d.water > 0 ||
    d.sleep != null ||
    d.steps != null ||
    d.waist != null
  )
}

export function quests(d: Day, profile: Profile): QuestResult {
  const T = targets(d, profile)
  const t = totals(d)
  const train = !T.rest
  const q: Quest[] = []

  const sets = d.lifts.reduce((a, x) => a + x.sets.length, 0)
  const ses = T.ses
  const Pg = PROGRAM[ses]

  if (Pg.kind === "lift") {
    const planned = Pg.ex.reduce((a, e) => a + e.sets, 0)
    const need = Math.ceil(planned * 0.6)
    q.push({
      id: "train",
      kind: "lift",
      stat: "str",
      xp: 40,
      name: `Finish ${Pg.name}`,
      prog: `${sets} / ${planned} working sets${sets < need ? ` · ${need} clears it` : ""}`,
      done: sets >= need,
      go: "training",
    })
  } else if (Pg.kind === "run") {
    const km = d.runs.reduce((a, r) => a + (r.km || 0), 0)
    const mn = d.runs.reduce((a, r) => a + (r.min || 0), 0)
    q.push({
      id: "train",
      kind: "run",
      stat: "end",
      xp: 40,
      name: `Finish your ${Pg.name.toLowerCase()}`,
      prog: d.runs.length
        ? `${fmt(fromKm(km, profile), 2)} ${DU(profile)} · ${fmt(mn)} min`
        : Pg.time,
      done: d.runs.length > 0,
      go: "training",
    })
  } else {
    q.push({
      id: "train",
      kind: "rest",
      stat: "vit",
      xp: 20,
      name: "Mobility and recovery",
      prog: d.mob ? "Done" : Pg.time + " of mobility",
      done: d.mob,
      go: "training",
    })
  }

  q.push({
    id: "protein",
    stat: "fuel",
    xp: 30,
    name: "Hit your protein",
    prog: `${fmt(t.p)} / ${fmt(T.protein)} g`,
    done: T.protein > 0 && t.p >= T.protein * 0.95,
    go: "food",
  })

  const tol = Math.max(T.kcal * 0.1, 220)
  const lo = Math.round(T.kcal - tol)
  const hi = Math.round(T.kcal + tol)
  q.push({
    id: "kcal",
    stat: "fuel",
    xp: 25,
    name: "Land your calories",
    prog: d.foods.length
      ? `${fmt(t.kcal)} kcal · aim ${fmt(lo)}–${fmt(hi)}`
      : `Aim for ${fmt(lo)}–${fmt(hi)} kcal`,
    done: d.foods.length > 0 && t.kcal >= lo && t.kcal <= hi,
    go: "food",
  })

  const req = (profile.stack || []).filter((s) => train || s.slot !== "Pre-gym")
  if (req.length) {
    const taken = req.filter((s) => d.supps[s.id]).length
    q.push({
      id: "supps",
      stat: "dis",
      xp: 20,
      name: "Take your stack",
      prog: `${taken} / ${req.length} taken`,
      done: taken === req.length,
    })
  }

  q.push({
    id: "water",
    stat: "vit",
    xp: 15,
    name: "Drink your water",
    prog: `${fmt(d.water)} / ${fmt(profile.waterGoal)} oz`,
    done: d.water >= profile.waterGoal,
  })

  q.push({
    id: "sleep",
    stat: "vit",
    xp: 20,
    name: `Sleep ${fmt(profile.sleepGoal, 2)}+ hours`,
    prog: d.sleep != null ? `${fmt(d.sleep, 2)} h logged` : "Log last night's sleep",
    done: d.sleep != null && d.sleep >= profile.sleepGoal,
  })

  q.push({
    id: "steps",
    stat: "vit",
    xp: 15,
    name: "Hit your steps",
    prog: `${fmt(d.steps || 0)} / ${fmt(profile.stepGoal)}`,
    done: (d.steps || 0) >= profile.stepGoal,
  })

  const wU = profile.unit === "kg" ? "kg" : "lb"
  const weightDisplay =
    d.weight != null
      ? `${Math.round((wU === "lb" ? d.weight / LB : d.weight) * 10) / 10} ${wU}`
      : "Morning weigh-in"
  q.push({
    id: "weigh",
    stat: "dis",
    xp: 10,
    name: "Weigh in",
    prog: weightDisplay,
    done: d.weight != null,
    go: "progress",
  })

  const lU = profile.unit === "kg" ? "cm" : "in"
  if (dateOf(d.date).getDay() === 0 || d.waist != null) {
    const waistDisplay =
      d.waist != null
        ? `Waist ${fmt(lU === "in" ? d.waist / CM_IN : d.waist, 2)} ${lU}`
        : "Waist, body fat and photos"
    q.push({
      id: "check",
      stat: "dis",
      xp: 25,
      bonus: true,
      name: "Weekly check-in",
      prog: waistDisplay,
      done: d.waist != null,
      go: "progress",
    })
  }

  const core = q.filter((x) => !x.bonus)
  const done = core.filter((x) => x.done).length
  const need = Math.ceil(core.length * 0.75)
  return { q, core, done, need, cleared: done >= need, perfect: done === core.length }
}
