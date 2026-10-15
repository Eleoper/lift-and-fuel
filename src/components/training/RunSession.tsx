import { useState, type FormEvent } from "react"
import { useStore } from "../../store/useStore"
import { useDay } from "../../store/derived"
import { sessionOf } from "../../game/targets"
import { uid, n, fmt, fromKm, toKm, paceStr, DU, sortedKeys } from "../../game/helpers"
import { PROGRAM } from "../../constants"

function easyHint(days: Record<string, Partial<import("../../types").Day>>, profile: import("../../types").Profile): string {
  const keys = sortedKeys(days)
  const k = keys.reverse().find((k) => {
    const runs = days[k]?.runs
    return runs && runs.some((r) => r.type === "speed" && r.km && r.min)
  })
  if (!k) return "Log a speed session and I'll work out your easy pace from it. Until then, keep it conversational."
  const runs = days[k]!.runs as import("../../types").Run[]
  const r = runs.find((r) => r.type === "speed" && r.km && r.min)!
  const p = r.min / fromKm(r.km, profile)
  const du = DU(profile)
  const add = du === "mi" ? [1.6, 3.2] : [1, 2]
  const fmtPace = (v: number) => {
    const m = Math.floor(v)
    const sec = Math.round((v - m) * 60)
    return `${sec === 60 ? m + 1 : m}:${String(sec === 60 ? 0 : sec).padStart(2, "0")}`
  }
  return `Easy pace target: about ${fmtPace(p + add[0]!)}\u2013${fmtPace(p + add[1]!)} per ${du}, based on your last speed session.`
}

const CHECK_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`

export function RunSession() {
  const profile = useStore((s) => s.profile)
  const days = useStore((s) => s.days)
  const saveDay = useStore((s) => s.saveDay)
  const day = useDay()
  const ses = sessionOf(day, profile)
  const Pg = PROGRAM[ses]

  const [runPick, setRunPick] = useState<number | null>(null)
  const [dist, setDist] = useState("")
  const [min, setMin] = useState("")
  const [rpe, setRpe] = useState("")

  if (Pg.kind !== "run") return null

  const du = DU(profile)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const distN = n(dist)
    const minN = n(min)
    if (!distN || !minN) return
    const km = toKm(distN, profile)
    const run = {
      id: uid(),
      type: ses,
      variant: ses === "speed" ? (runPick ?? null) : null,
      km,
      min: minN,
      rpe: Math.round(n(rpe)) || null,
    }
    saveDay(
      { ...day, runs: [...day.runs, run] },
      `run:${JSON.stringify({ type: "run", km, min: minN, rtype: ses })}`,
    )
    setDist("")
    setMin("")
    setRpe("")
  }

  function deleteRun(id: string) {
    saveDay({ ...day, runs: day.runs.filter((r) => r.id !== id) })
  }

  const hint = ses === "easy"
    ? easyHint(days, profile)
    : ses === "long"
    ? "Fuel is on today's meal plan: a banana before, then a sports drink and a gel once you pass 75 minutes. Build the long run gradually, about 10 minutes more each week."
    : ""

  return (
    <div className="box">
      <h2>{Pg.name}</h2>
      <span className="hint">{Pg.goal}</span>

      {Pg.opts && (
        <>
          <div className="label" style={{ marginTop: 8, marginBottom: 6 }}>Pick one</div>
          <div className="opts">
            {Pg.opts.map((o, i) => (
              <button
                key={i}
                type="button"
                className="opt"
                aria-pressed={runPick === i}
                onClick={() => setRunPick(i)}
              >
                <span className="check" dangerouslySetInnerHTML={{ __html: CHECK_SVG }} />
                <span>{o}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {hint && <p className="note" style={{ marginTop: 4 }}>{hint}</p>}

      <form className="row" onSubmit={handleSubmit} autoComplete="off" style={{ marginTop: 12 }}>
        <div className="field" style={{ flex: "1 1 100px" }}>
          <label>Distance ({du})</label>
          <input type="number" min="0.1" step="0.01" inputMode="decimal" value={dist} onChange={(e) => setDist(e.target.value)} required />
        </div>
        <div className="field" style={{ flex: "1 1 100px" }}>
          <label>Time (min)</label>
          <input type="number" min="1" step="0.5" inputMode="decimal" value={min} onChange={(e) => setMin(e.target.value)} required />
        </div>
        <div className="field" style={{ flex: "0 1 96px" }}>
          <label>Effort 1&ndash;10</label>
          <input type="number" min="1" max="10" step="1" inputMode="numeric" value={rpe} onChange={(e) => setRpe(e.target.value)} />
        </div>
        <button className="btn primary" type="submit">Log run</button>
      </form>

      {day.runs.length > 0 && (
        <div style={{ marginTop: 6 }}>
          {day.runs.map((r) => (
            <div className="runrow" key={r.id}>
              <span>
                <b>{PROGRAM[r.type]?.name ?? "Run"}</b>
                {r.type === "speed" && r.variant != null && "opts" in PROGRAM.speed && (PROGRAM.speed as { opts: string[] }).opts[r.variant] && (
                  <span className="hint"> &middot; {(PROGRAM.speed as { opts: string[] }).opts[r.variant]}</span>
                )}
                {r.rpe ? <span className="hint"> &middot; effort {r.rpe}/10</span> : null}
              </span>
              <span className="num">
                {fmt(fromKm(r.km, profile), 2)} {du} &middot; {fmt(r.min)} min &middot;{" "}
                {paceStr(r.min, r.km, profile)}/{du}
              </span>
              <button
                className="x"
                type="button"
                aria-label="Remove run"
                onClick={() => deleteRun(r.id)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
