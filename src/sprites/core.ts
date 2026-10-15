/* ---------- Sprite core: palettes, canvas helpers, outline pass ---------- */

export const SKINS = ["#F6D5BC", "#E7B48C", "#C98D60", "#9A633F", "#6A4128"]
export const HAIRS = ["#2A1D15", "#6B4024", "#A3662E", "#D9B66B", "#141414"]
export const STYLES = ["Spiky", "Short", "Buzz", "Curly", "Bun"] as const
export type HairStyle =
  | (typeof STYLES)[number]
  | "Ponytail"
  | "Gray"
  | "BigCurly"

export interface OutfitDef {
  top: string
  trim: string
  bottom: string
  cover: string
  stripe?: string
  extras?: string[]
  pants?: string
}

export const OUTFITS: Record<string, OutfitDef> = {
  tee: { top: "#C9CED6", trim: "#A9AFB8", bottom: "#585D66", cover: "tee" },
  tank: {
    top: "#F2F3F5",
    trim: "#D5D9DF",
    bottom: "#30343C",
    cover: "tank",
    stripe: "#8E97A3",
    extras: ["wristbands"],
  },
  runner: {
    top: "#F2F3F5",
    trim: "#D5D9DF",
    bottom: "#3E7D5A",
    cover: "tank",
    stripe: "#E8F2EC",
    extras: ["wristbands"],
  },
  hoodie: { top: "#5E6874", trim: "#434A54", bottom: "#2B2F38", cover: "hoodie" },
  stringer: { top: "#1E1F26", trim: "#E8B33C", bottom: "#3A3F4B", cover: "stringer" },
  singlet: { top: "#B3262D", trim: "#F2F2F2", bottom: "#B3262D", cover: "singlet" },
  track: {
    top: "#2D3E73",
    trim: "#22305C",
    bottom: "#2D3E73",
    cover: "track",
    pants: "#2D3E73",
    stripe: "#F2F3F5",
  },
  crop: { top: "#2E9E6A", trim: "#23805A", bottom: "#2F3E66", cover: "crop", pants: "#2F3E66" },
  aerobic: { top: "#8E44D9", trim: "#C04BD8", bottom: "#E94BA8", cover: "crop", pants: "#E94BA8" },
}

export const INK = "#1B1E26"

export const SPR_W = 40
export const SPR_H = 48

export function shadeOf(hex: string, amt: number): string {
  const v = parseInt(hex.slice(1), 16)
  let r = v >> 16
  let g = (v >> 8) & 255
  let b = v & 255
  r = Math.max(0, Math.round(r * (1 - amt)))
  g = Math.max(0, Math.round(g * (1 - amt)))
  b = Math.max(0, Math.round(b * (1 - amt)))
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)
}

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  return c
}

export function outline(cv: HTMLCanvasElement): HTMLCanvasElement {
  const x = cv.getContext("2d")!
  const W = cv.width
  const H = cv.height
  const img = x.getImageData(0, 0, W, H)
  const d = img.data
  const op = (i: number) => d[i * 4 + 3]! > 0
  const out: number[] = []
  for (let yy = 0; yy < H; yy++) {
    for (let xx = 0; xx < W; xx++) {
      const i = yy * W + xx
      if (op(i)) continue
      if (
        (xx > 0 && op(i - 1)) ||
        (xx < W - 1 && op(i + 1)) ||
        (yy > 0 && op(i - W)) ||
        (yy < H - 1 && op(i + W))
      )
        out.push(i)
    }
  }
  for (const i of out) {
    d[i * 4] = 0x15
    d[i * 4 + 1] = 0x17
    d[i * 4 + 2] = 0x1d
    d[i * 4 + 3] = 255
  }
  x.putImageData(img, 0, 0)
  return cv
}

const sprCanvases: Record<string, HTMLCanvasElement> = {}

export function sprCanvas(slot: string): HTMLCanvasElement {
  return (sprCanvases[slot] ??= makeCanvas(SPR_W, SPR_H))
}
