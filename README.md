# Currency Converter

A production-oriented web app for live currency conversion, built with React and TypeScript. It supports two exchange-rate backends, optional historical trend charts, and a sensible default “local” target currency based on IP or browser locale.

## Features

- **Conversion** — From/to currency pickers, amount input with validation, formatted result, spot rate, and timestamp when the API provides it.
- **Swap** — One control to exchange the from and to currencies.
- **Loading & errors** — Query-driven loading states, clear error messages, and retry where appropriate.
- **Responsive UI** — Material UI layout tuned for small and large screens.
- **Trend chart** — Daily ECB reference rate trend (Frankfurter) for the selected pair, with 30 / 90 / 180 day ranges. The chart bundle is lazy-loaded.
- **Local currency hint** — Suggests a default **to** currency using [ipapi.co](https://ipapi.co/) (IP → currency) with a fallback from `navigator.language` and a small region → currency map (e.g. Malaysia → MYR). Shown as a chip when a code is resolved.

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

## License

Private / unlicensed unless you add a `LICENSE` file.
