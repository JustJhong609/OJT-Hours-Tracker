import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import type { Session, TrackerMeta } from '../types';
import {
  formatElapsedTime,
  getAverageHours,
  getDistinctWorkDays,
  getElapsedSeconds,
  getHoursLeft,
  getTotalHours,
  formatHours,
} from '../utils/timeUtils';

interface DashboardProps {
  sessions: Session[];
  meta: TrackerMeta;
  clockedIn: boolean;
  clockInTime: string | null;
  onClockIn: () => void;
  onClockOut: () => void;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, scale: 0.94, y: 12 }, show: { opacity: 1, scale: 1, y: 0 } };

export const Dashboard = ({ sessions, meta, clockedIn, clockInTime, onClockIn, onClockOut }: DashboardProps) => {
  const [seconds, setSeconds] = useState(() => getElapsedSeconds(clockInTime));

  useEffect(() => {
    setSeconds(getElapsedSeconds(clockInTime));

    if (!clockedIn || !clockInTime) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setSeconds(getElapsedSeconds(clockInTime));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [clockedIn, clockInTime]);

  const totalHours = getTotalHours(sessions);
  const hoursLeft = getHoursLeft(sessions, meta);
  const daysLogged = getDistinctWorkDays(sessions);
  const averageHours = getAverageHours(sessions);
  const progress = Math.min((totalHours / meta.requiredHours) * 100, 100);
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  const todayHours = sessions.filter((session) => session.date === todayDate).reduce((total, session) => total + session.hours, 0);
  const statusText = clockedIn
    ? `Today — clocked in at ${clockInTime ? format(new Date(clockInTime), 'h:mm a') : '—'}`
    : todayHours > 0
      ? `Today — ${formatHours(todayHours)} hrs logged`
      : 'Today — no hours logged yet';

  const metrics = [
    { label: 'Hours Rendered', value: formatHours(totalHours) },
    { label: 'Hours Left', value: formatHours(hoursLeft) },
    { label: 'Days Logged', value: daysLogged.toString() },
    { label: 'Avg per Day', value: formatHours(averageHours) },
  ];

  return (
    <section className="space-y-6">
      <div className="paper-panel p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-sepia-500">Dashboard</p>
            <h2 className="mt-1 font-heading text-3xl text-sepia-900">Hours at a glance</h2>
            <p className="mt-2 text-sm text-sepia-700">{statusText}</p>
          </div>
          <div className="rounded-2xl border border-parchment-border bg-parchment-surface px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.3em] text-sepia-500">Live Timer</p>
            <AnimatePresence mode="wait">
              <motion.span
                key={seconds}
                initial={{ y: -4, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 4, opacity: 0 }}
                className="mt-1 block font-body text-2xl tracking-[0.2em] text-sepia-900"
              >
                {formatElapsedTime(seconds)}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <motion.div key={metric.label} variants={item} className="metric-card">
              <p className="text-xs uppercase tracking-[0.28em] text-sepia-500">{metric.label}</p>
              <p className="mt-3 font-heading text-3xl text-sepia-900">{metric.value}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-6 rounded-2xl border border-parchment-border bg-parchment-surface p-4">
          <div className="mb-2 flex items-center justify-between text-sm text-sepia-700">
            <span>Progress toward required hours</span>
            <span>{progress.toFixed(2)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-parchment-card">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 70, damping: 18 }}
              className="h-full rounded-full bg-sage"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4">
          <motion.button
            key={clockedIn ? 'clocked-in' : 'clocked-out'}
            type="button"
            whileTap={{ scale: 0.98, y: 2 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            onClick={clockedIn ? onClockOut : onClockIn}
            className={clockedIn ? 'btn-emboss-danger btn-emboss-large' : 'btn-emboss btn-emboss-large'}
          >
            {clockedIn ? 'Clock Out' : 'Clock In'}
          </motion.button>
          <p className="max-w-2xl text-center text-sm leading-6 text-sepia-700">
            {clockedIn
              ? 'Your clock-in time is being tracked locally and will continue counting until you clock out.'
              : 'Clock in to begin a live session. Your progress and log entries are saved in this browser only.'}
          </p>
        </div>
      </div>
    </section>
  );
};