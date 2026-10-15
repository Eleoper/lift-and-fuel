import { useEffect, useRef, useCallback } from "react"
import { useStore } from "../../store/useStore"
import { useGameState, useVitals } from "../../store/derived"
import { heroState, challenger } from "../../character/useCharacter"
import type { ActiveLine } from "../../character/useCharacter"
import { latestBf } from "../../game/records"
import {
  drawSprite,
  drawAlly,
  drawGoblin,
  drawTreadmill,
  drawScene,
  groundShadow,
  SCN_W,
  SCN_H,
} from "../../sprites"

const RM =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

interface HeroStageProps {
  active: ActiveLine | null
}

export function HeroStage({ active }: HeroStageProps) {
  const profile = useStore((s) => s.profile)
  const days = useStore((s) => s.days)
  const G = useGameState()
  const v = useVitals()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const xpRef = useRef<HTMLSpanElement>(null)
  const tickRef = useRef(0)
  const blinkRef = useRef({ next: 0, until: 0 })
  const particlesRef = useRef<
    { x: number; y: number; vx: number; vy: number; c: string; life: number }[]
  >([])
  const lastStepRef = useRef(0)
  const rafRef = useRef(0)

  /* keep active in a ref so the animation loop always reads the latest
     without needing active in the useEffect dependency array */
  const activeRef = useRef(active)
  activeRef.current = active

  const day = v.d
  const bf = latestBf(days, profile)
  const foe = challenger(day, profile)

  const burst = useCallback(() => {
    if (RM) return
    const cols = ["#C42F39", "#2350C8", "#E8B33C", "#1D7F51", "#FFFFFF", "#FFD866"]
    for (let i = 0; i < 36; i++) {
      particlesRef.current.push({
        x: 42 + Math.random() * 8,
        y: 16 + Math.random() * 6,
        vx: (Math.random() - 0.5) * 1.8,
        vy: -1.2 - Math.random() * 1.4,
        c: cols[Math.floor(Math.random() * cols.length)]!,
        life: 70 + Math.random() * 30,
      })
    }
  }, [])

  /* show XP float — use the full active object identity so consecutive
     lines with the same xp value still re-trigger */
  useEffect(() => {
    if (!active?.xp || !xpRef.current) return
    const el = xpRef.current
    el.textContent = `+${active.xp} XP`
    el.hidden = false
    el.style.animation = "none"
    void el.offsetWidth
    el.style.animation = ""
    const t = setTimeout(() => {
      el.hidden = true
    }, 1400)
    return () => clearTimeout(t)
  }, [active])

  /* confetti on celebrate */
  useEffect(() => {
    if (active?.celebrate) burst()
  }, [active, burst])

  /* animation loop — active is read from ref, not from deps */
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext("2d")!
    ctx.imageSmoothingEnabled = false

    function loop(now: number) {
      rafRef.current = requestAnimationFrame(loop)
      if (document.hidden) return

      if (!RM && now - lastStepRef.current > 450) {
        tickRef.current++
        lastStepRef.current = now
      }

      const blink = blinkRef.current
      if (now > blink.next) {
        blink.until = now + 150
        blink.next = now + 2600 + Math.random() * 3200
      }

      const tick = RM ? 0 : tickRef.current
      const blinking = now < blink.until
      const act = activeRef.current

      const st = heroState(G, profile, v.mood, bf, act, tick, blinking)

      ctx.clearRect(0, 0, SCN_W, SCN_H)
      drawScene(ctx, st.scene)

      // challenger on the right
      if (foe.id === "goblin") {
        ctx.drawImage(drawGoblin(foe.ko, RM ? 0 : tick), 64, 32)
      } else if (foe.id === "shadow") {
        drawTreadmill(ctx, 62, 59)
        if (!foe.ko) {
          const sh = drawSprite(
            {
              m: 2,
              f: 1,
              pose: "idle",
              frame: RM ? 0 : tick + 1,
              expr: "angry",
              skin: 1,
              hair: 1,
              style: 0,
              outfit: "tank",
              silhouette: true,
            },
            "shadow",
          )
          ctx.globalAlpha = 0.92
          ctx.drawImage(sh, 58, 11)
          ctx.globalAlpha = 1
        }
      }

      // ally on the left while speaking
      if (act && now < act.until && act.speaker) {
        groundShadow(ctx, 14)
        ctx.drawImage(
          drawAlly(act.speaker, act.pose || "idle", RM ? 0 : tick, blinking),
          -6,
          14,
        )
      }

      // hero center
      groundShadow(ctx, 44)
      ctx.drawImage(drawSprite(st, "hero"), 24, 14)

      // particles
      const parts = particlesRef.current
      for (const p of parts) {
        ctx.fillStyle = p.c
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1)
      }
      if (parts.length) {
        for (const p of parts) {
          p.x += p.vx
          p.y += p.vy
          p.vy += 0.06
          p.life--
        }
        particlesRef.current = parts.filter((p) => p.life > 0 && p.y < 64)
      }
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [G, profile, v.mood, bf, foe.id, foe.ko])

  return (
    <div className="stage" style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        width={SCN_W}
        height={SCN_H}
      />
      <span
        ref={xpRef}
        className="xpfloat"
        hidden
      />
    </div>
  )
}
