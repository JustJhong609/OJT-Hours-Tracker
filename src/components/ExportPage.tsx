import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Session, TrackerMeta } from '../types';
import { ExportModal } from './ExportModal';
import { formatHours, getTotalHours } from '../utils/timeUtils';

interface ExportPageProps {
  sessions: Session[];
  meta: TrackerMeta;
  onToast: (message: string) => void;
}

export const ExportPage = ({ sessions, meta, onToast }: ExportPageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const totalHours = getTotalHours(sessions);

  return (
    <section className="space-y-6">
      <div className="modern-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
              DTR Export
            </span>
            <h2 className="font-heading text-2xl font-extrabold text-[var(--color-text)]">
              Export Daily Time Record
            </h2>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Generate customizable Excel (.xlsx) spreadsheets for official university or company submission.
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn-primary text-sm font-bold py-3 px-6 shadow-glow"
          >
            📊 Export to Excel (.xlsx)
          </motion.button>
        </div>

        {/* Overview Stats & Instructions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface2)] p-5 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
              Total Logged Sessions
            </span>
            <p className="font-heading text-3xl font-extrabold text-[var(--color-text)]">
              {sessions.length} Shifts
            </p>
            <p className="text-xs text-[var(--color-muted)]">
              Total Rendered: {formatHours(totalHours)} Hours
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface2)] p-5 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
              Customizable Checklist
            </span>
            <p className="text-xs text-[var(--color-text)] leading-relaxed">
              Clicking <strong>Export to Excel</strong> allows you to preview your spreadsheet live, filter custom date ranges, and select which sections to include.
            </p>
          </div>
        </div>
      </div>

      <ExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sessions={sessions}
        meta={meta}
        onToast={onToast}
      />
    </section>
  );
};