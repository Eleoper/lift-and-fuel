import { useStore } from "../../store/useStore"
import { useGameState } from "../../store/derived"
import { todayKey, shift, shortDate } from "../../game/helpers"

export function StreakLog() {
  const date = useStore((s) => s.date)
  const setDate = useStore((s) => s.setDate)
  const G = useGameState()
  const today = todayKey()

  const cells = []
  for (let i = 27; i >= 0; i--) {
    const k = shift(today, -i)
    const g = G.days[k]
    const st = g ? g.status : "none"
    const lab: Record<string, string> = {
      perfect: "every quest done",
      cleared: "cleared",
      frozen: "saved by a freeze",
      missed: "missed",
      open: "in progress",
      none: "no log",
    }

    cells.push(
      <button
        key={k}
        type="button"
        className={`cell ${st}${k === today ? " today" : ""}${k === date ? " sel" : ""}`}
        onClick={() => setDate(k)}
        title={`${shortDate(k)}: ${lab[st] ?? ""}${g ? ` \u00b7 ${g.done}/${g.total} quests \u00b7 +${g.xp} XP` : ""}`}
        aria-label={`${shortDate(k)}: ${lab[st] ?? ""}`}
      />,
    )
  }

  return (
    <div className="box">
      <h2>Streak</h2>
      <div className="streakstrip">{cells}</div>
    </div>
  )
}
