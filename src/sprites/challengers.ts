/* ---------- Challengers: Heavy Dumbbell Goblin + Treadmill ---------- */

import { INK, makeCanvas, outline } from "./core"

const gobCv = makeCanvas(30, 30)

export function drawGoblin(ko: boolean, frame: number): HTMLCanvasElement {
  const x = gobCv.getContext("2d")!
  x.clearRect(0, 0, 30, 30)
  const P = (a: number, b: number, w: number, h: number, c: string) => {
    x.fillStyle = c
    x.fillRect(a, b, w, h)
  }
  const g = "#5DB34A"
  const g2 = "#3F8A33"
  const sh = ko ? 0 : frame % 2

  if (ko) {
    // flattened goblin, barbell dropped
    P(4, 22, 22, 2, "#9AA3AE")
    P(2, 18, 4, 9, "#3A3F49")
    P(24, 18, 4, 9, "#3A3F49")
    P(9, 15, 12, 7, g)
    P(9, 15, 12, 1, g2)
    P(7, 14, 3, 3, g)
    P(20, 14, 3, 3, g)
    P(12, 17, 2, 1, INK)
    P(16, 17, 2, 1, INK)
    P(13, 19, 4, 1, INK)
    P(10, 21, 10, 2, "#B33A2E")
    P(8, 9, 2, 2, "#F5D06B")
    P(14, 7, 2, 2, "#F5D06B")
    P(20, 9, 2, 2, "#F5D06B")
  } else {
    const y = sh
    // barbell overhead
    P(1, 3 + y, 28, 2, "#9AA3AE")
    P(0, 0 + y, 5, 8, "#3A3F49")
    P(1, 1 + y, 3, 6, "#555C68")
    P(25, 0 + y, 5, 8, "#3A3F49")
    P(26, 1 + y, 3, 6, "#555C68")
    // arms up
    P(8, 5 + y, 3, 8, g)
    P(19, 5 + y, 3, 8, g)
    P(8, 4 + y, 3, 2, g2)
    P(19, 4 + y, 3, 2, g2)
    // head with ears
    P(10, 9, 10, 8, g)
    P(6, 10, 4, 2, g)
    P(5, 9, 2, 2, g)
    P(20, 10, 4, 2, g)
    P(23, 9, 2, 2, g)
    P(11, 11, 3, 1, INK)
    P(16, 11, 3, 1, INK)
    P(12, 12, 2, 2, "#F5D06B")
    P(16, 12, 2, 2, "#F5D06B")
    P(12, 13, 1, 1, INK)
    P(17, 13, 1, 1, INK)
    P(12, 15, 6, 1, INK)
    P(13, 15, 1, 1, "#F4F5F7")
    P(16, 15, 1, 1, "#F4F5F7")
    // body + shorts + legs
    P(10, 17, 10, 5, g)
    P(10, 17, 1, 5, g2)
    P(10, 22, 10, 3, "#B33A2E")
    P(10, 25, 3, 3, g)
    P(17, 25, 3, 3, g)
    P(9, 28, 4, 2, g2)
    P(17, 28, 4, 2, g2)
    // strain lines
    if (frame % 2) {
      P(4, 10, 2, 1, "#F4F5F7")
      P(25, 10, 2, 1, "#F4F5F7")
      P(14, 6, 2, 1, "#F4F5F7")
    }
  }
  return outline(gobCv)
}

export function drawTreadmill(
  x: CanvasRenderingContext2D,
  ox: number,
  oy: number,
): void {
  const P = (a: number, b: number, w: number, h: number, c: string) => {
    x.fillStyle = c
    x.fillRect(ox + a, oy + b, w, h)
  }
  P(0, 0, 30, 3, "#3A3F49")
  P(0, 3, 30, 1, "#262A33")
  P(25, -20, 2, 20, "#6B7380")
  P(20, -21, 8, 2, "#6B7380")
  P(18, -23, 4, 3, "#3A3F49")
}
