# Lift & Fuel

A personal fitness log turned into a pixel-art RPG. You log food, lifts, runs, supplements, water, sleep, steps and weekly body check-ins. A pixel hero and a small cast of allies react to everything you log. Daily quests, XP, levels, streaks, a daily challenger and a weekly boss make consistency feel like a game.

The owner is using it for a 90-day-plus cut on a hybrid program (3 runs + 3 lifts a week). Their personal plan, which is the app's built-in content today, is in `docs/plan.md`. Ideas for what to build next are in `docs/roadmap.md`.

## Run it

There's no build step. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Files

| Path | What's in it |
|---|---|
| `index.html` | Markup for every tab (Quests, Food, Training, Progress, Goals), the stage and the companion dock |
| `src/styles.css` | All styles. Color tokens on `:root` with light and dark values |
| `src/sprites.js` | Procedural pixel art: hero, allies, goblin, Iron Colossus, scenes. Plain globals, loaded before `app.js` |
| `src/app.js` | Everything else, in one IIFE: data, game rules, character engine, storage, rendering, events |
| `docs/plan.md` | The owner's diet, supplement and training plan |
| `docs/character-sheet.jpg` | Concept art the cast is based on ("Workout Quest: Character Ideas") |
| `docs/roadmap.md` | Suggested next steps |

## How app.js works

The sections run in this order:

1. **Constants:** stack, cut targets (`CUT`), meal plan (`PF` foods, `PLAN`, `LONG_FUEL`, and the flexible `DINNER` slot with `DINNER_SIZES` for Mom's home-cooked dinner), hybrid program (`PROGRAM`, `WEEK`), stats, titles, achievements (`ACH`) and unlockables (`ITEMS`).
2. **State:** a single object `S`, holding `profile`, `days` (keyed `YYYY-MM-DD`), selected `date`, `tab` and a few UI flags.
3. **Pure game logic:**
   - `targets(d)` returns the day's calorie and macro targets, based on session type.
   - `quests(d)` returns that day's quest list.
   - `game()` replays the whole history into `GS`: XP, stats, streak, freezes, PRs, boss hits and unlock counters.

   These are derived, never stored, so changing a rule re-scores all history.
4. **Character engine:**
   - `heroState()` and `drawChar()` render each frame.
   - `say()` queues dialogue. Lines marked `low` can be cut off by any newer line, and lines marked `now` (user taps) clear the queue.
   - `react(prev, cur, date, evt)` diffs `GS` before and after a save to announce quests, PRs, level-ups, unlocks, boss kills and challenger KOs.
   - `eventLine(evt)` gives the immediate reaction to whatever was just logged.
5. **Storage (`Store`):**
   - When the page is hosted as a claude.ai artifact, `window.claude.use("db")` provides a private per-user collection (`data/users/<id>`, docs `profile` and `d-YYYY-MM-DD`).
   - Anywhere else it falls back to `localStorage` under `liftfuel:v1`.
   - Writes go through `saveDay(d, evt)` and `saveProfile()`.
6. **Rendering:** `render()` re-renders only the active tab and skips the work when the state is unchanged, using a JSON key check. Renderers build HTML strings, so escape any user text with `esc()`.
7. **Events:** one delegated `click` listener keyed on `data-*` attributes, plus form `submit` and `change` listeners.
8. **Boot:**
   - A one-time migration keyed on `profile.plan` (currently `"hybrid-v1"`) loads the cut targets and weekly layout.
   - It also starts the animation loop and the greeting.

## Data model

All values are stored in canonical units; the display unit comes from `profile.unit` (`lb`/`kg`).

- **Profile:**
  - Training-day targets: `kcal`, `protein`, `carbs`, `fat`.
  - Rest-day targets: `restKcal`, `restCarbs`, `restFat`.
  - Settings: `unit`, `heightCm`, `week` (`{0..6: "push"|"speed"|"pull"|"easy"|"legs"|"long"|"mobility"}`), `waterGoal` (oz), `sleepGoal` (h), `stepGoal`.
  - `stack` (`[{id,name,dose,slot: "Morning"|"Pre-gym"|"Evening"}]`).
  - Body fat: `startBf`, `goalBf`.
  - `avatar` (`{name, skin, hair, style, outfit, head, gear, scene}`).
  - `plan` (migration marker).
- **Day:**
  - `foods` (`[{id,meal,name,kcal,p,c,f,qty,plan?}]`). `plan` links an entry to a meal-plan id.
  - `lifts` (`[{id,name,sets:[{kg,reps}]}]`).
  - `runs` (`[{id,type,variant,km,min,rpe}]`).
  - Body: `weight` (kg), `waist` (cm), `neck` (cm), `bf` (%), `bfSrc` (`"scan"` or `"tape"`), `photo`. A check-in with waist and neck but no scan value stores a U.S. Navy tape estimate (`navyBf()`, male formula) as `bf` with `bfSrc: "tape"`. A scan value always wins.
  - Recovery: `supps` (`{stackId: true}`), `water` (oz), `sleep` (h), `steps`.
  - `session` (override of the weekly layout), `mob` (mobility done).
  - `rest` is legacy and maps to `mobility`.

## Game rules

- **Quests:** 8 core quests per day.
  - Session (+40 XP): Strength on lift days, Endurance on run days, or Vitality for mobility on rest days.
  - Protein ≥95% of target (+30).
  - Calories within ±10% or ±220 kcal, whichever is wider (+25). The wider band lets a home-cooked dinner of 400–800 kcal still clear the quest.
  - Full supplement stack (+20). Pre-gym items count only on training days.
  - Water (+15), sleep (+20) and steps (+15).
  - Weigh-in (+10).
  - Weekly check-in: a bonus quest on Sundays, or any day a waist measurement is logged (+25).
- **Clearing a day:** clear 75% of core quests. Every quest done adds a +50 bonus.
- **Streaks:** consecutive cleared days. Every 7 earns a freeze (max 2), which auto-covers one missed day.
- **Levels:** level N→N+1 costs `150 + 50·(N−1)` XP. Stat levels are `floor(√(xp/40)) + 1`. Titles go Novice → Apprentice → Lifter → Iron Initiate → Athlete → Iron Disciple → Elite → Legend.
- **PRs:**
  - Lift PR: a new best estimated 1RM (Epley) on an exercise, +50 Strength.
  - Distance PR: a new longest run, +50 Endurance.
- **Challengers:**
  - Lift days: the Heavy Dumbbell Goblin, KO'd by finishing ≥60% of the planned working sets.
  - Run days: the Treadmill Shadow, beaten by logging the run.
  - Rest days: none.
- **Weekly boss (Iron Colossus):** 5 HP, Monday–Sunday. A cleared day lands 1 hit, a perfect day 2. Defeating it earns +100 XP.
- **Hero build:**
  - Shoulders and arms grow with Strength level.
  - The waist follows the latest logged body fat, falling back to `startBf`.
  - Mood comes from sleep, protein and water against the time of day.

## The cast (see docs/character-sheet.jpg)

Sprites are drawn procedurally with `fillRect` on small canvases (40×48 for people, 96×64 scenes), then get a 1-px dark outline pass, and are scaled up with `image-rendering: pixelated`. Keep that look: no anti-aliasing and no image assets unless the owner asks.

- **Hero:** Gym Novice (gray tee, spiky hair) who becomes the Gym Warrior (white tank, teal wristbands). The Speed Runner kit is an unlock.
- **Coach Brock:** lifting, PRs, levels, weigh-ins, pep talks.
- **Gym Companion:** food, water, supplements, sleep.
- **Cardio Master:** runs and steps.
- **Challengers:** the Heavy Dumbbell Goblin, the Treadmill Shadow (a dark silhouette of the hero on a treadmill) and Iron Colossus with its punching bag.

## Conventions

- **Theming:** colors come from tokens in `:root`, with matching dark values under `prefers-color-scheme` and `[data-theme]`. Sprite and scene palettes are deliberately fixed literals.
- **Layout:** it must work at 390 px wide with no horizontal scroll, keeping the 16 px safe-area gutters on `body`.
- **Accessibility:** respect `prefers-reduced-motion`. The animation loop and confetti already check `RM`.
- **Copy:** plain, direct and specific. Characters can be playful, but every line should say something useful, such as how much protein is left or what's next.
- **Health guardrails:**
  - Supplement doses stay within established upper limits (D3 ≤4,000 IU, zinc ≤25 mg, supplemental magnesium ≤350 mg, omega-3 EPA+DHA ≤3 g, caffeine ≤400 mg/day).
  - Never encourage aggressive deficits, punishing missed days, or anything that rewards under-eating.
  - Calorie quests reward landing in a range, not going lower.
