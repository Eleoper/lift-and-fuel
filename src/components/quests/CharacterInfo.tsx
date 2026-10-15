import { useStore } from "../../store/useStore"
import { useGameState, useVitals } from "../../store/derived"
import { levelOf, titleOf, statLevel } from "../../game/engine"
import { avatar, fmt } from "../../game/helpers"
import { STATS, FREEZE_MAX } from "../../constants"
import { MOOD_LABEL } from "../../game/vitals"

const FLAME_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.6 1.8c.6 3.3-1.6 5-3 6.9C8.4 10.3 7.5 12 7.5 14a4.5 4.5 0 0 0 9 0c0-1.4-.5-2.6-1.2-3.6 1.9.7 3.7 2.8 3.7 5.6A7 7 0 0 1 5 16c0-4.6 3.3-7 5.2-9.6 1-1.4 1.8-2.9 2.4-4.6zM12 12.5c.9 1 1.8 2 1.8 3.2a1.8 1.8 0 0 1-3.6 0c0-1.2.9-2.2 1.8-3.2z"/></svg>`
const FROST_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11M9 3.5l3 2.5 3-2.5M9 20.5l3-2.5 3 2.5"/></svg>`

export function CharacterInfo() {
  const profile = useStore((s) => s.profile)
  const G = useGameState()
  const v = useVitals()
  const A = avatar(profile)

  const lv = levelOf(G.xp)
  const pct = lv.into / lv.need

  const vitals: [string, number, string, string][] = [
    ["Energy", v.energy, "--vit", v.d.sleep == null ? "Log sleep" : `${fmt(v.d.sleep, 2)} h sleep`],
    ["Fuel", v.fuel, "--fuel", `${fmt(v.t.p)} g protein`],
    ["Hydration", v.hyd, "--frost", `${fmt(v.d.water)} oz`],
  ]

  return (
    <div className="box">
      <span className="label">{A.name} &middot; Level {lv.L}</span>
      <h2>{titleOf(lv.L)}</h2>

      <div
        className="xpbar"
        role="progressbar"
        aria-label="XP to next level"
        aria-valuemin={0}
        aria-valuemax={lv.need}
        aria-valuenow={lv.into}
      >
        <i style={{ width: `${(pct * 100).toFixed(1)}%` }} />
      </div>
      <span className="hint num">
        {fmt(lv.into)} / {fmt(lv.need)} XP to level {lv.L + 1} &middot; {fmt(G.xp)} XP total
      </span>

      {/* Badges */}
      <div className="badges">
        <span className="pill flame">
          <span dangerouslySetInnerHTML={{ __html: FLAME_SVG }} />
          <span className="num">{G.streak}</span>-day streak
        </span>
        <span className="pill frost" title="Streak freezes cover one missed day each">
          {[...Array(FREEZE_MAX)].map((_, i) => (
            <span key={i} className={i < G.freezes ? "" : "off"} dangerouslySetInnerHTML={{ __html: FROST_SVG }} />
          ))}
          <span>{G.freezes} freeze{G.freezes === 1 ? "" : "s"}</span>
        </span>
        <span className="pill">
          <span className="muted">Best</span>
          <span className="num">{G.best}</span>
        </span>
      </div>

      {/* Vitals */}
      <div className="vitals">
        <div className="mood">
          <span className="label">Mood</span>
          <b>{MOOD_LABEL[v.mood]}</b>
        </div>
        {vitals.map(([nm, val, c]) => (
          <div className="vital" key={nm} style={{ "--c": `var(${c})` } as React.CSSProperties}>
            <b>{nm}</b>
            <div className={`bar${val < 0.5 ? " low" : ""}`}>
              <i style={{ width: `${Math.round(val * 100)}%` }} />
            </div>
            <span className="num hint" style={{ textAlign: "right" }}>
              {Math.round(val * 100)}%
            </span>
          </div>
        ))}
        <span className="hint">
          Fuel and hydration are measured against where you should be by this time of day.
        </span>
      </div>

      {/* Stat grid */}
      <div className="statgrid">
        {(Object.entries(STATS) as [string, { name: string; c: string; from: string }][]).map(
          ([k, s]) => {
            const xp = G.stat[k] ?? 0
            const sl = statLevel(xp)
            return (
              <div className="stat" key={k} style={{ "--c": `var(${s.c})` } as React.CSSProperties}>
                <div className="top2">
                  <span className="nm">{s.name}</span>
                  <span className="sv num">{sl.L}</span>
                </div>
                <div className="bar">
                  <i style={{ width: `${sl.pct.toFixed(1)}%` }} />
                </div>
                <span className="hint">
                  {s.from} &middot; <span className="num">{fmt(xp)}</span> XP
                </span>
              </div>
            )
          },
        )}
      </div>
    </div>
  )
}
