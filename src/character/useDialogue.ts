import type { ActiveLine } from "./useCharacter"

/* -------- Speech line -------- */

export interface SpeechLine {
  text: string
  speaker?: string | null
  pose?: string
  expr?: string
  heroPose?: string
  heroExpr?: string
  low?: boolean
  now?: boolean
  celebrate?: boolean
  xp?: number
}

/* -------- Dialogue state (for UI consumption) -------- */

export interface DialogueState {
  queue: SpeechLine[]
  active: ActiveLine | null
  speaking: SpeechLine | null
}

/**
 * Imperatively manages the speech queue, timers, and active line.
 *
 * This is a plain class -- no React, no hooks.
 * The consuming React hook wraps it and bridges state changes into re-renders.
 */
export class DialogueManager {
  queue: SpeechLine[] = []
  active: ActiveLine | null = null
  speaking: SpeechLine | null = null

  /** Called whenever a new line starts playing (for UI updates). */
  onSpeech: ((line: SpeechLine, active: ActiveLine) => void) | null = null

  /** Called when the queue is fully drained and no line is active. */
  onIdle: (() => void) | null = null

  private timer: ReturnType<typeof setTimeout> | null = null

  /* ---- public API ---- */

  /**
   * Add a line to the speech queue.
   *
   * - `now` lines clear the entire queue first (user-initiated).
   * - New lines always evict existing `low` (ambient) entries.
   * - The queue is capped at 4 entries.
   */
  say(text: string, opts: Partial<SpeechLine> = {}): void {
    const line: SpeechLine = { text, ...opts }

    if (line.now) {
      this.queue = []
    } else {
      this.queue = this.queue.filter((s) => !s.low)
    }

    /* clear the current timer if this is a `now` line or the current line is `low` */
    if (line.now || this.speaking?.low) {
      this.clearTimer()
    }

    this.queue.push(line)

    /* keep the queue from growing unboundedly */
    if (this.queue.length > 4) {
      this.queue.splice(0, this.queue.length - 4)
    }

    /* kick off playback if nothing is currently running */
    if (!this.timer) {
      this.nextSpeech()
    }
  }

  /**
   * Advance to the next queued speech line.
   * If the queue is empty, notify idle and bail out.
   */
  nextSpeech(): void {
    const s = this.queue.shift() ?? null
    this.speaking = s

    if (!s) {
      this.timer = null
      this.onIdle?.()
      return
    }

    const duration = Math.max(2600, Math.min(6000, s.text.length * 55))

    this.active = {
      pose: s.pose || (s.speaker ? "idle" : "wave"),
      expr: s.expr,
      speaker: s.speaker ?? null,
      heroPose: s.heroPose,
      heroExpr: s.heroExpr,
      until: performance.now() + duration,
      celebrate: s.celebrate,
      xp: s.xp,
    }

    this.onSpeech?.(s, this.active)

    const delay = Math.max(2800, Math.min(6500, s.text.length * 60))
    this.timer = setTimeout(() => this.nextSpeech(), delay)
  }

  /** Clear all timers and reset state. */
  stop(): void {
    this.clearTimer()
    this.queue = []
    this.speaking = null
    this.active = null
  }

  /** Snapshot of the current dialogue state for rendering. */
  snapshot(): DialogueState {
    return {
      queue: [...this.queue],
      active: this.active,
      speaking: this.speaking,
    }
  }

  /* ---- private ---- */

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
}
