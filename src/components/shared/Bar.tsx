import type React from "react"

interface BarProps {
  value: number
  max: number
  color?: string
  label?: string
  size?: "sm" | "md"
}

export function Bar({ value, max, color, label, size = "md" }: BarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const over = max > 0 && value > max

  const height = size === "sm" ? "7px" : "8px"
  const style: React.CSSProperties = color
    ? { "--c": `var(${color})` } as React.CSSProperties
    : {}

  return (
    <div
      className={`bar${over ? " over" : ""}`}
      style={{ height, ...style }}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={Math.round(max)}
      aria-label={label}
    >
      <i style={{ width: `${pct}%` }} />
    </div>
  )
}
