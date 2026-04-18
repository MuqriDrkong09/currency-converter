# Currency Converter

A production-oriented web app for live currency conversion, built with React and TypeScript. It supports two exchange-rate backends, optional historical trend charts, and a sensible default “local” target currency based on IP or browser locale.

## Features

- **Conversion** — From/to currency pickers, amount input with validation, formatted result, spot rate, and timestamp when the API provides it.
- **Swap** — One control to exchange the from and to currencies.
- **Loading & errors** — Query-driven loading states, clear error messages, and retry where appropriate.
- **Responsive UI** — Material UI layout tuned for small and large screens.
- **Trend chart** — Daily ECB reference rate trend (Frankfurter) for the selected pair, with 30 / 90 / 180 day ranges. The chart bundle is lazy-loaded.
- **Local currency hint** — Suggests a default **to** currency using [ipapi.co](https://ipapi.co/) (IP → currency) with a fallback from `navigator.language` and a small region → currency map (e.g. Malaysia → MYR). Shown as a chip when a code is resolved.
- **Conversion history** — Keeps the last **10** successful conversions in `localStorage`, lists them under the converter, and restores **from**, **to**, and **amount** when you click a row (debounced saves to avoid noise while typing).

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
  providers/     # Theme + QueryClientProvider
  theme/         # MUI theme
  types/         # Shared TypeScript types
  utils/         # Formatting and small helpers
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

**Why it matters:** Shows product thinking, not just API usage.

#### 2. Favorites (quick access) ⭐

**Goal:** Improve UX speed.

**Tasks:**

- Add a star (⭐) control next to the conversion area.
- Save pairs such as `USD → MYR`.
- Display favorites as MUI `Chip` components.

**Why it matters:** Demonstrates user-centered design.

#### 3. Theme toggle (dark / light) 🌙

**Goal:** Personalization.

**Tasks:**

- Add a toggle in the header (dark / light).
- Persist the choice in `localStorage`.

**Why it matters:** Shows MUI theming and UX polish.

---

### ⚡ Phase 2 — Make it feel “alive”

#### 4. Auto refresh rates 🔄

**Goal:** Real-time behavior.

**Tasks:**

- Set `refetchInterval: 60000` (and/or equivalent per-query options).
- Set `refetchOnWindowFocus: true` where appropriate.
- Add UI copy such as: “Rates update automatically”.

#### 5. Rate alert (standout feature) 🔔

**Goal:** Differentiate the app.

**Tasks:**

- Input for a target rate.
- Store the target in `localStorage`.
- On refetch / new data, compare against the live rate.
- Show a MUI `Snackbar` when the condition is triggered.

---

### 📊 Phase 3 — Elevate visual impact

#### 6. Upgrade chart 📈

**Goal:** Make the chart a highlight feature.

**Tasks:**

- Tooltip with formatted values (build on existing Recharts tooltip).
- Highlight min / max points on the series.
- Smooth animation for line updates.
- Toggle: **Line** vs **Area** chart.

#### 7. Multi-currency view 🌍

**Goal:** Add depth.

**Tasks:**

- Show several target currencies at once for a given base amount.
- Use MUI `Grid` / list layout for scanability.

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
