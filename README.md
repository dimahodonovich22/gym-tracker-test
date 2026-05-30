# GymTracker — Test

Sandbox copy of [gym-tracker](https://github.com/dimahodonovich22/gym-tracker) for experimenting without touching the production app.

Live: https://dimahodonovich22.github.io/gym-tracker-test/

## Why a separate repo

- Independent GitHub Pages URL — production stays unaffected
- Independent `STORAGE_KEY` (`gymtracker.test.v1`) so localStorage on the same browser doesn't collide with production data
- Independent SW cache name (`gymtracker-test-v2`) so service workers don't fight each other

## Касса для ресторана (POS)

В этой песочнице, помимо трекера тренировок, есть кассовый аппарат для ресторана.

- Страница: [`pos.html`](./pos.html) — live: https://dimahodonovich22.github.io/gym-tracker-test/pos.html
- Возможности: столики, заказы (блюда из меню с количеством), подсчёт суммы и количества, управление меню, история оплаченных чеков, печать чека.
- Чек свёрстан под **чековый термопринтер** (лента ~80 мм) — печать через диалог печати браузера.
- Устанавливается на планшет как отдельное PWA-приложение «Касса» (`pos.webmanifest`, `start_url` → `pos.html`), работает офлайн.
- Свой `STORAGE_KEY` (`restpos.test.v1`) — данные кассы не пересекаются с трекером.
- Файлы: `pos.html`, `pos.js`, `pos.css`, `pos.webmanifest` (иконки кассы добавлены в общий `icons.js`).
