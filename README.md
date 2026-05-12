# Currency Converter

A production-oriented web app for live currency conversion, built with React and TypeScript. It supports two exchange-rate backends, optional historical trend charts, and a sensible default “local” target currency based on IP or browser locale.

## Features

- **Conversion** — From/to pickers and amount with validation; the **result and live rate fetch** run only after you **explicitly choose both** From and To (dropdown, swap, favorite chip, or history row), not from initial or geo defaults alone.
- **Swap** — One control to exchange the from and to currencies.
- **Loading & errors** — Query-driven loading states, clear error messages, and retry where appropriate.
- **Responsive UI** — Material UI layout tuned for small and large screens.
- **Trend chart** — Daily ECB reference rate trend (Frankfurter) for the selected pair with 30 / 90 / 180 day ranges. **Line ↔ Area** toggle (preference stored in `localStorage` under `currency-converter:chart-mode`), **min/max markers** with labels, summary chips for the period high / low / overall change, a **rich tooltip** showing the date, formatted rate, and Δ vs the previous day, and smooth animated transitions. The chart bundle is lazy-loaded.
- **Local currency hint** — Suggests a default **to** currency using [ipapi.co](https://ipapi.co/) (IP → currency) with a fallback from `navigator.language` and a small region → currency map (e.g. Malaysia → MYR). Shown as a chip when a code is resolved.
- **Conversion history** — Keeps the last **10** successful conversions in `localStorage` once you have **explicitly chosen both From and To** (dropdown change, swap, favorite chip, or reusing a history row); geo defaults alone do not write history. Lists entries under the converter; click a row to restore **from**, **to**, and **amount**; **remove** one entry or **clear all**.
- **Favorite pairs** — Star control beside the conversion block toggles the current **from → to** pair; pairs are stored in `localStorage` (up to **24**), shown as **MUI Chips** above the result (**click** = apply pair, **×** = remove).
- **Theme** — **Light / dark** toggle in the page header; choice is stored in `localStorage` under `currency-converter:color-mode` (default **dark**).
- **Auto-refresh rates** — Active conversions refetch every **60s** (and on **window focus** / network reconnect); the trend chart refetches on focus / reconnect. Background-tab refetches are paused to save resources.
- **Rate alert** — Set **one** target rate per pair (≥ above or ≤ below); the alert is stored in `localStorage` (`currency-converter:rate-alerts`). The watcher checks each fresh refetch (incl. the 60s poll and focus refetches), pops a MUI **Snackbar** when the threshold is breached, then **disarms** so the user is not spammed. It re-arms automatically when the live rate moves back across the threshold.
- **Multi-currency view** — Compare the base **From** currency against up to **12** target currencies in one MUI Grid (responsive 1 / 2 / 3 columns). Each card shows the converted amount (when one is entered) or the live rate per 1 base, with one-click "Use as To" and remove actions. Tracked targets are stored in `localStorage` (`currency-converter:multi-targets`, default set: EUR / GBP / JPY / MYR / SGD / AUD). Rates are sourced from Frankfurter and refresh on the same 60s cadence.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 8](https://vite.dev/)
- [Material UI v9](https://mui.com/)
- [TanStack Query v5](https://tanstack.com/query/latest)
- [Recharts](https://recharts.org/) (trend chart)

## Prerequisites

- [Node.js](https://nodejs.org/) (current LTS recommended)
- npm (comes with Node)

## Getting started

```bash
git clone <your-repo-url>
cd currency-converter
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Optional: exchangerate.host API key

Without a key, the app uses **Frankfurter** ([api.frankfurter.dev](https://api.frankfurter.dev/)) for the currency list and conversions (no signup required).

To use **exchangerate.host** instead:

1. Copy `.env.example` to `.env` in the project root.
2. Set `VITE_EXCHANGERATE_HOST_ACCESS_KEY` to your key from [exchangerate.host](https://exchangerate.host/pricing).
3. Restart the dev server (`npm run dev`).

`.env` is gitignored so keys are not committed.

## Scripts

| Command        | Description                          |
| -------------- | ------------------------------------ |
| `npm run dev`  | Start Vite in development mode       |
| `npm run build`| Typecheck (`tsc`) then production build |
| `npm run preview` | Serve the production build locally |

## Environment variables

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `VITE_EXCHANGERATE_HOST_ACCESS_KEY` | No | If set, currency list and conversions use exchangerate.host. If unset, Frankfurter is used. |

## Project layout (high level)

```
src/
  api/           # HTTP clients (Frankfurter, exchangerate.host, geo, routing)
  components/    # UI (converter, chart, inputs, etc.)
  data/          # Static maps (e.g. region → currency)
  hooks/         # TanStack Query hooks
  providers/     # QueryClient, color mode context, ThemeProvider
  theme/         # createAppTheme, ColorModeContext
  types/         # Shared TypeScript types
  utils/         # Formatting, history, favorites, color mode storage, etc.
```

## APIs and privacy

- **Frankfurter** — Used for conversions and currency list when no exchangerate key is set; also used for the **trend chart** (ECB reference data).
- **exchangerate.host** — Used when `VITE_EXCHANGERATE_HOST_ACCESS_KEY` is configured.
- **ipapi.co** — Used once per session (cached by TanStack Query) to suggest a local currency from the client’s public IP. If that fails, the app falls back to locale only. Review [ipapi.co](https://ipapi.co/privacy/) for their terms and privacy policy.

## Roadmap

Planned enhancements grouped by phase. Items are **backlog** unless noted as done in this section or in **Features** above.

### 🚀 Phase 1 — Must add (finish core product)

#### 1. Conversion history 💾 *(done)*

**Goal:** Make the app feel stateful.

**Tasks:**

- Store the last 5–10 conversions in `localStorage`. *(Implemented: up to 10 entries, key `currency-converter:conversion-history`.)*
- Show the list under the converter.
- Clicking an item auto-fills inputs (from, to, amount).
- History rows are only appended after the user has explicitly set both currencies (not from geo/list defaults alone).

**Why it matters:** Shows product thinking, not just API usage.

#### 2. Favorites (quick access) ⭐ *(done)*

**Goal:** Improve UX speed.

**Tasks:**

- Add a star (⭐) control next to the conversion area.
- Save pairs such as `USD → MYR`. *(Storage key `currency-converter:favorite-pairs`.)*
- Display favorites as MUI `Chip` components.

**Why it matters:** Demonstrates user-centered design.

#### 3. Theme toggle (dark / light) 🌙 *(done)*

**Goal:** Personalization.

**Tasks:**

- Add a toggle in the header (dark / light). *(Icon button next to the title; sun / moon style icons.)*
- Persist the choice in `localStorage`. *(Key `currency-converter:color-mode`.)*

**Why it matters:** Shows MUI theming and UX polish.

---

### ⚡ Phase 2 — Make it feel “alive”

#### 4. Auto refresh rates 🔄 *(done)*

**Goal:** Real-time behavior.

**Tasks:**

- Set `refetchInterval: 60000` (and/or equivalent per-query options). *(Implemented in `useConversion`; paused when the query is disabled or the tab is hidden via `refetchIntervalInBackground: false`.)*
- Set `refetchOnWindowFocus: true` where appropriate. *(Conversion + trend queries.)*
- Add UI copy such as: “Rates update automatically”. *(Shown in the page subtitle and as a caption beneath the result.)*

#### 5. Rate alert (standout feature) 🔔 *(done)*

**Goal:** Differentiate the app.

**Tasks:**

- Input for a target rate. *(Inline editor in the converter card with a target field and an above/below toggle.)*
- Store the target in `localStorage`. *(One alert per `from→to` pair, key `currency-converter:rate-alerts`.)*
- On refetch / new data, compare against the live rate. *(Watcher in `useRateAlertWatcher` keyed on `dataUpdatedAt` so it acts on each fresh refetch and skips re-renders.)*
- Show a MUI `Snackbar` when the condition is triggered. *(Anchored bottom-center; alert auto-disarms after firing and re-arms when the rate crosses back.)*

---

### 📊 Phase 3 — Elevate visual impact

#### 6. Upgrade chart 📈 *(done)*

**Goal:** Make the chart a highlight feature.

**Tasks:**

- Tooltip with formatted values (build on existing Recharts tooltip). *(Custom MUI-styled tooltip with date, formatted rate, and Δ vs previous day with a colored pill.)*
- Highlight min / max points on the series. *(`ReferenceDot` markers with ▲ High / ▼ Low labels and matching summary chips above the chart.)*
- Smooth animation for line updates. *(`isAnimationActive` enabled with `animationDuration: 600` and `animationEasing: 'ease-out'`.)*
- Toggle: **Line** vs **Area** chart. *(`ToggleButtonGroup` with `ShowChart` / `StackedLineChart` icons; preference persisted in `localStorage` at `currency-converter:chart-mode`.)*

#### 7. Multi-currency view 🌍 *(done)*

**Goal:** Add depth.

**Tasks:**

- Show several target currencies at once for a given base amount. *(Up to 12 tracked currencies; each card shows the converted amount when an amount is entered, otherwise the live rate per 1 base.)*
- Use MUI `Grid` / list layout for scanability. *(Responsive Grid: 1 column on xs, 2 on sm, 3 on md+. Add via Autocomplete, remove with × on each card, "Use as To" arrow promotes a card into the main converter.)*

---

### 🧠 Phase 4 — Engineering polish

#### 8. Optimize TanStack Query ⚡

**Tasks:**

- Use `select` to shape data at the query layer where it helps.
- Tune cache / `staleTime` / keys to avoid redundant refetches.
- Prevent unnecessary refetches (narrow `queryKey`s, `enabled`, etc.).

#### 9. Add basic tests 🧪

**Tasks:**

- Test conversion / amount parsing logic.
- Test API response parsing (Frankfurter / host adapters).

**Tools:** [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/react).

---

### 🎯 Phase 5 — Production-level polish

#### 10. UI / UX refinement 🎨

**Tasks:**

- Replace text-only loaders with skeleton loaders where still missing.
- Improve empty states (no history, no chart data, etc.).
- Improve error messages (actionable, consistent tone).
- Accessibility: labels, `aria-*`, keyboard paths, focus management.

## License

Private / unlicensed unless you add a `LICENSE` file.
