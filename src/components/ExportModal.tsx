import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { parseISO, startOfWeek, format } from 'date-fns';
import type { Session, TrackerMeta } from '../types';
import { downloadExcelReport, getAmPmBreakdown, type ExportOptions } from '../utils/exportUtils';
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
        className="modern-card w-full max-w-5xl p-6 space-y-6 max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <div>
            <h2 className="font-heading text-xl font-extrabold text-[var(--color-text)]">
              📊 Export to Excel (.xlsx) Preview & Options
            </h2>
            <p className="text-xs text-[var(--color-muted)]">
              Includes Morning (AM) & Afternoon (PM) Time In / Time Out columns.
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

        <div className="grid gap-6 md:grid-cols-[280px_1fr] flex-1 overflow-hidden min-h-0">
          {/* Left Checklist & Filters Panel */}
          <div className="space-y-4 overflow-y-auto pr-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-[var(--color-muted)] block">
                Report Date Range
              </label>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as 'all' | 'this_week' | 'this_month' | 'month' | 'week');
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
              Live Spreadsheet Preview ({filteredSessions.length} rows)
            </span>

            <div className="flex-1 overflow-auto border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] p-2">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                    <th className="p-2">Date</th>
                    <th className="p-2">AM In</th>
                    <th className="p-2">AM Out</th>
                    <th className="p-2">PM In</th>
                    <th className="p-2">PM Out</th>
                    <th className="p-2">Hours</th>
                    {options.includeBreaks && <th className="p-2">Break</th>}
                    {options.includeRemarks && <th className="p-2">Remarks</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {filteredSessions.map((s) => {
                    const amPm = getAmPmBreakdown(s);
                    return (
                      <tr key={s.id}>
                        <td className="p-2 font-mono">{s.date}</td>
                        <td className="p-2 font-mono">{amPm.amIn}</td>
                        <td className="p-2 font-mono">{amPm.amOut}</td>
                        <td className="p-2 font-mono">{amPm.pmIn}</td>
                        <td className="p-2 font-mono">{amPm.pmOut}</td>
                        <td className="p-2 font-bold text-[var(--color-accent)]">{s.hours}h</td>
                        {options.includeBreaks && <td className="p-2 text-[var(--color-muted)]">{s.breakMinutes ?? 0}m</td>}
                        {options.includeRemarks && <td className="p-2 truncate max-w-[120px]">{s.remarks || '—'}</td>}
                      </tr>
                    );
                  })}
                  {options.includeSummaryTotals && (
                    <tr className="font-bold border-t-2 border-[var(--color-border)] bg-[var(--color-surface2)]">
                      <td className="p-2">TOTAL</td>
                      <td className="p-2">—</td>
                      <td className="p-2">—</td>
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
