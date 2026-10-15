import { dateOf, shortDate, fmt } from "../../game/helpers"

interface Point {
  k: string
  v: number
}

interface LineChartProps {
  pts: Point[]
  avg?: Point[] | null
  label: string
  dec?: number
}

export function LineChart({ pts, avg, label, dec = 1 }: LineChartProps) {
  if (pts.length < 2) return null

  const all = [...pts.map((p) => p.v), ...(avg || []).map((p) => p.v)]
  const lo = Math.min(...all)
  const hi = Math.max(...all)
  const pd = Math.max(dec ? 0.5 : 1, (hi - lo) * 0.15)
  const a = Math.floor(lo - pd)
  const b = Math.ceil(hi + pd)
  const WW = 320
  const HH = 170
  const l = 40
  const r = 10
  const t = 10
  const bt = 24

  const t0 = dateOf(pts[0]!.k).getTime()
  const t1 = dateOf(pts[pts.length - 1]!.k).getTime()
  const X = (k: string) =>
    l + (WW - l - r) * ((dateOf(k).getTime() - t0) / ((t1 - t0) || 1))
  const Y = (v: number) => t + (HH - t - bt) * (1 - (v - a) / (b - a))

  const gridLines = [a, (a + b) / 2, b]

  if (avg && avg.length > 1) {
    const rawDots = pts
      .map(
        (p) =>
          `<circle cx="${X(p.k).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="2.2" fill="var(--muted)" opacity=".55"/>`,
      )
      .join("")
    const line = avg
      .map((p) => `${X(p.k).toFixed(1)},${Y(p.v).toFixed(1)}`)
      .join(" ")
    const lp = avg[avg.length - 1]!

    return (
      <svg
        viewBox={`0 0 ${WW} ${HH}`}
        role="img"
        aria-label={label}
        dangerouslySetInnerHTML={{
          __html:
            gridLines
              .map(
                (v) =>
                  `<line x1="${l}" x2="${WW - r}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/>` +
                  `<text x="${l - 6}" y="${Y(v) + 4}" text-anchor="end">${fmt(v, 1)}</text>`,
              )
              .join("") +
            rawDots +
            `<polyline points="${line}" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linejoin="round"/>` +
            `<circle cx="${X(lp.k)}" cy="${Y(lp.v)}" r="4" fill="var(--accent)"/>` +
            `<text x="${l}" y="${HH - 6}">${shortDate(pts[0]!.k)}</text>` +
            `<text x="${WW - r}" y="${HH - 6}" text-anchor="end">${shortDate(pts[pts.length - 1]!.k)}</text>`,
        }}
      />
    )
  }

  const line = pts
    .map((p) => `${X(p.k).toFixed(1)},${Y(p.v).toFixed(1)}`)
    .join(" ")
  const lp = pts[pts.length - 1]!

  return (
    <svg
      viewBox={`0 0 ${WW} ${HH}`}
      role="img"
      aria-label={label}
      dangerouslySetInnerHTML={{
        __html:
          gridLines
            .map(
              (v) =>
                `<line x1="${l}" x2="${WW - r}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/>` +
                `<text x="${l - 6}" y="${Y(v) + 4}" text-anchor="end">${fmt(v, 1)}</text>`,
            )
            .join("") +
          `<polygon points="${X(pts[0]!.k)},${Y(a)} ${line} ${X(pts[pts.length - 1]!.k)},${Y(a)}" fill="var(--accent)" opacity=".12"/>` +
          `<polyline points="${line}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>` +
          `<circle cx="${X(lp.k)}" cy="${Y(lp.v)}" r="4" fill="var(--accent)"/>` +
          `<text x="${l}" y="${HH - 6}">${shortDate(pts[0]!.k)}</text>` +
          `<text x="${WW - r}" y="${HH - 6}" text-anchor="end">${shortDate(pts[pts.length - 1]!.k)}</text>`,
      }}
    />
  )
}
