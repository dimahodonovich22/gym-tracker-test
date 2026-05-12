# GymTracker — Test

Sandbox copy of [gym-tracker](https://github.com/dimahodonovich22/gym-tracker) for experimenting without touching the production app.

Live: https://dimahodonovich22.github.io/gym-tracker-test/

## Why a separate repo

- Independent GitHub Pages URL — production stays unaffected
- Independent `STORAGE_KEY` (`gymtracker.test.v1`) so localStorage on the same browser doesn't collide with production data
- Independent SW cache name (`gymtracker-test-v1`) so service workers don't fight each other
