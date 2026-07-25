import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import type { ManualEntryValues } from '../types';
import type { FormEvent } from 'react';

interface ManualEntryProps {
  onAddSession: (values: ManualEntryValues) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  onToast: (message: string) => void;
  inline?: boolean;
}

const today = format(new Date(), 'yyyy-MM-dd');

const presets = [
  { label: 'Full Shift (8am - 5pm)', timeIn: '08:00', timeOut: '17:00', breakMinutes: 60 },
  { label: 'Morning Shift (8am - 12pm)', timeIn: '08:00', timeOut: '12:00', breakMinutes: 0 },
  { label: 'Afternoon Shift (1pm - 5pm)', timeIn: '13:00', timeOut: '17:00', breakMinutes: 0 },
];

export const ManualEntry = ({ onAddSession, onToast, inline = false }: ManualEntryProps) => {
  const [values, setValues] = useState<ManualEntryValues>({
    date: today,
    timeIn: '08:00',
    timeOut: '17:00',
    remarks: '',
    breakMinutes: 60,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues((current) => ({ ...current, date: today }));
  }, []);

  const applyPreset = (preset: typeof presets[0]) => {
    setValues((current) => ({
      ...current,
      timeIn: preset.timeIn,
      timeOut: preset.timeOut,
      breakMinutes: preset.breakMinutes,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await onAddSession(values);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setError(null);
    onToast(result.message);
    setValues({
      date: today,
      timeIn: '08:00',
      timeOut: '17:00',
      remarks: '',
      breakMinutes: 60,
    });
  };

  return (
    <section className={inline ? 'mb-6' : 'modern-card p-6 md:p-8 space-y-6'}>
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Manual Entry</span>
        <h2 className="font-heading text-2xl font-extrabold text-[var(--text-primary)]">Log Past Session</h2>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">Backfill OJT hours or correct missed shift logs easily.</p>
      </div>

      {/* Shift Presets */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => applyPreset(preset)}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:border-indigo-500 hover:bg-indigo-500/5"
          >
            ⚡ {preset.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1.5 text-xs font-bold text-[var(--text-secondary)] uppercase">
            <span>Date</span>
            <input
              type="date"
              value={values.date}
              onChange={(event) => setValues((current) => ({ ...current, date: event.target.value }))}
              className="modern-input"
              required
            />
          </label>

          <label className="space-y-1.5 text-xs font-bold text-[var(--text-secondary)] uppercase">
            <span>Time In</span>
            <input
              type="time"
              value={values.timeIn}
              onChange={(event) => setValues((current) => ({ ...current, timeIn: event.target.value }))}
              className="modern-input"
              required
            />
          </label>

          <label className="space-y-1.5 text-xs font-bold text-[var(--text-secondary)] uppercase">
            <span>Time Out</span>
            <input
              type="time"
              value={values.timeOut}
              onChange={(event) => setValues((current) => ({ ...current, timeOut: event.target.value }))}
              className="modern-input"
              required
            />
          </label>

          <label className="space-y-1.5 text-xs font-bold text-[var(--text-secondary)] uppercase">
            <span>Break Duration</span>
            <select
              value={values.breakMinutes ?? 0}
              onChange={(event) => setValues((current) => ({ ...current, breakMinutes: Number(event.target.value) }))}
              className="modern-input"
            >
              <option value={0}>No Break (0 mins)</option>
              <option value={30}>30 mins Break</option>
              <option value={60}>1 Hour Break</option>
              <option value={90}>1.5 Hours Break</option>
            </select>
          </label>
        </div>

        <label className="block space-y-1.5 text-xs font-bold text-[var(--text-secondary)] uppercase">
          <span>Remarks / Tasks Performed (Optional)</span>
          <input
            type="text"
            value={values.remarks ?? ''}
            onChange={(event) => setValues((current) => ({ ...current, remarks: event.target.value }))}
            placeholder="e.g., Developed API endpoints, attended team standup..."
            className="modern-input"
          />
        </label>

        {error ? <p className="text-sm font-semibold text-rose-500">{error}</p> : null}

        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          className="btn-primary w-full sm:w-auto text-sm font-bold shadow-glow"
        >
          Add Manual Session
        </motion.button>
      </form>
    </section>
  );
};