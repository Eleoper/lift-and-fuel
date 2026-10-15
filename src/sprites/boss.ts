/* ---------- Iron Colossus boss: 64 x 48 ---------- */

import { INK, makeCanvas, outline } from "./core"

const bossCv = makeCanvas(64, 48)

export function drawColossus(hp: number, maxHp: number, frame: number): HTMLCanvasElement {
  const x = bossCv.getContext("2d")!
  x.clearRect(0, 0, 64, 48)
  const P = (a: number, b: number, w: number, h: number, c: string) => {
    x.fillStyle = c
    x.fillRect(a, b, w, h)
  }
  const ko = hp <= 0
  const hurt = hp <= Math.ceil(maxHp / 2)
  const sh = ko ? 0 : frame % 2

  // stand
  P(50, 2, 3, 40, "#6B7380")
  P(40, 2, 12, 2, "#6B7380")
  P(46, 42, 16, 3, "#4A505B")
  P(58, 40, 4, 4, "#3A3F49")

  // punching bag
  const bx = 36
  const by = 6 + sh
  P(bx + 4, by - 4, 1, 4, "#9AA3AE")
  P(bx + 8, by - 4, 1, 4, "#9AA3AE")
  P(bx, by, 14, 30, ko ? "#8A6E66" : "#D2582E")
  P(bx, by, 2, 30, ko ? "#6E5650" : "#A9431F")
  P(bx, by, 14, 2, "#A9431F")
  P(bx, by + 28, 14, 2, "#A9431F")
  P(bx + 2, by + 8, 4, 5, "#F4F5F7")
  P(bx + 8, by + 8, 4, 5, "#F4F5F7")
  if (ko) {
    P(bx + 3, by + 9, 2, 1, INK)
    P(bx + 3, by + 11, 2, 1, INK)
    P(bx + 9, by + 9, 2, 1, INK)
    P(bx + 9, by + 11, 2, 1, INK)
  } else {
    P(bx + 3 + (hurt ? 0 : 1), by + 10, 2, 2, INK)
    P(bx + 9 + (hurt ? 0 : 1), by + 10, 2, 2, INK)
  }
  P(bx + 4, by + 16, 6, 1, INK)
  if (hurt) P(bx + 5, by + 17, 4, 1, INK)

  // robot body
  const rx = 6
  const ry = 12 - sh
  P(rx, ry, 26, 22, ko ? "#7D838C" : "#9AA3AE")
  P(rx, ry, 26, 2, "#B9C0C9")
  P(rx, ry, 2, 22, "#7D838C")
  P(rx + 4, ry + 5, 18, 10, "#4A505B")
  P(rx + 6, ry + 7, 6, 6, "#F2D7B0")
  P(rx + 14, ry + 7, 6, 6, "#F2D7B0")
  if (ko) {
    P(rx + 7, ry + 8, 4, 1, INK)
    P(rx + 7, ry + 11, 4, 1, INK)
    P(rx + 15, ry + 8, 4, 1, INK)
    P(rx + 15, ry + 11, 4, 1, INK)
  } else {
    P(rx + 8, ry + 9, 3, 3, INK)
    P(rx + 16, ry + 9, 3, 3, INK)
    P(rx + 8, ry + 9, 1, 1, "#F4F5F7")
    P(rx + 16, ry + 9, 1, 1, "#F4F5F7")
  }
  P(rx + 6, ry + 17, 14, 2, "#7D838C")

  // glove arm
  P(rx - 4, ry + 8, 5, 6, "#B8732E")
  P(rx - 6, ry + 16, 8, 9, "#C42F39")
  P(rx - 6, ry + 16, 8, 2, "#E0574F")
  P(rx - 6, ry + 23, 8, 2, "#8F1F27")
  P(rx + 26, ry + 10, 4, 10, "#B8732E")

  // legs
  P(rx + 4, ry + 22, 7, 8, "#6B7380")
  P(rx + 15, ry + 22, 7, 8, "#6B7380")
  P(rx + 2, ry + 30, 10, 3, "#8A5A2B")
  P(rx + 14, ry + 30, 10, 3, "#8A5A2B")

  // damage sparks
  if (hurt && !ko) {
    P(rx + 27, ry - 3, 1, 3, "#5DC8E0")
    P(rx + 30, ry - 1, 2, 1, "#5DC8E0")
    P(bx + 15, by + 2, 1, 3, "#5DC8E0")
  }

  // KO stars
  if (ko) {
    P(8, 2, 2, 2, "#F5D06B")
    P(18, 0, 2, 2, "#F5D06B")
    P(28, 2, 2, 2, "#F5D06B")
  }

  return outline(bossCv)
}
