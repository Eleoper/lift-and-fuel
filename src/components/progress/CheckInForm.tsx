import { useState, type FormEvent } from "react"
import { useStore } from "../../store/useStore"
import { useDay } from "../../store/derived"
import { n, fmt, fromCm, toCm, LU, shortDate, sortedKeys } from "../../game/helpers"
import { navyBf } from "../../game/records"

export function CheckInForm() {
  const profile = useStore((s) => s.profile)
  const days = useStore((s) => s.days)
  const saveDay = useStore((s) => s.saveDay)
  const day = useDay()
  const lu = LU(profile)

  const [waist, setWaist] = useState(
    day.waist != null ? String(Math.round(fromCm(day.waist, profile) * 100) / 100) : "",
  )
  const [neck, setNeck] = useState(
    day.neck != null ? String(Math.round(fromCm(day.neck!, profile) * 100) / 100) : "",
  )
  const [bf, setBf] = useState(
    day.bf != null && day.bfSrc !== "tape" ? String(day.bf) : "",
  )
  const [photo, setPhoto] = useState(day.photo)

  const wk = sortedKeys(days).filter((k) => days[k]?.waist != null)
  const lastCheck = wk[wk.length - 1]
  const lastPhoto = sortedKeys(days).reverse().find((k) => days[k]?.photo)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const wv = n(waist)
    const nv = n(neck)
    const bv = n(bf)
    if (!wv && !bv && !nv) return

    const updated = { ...day }
    if (wv) updated.waist = toCm(wv, profile)
    if (nv) updated.neck = toCm(nv, profile)

    if (bv) {
      updated.bf = Math.round(bv * 10) / 10
      updated.bfSrc = "scan"
    } else if (updated.waist && updated.neck) {
      const est = navyBf(updated.waist, updated.neck!, profile.heightCm || 165.1)
      if (est != null && est > 2 && est < 60) {
        updated.bf = est
        updated.bfSrc = "tape"
      }
    }

    const prevK = sortedKeys(days).reverse().find((k) => k < day.date && days[k]?.waist != null)
    let msg = updated.bfSrc === "tape" && updated.bf != null
      ? `Tape estimate: ${fmt(updated.bf, 1)}% body fat.`
      : "Same time next week."

    if (wv && prevK) {
      const dl = wv - fromCm(days[prevK]!.waist as number, profile)
      msg = dl < 0
        ? `Waist down ${fmt(-dl, 2)} ${lu} since ${shortDate(prevK)}. The cut is working.`
        : dl > 0
          ? `Waist up ${fmt(dl, 2)} ${lu}. One reading is noise; watch next week.`
          : "Waist holding steady."
      if (updated.bfSrc === "tape" && updated.bf != null) msg += ` Tape estimate ${fmt(updated.bf, 1)}%.`
    }

    saveDay(updated, `check:${JSON.stringify({ type: "check", msg })}`)
  }

  function togglePhoto() {
    const updated = { ...day, photo: !photo }
    setPhoto(!photo)
    saveDay(
      updated,
      !photo ? `check:${JSON.stringify({ type: "check", msg: "Photos noted. Same light and poses next time." })}` : undefined,
    )
  }

  return (
    <form className="box" onSubmit={handleSubmit} autoComplete="off">
      <h2>Body check-in</h2>
      <div className="row">
        <div className="field">
          <label>Waist at navel ({lu})</label>
          <input type="number" step="0.01" inputMode="decimal" value={waist} onChange={(e) => setWaist(e.target.value)} />
        </div>
        <div className="field">
          <label>Neck ({lu})</label>
          <input type="number" step="0.01" inputMode="decimal" value={neck} onChange={(e) => setNeck(e.target.value)} />
        </div>
        <div className="field">
          <label>Body fat % (scan)</label>
          <input type="number" step="0.1" inputMode="decimal" value={bf} onChange={(e) => setBf(e.target.value)} />
        </div>
        <button className="btn primary" type="submit">Save</button>
      </div>
      <div className="row" style={{ alignItems: "center", gap: 8 }}>
        <button
          type="button"
          className={`btn${photo ? " done" : ""}`}
          aria-pressed={photo}
          onClick={togglePhoto}
        >
          {photo ? "Photos taken" : "Took progress photos"}
        </button>
      </div>
      <span className="hint">
        {lastCheck
          ? `Last check-in ${shortDate(lastCheck)}${lastPhoto ? ` \u00b7 photos ${shortDate(lastPhoto)}` : ""}`
          : "Once a week, same time of day"}
      </span>
    </form>
  )
}
