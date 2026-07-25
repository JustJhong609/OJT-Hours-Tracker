# Export Preview & Selection Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace legacy text report / print controls with an interactive Export Preview & Selection Modal allowing users to customize and preview Excel spreadsheet downloads.

**Architecture:** Create an `ExportModal` component with a split view (left: checklist & range filters; right: real-time live preview table) and update `exportUtils.ts` to build customized SheetJS `.xlsx` files based on the active checklist state.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Framer Motion, SheetJS (`xlsx`), date-fns.

## Global Constraints

- Must remove "Print DTR" and "Download Text (.txt)" buttons from `ExportPage.tsx`.
- Must include checkboxes for Trainee Profile Summary, Remarks Column, Break Minutes Column, and Totals Summary Row.
- Must render a live preview table matching the selected export columns and filtered date range.
- Strict type-safety with `tsc -b` and zero ESLint errors with `npm run lint`.

---

### Task 1: Update Export Utilities (`src/utils/exportUtils.ts`)

**Files:**
- Modify: `src/utils/exportUtils.ts`

**Interfaces:**
- Consumes: `Session`, `TrackerMeta` from `src/types/index.ts`
- Produces: `ExportOptions` interface and updated `downloadExcelReport(sessions, meta, options)` function.

- [ ] **Step 1: Define ExportOptions interface in exportUtils.ts**

```typescript
export interface ExportOptions {
  includeProfile: boolean;
  includeRemarks: boolean;
  includeBreaks: boolean;
  includeSummaryTotals: boolean;
}
```

- [ ] **Step 2: Update downloadExcelReport function to respect ExportOptions**

```typescript
export const downloadExcelReport = (
  sessions: Session[],
  meta: TrackerMeta,
  options: ExportOptions = {
    includeProfile: true,
    includeRemarks: true,
    includeBreaks: true,
    includeSummaryTotals: true,
  }
): void => {
  const wb = utils.book_new();

  // 1. Summary Sheet
  if (options.includeProfile) {
    const totalHours = getTotalHours(sessions);
    const summaryRows: Array<Array<string | number>> = [
      ['OJT Logbook Summary'],
      ['Name', meta.name || ''],
      ['School', meta.school || ''],
      ['Company', meta.company || ''],
      ['Supervisor', meta.supervisor || ''],
      ['Required Hours', formatHours(meta.requiredHours)],
      ['Total Hours Rendered', formatHours(totalHours)],
    ];
    const summaryWs = utils.aoa_to_sheet(summaryRows);
    utils.book_append_sheet(wb, summaryWs, 'Summary');
  }

  // 2. Session Logs Sheet
  const headerRow: string[] = ['Date', 'Time In', 'Time Out', 'Hours'];
  if (options.includeBreaks) headerRow.push('Break (mins)');
  if (options.includeRemarks) headerRow.push('Remarks');

  const logRows: Array<Array<string | number>> = [headerRow];

  sessions.forEach((s) => {
    const row: Array<string | number> = [s.date, s.timeIn, s.timeOut, s.hours];
    if (options.includeBreaks) row.push(s.breakMinutes ?? 0);
    if (options.includeRemarks) row.push(s.remarks || '');
    logRows.push(row);
  });

  if (options.includeSummaryTotals) {
    const totalHours = getTotalHours(sessions);
    const totalRow: Array<string | number> = ['TOTAL', '', '', Number(totalHours.toFixed(2))];
    if (options.includeBreaks) totalRow.push('');
    if (options.includeRemarks) totalRow.push('');
    logRows.push([]);
    logRows.push(totalRow);
  }

  const logsWs = utils.aoa_to_sheet(logRows);
  utils.book_append_sheet(wb, logsWs, 'Session Logs');

  writeFile(wb, `ojt-logbook-export-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};
```

- [ ] **Step 3: Run linter and build check**

Run: `npm run lint && npm run build`
Expected: Exit code 0 with zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/utils/exportUtils.ts
git commit -m "feat: add ExportOptions support to downloadExcelReport"
```

---

### Task 2: Build Export Preview & Selection Modal (`src/components/ExportModal.tsx`)

**Files:**
- Create: `src/components/ExportModal.tsx`

**Interfaces:**
- Consumes: `Session`, `TrackerMeta` from `src/types/index.ts`, `ExportOptions`, `downloadExcelReport` from `src/utils/exportUtils.ts`
- Produces: `ExportModal` component for customizing date range and checklist options before download.

- [ ] **Step 1: Create ExportModal component**

```tsx
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseISO, startOfWeek, format } from 'date-fns';
import type { Session, TrackerMeta } from '../types';
import { downloadExcelReport, type ExportOptions } from '../utils/exportUtils';
import { formatHours, getTotalHours } from '../utils/timeUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: Session[];
  meta: TrackerMeta;
  onToast: (msg: string) => void;
}

export const ExportModal = ({ isOpen, onClose, sessions, meta, onToast }: ExportModalProps) => {
  const [filterType, setFilterType] = useState<'all' | 'this_week' | 'this_month' | 'month' | 'week'>('all');
  const [filterValue, setFilterValue] = useState<string>('all');

  const [options, setOptions] = useState<ExportOptions>({
    includeProfile: true,
    includeRemarks: true,
    includeBreaks: true,
    includeSummaryTotals: true,
  });

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => new Date(b.timeInISO).getTime() - new Date(a.timeInISO).getTime()),
    [sessions]
  );

  const monthOptions = useMemo(() => {
    const months = new Set(sortedSessions.map((s) => s.date.slice(0, 7)));
    return Array.from(months).sort((a, b) => (a < b ? 1 : -1));
  }, [sortedSessions]);

  const weekOptions = useMemo(() => {
    const weeks = new Set(
      sortedSessions.map((s) => format(startOfWeek(parseISO(s.timeInISO), { weekStartsOn: 1 }), 'yyyy-MM-dd'))
    );
    return Array.from(weeks).sort((a, b) => (a < b ? 1 : -1));
  }, [sortedSessions]);

  const filteredSessions = useMemo(() => {
    if (filterType === 'all') return sortedSessions;
    if (filterType === 'this_week') {
      const now = new Date();
      return sortedSessions.filter((s) => startOfWeek(parseISO(s.timeInISO), { weekStartsOn: 1 }).getTime() === startOfWeek(now, { weekStartsOn: 1 }).getTime());
    }
    if (filterType === 'this_month') {
      const now = new Date();
      return sortedSessions.filter((s) => parseISO(s.timeInISO).getMonth() === now.getMonth() && parseISO(s.timeInISO).getFullYear() === now.getFullYear());
    }
    if (filterType === 'month' && filterValue !== 'all') {
      return sortedSessions.filter((s) => s.date.startsWith(filterValue));
    }
    if (filterType === 'week' && filterValue !== 'all') {
      return sortedSessions.filter((s) => format(startOfWeek(parseISO(s.timeInISO), { weekStartsOn: 1 }), 'yyyy-MM-dd') === filterValue);
    }
    return sortedSessions;
  }, [filterType, filterValue, sortedSessions]);

  const totalHours = useMemo(() => getTotalHours(filteredSessions), [filteredSessions]);

  if (!isOpen) return null;

  const handleDownload = () => {
    downloadExcelReport(filteredSessions, meta, options);
    onToast('Excel DTR Report downloaded successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="modern-card w-full max-w-4xl p-6 space-y-6 max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <div>
            <h2 className="font-heading text-xl font-extrabold text-[var(--color-text)]">
              📊 Export to Excel (.xlsx) Preview & Options
            </h2>
            <p className="text-xs text-[var(--color-muted)]">
              Customize inclusion checklist and inspect live spreadsheet preview before downloading.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-muted)] hover:text-[var(--color-text)] text-lg"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_1.3fr] flex-1 overflow-hidden min-h-0">
          {/* Left Checklist & Filters Panel */}
          <div className="space-y-4 overflow-y-auto pr-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-[var(--color-muted)] block">
                Report Date Range
              </label>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as any);
                  setFilterValue('all');
                }}
                className="modern-input text-xs"
              >
                <option value="all">All Sessions ({sessions.length})</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="month">Specific Month</option>
                <option value="week">Specific Week</option>
              </select>

              {filterType === 'month' && (
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="modern-input text-xs mt-2"
                >
                  <option value="all">Select Month</option>
                  {monthOptions.map((m) => (
                    <option key={m} value={m}>
                      {format(new Date(`${m}-01`), 'MMMM yyyy')}
                    </option>
                  ))}
                </select>
              )}

              {filterType === 'week' && (
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="modern-input text-xs mt-2"
                >
                  <option value="all">Select Week</option>
                  {weekOptions.map((w) => (
                    <option key={w} value={w}>
                      Week of {format(new Date(w), 'MMM d, yyyy')}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
              <span className="text-xs font-bold uppercase text-[var(--color-muted)] block">
                Inclusion Checklist
              </span>

              <label className="flex items-center gap-2.5 text-xs text-[var(--color-text)] font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeProfile}
                  onChange={(e) => setOptions((curr) => ({ ...curr, includeProfile: e.target.checked }))}
                  className="h-4 w-4 rounded border-[var(--color-border)] text-indigo-600 focus:ring-indigo-500"
                />
                <span>Include Trainee Profile Summary</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-[var(--color-text)] font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeBreaks}
                  onChange={(e) => setOptions((curr) => ({ ...curr, includeBreaks: e.target.checked }))}
                  className="h-4 w-4 rounded border-[var(--color-border)] text-indigo-600 focus:ring-indigo-500"
                />
                <span>Include Break Minutes Column</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-[var(--color-text)] font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeRemarks}
                  onChange={(e) => setOptions((curr) => ({ ...curr, includeRemarks: e.target.checked }))}
                  className="h-4 w-4 rounded border-[var(--color-border)] text-indigo-600 focus:ring-indigo-500"
                />
                <span>Include Shift Remarks Column</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-[var(--color-text)] font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeSummaryTotals}
                  onChange={(e) => setOptions((curr) => ({ ...curr, includeSummaryTotals: e.target.checked }))}
                  className="h-4 w-4 rounded border-[var(--color-border)] text-indigo-600 focus:ring-indigo-500"
                />
                <span>Include Totals Row at Bottom</span>
              </label>
            </div>
          </div>

          {/* Right Live Sheet Table Preview Panel */}
          <div className="flex flex-col space-y-2 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface2)] p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
              Live Excel Spreadsheet Preview ({filteredSessions.length} rows)
            </span>

            <div className="flex-1 overflow-auto border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] p-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                    <th className="p-2">Date</th>
                    <th className="p-2">Time In</th>
                    <th className="p-2">Time Out</th>
                    <th className="p-2">Hours</th>
                    {options.includeBreaks && <th className="p-2">Break (m)</th>}
                    {options.includeRemarks && <th className="p-2">Remarks</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {filteredSessions.map((s) => (
                    <tr key={s.id}>
                      <td className="p-2 font-mono">{s.date}</td>
                      <td className="p-2 font-mono">{s.timeIn}</td>
                      <td className="p-2 font-mono">{s.timeOut}</td>
                      <td className="p-2 font-bold text-[var(--color-accent)]">{s.hours}h</td>
                      {options.includeBreaks && <td className="p-2 text-[var(--color-muted)]">{s.breakMinutes ?? 0}m</td>}
                      {options.includeRemarks && <td className="p-2 truncate max-w-[120px]">{s.remarks || '—'}</td>}
                    </tr>
                  ))}
                  {options.includeSummaryTotals && (
                    <tr className="font-bold border-t-2 border-[var(--color-border)] bg-[var(--color-surface2)]">
                      <td className="p-2">TOTAL</td>
                      <td className="p-2">—</td>
                      <td className="p-2">—</td>
                      <td className="p-2 text-[var(--color-accent)]">{formatHours(totalHours)} hrs</td>
                      {options.includeBreaks && <td className="p-2">—</td>}
                      {options.includeRemarks && <td className="p-2">—</td>}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border)] pt-4">
          <button type="button" onClick={onClose} className="btn-secondary text-xs py-2.5 px-4">
            Cancel
          </button>
          <button type="button" onClick={handleDownload} className="btn-primary text-xs font-bold py-2.5 px-6 shadow-glow">
            Confirm & Download Excel (.xlsx)
          </button>
        </div>
      </motion.div>
    </div>
  );
};
```

- [ ] **Step 2: Run linter and build check**

Run: `npm run lint && npm run build`
Expected: Exit code 0 with zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ExportModal.tsx
git commit -m "feat: create ExportModal component with checklist and live preview"
```

---

### Task 3: Simplify ExportPage & Integrate ExportModal (`src/components/ExportPage.tsx`)

**Files:**
- Modify: `src/components/ExportPage.tsx`

**Interfaces:**
- Consumes: `ExportModal` component, `Session`, `TrackerMeta` from `src/types/index.ts`
- Produces: Simplified `ExportPage` with single Export button launching `ExportModal`.

- [ ] **Step 1: Update ExportPage.tsx to use ExportModal and remove legacy buttons**

```tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Session, TrackerMeta } from '../types';
import { ExportModal } from './ExportModal';
import { formatHours, getTotalHours } from '../utils/timeUtils';

interface ExportPageProps {
  sessions: Session[];
  meta: TrackerMeta;
  onToast: (message: string) => void;
}

export const ExportPage = ({ sessions, meta, onToast }: ExportPageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const totalHours = getTotalHours(sessions);

  return (
    <section className="space-y-6">
      <div className="modern-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
              DTR Export
            </span>
            <h2 className="font-heading text-2xl font-extrabold text-[var(--color-text)]">
              Export Daily Time Record
            </h2>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Generate customizable Excel (.xlsx) spreadsheets for official university or company submission.
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn-primary text-sm font-bold py-3 px-6 shadow-glow"
          >
            📊 Export to Excel (.xlsx)
          </motion.button>
        </div>

        {/* Overview Stats & Instructions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface2)] p-5 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
              Total Logged Sessions
            </span>
            <p className="font-heading text-3xl font-extrabold text-[var(--color-text)]">
              {sessions.length} Shifts
            </p>
            <p className="text-xs text-[var(--color-muted)]">
              Total Rendered: {formatHours(totalHours)} Hours
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface2)] p-5 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
              Customizable Checklist
            </span>
            <p className="text-xs text-[var(--color-text)] leading-relaxed">
              Clicking <strong>Export to Excel</strong> allows you to preview your spreadsheet live, filter custom date ranges, and select which sections to include.
            </p>
          </div>
        </div>
      </div>

      <ExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sessions={sessions}
        meta={meta}
        onToast={onToast}
      />
    </section>
  );
};
```

- [ ] **Step 2: Run linter and build check**

Run: `npm run lint && npm run build`
Expected: Exit code 0 with zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ExportPage.tsx
git commit -m "feat: simplify ExportPage and integrate ExportModal"
```
