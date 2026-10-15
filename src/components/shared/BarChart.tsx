import { dateOf, shortDate, fmt } from "../../game/helpers"

interface BarChartProps {
  days: string[]
  values: number[]
  targets: number[]
  selectedDate: string
  goal: number
}

export function BarChart({
  days,
  values,
  targets: tg,
  selectedDate,
  goal,
}: BarChartProps) {
  const W = 640
  const H = 210
  const L = 44
  const R = 10
  const T = 12
  const B = 28
  const max = Math.max(goal * 1.25, ...values, 500)
  const top = Math.ceil(max / 500) * 500
  const y = (v: number) => T + (H - T - B) * (1 - v / top)
  const bw = (W - L - R) / 14

  let svg = ""

  for (let v = 0; v <= top; v += top / 4) {
    svg += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-width="1"/>`
    svg += `<text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${fmt(v)}</text>`
  }

  days.forEach((k, i) => {
    const v = values[i]!
    const x = L + i * bw + bw * 0.18
    const w = bw * 0.64
    svg += `<line x1="${x - 1}" x2="${x + w + 1}" y1="${y(tg[i]!)}" y2="${y(tg[i]!)}" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="3 2" opacity=".55"/>`
    if (v > 0) {
      const fill = v > tg[i]! * 1.05 ? "var(--warn)" : "var(--kcal)"
      const op = k === selectedDate ? 1 : 0.75
      svg += `<rect x="${x}" y="${y(v)}" width="${w}" height="${y(0) - y(v)}" rx="3" fill="${fill}" opacity="${op}"><title>${shortDate(k)}: ${fmt(v)} of ${fmt(tg[i]!)} kcal</title></rect>`
    }
    if (i % 2 === 1 || i === 13) {
      svg += `<text x="${x + w / 2}" y="${H - 8}" text-anchor="middle">${dateOf(k).getDate()}</text>`
    }
  })

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Calories eaten each day over the last 14 days compared with your target"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
