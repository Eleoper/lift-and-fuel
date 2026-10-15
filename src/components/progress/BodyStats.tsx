import { useStore } from "../../store/useStore"
import { latestBf, latestWeight, latestOf, navyBf } from "../../game/records"
import { fmt, fromKg, fromCm, U, LU, sortedKeys, shortDate } from "../../game/helpers"

export function BodyStats() {
  const profile = useStore((s) => s.profile)
  const days = useStore((s) => s.days)
  const unit = U(profile)
  const lu = LU(profile)

  const bf = latestBf(days, profile)
  const lw = latestWeight(days)
  const wk = sortedKeys(days).filter((k) => days[k]?.waist != null)
  const lastCheck = wk[wk.length - 1]

  const hcm = profile.heightCm || 165.1
  const wcm = latestOf(days, "waist") as number | null
  const ncm = latestOf(days, "neck") as number | null
  const navy = wcm && ncm ? navyBf(wcm, ncm, hcm) : null
  const bmi = lw != null ? lw / Math.pow(hcm / 100, 2) : null
  const whtr = wcm ? wcm / hcm : null

  const bfK = sortedKeys(days).reverse().find((k) => days[k]?.bf != null)
  const bfSrc = bfK ? (days[bfK]!.bfSrc === "tape" ? "Tape estimate" : "Scan") : "Starting estimate"

  return (
    <div className="box">
      <h2>Body stats</h2>
      <div className="stats">
        {/* Waist */}
        {wk.length > 0 ? (
          <div>
            <span className="v num">{fmt(fromCm(days[lastCheck!]!.waist as number, profile), 2)}</span>
            <span className="label">Waist {lu}</span>
            <span className="hint num">
              {wk.length > 1
                ? (() => {
                    const f = fromCm(days[wk[0]!]!.waist as number, profile)
                    const l = fromCm(days[lastCheck!]!.waist as number, profile)
                    const dlt = l - f
                    return `${dlt > 0 ? "+" : ""}${fmt(dlt, 2)} since ${shortDate(wk[0]!)}`
                  })()
                : "First check-in"}
            </span>
          </div>
        ) : (
          <div>
            <span className="v num">&ndash;</span>
            <span className="label">Waist {lu}</span>
            <span className="hint">Measure at the navel</span>
          </div>
        )}

        {/* Body fat */}
        <div>
          <span className="v num">{fmt(bf, 1)}%</span>
          <span className="label">Body fat</span>
          <span className="hint">{bfSrc} &middot; goal {fmt(profile.goalBf || 15)}%</span>
        </div>

        {/* Lean mass & weight at goal */}
        {lw != null ? (
          <>
            <div>
              <span className="v num">{fmt(fromKg(lw, profile) * (1 - bf / 100))}</span>
              <span className="label">Lean mass {unit}</span>
              <span className="hint num">{fmt(fromKg(lw, profile) * (bf / 100))} {unit} fat</span>
            </div>
            <div>
              <span className="v num">
                {fmt(fromKg(lw, profile) * (1 - bf / 100) / (1 - (profile.goalBf || 15) / 100))}
              </span>
              <span className="label">Weight at {fmt(profile.goalBf || 15)}%</span>
              <span className="hint">Keeping today's muscle</span>
            </div>
          </>
        ) : (
          <>
            <div>
              <span className="v num">&ndash;</span>
              <span className="label">Lean mass</span>
              <span className="hint">Needs a weigh-in</span>
            </div>
            <div>
              <span className="v num">&ndash;</span>
              <span className="label">Weight at goal</span>
              <span className="hint">Needs a weigh-in</span>
            </div>
          </>
        )}

        {/* Tape estimate */}
        <div>
          <span className="v num">{navy != null ? `${fmt(navy, 1)}%` : "\u2013"}</span>
          <span className="label">Tape estimate</span>
          <span className="hint">{navy != null ? "Navy method, \u00b13\u20134%" : "Needs waist and neck"}</span>
        </div>

        {/* Waist/height */}
        <div>
          <span className="v num">{whtr ? fmt(whtr, 2) : "\u2013"}</span>
          <span className="label">Waist &divide; height</span>
          <span className="hint">
            {whtr ? (whtr < 0.5 ? "Healthy range (under 0.5)" : "Aim for under 0.5") : "Needs a waist"}
          </span>
        </div>

        {/* BMI */}
        <div>
          <span className="v num">{bmi ? fmt(bmi, 1) : "\u2013"}</span>
          <span className="label">BMI</span>
          <span className="hint">{bmi ? "Ignores muscle, so trust it least" : "Needs a weigh-in"}</span>
        </div>

        {/* Neck */}
        <div>
          <span className="v num">{ncm ? fmt(fromCm(ncm, profile), 2) : "\u2013"}</span>
          <span className="label">Neck {lu}</span>
          <span className="hint">Just below the Adam's apple</span>
        </div>
      </div>

      <span className="hint" style={{ marginTop: 8, display: "block" }}>
        Height{" "}
        {lu === "in"
          ? `${Math.floor(hcm / 2.54 / 12)}'${Math.round((hcm / 2.54) % 12)}"`
          : `${fmt(hcm)} cm`}{" "}
        (change it under Goals). Measure waist and neck relaxed, first thing in the morning.
        Leave the scan box blank to use the tape estimate, or enter a DEXA/BodPod result, which always wins.
      </span>
    </div>
  )
}
