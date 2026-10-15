import { useEffect, useRef } from "react"
import type { DialogueState } from "../../character"
import { avatar } from "../../game/helpers"
import { useStore } from "../../store/useStore"

const RM = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

const SPEAKERS: Record<string, string> = {
  coach: "Coach Brock",
  buddy: "Gym Companion",
  cardio: "Cardio Master",
}

interface DialogBoxProps {
  state: DialogueState
}

export function DialogBox({ state }: DialogBoxProps) {
  const profile = useStore((s) => s.profile)
  const A = avatar(profile)
  const textRef = useRef<HTMLSpanElement>(null)

  const line = state.active
  const speech = state.speaking
  const text = speech?.text ?? ""
  const speaker = line?.speaker || null
  const whoName = speaker ? SPEAKERS[speaker] ?? speaker : A.name

  useEffect(() => {
    const el = textRef.current
    if (!el || !text) return
    if (RM) {
      el.textContent = text
      return
    }
    let i = 0
    el.textContent = ""
    const iv = setInterval(() => {
      i += 2
      el.textContent = text.slice(0, i)
      if (i >= text.length) clearInterval(iv)
    }, 18)
    return () => clearInterval(iv)
  }, [text])

  if (!line || !text) return null

  return (
    <div className="dialog">
      <span className={`who pix ${speaker || ""}`}>{whoName.toUpperCase()}</span>
      <span ref={textRef} className="dlgtext" />
    </div>
  )
}
