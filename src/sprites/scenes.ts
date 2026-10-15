/* ---------- Scene backgrounds: 96 x 64 logical pixels ---------- */

export const SCN_W = 96
export const SCN_H = 64

export function drawScene(x: CanvasRenderingContext2D, id: string): void {
  const P = (a: number, b: number, w: number, h: number, c: string) => {
    x.fillStyle = c
    x.fillRect(a, b, w, h)
  }

  if (id === "gym") {
    P(0, 0, 96, 46, "#CFD6DF")
    for (let i = 0; i < 4; i++) {
      P(6 + i * 22, 6, 18, 32, "#9EC0D8")
      P(7 + i * 22, 7, 2, 30, "#C4DBEA")
      P(6 + i * 22, 38, 18, 1, "#7F8C99")
    }
    P(0, 46, 96, 18, "#23262C")
    for (let i = 0; i < 40; i++) P((i * 37) % 96, 47 + ((i * 11) % 16), 1, 1, "#33373F")
    P(2, 40, 20, 2, "#5A606B")
    const plates: [string, number][] = [
      ["#C42F39", 3],
      ["#2350C8", 8],
      ["#B98000", 13],
      ["#1D7F51", 18],
    ]
    plates.forEach(([c, xx]) => P(xx, 37, 3, 3, c))
  } else if (id === "roof") {
    const bands = [
      "#2B2452",
      "#40306A",
      "#5E3A78",
      "#8A4479",
      "#B5506E",
      "#D86A5C",
      "#EE8C52",
      "#F5AE58",
    ]
    bands.forEach((c, i) => P(0, i * 5, 96, 5, c))
    P(0, 40, 96, 6, "#F5AE58")
    P(36, 32, 24, 8, "#FFD27A")
    P(40, 29, 16, 3, "#FFD27A")
    P(44, 27, 8, 2, "#FFD27A")
    const buildings: [number, number, number][] = [
      [0, 22, 10],
      [10, 28, 8],
      [18, 18, 9],
      [27, 30, 7],
      [60, 24, 9],
      [69, 16, 8],
      [77, 26, 10],
      [87, 20, 9],
    ]
    buildings.forEach(([bx, by, bw]) => {
      P(bx, by + 10, bw, 36 - by, "#1E1A35")
      for (let wy = by + 13; wy < 44; wy += 4)
        for (let wx = bx + 1; wx < bx + bw - 1; wx += 3)
          if ((wx * 7 + wy * 3) % 5 < 2) P(wx, wy, 1, 1, "#F5C25C")
    })
    P(0, 46, 96, 18, "#3A3946")
    P(0, 46, 96, 1, "#56556A")
    for (let i = 0; i < 96; i += 8) P(i, 48, 1, 6, "#6A6980")
    P(0, 48, 96, 1, "#6A6980")
  } else if (id === "beach") {
    P(0, 0, 96, 36, "#86CDF2")
    P(0, 24, 96, 12, "#A9DCF5")
    P(70, 6, 10, 10, "#FFD45C")
    P(72, 4, 6, 14, "#FFD45C")
    P(68, 8, 14, 6, "#FFD45C")
    P(10, 8, 10, 2, "#FFFFFF")
    P(13, 6, 6, 2, "#FFFFFF")
    P(40, 12, 12, 2, "#FFFFFF")
    P(0, 36, 96, 10, "#2E86C1")
    for (let i = 0; i < 96; i += 12)
      P(i + (i % 24 ? 3 : 0), 38 + (i % 3), 5, 1, "#BFE6F7")
    P(0, 46, 96, 18, "#E9CF8E")
    for (let i = 0; i < 30; i++) P((i * 29) % 96, 48 + ((i * 7) % 15), 1, 1, "#D6B972")
  } else if (id === "stage") {
    P(0, 0, 96, 46, "#3B0E16")
    for (let i = 0; i < 96; i += 6) {
      P(i, 0, 3, 46, "#5A1420")
      P(i + 3, 0, 1, 46, "#741C2A")
    }
    P(0, 0, 96, 5, "#741C2A")
    for (let i = 0; i < 96; i += 8) P(i, 5, 8, 2, "#5A1420")
    x.fillStyle = "rgba(255,236,170,0.18)"
    x.beginPath()
    x.moveTo(42, 0)
    x.lineTo(54, 0)
    x.lineTo(70, 60)
    x.lineTo(26, 60)
    x.closePath()
    x.fill()
    P(0, 46, 96, 18, "#7A4A2A")
    for (let i = 0; i < 96; i += 12) P(i, 46, 1, 18, "#5F391F")
    P(0, 46, 96, 1, "#A3693E")
  } else {
    // quest grid room
    P(0, 0, 96, 46, "#1F2233")
    for (let i = 0; i < 96; i += 8) P(i, 0, 1, 46, "#2B2F45")
    for (let j = 0; j < 46; j += 8) P(0, j, 96, 1, "#2B2F45")
    P(44, 3, 8, 2, "#3B4060")
    P(46, 5, 4, 1, "#F5D06B")
    P(0, 46, 96, 18, "#3A3F55")
    for (let i = 0; i < 96; i += 16) P(i, 46, 1, 18, "#33384C")
    P(0, 46, 96, 1, "#565C7A")
    P(4, 52, 9, 9, "#3A3F49")
    P(7, 55, 3, 3, "#3A3F55")
    P(84, 54, 8, 3, "#9AA3AE")
    P(82, 52, 3, 7, "#3A3F49")
    P(91, 52, 3, 7, "#3A3F49")
  }
}

export function groundShadow(x: CanvasRenderingContext2D, cx: number): void {
  x.fillStyle = "rgba(0,0,0,0.28)"
  x.fillRect(cx - 12, 60, 24, 2)
  x.fillRect(cx - 10, 62, 20, 1)
}
