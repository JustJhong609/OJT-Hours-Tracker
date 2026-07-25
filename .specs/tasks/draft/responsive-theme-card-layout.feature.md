---
title: Make Customize Your Experience theme card mobile-first responsive with horizontal scrollable chip track
---

## Initial User Prompt

make the Customize Your Experience card responsive and mobile 1st layout its eating a lot of space when choosing a theme

### Requirements

#### 1. Reduced Mobile Card Padding & Compact Header
- Shift card padding in `src/components/LandingPage.tsx` from `p-6 sm:p-8` to `p-4 sm:p-6`.
- Hide paragraph subtitle on small screens (`hidden sm:block`) to minimize vertical height.
- Reduce font size of card title on mobile screens (`text-lg sm:text-2xl`).

#### 2. Horizontal Scrollable Chip Track
- Replace vertical flex wrapping with a single-row touch-scrollable chip container:
  `flex items-center gap-2 overflow-x-auto snap-x py-1 px-0.5 no-scrollbar sm:justify-center`
- Each theme pill button rendered as non-shrinking flex chip:
  `snap-start shrink-0 whitespace-nowrap px-3 py-2 text-xs font-bold rounded-xl border`

## Description

// Will be filled in future stages by business analyst
