import { useRef, useEffect } from "react"
import { useGameState } from "../../store/derived"
import { weekOf, shortDate, todayKey } from "../../game/helpers"
import { drawColossus } from "../../sprites"
import { BOSS_HP, BOSS_XP } from "../../constants"

export function BossPanel() {
  const G = useGameState()
  const today = todayKey()
  const wk = weekOf(today)
  const hp = Math.max(0, BOSS_HP - G.weekHits)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const x = cv.getContext("2d")!
    x.imageSmoothingEnabled = false
    x.clearRect(0, 0, 64, 48)
    x.drawImage(drawColossus(hp, BOSS_HP, 0), 0, 0)
  }, [hp])

  return (
    <div className="box">
      <div className="row" style={{ alignItems: "center", gap: 8 }}>
        <canvas
          ref={canvasRef}
          width={64}
          height={48}
          style={{ imageRendering: "pixelated", width: 128, height: 96 }}
        />
        <div style={{ flex: 1 }}>
          <h3>{hp <= 0 ? "Iron Colossus \u00b7 KO" : "Iron Colossus"}</h3>
          <span className="hint">Week of {shortDate(wk)}</span>
          <div className="bosshp" style={{ marginTop: 4 }}>
            {[...Array(BOSS_HP)].map((_, i) => (
              <i key={i} className={i < hp ? "" : "gone"} />
            ))}
          </div>
          <span className="hint" style={{ marginTop: 4, display: "block" }}>
            {hp <= 0
              ? `Defeated this week. +${BOSS_XP} XP earned. A new one shows up Monday.`
              : `Each cleared day lands a hit, and a perfect day lands two. ${hp} hit${hp === 1 ? "" : "s"} left for +${BOSS_XP} XP.`}
          </span>
        </div>
      </div>
    </div>
  )
}
