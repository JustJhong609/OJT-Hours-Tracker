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
    onToast('Excel DTR Report downloaded!');
  };

  const handleText = () => {
    downloadTextReport(filteredSessions, meta);
    onToast('Text DTR Report downloaded!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="space-y-6">
      <div className="modern-card p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">DTR Export</span>
            <h2 className="font-heading text-2xl font-extrabold text-[var(--text-primary)]">Export & Print DTR Reports</h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">Generate official Daily Time Records for university or company submission.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={handleExcel} className="btn-primary text-xs py-2.5 shadow-glow">
              📊 Export Excel (.xlsx)
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={handleText} className="btn-secondary text-xs py-2.5">
              📝 Download Text (.txt)
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={handlePrint} className="btn-secondary text-xs py-2.5">
              🖨️ Print DTR
            </motion.button>
          </div>
        </div>

        {/* Range Filter */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[var(--border-color)] pt-4">
          <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Report Range:</label>
          <select value={filterType} onChange={(e) => { setFilterType(e.target.value as 'all' | 'this_week' | 'this_month' | 'month' | 'week'); setFilterValue('all'); }} className="modern-input text-xs py-2 w-auto">
            <option value="all">All Sessions</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="month">Specific Month</option>
            <option value="week">Specific Week</option>
          </select>

          {filterType === 'month' && (
            <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)} className="modern-input text-xs py-2 w-auto">
              <option value="all">Select Month</option>
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  {format(new Date(`${m}-01`), 'MMMM yyyy')}
                </option>
              ))}
            </select>
          )}

          {filterType === 'week' && (
            <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)} className="modern-input text-xs py-2 w-auto">
              <option value="all">Select Week</option>
              {weekOptions.map((w) => (
                <option key={w} value={w}>
                  Week of {format(new Date(w), 'MMM d, yyyy')}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* DTR Preview */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] p-5 overflow-x-auto shadow-inner">
            <pre className="font-mono text-xs leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap">{preview}</pre>
          </div>

          <div className="modern-card p-6 space-y-4">
            <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">Export & Verification Info</h3>
            <ul className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">✓</span>
                <span><strong>Excel Export (.xlsx):</strong> Generates formatted sheets with full session timestamps, remarks, and calculated total hours.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">✓</span>
                <span><strong>Printable DTR:</strong> Formatted layout containing Student Name, Company/Agency, Supervisor line, and total hours summary.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">✓</span>
                <span><strong>Real-time Live Sync:</strong> Previews automatically reflect all recent session logs and remarks.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};