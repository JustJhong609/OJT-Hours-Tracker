import { AnimatePresence, motion } from 'framer-motion';
import type { Session } from '../types';
import { formatHours } from '../utils/timeUtils';

interface SessionLogProps {
  sessions: Session[];
  onUpdateRemarks: (sessionId: string, remarks: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const SessionLog = ({ sessions, onUpdateRemarks, onDeleteSession }: SessionLogProps) => {
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.timeInISO).getTime() - new Date(a.timeInISO).getTime()
  );

  return (
    <section className="paper-panel p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-sepia-500">Session log</p>
          <h2 className="mt-1 font-heading text-3xl text-sepia-900">Logged hours and remarks</h2>
        </div>
        <p className="text-sm text-sepia-700">{sortedSessions.length.toString()} sessions stored</p>
      </div>

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