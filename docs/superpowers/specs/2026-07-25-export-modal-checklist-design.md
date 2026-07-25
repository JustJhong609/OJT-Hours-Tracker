# Design Spec: Export Preview & Selection Modal with Customization Checklist

**Date:** 2026-07-25  
**Topic:** Interactive Export Modal for OJT Hours Tracker  
**Status:** Approved  

---

## 1. Overview
Redesign the OJT Hours Tracker Export feature to remove the legacy "Print DTR" and "Download Text (.txt)" controls. Replace them with a single primary **"Export to Excel (.xlsx)"** button that launches an interactive **Export Preview & Selection Modal**. The modal provides a live preview of the spreadsheet and a checklist allowing users to select exactly which sections, columns, and date ranges to include in the exported file.

---

## 2. Requirements & UI Changes

### 2.1 Cleaned Export Page (`src/components/ExportPage.tsx`)
- **Removed Elements:**
  - "Download as Text Report (.txt)" button
  - "Print DTR" button
  - Static text preview box
- **New Element:**
  - Single primary CTA button: `📊 Export to Excel (.xlsx)`
  - Summary card detailing total logged sessions, hours rendered, and export instructions.

### 2.2 Export Preview & Selection Modal (`src/components/ExportModal.tsx`)
- **Left Panel — Checklist & Filters:**
  - **Date Range Filter:** Range selector dropdown (`All Sessions`, `This Week`, `This Month`, `Specific Month`, `Specific Week`).
  - **Inclusion Checklist:**
    - `[x]` **Trainee & Profile Summary:** Includes Trainee Name, School, Company, Supervisor, and Target Hours.
    - `[x]` **Remarks / Shift Notes:** Toggles the inclusion of the Remarks column in the log table.
    - `[x]` **Break Deductions:** Toggles the inclusion of the Break Minutes column.
    - `[x]` **Totals Summary Row:** Includes calculated Total Hours & Remaining Hours at the bottom of the log table.
- **Right Panel — Live Table Preview:**
  - Scrollable real-time preview table displaying the exact formatted spreadsheet output based on the user's checklist selections.
- **Modal Action Bar:**
  - **"Cancel"** button to dismiss modal.
  - **"Confirm & Download Excel (.xlsx)"** button that triggers the SheetJS file generation.

---

## 3. Data Architecture & Excel Generator (`src/utils/exportUtils.ts`)
Update `downloadExcelReport` function signature to accept export customization options:

```typescript
export interface ExportOptions {
  includeProfile: boolean;
  includeRemarks: boolean;
  includeBreaks: boolean;
  includeSummaryTotals: boolean;
}

export const downloadExcelReport = (
  sessions: Session[],
  meta: TrackerMeta,
  options: ExportOptions
): void => {
  // Builds SheetJS workbook based strictly on selected options & filtered sessions
};
```

---

## 4. Verification & Testing Strategy
- **TypeScript Type Safety:** Ensure strict compilation with `tsc -b`.
- **Linter Compliance:** Zero ESLint warnings or errors (`npm run lint`).
- **Production Build:** Verification via `npm run build`.
- **Functional Validation:** Modal toggle, live preview recalculation, checklist filtering, and `.xlsx` file download.
