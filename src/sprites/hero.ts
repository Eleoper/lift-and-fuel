/* ---------- Hero sprite: drawSprite() ---------- */

import {
  SKINS,
  HAIRS,
  STYLES,
  OUTFITS,
  INK,
  SPR_W,
  SPR_H,
  shadeOf,
  outline,
  sprCanvas,
  type OutfitDef,
  type HairStyle,
} from "./core"

export interface SpriteOpts {
  m: number
  f: number
  pose: string
  frame: number
  blink?: boolean
  expr?: string
  skin?: number
  skinColor?: string
  hair?: number
  hairColor?: string
  style?: string | number
  outfit?: string
  outfitDef?: OutfitDef
  head?: string
  gear?: string
  extras?: string[]
  brows?: boolean
  shoe?: string
  sweat?: boolean
  silhouette?: boolean
  jowls?: boolean
  bandColor?: string
}

export function drawSprite(o: SpriteOpts, slot = "hero"): HTMLCanvasElement {
  const cv = sprCanvas(slot)
  const x = cv.getContext("2d")!
  x.clearRect(0, 0, SPR_W, SPR_H)

  const P = (a: number, b: number, w: number, h: number, c: string) => {
    if (w <= 0 || h <= 0) return
    x.fillStyle = c
    x.fillRect(a, b, w, h)
  }

  const cx = 20
  const skin = o.skinColor ?? SKINS[o.skin ?? 0] ?? SKINS[1]!
  const sk2 = shadeOf(skin, 0.16)
  const hair = o.hairColor ?? HAIRS[o.hair ?? 0] ?? HAIRS[1]!
  const O: OutfitDef = o.outfitDef ?? OUTFITS[o.outfit ?? ""] ?? OUTFITS["tee"]!
  const top = O.top
  const top2 = shadeOf(O.top, 0.22)
  const stripe = O.stripe ?? ""
  const pants = O.pants ?? ""
  const extras = [...(O.extras || []), ...(o.extras || [])]
  const m = o.m
  const f = o.f
  const fr = o.frame % 2
  const pose = o.pose

  const Y = pose === "cheer" && fr ? -2 : 0
  const breathe = (pose === "idle" || pose === "sleepy" || pose === "sad") && fr ? 1 : 0
  const slump = pose === "sleepy" || pose === "sad" ? 1 : 0
  const U = Y - breathe

  const sw = 14 + m * 2
  const ww = Math.min(sw + 3, 10 + f * 2)
  const at = 3 + Math.floor(m / 2)
  const lw = 4 + Math.floor(m / 3)
  const edgeL = cx - Math.floor(sw / 2)
  const edgeR = edgeL + sw
  const lax = edgeL - at
  const rax = edgeR
  const sy = 19 + U
  const hx = cx - 5
  const hy = 6 + U + slump

  const sleeveFull = O.cover === "hoodie" || O.cover === "track"
  const sleeve = O.cover === "tee" ? 4 : 0
  const armCol = (row: number) => (sleeveFull || row < sleeve ? top : skin)

  const vArm = (ax: number, ay: number, h: number, shadeCol = true) => {
    for (let r = 0; r < h; r++) P(ax, ay + r, at, 1, armCol(r))
    if (shadeCol && !sleeveFull) P(ax, ay + sleeve, 1, Math.max(0, h - sleeve), sk2)
    if (O.cover === "track") P(ax + (ax < cx ? 0 : at - 1), ay, 1, h, stripe)
  }

  const hand = (ax: number, ay: number, w = at, h = 2) => {
    P(ax, ay, w, h, skin)
    if (o.gear === "wraps") P(ax, ay - 1, w, 1, "#D9483B")
    else if (extras.includes("wristbands")) P(ax, ay - 1, w, 1, "#2BB5B0")
  }

  const shoe = o.shoe || "#F1F2F4"

  // hoodie collar
  if (O.cover === "hoodie") P(cx - 6, hy + 8, 12, 5, O.trim)

  // ponytail behind
  const st: HairStyle =
    typeof o.style === "string"
      ? (o.style as HairStyle)
      : ((STYLES[o.style ?? 0] ?? "Spiky") as HairStyle)
  if (st === "Ponytail") {
    P(hx + 9, hy + 1, 3, 3, hair)
    P(hx + 11, hy + 3, 3, 7, hair)
    P(hx + 12, hy + 10, 2, 2, hair)
  }
  if (st === "BigCurly") {
    P(hx - 3, hy - 2, 16, 13, hair)
    P(hx - 4, hy + 2, 2, 8, hair)
    P(hx + 12, hy + 2, 2, 8, hair)
  }

  // legs + shoes
  const legL = cx - 1 - lw
  const legR = cx + 1
  const legCol = pants || skin
  const legSh = pants ? shadeOf(pants, 0.2) : sk2
  P(legL, 35 + Y, lw, 8, legCol)
  P(legR, 35 + Y, lw, 8, legCol)
  P(legL, 35 + Y, 1, 8, legSh)
  P(legR, 35 + Y, 1, 8, legSh)
  if (O.cover === "track") {
    P(legL, 35 + Y, 1, 8, stripe)
    P(legR + lw - 1, 35 + Y, 1, 8, stripe)
  }
  if (extras.includes("warmers")) {
    P(legL - 1, 40 + Y, lw + 1, 3, "#F2D33C")
    P(legR, 40 + Y, lw + 1, 3, "#F2D33C")
  } else if (!pants) {
    P(legL, 41 + Y, lw, 2, "#F1F2F4")
    P(legR, 41 + Y, lw, 2, "#F1F2F4")
  }
  P(legL - 1, 43 + Y, lw + 1, 2, shoe)
  P(legR, 43 + Y, lw + 1, 2, shoe)
  P(legL - 1, 45 + Y, lw + 1, 1, "#8E97A3")
  P(legR, 45 + Y, lw + 1, 1, "#8E97A3")

  // shorts
  const shw = Math.max(ww, 2 * lw + 3)
  const shx = cx - Math.floor(shw / 2)
  P(shx, 30 + Y, shw, 6, O.bottom)
  P(cx, 34 + Y, 1, 2, shadeOf(O.bottom, 0.35))
  if (stripe && !pants) {
    P(shx, 30 + Y, 1, 6, stripe)
    P(shx + shw - 1, 30 + Y, 1, 6, stripe)
  }

  // torso
  const t0 = 19 + U
  const rows = 30 + Y - t0
  for (let r = 0; r < rows; r++) {
    const k = rows > 1 ? r / (rows - 1) : 0
    let w = Math.round(sw + (ww - sw) * k)
    if (k >= 0.5 && k <= 0.92) w += Math.max(0, f - 1)
    const xl = cx - Math.floor(w / 2)
    const yy = t0 + r
    P(xl, yy, w, 1, skin)
    P(xl, yy, 1, 1, sk2)
    const cov = O.cover
    if (cov === "tee" || cov === "hoodie" || cov === "track") {
      P(xl, yy, w, 1, top)
      P(xl, yy, 1, 1, top2)
      if (r === 0) P(cx - 1, yy, 2, 1, cov === "track" ? O.trim : skin)
      if (cov === "track") P(cx, yy, 1, 1, O.trim)
    } else if (cov === "tank" || cov === "singlet") {
      if (r <= 2) {
        P(xl + 2, yy, w - 4, 1, top)
        if (r <= 1) P(cx - 2, yy, 4, 1, skin)
      } else {
        P(xl, yy, w, 1, top)
        P(xl, yy, 1, 1, top2)
      }
      if (cov === "singlet" && r === 5) P(xl, yy, w, 1, O.trim)
    } else if (cov === "stringer") {
      if (r <= 5) {
        P(cx - 4, yy, 1, 1, top)
        P(cx + 3, yy, 1, 1, top)
      } else {
        P(xl + 1, yy, w - 2, 1, top)
      }
      if (r === rows - 1) P(xl + 1, yy, w - 2, 1, O.trim)
    } else if (cov === "crop") {
      if (r <= 1) {
        P(cx - 4, yy, 1, 1, top)
        P(cx + 3, yy, 1, 1, top)
      } else if (r <= 6) {
        P(xl + 1, yy, w - 2, 1, top)
        if (r === 6) P(xl + 1, yy, w - 2, 1, O.trim)
      }
    }
  }

  // muscle definition
  if (m >= 2 && (O.cover === "tank" || O.cover === "stringer")) {
    P(cx - 4, t0 + 4, 3, 1, shadeOf(O.cover === "tank" ? top : skin, 0.12))
    P(cx + 1, t0 + 4, 3, 1, shadeOf(O.cover === "tank" ? top : skin, 0.12))
  }
  if (O.cover === "hoodie") {
    P(cx - 2, t0, 1, 3, "#E6E8EC")
    P(cx + 1, t0, 1, 3, "#E6E8EC")
  }
  if (O.cover === "tee") P(cx - Math.floor(ww / 2), 29 + Y, ww, 1, O.trim)
  if (extras.includes("towel")) {
    P(cx - 5, t0, 2, 7, "#F4F5F7")
    P(cx + 3, t0, 2, 7, "#F4F5F7")
    P(cx - 5, t0, 10, 1, "#F4F5F7")
    P(cx - 5, t0 + 6, 2, 1, "#D5D9DF")
    P(cx + 3, t0 + 6, 2, 1, "#D5D9DF")
  }
  if (extras.includes("whistle")) {
    P(cx - 3, t0, 1, 4, "#D9483B")
    P(cx + 2, t0, 1, 4, "#D9483B")
    P(cx - 3, t0 + 4, 6, 1, "#D9483B")
    P(cx - 1, t0 + 5, 2, 2, "#E8B33C")
  }
  if (o.gear === "belt") {
    const bw = Math.max(ww, 10) + 1
    P(cx - Math.floor(bw / 2), 28 + Y, bw, 2, "#5B3A22")
    P(cx - 1, 28 + Y, 2, 2, "#E8B33C")
  }

  // arms
  const peak = 1 + Math.floor(m / 2)
  const idleL = () => {
    vArm(lax, sy, 11)
    hand(lax, sy + 11)
  }
  const idleR = () => {
    vArm(rax, sy, 11)
    hand(rax, sy + 11)
  }

  if (pose === "cheer") {
    vArm(lax - 1, sy - 5, 6, false)
    vArm(lax - 2, sy - 10, 5, false)
    hand(lax - 2, sy - 12)
    vArm(rax + 1, sy - 5, 6, false)
    vArm(rax + 2, sy - 10, 5, false)
    hand(rax + 2, sy - 12)
  } else if (pose === "flex") {
    for (const side of [-1, 1]) {
      const ux = side < 0 ? lax - 4 : rax
      const fx = side < 0 ? lax - 4 : rax + 4 - at + 1
      P(ux, sy, at + 4, at, sleeveFull ? top : skin)
      if (sleeve) P(side < 0 ? lax - 1 : rax, sy, Math.min(at + 1, 4), at, top)
      P(fx, sy - 6, at, 6, sleeveFull ? top : skin)
      hand(fx, sy - 8)
      if (!sleeveFull) P(side < 0 ? lax - 3 : rax + 1, sy - peak, 3, peak, skin)
    }
  } else if (pose === "lift") {
    const barY = fr ? hy + 9 : hy - 5
    const ah = sy - barY - 1
    vArm(lax + (fr ? 0 : -1), barY + 1, ah, false)
    vArm(rax + (fr ? 0 : 1), barY + 1, ah, false)
    const bx = lax - 7
    const bw = rax + at + 7 - bx
    P(bx, barY, bw, 1, "#9AA3AE")
    P(bx, barY - 3, 2, 7, "#3A3F49")
    P(bx + 2, barY - 2, 1, 5, "#555C68")
    P(bx + bw - 2, barY - 3, 2, 7, "#3A3F49")
    P(bx + bw - 3, barY - 2, 1, 5, "#555C68")
  } else if (pose === "eat" || pose === "drink") {
    idleL()
    vArm(rax, sy, 5)
    vArm(rax - 1, sy - 4, 5, false)
    hand(cx + 3, hy + 8, 3, 2)
    if (pose === "eat") {
      P(cx + 3, hy + 4, 4, 4, "#B8732E")
      P(cx + 4, hy + 4, 2, 1, "#D99A55")
      P(cx + 7, hy + 7, 2, 2, "#F2F2F2")
    } else {
      P(cx + 3, hy + 2, 3, 7, "#8FD3F4")
      P(cx + 3, hy + 2, 1, 7, "#5DB4E0")
      P(cx + 3, hy + 1, 3, 1, "#F2F3F5")
    }
  } else if (pose === "highfive" || pose === "wave" || pose === "point") {
    idleL()
    const wx = pose === "wave" && fr ? 1 : 0
    vArm(rax + 1 + wx, sy - 8, 9, false)
    P(rax + wx, sy - 12, at + 2, 4, skin)
    P(rax + wx, sy - 13, 1, 1, skin)
    P(rax + 2 + wx, sy - 13, 1, 1, skin)
    P(rax + 4 + wx, sy - 13, 1, 1, skin)
  } else {
    idleL()
    idleR()
  }

  // held extras (idle-ish arms)
  if (
    extras.includes("clipboard") &&
    !["cheer", "flex", "lift", "highfive", "wave", "point"].includes(pose)
  ) {
    P(rax - 1, sy + 5, 6, 8, "#8A5A2B")
    P(rax, sy + 6, 4, 6, "#F4F5F7")
    P(rax, sy + 7, 3, 1, "#9AA3AE")
    P(rax, sy + 9, 3, 1, "#9AA3AE")
    P(rax + 1, sy + 4, 2, 2, "#9AA3AE")
  }
  if (
    (extras.includes("bottle") || o.gear === "shaker") &&
    !["cheer", "flex", "lift", "eat", "drink", "highfive", "wave", "point"].includes(pose)
  ) {
    P(rax + at, sy + 7, 3, 6, "#8FD3F4")
    P(rax + at, sy + 7, 3, 1, "#F2F3F5")
    P(rax + at, sy + 8, 1, 5, "#5DB4E0")
  }

  // head
  P(hx, hy, 10, 10, skin)
  P(hx + 9, hy + 1, 1, 9, sk2)
  P(hx - 1, hy + 4, 1, 2, skin)
  P(hx + 10, hy + 4, 1, 2, sk2)
  P(cx - 2, hy + 10, 4, 2, skin)
  P(cx - 2, hy + 10, 1, 2, sk2)
  if (o.jowls) {
    P(hx, hy + 7, 1, 3, sk2)
    P(hx + 9, hy + 7, 1, 3, sk2)
  }

  // hair
  if (st === "Spiky") {
    P(hx, hy - 1, 10, 3, hair)
    P(hx - 1, hy, 1, 4, hair)
    P(hx + 10, hy, 1, 3, hair)
    P(hx + 1, hy - 3, 2, 2, hair)
    P(hx + 4, hy - 4, 2, 3, hair)
    P(hx + 7, hy - 3, 2, 2, hair)
    P(hx + 9, hy - 2, 2, 2, hair)
    P(hx, hy + 2, 2, 1, hair)
    P(hx + 3, hy + 2, 2, 1, hair)
  } else if (st === "Short") {
    P(hx, hy - 1, 10, 3, hair)
    P(hx - 1, hy, 1, 4, hair)
    P(hx + 10, hy, 1, 4, hair)
    P(hx, hy + 2, 3, 1, hair)
  } else if (st === "Buzz") {
    P(hx + 1, hy - 1, 8, 1, hair)
    P(hx, hy, 10, 1, hair)
    P(hx - 1, hy + 1, 1, 2, hair)
    P(hx + 10, hy + 1, 1, 2, hair)
  } else if (st === "Curly") {
    for (let i = 0; i < 6; i++) P(hx - 1 + i * 2, hy - 2 + (i % 2), 3, 3, hair)
    P(hx - 1, hy, 12, 2, hair)
    P(hx - 1, hy + 2, 1, 3, hair)
    P(hx + 10, hy + 2, 1, 3, hair)
  } else if (st === "Bun") {
    P(hx, hy - 1, 10, 2, hair)
    P(hx + 3, hy - 4, 4, 3, hair)
    P(hx - 1, hy, 1, 3, hair)
    P(hx + 10, hy, 1, 3, hair)
  } else if (st === "Ponytail") {
    P(hx, hy - 1, 10, 3, hair)
    P(hx - 1, hy, 1, 5, hair)
    P(hx + 10, hy, 1, 3, hair)
    P(hx + 1, hy + 2, 4, 1, hair)
  } else if (st === "Gray") {
    P(hx + 1, hy - 1, 8, 2, hair)
    P(hx - 1, hy + 1, 2, 5, hair)
    P(hx + 9, hy + 1, 2, 5, hair)
    P(hx, hy, 2, 2, hair)
    P(hx + 8, hy, 2, 2, hair)
  } else if (st === "BigCurly") {
    P(hx, hy - 1, 10, 3, hair)
    P(hx - 1, hy, 2, 7, hair)
    P(hx + 9, hy, 2, 7, hair)
  }

  // head items
  if (o.head === "band" || extras.includes("band")) {
    const bc = o.bandColor || "#F4F5F7"
    P(hx - 1, hy + 2, 12, 1, bc)
    P(hx - 4, hy + 3, 3, 1, bc)
    P(hx - 3, hy + 4, 2, 1, bc)
  }
  if (o.head === "cap") {
    P(hx - 1, hy - 2, 12, 4, "#2350C8")
    P(hx - 1, hy + 1, 12, 1, "#1A3A94")
    P(hx - 4, hy + 1, 3, 1, "#1A3A94")
  }
  if (o.head === "phones" || extras.includes("headset")) {
    P(hx, hy - 2, 10, 1, "#24262D")
    P(hx - 2, hy + 3, 2, 4, "#C04BD8")
    P(hx + 10, hy + 3, 2, 4, "#C04BD8")
    if (extras.includes("headset")) {
      P(hx - 1, hy + 7, 1, 1, "#24262D")
      P(hx, hy + 8, 3, 1, "#24262D")
    }
  }
  if (o.head === "crown") {
    P(hx + 1, hy - 4, 8, 2, "#E8B33C")
    P(hx + 1, hy - 6, 1, 2, "#E8B33C")
    P(hx + 4, hy - 6, 2, 2, "#E8B33C")
    P(hx + 8, hy - 6, 1, 2, "#E8B33C")
    P(hx + 4, hy - 4, 2, 1, "#D9483B")
  }

  // face
  const e = o.expr
  const ey = hy + 4
  const eye = o.silhouette ? "#F0464E" : INK
  if (o.brows) {
    P(hx + 1, ey - 2, 3, 1, hair === "#C4C8CF" ? "#8E949C" : shadeOf(hair, 0.3))
    P(hx + 6, ey - 2, 3, 1, hair === "#C4C8CF" ? "#8E949C" : shadeOf(hair, 0.3))
    if (e === "stern") {
      P(hx + 3, ey - 1, 1, 1, INK)
      P(hx + 6, ey - 1, 1, 1, INK)
    }
  }
  if (o.blink && !["sleepy", "happy"].includes(e || "")) {
    P(hx + 2, ey + 1, 2, 1, eye)
    P(hx + 6, ey + 1, 2, 1, eye)
  } else if (e === "sleepy") {
    P(hx + 2, ey + 1, 2, 1, eye)
    P(hx + 6, ey + 1, 2, 1, eye)
  } else if (e === "happy") {
    P(hx + 2, ey + 1, 1, 1, eye)
    P(hx + 3, ey, 1, 1, eye)
    P(hx + 4, ey + 1, 1, 1, eye)
    P(hx + 5, ey + 1, 1, 1, eye)
    P(hx + 6, ey, 1, 1, eye)
    P(hx + 7, ey + 1, 1, 1, eye)
  } else if (e === "excited") {
    P(hx + 2, ey, 2, 2, eye)
    P(hx + 6, ey, 2, 2, eye)
    P(hx + 2, ey, 1, 1, "#FFFFFF")
    P(hx + 6, ey, 1, 1, "#FFFFFF")
  } else if (e === "angry") {
    P(hx + 2, ey, 2, 2, eye)
    P(hx + 6, ey, 2, 2, eye)
    P(hx + 1, ey - 1, 3, 1, eye)
    P(hx + 6, ey - 1, 3, 1, eye)
  } else {
    P(hx + 2, ey, 1, 2, eye)
    P(hx + 7, ey, 1, 2, eye)
  }

  const my = hy + 7
  if (e === "happy" || e === "smile") {
    P(hx + 3, my, 1, 1, INK)
    P(hx + 4, my + 1, 2, 1, INK)
    P(hx + 6, my, 1, 1, INK)
  } else if (e === "excited") {
    P(hx + 3, my, 4, 2, "#6B2B2B")
    P(hx + 3, my, 4, 1, "#FFFFFF")
  } else if (e === "chew") {
    if (fr) P(hx + 4, my, 2, 2, "#6B2B2B")
    else P(hx + 4, my + 1, 2, 1, INK)
  } else if (e === "frown" || e === "angry") {
    P(hx + 3, my + 1, 1, 1, INK)
    P(hx + 4, my, 2, 1, INK)
    P(hx + 6, my + 1, 1, 1, INK)
  } else if (e === "strain") {
    P(hx + 3, my, 4, 1, INK)
    P(hx + 3, my + 1, 4, 1, "#FFFFFF")
  } else if (e === "stern") {
    P(hx + 3, my + 1, 4, 1, INK)
  } else {
    P(hx + 4, my + 1, 2, 1, INK)
  }

  // blush
  if (e === "happy" || e === "excited") {
    P(hx + 1, my, 1, 1, "#E78C8C")
    P(hx + 8, my, 1, 1, "#E78C8C")
  }

  // sweat
  if (o.sweat) {
    P(hx + 10, hy - 1, 1, 1, "#9ED6F2")
    P(hx + 10, hy, 1, 2, "#5DB4E0")
  }

  // sleepy Zs
  if (pose === "sleepy") {
    const zx = hx + 11
    const zy = hy - 4 - (fr ? 1 : 0)
    P(zx, zy, 3, 1, "#9AA3AE")
    P(zx + 1, zy + 1, 1, 1, "#9AA3AE")
    P(zx, zy + 2, 3, 1, "#9AA3AE")
    P(zx + 4, zy - 3, 2, 1, "#9AA3AE")
    P(zx + 4, zy - 2, 1, 1, "#9AA3AE")
    P(zx + 4, zy - 1, 2, 1, "#9AA3AE")
  }

  // treadmill shadow post-process
  if (o.silhouette) {
    const img = x.getImageData(0, 0, SPR_W, SPR_H)
    const d = img.data
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue
      const red = d[i]! === 0xf0 && d[i + 1]! === 0x46
      if (!red) {
        const l = (d[i]! + d[i + 1]! + d[i + 2]!) / 3
        const v = 34 + l * 0.12
        d[i] = v
        d[i + 1] = v + 4
        d[i + 2] = v + 14
      }
    }
    x.putImageData(img, 0, 0)
  }

  return outline(cv)
}
