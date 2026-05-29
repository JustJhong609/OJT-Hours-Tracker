import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { TrackerMeta } from '../types';
import type { FormEvent } from 'react';

interface SettingsPageProps {
  meta: TrackerMeta;
  onSave: (meta: TrackerMeta) => void;
  onClearAll: () => void;
  onToast: (message: string) => void;
}

export const SettingsPage = ({ meta, onSave, onClearAll, onToast }: SettingsPageProps) => {
  const [form, setForm] = useState(meta);

  useEffect(() => {
    setForm(meta);
  }, [meta]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({
      ...form,
      requiredHours: Number(form.requiredHours) || 486,
    });
    onToast('Saved!');
  };

  const handleClear = () => {
    const confirmed = window.confirm('Clear all tracker data? This will remove sessions and settings.');
    if (!confirmed) {
      return;
    }

    onClearAll();
  };

  return (
    <section className="paper-panel p-5 md:p-6">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.35em] text-sepia-500">Settings</p>
        <h2 className="mt-1 font-heading text-3xl text-sepia-900">Logbook details</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-sepia-700">
          <span>Full Name</span>
          <input
            type="text"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="form-field"
          />
        </label>
        <label className="space-y-2 text-sm text-sepia-700">
          <span>School</span>
          <input
            type="text"
            value={form.school}
            onChange={(event) => setForm((current) => ({ ...current, school: event.target.value }))}
            className="form-field"
          />
        </label>
        <label className="space-y-2 text-sm text-sepia-700">
          <span>Company / Org</span>
          <input
            type="text"
            value={form.company}
            onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
            className="form-field"
          />
        </label>
        <label className="space-y-2 text-sm text-sepia-700">
          <span>Required OJT Hours</span>
          <input
            type="number"
            min="1"
            step="1"
            value={form.requiredHours}
            onChange={(event) => setForm((current) => ({ ...current, requiredHours: Number(event.target.value) }))}
            className="form-field"
          />
        </label>

        <div className="flex flex-wrap gap-3 md:col-span-2">
          <motion.button whileTap={{ scale: 0.98, y: 2 }} type="submit" className="btn-emboss">
            Save Settings
          </motion.button>
          <motion.button whileTap={{ scale: 0.98, y: 2 }} type="button" onClick={handleClear} className="btn-emboss-danger">
            Clear All Data
          </motion.button>
        </div>
      </form>
    </section>
  );
};