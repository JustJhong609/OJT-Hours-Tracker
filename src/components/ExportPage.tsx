import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { Session, TrackerMeta } from '../types';
import { buildTextReport, downloadExcelReport, downloadTextReport } from '../utils/exportUtils';
import { parseISO, startOfWeek, format } from 'date-fns';

interface ExportPageProps {
  sessions: Session[];
  meta: TrackerMeta;
  onToast: (message: string) => void;
}

export const ExportPage = ({ sessions, meta, onToast }: ExportPageProps) => {
  const [filterType, setFilterType] = useState<'all' | 'this_week' | 'this_month' | 'month' | 'week'>('all');
  const [filterValue, setFilterValue] = useState<string>('all');

  const sortedSessions = useMemo(() => [...sessions].sort((a, b) => new Date(b.timeInISO).getTime() - new Date(a.timeInISO).getTime()), [sessions]);

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
    if (filterType === 'month') {
      return sortedSessions.filter((s) => s.date.startsWith(filterValue));
    }
    if (filterType === 'week') {
      return sortedSessions.filter((s) => format(startOfWeek(parseISO(s.timeInISO), { weekStartsOn: 1 }), 'yyyy-MM-dd') === filterValue);
    }
    return sortedSessions;
  }, [filterType, filterValue, sortedSessions]);

  const preview = buildTextReport(filteredSessions, meta);

  const handleExcel = () => {
    downloadExcelReport(filteredSessions, meta);
    onToast('Exported!');
  };

  const handleText = () => {
    downloadTextReport(filteredSessions, meta);
    onToast('Exported!');
  };

  return (
    <section className="paper-panel p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-sepia-500">Export</p>
          <h2 className="mt-1 font-heading text-3xl text-sepia-900">Print-ready report tools</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <motion.button whileTap={{ scale: 0.98, y: 2 }} type="button" onClick={handleExcel} className="btn-emboss">
            Download as Excel (.xlsx)
          </motion.button>
          <motion.button whileTap={{ scale: 0.98, y: 2 }} type="button" onClick={handleText} className="btn-emboss">
            Download as Text Report (.txt)
          </motion.button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm text-sepia-700">Range:</label>
          <select value={filterType} onChange={(e) => { setFilterType(e.target.value as any); setFilterValue('all'); }} className="form-field">
            <option value="all">All</option>
            <option value="this_week">This week</option>
            <option value="this_month">This month</option>
            <option value="month">Specific month</option>
            <option value="week">Specific week</option>
          </select>

          {filterType === 'month' ? (
            <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)} className="form-field">
              <option value="all">Select month</option>
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  {format(new Date(`${m}-01`), 'MMMM yyyy')}
                </option>
              ))}
            </select>
          ) : null}

          {filterType === 'week' ? (
            <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)} className="form-field">
              <option value="all">Select week</option>
              {weekOptions.map((w) => (
                <option key={w} value={w}>
                  Week of {format(new Date(w), 'MMM d, yyyy')}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="paper-preview overflow-auto rounded-2xl border border-parchment-border p-4">
          <pre className="whitespace-pre-wrap font-body text-sm leading-6 text-sepia-900">{preview}</pre>
        </div>
        <div className="rounded-2xl border border-parchment-border bg-parchment-surface p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-sepia-500">Export notes</p>
          <ul className="space-y-3 text-sm leading-6 text-sepia-700">
            <li>Excel export contains a summary sheet and a session log sheet.</li>
            <li>The text report mirrors a printed DTR form with ruled separators.</li>
            <li>The preview updates immediately whenever your stored sessions change.</li>
          </ul>
        </div>
      </div>
    </section>
  );
};