# OJT Hours Tracker

OJT Hours Tracker is a Vite + React + TypeScript web app for logging on-the-job training hours locally in the browser. It uses Tailwind CSS for styling, Framer Motion for all UI motion, and localStorage for persistence, so no backend is required.

## Features

- Dashboard with total hours, remaining hours, days logged, average per day, and a live timer.
- Clock in and clock out flow with animated state changes.
- Session log with editable remarks and delete controls.
- Manual session entry for backfilling or correcting hours.
- Export tools for Excel `.xlsx` and text-based DTR reports.
- Settings page for trainee and company details plus required hours.
- Antique parchment visual theme with embossed button styling and responsive mobile/desktop navigation.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- date-fns
- SheetJS (`xlsx`)

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Install

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Scripts

- `npm run dev` - start the Vite development server.
- `npm run build` - type-check and build the app.
- `npm run preview` - preview the production build locally.

## Data Storage

All tracker data is saved in the browser using localStorage. Clearing site data or using the in-app danger zone will remove sessions and settings.

## Project Structure

```text
src/
├── components/
│   ├── Layout.tsx
│   ├── Dashboard.tsx
│   ├── SessionLog.tsx
│   ├── ManualEntry.tsx
│   ├── ExportPage.tsx
│   └── SettingsPage.tsx
├── hooks/
│   └── useTracker.ts
├── utils/
│   ├── timeUtils.ts
│   └── exportUtils.ts
├── types/
│   └── index.ts
├── App.tsx
└── index.css
```

## Notes

- The app is styled around a warm parchment theme with custom embossed button effects.
- Fonts are loaded in `src/index.css` from Google Fonts.
- Session rows, page transitions, progress bars, and toast notifications all use Framer Motion animations.