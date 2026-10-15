# Roadmap

Suggested next steps, roughly in order. None of this is built yet.

## 1. Data you can move
- Add **Export / Import JSON** under Goals. Logs from the hosted claude.ai version live in that artifact's private storage, so this is how they come across, and it doubles as a backup.

## 2. Make it a real phone app
- Turn it into a **PWA** with a manifest, icons and a service worker, so it installs to the home screen and works offline.
- Optionally, move to **Vite + TypeScript**: split `src/app.js` into modules (`state`, `game`, `character`, `storage`, `render/*`, `events`) and keep `sprites.js` as its own module.

## 3. Tests for the rules
- `quests()`, `game()`, `levelOf()`, `targets()` and `suggest()` are pure, so cover them with Vitest: streak freezes, boss hits, the PR detector, long-run fuel targets and unit conversions.

## 4. Accounts and sync
- Add sign-in and cloud sync so phone and laptop share one log. Supabase is a good fit (auth + Postgres + row-level security), and a Supabase connector is already linked to the owner's Claude account.

## 5. Make the plan editable
- Edit the meal plan, the weekly program (exercises, sets, rep ranges, increments) and the supplement stack in the UI instead of in code.
- Add a food search or barcode lookup instead of typing macros.

## 6. More game
- Add new animations: a running pose for run days, a mobility stretch, and a victory pose for boss kills.
- Add boss variety (monthly bosses), seasonal events, and short sound effects started from user taps.
- Give the allies daily tips drawn from the actual plan.

## 7. Apple Watch and Apple Health
A web app can't read HealthKit directly. There are three routes, from quickest to most complete:

1. **Import an Apple Health export.** Health app → profile → Export All Health Data produces a zip with `export.xml`. Parse it in the browser (stream it, since it can be hundreds of MB) and pull steps, active energy, resting heart rate, HRV, VO₂ max ("Cardio Fitness"), sleep and workouts into each day. Free and works today, but it's manual.
2. **Automatic sync through a bridge app.** An iOS app such as Health Auto Export can post HealthKit data as JSON to a URL on a schedule. That needs a small backend to receive it (for example a Supabase edge function plus a table), which pairs with roadmap step 4.
3. **A native iPhone app.** Wrap the app with React Native/Expo or Capacitor and use a HealthKit library. It's the most seamless option, and it needs an Apple Developer account. Building from Windows works through Expo's cloud builds.

Once health data flows in: auto-complete the steps and sleep quests, show resting HR and VO₂ max trends on Progress, attach heart-rate data to logged runs, and let the Speed Run use real paces. Don't add the watch's active calories to the food budget, because those estimates are too rough.

## 8. Other integrations
- Pull runs from Strava, and send reminder notifications (water, evening stack, Sunday check-in).
