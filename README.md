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
<img width="1542" height="865" alt="image" src="https://github.com/user-attachments/assets/7700ddad-66c4-4fe2-a4de-8ba6167b2bea" />
<img width="1516" height="885" alt="image" src="https://github.com/user-attachments/assets/f3861f3e-3640-424a-8657-17a8c396e660" />
<img width="1535" height="881" alt="image" src="https://github.com/user-attachments/assets/93c19305-803c-4767-b9e5-1a3785518389" />
<img width="1566" height="737" alt="image" src="https://github.com/user-attachments/assets/c50b826e-b802-4646-837d-26b72eb24c0e" />


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
