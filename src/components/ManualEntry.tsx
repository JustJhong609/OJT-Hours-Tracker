import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import type { ManualEntryValues } from '../types';
import type { FormEvent } from 'react';

interface ManualEntryProps {
  onAddSession: (values: ManualEntryValues) => { success: boolean; message: string };
  onToast: (message: string) => void;
  inline?: boolean;
}

const today = format(new Date(), 'yyyy-MM-dd');

export const ManualEntry = ({ onAddSession, onToast, inline = false }: ManualEntryProps) => {
  const [values, setValues] = useState<ManualEntryValues>({
    date: today,
    timeIn: '08:00',
    timeOut: '17:00',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues((current) => ({ ...current, date: today }));
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = onAddSession(values);

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
    });
  };

  return (
    <section className={inline ? 'mb-6' : 'paper-panel mt-6 p-5 md:p-6'}>
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.35em] text-sepia-500">Manual entry</p>
        <h2 className="mt-1 font-heading text-2xl text-sepia-900">Add a session by hand</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
        <label className="space-y-2 text-sm text-sepia-700">
          <span>Date</span>
          <input
            type="date"
            value={values.date}
            onChange={(event) => setValues((current) => ({ ...current, date: event.target.value }))}
            className="form-field"
          />
        </label>
        <label className="space-y-2 text-sm text-sepia-700">
          <span>Time In</span>
          <input
            type="time"
            value={values.timeIn}
            onChange={(event) => setValues((current) => ({ ...current, timeIn: event.target.value }))}
            className="form-field"
          />
        </label>
        <label className="space-y-2 text-sm text-sepia-700">
          <span>Time Out</span>
          <input
            type="time"
            value={values.timeOut}
            onChange={(event) => setValues((current) => ({ ...current, timeOut: event.target.value }))}
            className="form-field"
          />
        </label>
        <motion.button
          type="submit"
          whileTap={{ scale: 0.98, y: 2 }}
          className="btn-emboss btn-emboss-large h-fit"
        >
          Add Manual Entry
        </motion.button>
        {error ? <p className="text-sm text-[#7a3f1c] md:col-span-4">{error}</p> : null}
      </form>
    </section>
  );
};