import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { Session, ManualEntryValues } from '../types';
import { ManualEntry } from './ManualEntry';
import { formatHours, getTotalHours } from '../utils/timeUtils';
import { parseISO, startOfWeek, format } from 'date-fns';

interface SessionLogProps {
  sessions: Session[];
  onUpdateRemarks: (sessionId: string, remarks: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onAddSession?: (values: ManualEntryValues) => { success: boolean; message: string };
  onToast?: (message: string) => void;
}

export const SessionLog = ({ sessions, onUpdateRemarks, onDeleteSession, onAddSession, onToast }: SessionLogProps) => {
  const [collapsed, setCollapsed] = useState(false);
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
    if (filterType === 'all') return sortedSessions;
    if (filterType === 'this_week') {
      const now = new Date();
      return sortedSessions.filter((s) => {
        const sessionDate = parseISO(s.timeInISO);
        return startOfWeek(sessionDate, { weekStartsOn: 1 }).getTime() === startOfWeek(now, { weekStartsOn: 1 }).getTime();
      });
    }
    if (filterType === 'this_month') {
      const now = new Date();
      return sortedSessions.filter((s) => parseISO(s.timeInISO).getMonth() === now.getMonth() && parseISO(s.timeInISO).getFullYear() === now.getFullYear());
    }
    if (filterType === 'month') {
      const month = filterValue; // yyyy-MM
      return sortedSessions.filter((s) => s.date.startsWith(month));
    }
    if (filterType === 'week') {
      const weekStart = filterValue; // yyyy-MM-dd
      return sortedSessions.filter((s) => format(startOfWeek(parseISO(s.timeInISO), { weekStartsOn: 1 }), 'yyyy-MM-dd') === weekStart);
    }

    return sortedSessions;
  }, [filterType, filterValue, sortedSessions]);

  const totalHours = useMemo(() => getTotalHours(filteredSessions), [filteredSessions]);

  return (
    <section className="paper-panel p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-sepia-500">Session log</p>
          <h2 className="mt-1 font-heading text-3xl text-sepia-900">Logged hours and remarks</h2>
          <div className="mt-2 text-sm text-sepia-700">{filteredSessions.length} sessions shown — {formatHours(totalHours)} hours</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-sepia-700">{sortedSessions.length.toString()} sessions stored</div>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="btn-ghost"
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>
      </div>

      {onAddSession ? (
        <div className="mb-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <label className="text-sm text-sepia-700">Filter:</label>
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
            <div className="text-sm text-sepia-700">Summary: {formatHours(totalHours)} hours for selected range</div>
          </div>
          {!collapsed ? (
            <ManualEntry onAddSession={onAddSession} onToast={onToast ?? (() => {})} inline />
          ) : null}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-parchment-border bg-parchment-surface">
        <div className="hidden grid-cols-[1.1fr_1fr_1fr_0.7fr_1.5fr_0.6fr] border-b border-parchment-border bg-parchment-card px-4 py-3 text-xs uppercase tracking-[0.25em] text-sepia-500 md:grid">
          <span>Date</span>
          <span>Time In</span>
          <span>Time Out</span>
          <span>Hours</span>
          <span>Remarks</span>
          <span>Delete</span>
        </div>

        <div className="divide-y divide-parchment-border">
          <AnimatePresence initial={false}>
            {sortedSessions.length === 0 ? (
              <div className="px-4 py-10 text-center text-sepia-700">No sessions logged yet.</div>
            ) : (
              sortedSessions.map((session) => (
                <motion.div
                  key={session.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className="grid gap-3 px-4 py-4 md:grid-cols-[1.1fr_1fr_1fr_0.7fr_1.5fr_0.6fr] md:items-start"
                >
                  <div className="font-bold text-sepia-900 md:font-normal">{session.date}</div>
                  <div className="text-sepia-700">{session.timeIn}</div>
                  <div className="text-sepia-700">{session.timeOut}</div>
                  <div className="font-bold text-sepia-900">{formatHours(session.hours)}</div>
                  <div>
                    <label className="sr-only" htmlFor={`remarks-${session.id}`}>
                      Remarks for {session.date}
                    </label>
                    <textarea
                      id={`remarks-${session.id}`}
                      value={session.remarks}
                      onChange={(event) => onUpdateRemarks(session.id, event.target.value)}
                      placeholder="Add remarks..."
                      className="min-h-20 w-full rounded-xl border border-parchment-border bg-parchment-page px-3 py-2 text-sm text-sepia-900 outline-none transition focus:border-parchment-emphasis"
                    />
                  </div>
                  <div className="flex md:justify-end">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98, y: 2 }}
                      onClick={() => onDeleteSession(session.id)}
                      className="btn-emboss-danger"
                    >
                      Delete
                    </motion.button>
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