---
title: Implement Dexie.js Multi-User Auth, 5-Theme Engine, and Hero Landing Page
---

## Initial User Prompt

/brainstorm we make a Login page, and sign up where user register there name and password no need for email and store into local db using dexie, then we make a homepage/description about the app .

### Requirements

#### Section 1: Dexie.js Database & Auth Architecture
- **Dexie IndexedDB Schema (`src/db/index.ts`):**
  - `users`: `++id, &username, password, createdAt`
  - `sessions`: `++id, userId, date, timeInISO, timeOutISO, hours, remarks, breakMinutes`
  - `meta`: `userId, name, school, company, supervisor, requiredHours, autoBreak`
- **Auth Context & State (`src/context/AuthContext.tsx`):**
  - Manage active user session (`currentUser: { id, username } | null`).
  - Register & Login methods querying Dexie database.
  - Multi-user isolation so each account manages only its own OJT sessions and profile.

#### Section 2: Landing Page, Auth UI & 5-Theme Engine
- **5-Theme System (`src/styles/themes.ts`):**
  - `sleekDark` (Sleek Dark): `bg: #0B1120`, `surface: #131B2E`, `accent: #6366F1`, `text: #E2E8F0`
  - `sunAndSoil` (Sun & Soil): `bg: #FBF4E9`, `surface: #FFFDF8`, `accent: #C4652A`, `text: #3B2E22`
  - `deepOcean` (Deep Ocean): `bg: #0E1B21`, `surface: #16262E`, `accent: #2FA3A3`, `text: #DCE8EA`
  - `roseQuartzLight` (Rose Quartz Light): `bg: #FBF3F5`, `surface: #FFFFFF`, `accent: #A64D6E`, `text: #4A2E38`
  - `accessibleLight` (Accessible Light): `bg: #F7F8FA`, `surface: #FFFFFF`, `accent: #0D9488`, `text: #1E293B`
  - Interactive theme selector in top navigation header & settings page.
- **Modern Hero Landing Page (`src/components/LandingPage.tsx`):**
  - Feature showcase, app benefits, 100% offline privacy notice, and CTA buttons to Log In / Sign Up.
- **Auth Modal & Form (`src/components/AuthModal.tsx`):**
  - Username & Password fields (no email required).
  - Terms & Conditions agreement checkbox on Sign Up page.

#### Section 3: Data Flow, Multi-User Security & Verification
- **IndexedDB Query Isolation:** All session reads, writes, and meta settings scoped strictly to `currentUser.id`.
- **Validation:** Unique username check, password length check, and terms agreement check.
- **Verification:** Clean `tsc -b` compilation, ESLint pass, and Vite build verification (`npm run build`).

## Description

// Will be filled in future stages by business analyst
