import { useEffect, useRef, useState, useCallback } from "react"
import { useStore } from "../../store/useStore"
import { useGameState, useVitals } from "../../store/derived"
import { sessionOf } from "../../game/targets"
import { fmt, getDay, todayKey } from "../../game/helpers"
import { nextPlanMeal } from "../../game/plan"
import { challenger } from "../../character/useCharacter"
import { DialogueManager } from "../../character/useDialogue"
import type { SpeechLine, DialogueState } from "../../character/useDialogue"
import { react as reactDiff } from "../../character/react"
import { PROGRAM } from "../../constants"

import { HeroStage } from "./HeroStage"
import { DialogBox } from "./DialogBox"
import { ActionButtons } from "./ActionButtons"
import { CharacterInfo } from "./CharacterInfo"
import { Wardrobe } from "./Wardrobe"
import { QuestGrid } from "./QuestGrid"
import { StreakLog } from "./StreakLog"
import { Achievements } from "./Achievements"

import type { Vitals, Profile, GameState } from "../../types"

/* ---------- mood greeting ---------- */

function moodLine(v: Vitals, profile: Profile): string {
  const d = v.d
  const nm = nextPlanMeal(d, profile)
  const greet = v.h < 12 ? "Morning" : v.h < 17 ? "Afternoon" : "Evening"

  switch (v.mood) {
    case "late":
      return `It's late. Sleep is a quest too: ${fmt(profile.sleepGoal, 2)} hours earns Vitality XP. See you in the morning.`
    case "sleepy":
      return `Only ${fmt(v.d.sleep ?? 0, 2)} h of sleep. Train smart today and aim for an earlier night.`
    case "hungry":
      return nm
        ? `I'm running on empty. ${nm.name} is next: ${fmt(nm.t.p)} g protein.`
        : "I'm running on empty. Log a meal?"
    case "thirsty":
      return `Water check: ${fmt(v.d.water)} / ${fmt(profile.waterGoal)} oz. Grab 16 oz?`
    case "ecstatic":
      return "Every quest done today. That's how it's done."
    case "happy":
      return `Day cleared. ${v.r.core.length - v.r.done} more for a perfect day.`
    case "pumped":
      return "Session's in. Now eat and recover."
    default:
      return `${greet}! Let's keep going.`
  }
}

/* ---------- QuestsTab ---------- */

export function QuestsTab() {
  const profile = useStore((s) => s.profile)
  const days = useStore((s) => s.days)

  const G = useGameState()
  const v = useVitals()

  const [dlg, setDlg] = useState<DialogueState>({
    queue: [],
    active: null,
    speaking: null,
  })

  const dmRef = useRef<DialogueManager | null>(null)
  const prevGRef = useRef<GameState | null>(null)
  const greetedRef = useRef(false)

  /* create the DialogueManager once */
  if (!dmRef.current) {
    dmRef.current = new DialogueManager()
  }

  const dm = dmRef.current

  /* bridge DM events into React state */
  useEffect(() => {
    dm.onSpeech = () => setDlg(dm.snapshot())
    dm.onIdle = () => setDlg(dm.snapshot())
    return () => {
      dm.onSpeech = null
      dm.onIdle = null
    }
  }, [dm])

  /* expose say for action buttons */
  const say = useCallback(
    (text: string, opts: Partial<SpeechLine> = {}) => {
      dm.say(text, opts)
      setDlg(dm.snapshot())
    },
    [dm],
  )

  /* greeting on first mount */
  useEffect(() => {
    if (greetedRef.current) return
    greetedRef.current = true

    const today = todayKey()
    const d = getDay(days, today)
    const sleepy = v.mood === "late" || v.mood === "sleepy"
    const foe = challenger(d, profile)

    say(moodLine(v, profile), {
      pose: sleepy ? "sleepy" : "wave",
      expr: sleepy ? "sleepy" : "smile",
      low: true,
    })

    const Pg = PROGRAM[sessionOf(d, profile)]
    if (!sleepy && !foe.ko && Pg.kind === "lift") {
      say(
        `${Pg.name} today. The Heavy Dumbbell Goblin's waiting. Start with ${Pg.ex[0]!.n.toLowerCase()}, ${Pg.ex[0]!.sets}\u00d7${Pg.ex[0]!.lo}\u2013${Pg.ex[0]!.hi}.`,
        { speaker: "coach", pose: "point", low: true },
      )
    } else if (!sleepy && !foe.ko && Pg.kind === "run") {
      say(`${Pg.name} today, ${Pg.time}! Log it to outrun the Treadmill Shadow.`, {
        speaker: "cardio",
        pose: "flex",
        low: true,
      })
    } else if (!sleepy && Pg.kind === "rest") {
      say(
        "Recovery day. 15 minutes of mobility, an easy walk, and your weekly check-in.",
        { speaker: "buddy", pose: "wave", low: true },
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* react to game-state changes (PRs, quests, level-ups, etc.) */
  useEffect(() => {
    const prev = prevGRef.current
    prevGRef.current = G

    if (!prev) return

    const k = useStore.getState().date
    const msgs = reactDiff(prev, G, k, days, profile)
    for (const m of msgs) {
      dm.say(m.text, m)
    }
    if (msgs.length) {
      setDlg(dm.snapshot())
    }
  }, [G, days, profile, dm])

  return (
    <>
      <div className="stagehero">
        <HeroStage active={dlg.active} />
        <DialogBox state={dlg} />
        <ActionButtons say={say} />
      </div>
      <CharacterInfo />
      <Wardrobe />
      <QuestGrid />
      <StreakLog />
      <Achievements />
    </>
  )
}
