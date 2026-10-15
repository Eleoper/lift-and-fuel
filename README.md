# Lift & Fuel

A fitness log disguised as a pixel RPG. Log meals, lifts, runs, supplements and recovery. Your hero, Coach Brock, the Gym Companion and Cardio Master react as you clear daily quests, knock out the Dumbbell Goblin, outrun the Treadmill Shadow and take down the weekly boss, Iron Colossus.

## Run it

Open `index.html` in a browser. To serve it locally instead:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000. Your data saves in the browser's local storage.

## Work on it with Claude Code

From this folder, run:

```bash
claude
```

Claude Code reads `CLAUDE.md` automatically for the architecture, game rules and data model. Good first prompts:

- "Read CLAUDE.md and docs/roadmap.md, then add Export/Import JSON under Goals."
- "Turn this into an installable PWA that works offline."
- "Add Vitest tests for quests(), game() and levelOf()."

## Layout

```
index.html          markup for all tabs
src/styles.css      styles and light/dark color tokens
src/sprites.js      procedural pixel-art cast and scenes
src/app.js          data, game rules, character engine, storage, rendering
docs/plan.md        the diet, supplement and training plan
docs/roadmap.md     what to build next
docs/character-sheet.jpg  concept art for the cast
```
