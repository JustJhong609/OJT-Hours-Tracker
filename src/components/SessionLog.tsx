import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { Session } from '../types';
import { formatHours, getTotalHours } from '../utils/timeUtils';
import { parseISO, startOfWeek, format } from 'date-fns';

interface SessionLogProps {
  sessions: Session[];
  onUpdateRemarks: (sessionId: string, remarks: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const SessionLog = ({ sessions, onUpdateRemarks, onDeleteSession }: SessionLogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'this_week' | 'this_month' | 'month' | 'week'>('all');
  const [filterValue, setFilterValue] = useState<string>('all');

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => new Date(b.timeInISO).getTime() - new Date(a.timeInISO).getTime());
  }, [sessions]);

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
    let result = sortedSessions;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) => s.date.toLowerCase().includes(q) || s.remarks.toLowerCase().includes(q) || s.timeIn.toLowerCase().includes(q)
      );
    }

    if (filterType === 'this_week') {
      const now = new Date();
      result = result.filter((s) => {
        const sessionDate = parseISO(s.timeInISO);
        return startOfWeek(sessionDate, { weekStartsOn: 1 }).getTime() === startOfWeek(now, { weekStartsOn: 1 }).getTime();
      });
    } else if (filterType === 'this_month') {
      const now = new Date();
      result = result.filter((s) => parseISO(s.timeInISO).getMonth() === now.getMonth() && parseISO(s.timeInISO).getFullYear() === now.getFullYear());
    } else if (filterType === 'month' && filterValue !== 'all') {
      result = result.filter((s) => s.date.startsWith(filterValue));
    } else if (filterType === 'week' && filterValue !== 'all') {
      result = result.filter((s) => format(startOfWeek(parseISO(s.timeInISO), { weekStartsOn: 1 }), 'yyyy-MM-dd') === filterValue);
    }

    return result;
  }, [filterType, filterValue, searchQuery, sortedSessions]);

  const totalHours = useMemo(() => getTotalHours(filteredSessions), [filteredSessions]);

  return (
    <section className="space-y-6">
      <div className="modern-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Session Log</span>
            <h2 className="font-heading text-2xl font-extrabold text-[var(--text-primary)]">Training Session History</h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Showing {filteredSessions.length} of {sessions.length} sessions • Total: {formatHours(totalHours)} hours
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 sm:flex-none">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search remarks or dates..."
                className="modern-input pl-9 text-xs py-2.5"
              />
            </div>

            {/* Filter Dropdown */}
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as 'all' | 'this_week' | 'this_month' | 'month' | 'week');
                setFilterValue('all');
              }}
              className="modern-input text-xs py-2.5 w-auto"
            >
              <option value="all">All Sessions</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="month">By Month</option>
              <option value="week">By Week</option>
            </select>

            {filterType === 'month' && (
              <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)} className="modern-input text-xs py-2.5 w-auto">
                <option value="all">Select Month</option>
                {monthOptions.map((m) => (
                  <option key={m} value={m}>
                    {format(new Date(`${m}-01`), 'MMMM yyyy')}
                  </option>
                ))}
              </select>
            )}

            {filterType === 'week' && (
              <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)} className="modern-input text-xs py-2.5 w-auto">
                <option value="all">Select Week</option>
                {weekOptions.map((w) => (
                  <option key={w} value={w}>
                    Week of {format(new Date(w), 'MMM d, yyyy')}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Sessions Feed */}
        <div className="mt-6 space-y-3">
          <AnimatePresence initial={false}>
            {filteredSessions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border-color)] p-8 text-center text-sm text-[var(--text-secondary)]">
                No session entries found.
              </div>
            ) : (
              filteredSessions.map((session) => (
                <motion.div
                  key={session.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="modern-card p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:border-indigo-500/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">
                      {session.hours}h
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-bold text-base text-[var(--text-primary)]">
                          {session.date}
                        </span>
                        {session.breakMinutes && session.breakMinutes > 0 ? (
                          <span className="rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 text-[10px] font-bold">
                            -1h Lunch Break
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] font-medium">
                        🕒 {session.timeIn} → {session.timeOut}
                      </p>
                      <input
                        type="text"
                        value={session.remarks}
                        onChange={(e) => onUpdateRemarks(session.id, e.target.value)}
                        placeholder="Add shift remarks/tasks performed..."
                        className="modern-input text-xs py-1.5 px-3 mt-1.5 max-w-md"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end sm:flex-col sm:items-end gap-2 border-t border-[var(--border-color)] pt-3 sm:border-0 sm:pt-0">
                    <span className="font-heading font-extrabold text-lg text-indigo-600 dark:text-indigo-400">
                      {formatHours(session.hours)} hrs
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete session log for ${session.date}?`)) {
                          onDeleteSession(session.id);
                        }
                      }}
                      className="btn-danger py-1.5 px-3 text-xs min-h-[36px]"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};