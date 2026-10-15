import { useStore } from "../../store/useStore"
import { useGameState, useVitals } from "../../store/derived"
import { statLevel } from "../../game/engine"
import { fmt, pick } from "../../game/helpers"
import { sessionOf, isTrainDay } from "../../game/targets"
import { nextPlanMeal } from "../../game/plan"
import { PROGRAM } from "../../constants"
import type { SpeechLine } from "../../character/useDialogue"

function pepLine(
  profile: ReturnType<typeof useStore.getState>["profile"],
  v: ReturnType<typeof useVitals>,
): string {
  const d = v.d
  const r = v.r
  const open = r.core.filter((x) => !x.done)

  if (!open.length)
    return pick([
      "Nothing left on the board today. Rest up.",
      "All quests done. Proud of you.",
      "Clean sweep today. Same again tomorrow.",
    ])

  const x = open[0]!

  if (x.id === "train") {
    const Pg = PROGRAM[sessionOf(d, profile)]
    if (Pg.kind === "lift")
      return `${Pg.name} is still open. Start with ${Pg.ex[0]!.n.toLowerCase()}, ${Pg.ex[0]!.sets}\u00d7${Pg.ex[0]!.lo}${Pg.ex[0]!.hi > Pg.ex[0]!.lo ? "\u2013" + Pg.ex[0]!.hi : ""}, and leave 1\u20132 reps in reserve.`
    if (Pg.kind === "run")
      return `Your ${Pg.name.toLowerCase()} is still open. ${Pg.time}.${sessionOf(d, profile) === "easy" ? " Keep it conversational." : ""}`
    return "Mobility's still open. 15 minutes is enough. Recovery is training too."
  }

  if (x.id === "protein") {
    const left = Math.max(0, v.T.protein - v.t.p)
    const nm = nextPlanMeal(d, profile)
    return `${fmt(left)} g protein to go.${nm ? ` ${nm.name} covers ${fmt(nm.t.p)} g.` : ""}`
  }

  if (x.id === "kcal")
    return v.t.kcal < v.T.kcal * 0.9
      ? `${fmt(v.T.kcal - v.t.kcal)} kcal left. Stick to the plan.`
      : "Over on calories today. No need to make up for it tomorrow, just get back on plan."

  if (x.id === "supps") {
    const left = (profile.stack || [])
      .filter(
        (s) => (isTrainDay(d, profile) || s.slot !== "Pre-gym") && !d.supps[s.id],
      )
      .map((s) => s.name)
    return `Still to take: ${left.slice(0, 3).join(", ")}${left.length > 3 ? "\u2026" : ""}.`
  }

  if (x.id === "water") return `${fmt(Math.max(0, profile.waterGoal - d.water))} oz of water left today.`
  if (x.id === "sleep") return "Log last night's sleep in Recovery."
  if (x.id === "steps") return "Steps are still open. A 20-minute walk is about 2,000."
  if (x.id === "weigh") return "Weigh-in's open. Best right after you wake up."

  return "Let's keep going."
}

interface ActionButtonsProps {
  say: (text: string, opts?: Partial<SpeechLine>) => void
}

export function ActionButtons({ say }: ActionButtonsProps) {
  const profile = useStore((s) => s.profile)
  const G = useGameState()
  const v = useVitals()

  function interact(kind: string) {
    const sl = statLevel(G.stat.str ?? 0).L

    if (kind === "high") {
      say(
        pick([
          `Up top! ${v.r.done} of ${v.r.core.length} quests done.`,
          "Nice one!",
          `${G.streak}-day streak. Keep it rolling.`,
        ]),
        { pose: "highfive", expr: "excited", now: true },
      )
    } else if (kind === "flex") {
      say(
        pick([
          `Strength level ${sl}. Built on ${fmt(G.sets)} working sets.`,
          `${G.prs} PRs so far. More coming.`,
          `Fuel level ${statLevel(G.stat.fuel ?? 0).L}. The protein is paying off.`,
        ]),
        { pose: "flex", expr: "happy", now: true },
      )
    } else if (kind === "pep") {
      say(pepLine(profile, v), {
        speaker: "coach",
        pose: "point",
        heroPose: "idle",
        heroExpr: "smile",
        now: true,
      })
    }
  }

  return (
    <div className="row" style={{ gap: 6, marginTop: 4 }}>
      <button
        type="button"
        className="btn"
        onClick={() => interact("high")}
      >
        High five
      </button>
      <button
        type="button"
        className="btn"
        onClick={() => interact("flex")}
      >
        Flex
      </button>
      <button
        type="button"
        className="btn"
        onClick={() => interact("pep")}
      >
        Pep talk
      </button>
    </div>
  )
}
