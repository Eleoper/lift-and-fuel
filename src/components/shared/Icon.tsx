const ICONS: Record<string, string> = {
  sword: "\u2694\uFE0F",
  food: "\uD83C\uDF7D\uFE0F",
  dumbbell: "\uD83C\uDFCB\uFE0F",
  chart: "\uD83D\uDCCA",
  target: "\uD83C\uDFAF",
  fire: "\uD83D\uDD25",
  shield: "\uD83D\uDEE1\uFE0F",
  star: "\u2B50",
  trophy: "\uD83C\uDFC6",
  heart: "\u2764\uFE0F",
  bolt: "\u26A1",
  water: "\uD83D\uDCA7",
  moon: "\uD83C\uDF19",
  run: "\uD83C\uDFC3",
  check: "\u2713",
  prev: "\u2039",
  next: "\u203A",
}

interface IconProps {
  name: string
  size?: number
}

export function Icon({ name, size = 16 }: IconProps) {
  const ch = ICONS[name] ?? name
  return (
    <span
      aria-hidden="true"
      style={{ fontSize: `${size}px`, lineHeight: 1 }}
    >
      {ch}
    </span>
  )
}
