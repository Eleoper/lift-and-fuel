import type React from "react"
import { useStore } from "../../store/useStore"
import { dateOf, shift, todayKey, shortDate } from "../../game/helpers"
import { DOW } from "../../constants"

function formatDateLabel(dateKey: string, today: string): string {
  if (dateKey === today) return "Today"
  if (dateKey === shift(today, -1)) return "Yesterday"
  const d = dateOf(dateKey)
  const dow = DOW[d.getDay()] ?? "?"
  return `${dow}, ${shortDate(dateKey)}`
}

export function DateNav() {
  const date = useStore((s) => s.date)
  const setDate = useStore((s) => s.setDate)

  const today = todayKey()
  const label = formatDateLabel(date, today)

  function goTo(k: string) {
    if (k > today) return
    setDate(k)
  }

  function handleDateInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    if (v) goTo(v)
  }

  return (
    <nav className="datenav" aria-label="Choose day">
      <button
        className="iconbtn"
        aria-label="Previous day"
        onClick={() => goTo(shift(date, -1))}
      >
        &#8249;
      </button>
      <span className="when">{label}</span>
      <button
        className="iconbtn"
        aria-label="Next day"
        disabled={date >= today}
        onClick={() => goTo(shift(date, 1))}
      >
        &#8250;
      </button>
      <input
        type="date"
        aria-label="Pick a date"
        value={date}
        max={today}
        onChange={handleDateInput}
      />
      {date !== today && (
        <button className="btn" onClick={() => setDate(today)}>
          Today
        </button>
      )}
    </nav>
  )
}
