import { AnimatePresence, motion } from 'framer-motion';
import { format, addDays } from 'date-fns';
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
  onSaveMeta: (meta: Partial<TrackerMeta>) => void;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, scale: 0.95, y: 12 }, show: { opacity: 1, scale: 1, y: 0 } };

export const Dashboard = ({
  sessions,
  meta,
  clockedIn,
  clockInTime,
  onClockIn,
  onClockOut,
  onSaveMeta,
}: DashboardProps) => {
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
  const progressPercent = Math.min((totalHours / meta.requiredHours) * 100, 100);

  // Projected Completion Date calculation
  const estimatedDaysRemaining = averageHours > 0 ? Math.ceil(hoursLeft / averageHours) : 0;
  const projectedCompletionDate = estimatedDaysRemaining > 0 ? format(addDays(new Date(), estimatedDaysRemaining), 'MMM d, yyyy') : 'Complete!';

  const todayDate = format(new Date(), 'yyyy-MM-dd');
  const todayHours = sessions
    .filter((session) => session.date === todayDate)
    .reduce((total, session) => total + session.hours, 0);

  // SVG Circular Progress Ring parameters
  const ringRadius = 70;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference - (progressPercent / 100) * ringCircumference;

  const metrics = [
    { label: 'Total Hours', value: formatHours(totalHours), icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Hours Remaining', value: formatHours(hoursLeft), icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { label: 'Days Logged', value: daysLogged.toString(), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { label: 'Daily Average', value: `${formatHours(averageHours)} hrs`, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  return (
    <section className="space-y-6">
      {/* Hero Header & Clock Card */}
      <div className="modern-card p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col items-center text-center lg:flex-row lg:text-left lg:gap-8">
            {/* SVG Circular Progress Ring */}
            <div className="relative flex items-center justify-center">
              <svg className="h-44 w-44 transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r={ringRadius}
                  className="stroke-[var(--border-color)] fill-none stroke-[10]"
                />
                <circle
                  cx="88"
                  cy="88"
                  r={ringRadius}
                  className="stroke-indigo-600 dark:stroke-indigo-500 fill-none stroke-[10] transition-all duration-1000 ease-out"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-heading text-3xl font-extrabold text-[var(--text-primary)]">
                  {progressPercent.toFixed(1)}%
                </span>
                <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Completed
                </span>
              </div>
            </div>

            <div className="space-y-2 mt-4 lg:mt-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {meta.name ? meta.name : 'Trainee Profile'} • {meta.company ? meta.company : 'OJT Tracker'}
              </span>
              <h2 className="font-heading text-3xl font-extrabold text-[var(--text-primary)] md:text-4xl">
                {formatHours(totalHours)} / {meta.requiredHours} Hours
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                {clockedIn
                  ? `Active Shift started at ${clockInTime ? format(new Date(clockInTime), 'h:mm a') : '—'}`
                  : todayHours > 0
                    ? `Logged ${formatHours(todayHours)} hours today`
                    : 'Ready to log your training session today'}
              </p>
            </div>
          </div>

          {/* Clock In/Out Live Control Widget */}
          <div className="flex flex-col items-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] p-6 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
              {clockedIn ? 'Shift Elapsed Time' : 'Live Clock Action'}
            </span>

            <AnimatePresence mode="wait">
              <motion.span
                key={seconds}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className={`mt-2 font-mono text-3xl font-extrabold tracking-widest ${
                  clockedIn ? 'text-emerald-600 dark:text-emerald-400 animate-pulse' : 'text-[var(--text-primary)]'
                }`}
              >
                {formatElapsedTime(seconds)}
              </motion.span>
            </AnimatePresence>

            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={clockedIn ? onClockOut : onClockIn}
              className={`mt-5 w-full btn-primary text-base font-bold py-3.5 shadow-glow touch-target ${
                clockedIn ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {clockedIn ? 'Clock Out Shift' : 'Clock In Now'}
            </motion.button>

            {/* Auto Break Calculation Toggle */}
            <div className="mt-4 flex items-center gap-2">
              <input
                id="autoBreakCheck"
                type="checkbox"
                checked={meta.autoBreak ?? true}
                onChange={(e) => onSaveMeta({ autoBreak: e.target.checked })}
                className="h-4 w-4 rounded border-[var(--border-color)] text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="autoBreakCheck" className="text-xs text-[var(--text-secondary)] font-medium cursor-pointer">
                Auto 1hr lunch break deduction (shifts ≥ 5h)
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <motion.div key={metric.label} variants={item} className="modern-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                {metric.label}
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={metric.icon} />
                </svg>
              </div>
            </div>
            <p className="mt-4 font-heading text-3xl font-extrabold text-[var(--text-primary)]">{metric.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Estimated Completion Projection Card */}
      <div className="modern-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold">
            🎯
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-[var(--text-primary)]">Projected Target Completion</h3>
            <p className="text-xs text-[var(--text-secondary)]">Based on your daily average of {formatHours(averageHours)} hours</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Estimated Finish Date</span>
          <p className="font-heading text-xl font-extrabold text-indigo-600 dark:text-indigo-400">{projectedCompletionDate}</p>
        </div>
      </div>
    </section>
  );
};