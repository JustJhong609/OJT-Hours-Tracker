import { motion } from 'framer-motion';
import type { Session, TrackerMeta } from '../types';
import { buildTextReport, downloadExcelReport, downloadTextReport } from '../utils/exportUtils';

interface ExportPageProps {
  sessions: Session[];
  meta: TrackerMeta;
  onToast: (message: string) => void;
}

export const ExportPage = ({ sessions, meta, onToast }: ExportPageProps) => {
  const preview = buildTextReport(sessions, meta);

  const handleExcel = () => {
    downloadExcelReport(sessions, meta);
    onToast('Exported!');
  };

  const handleText = () => {
    downloadTextReport(sessions, meta);
    onToast('Exported!');
  };

  return (
    <section className="paper-panel p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-sepia-500">Export</p>
          <h2 className="mt-1 font-heading text-3xl text-sepia-900">Print-ready report tools</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <motion.button whileTap={{ scale: 0.98, y: 2 }} type="button" onClick={handleExcel} className="btn-emboss">
            Download as Excel (.xlsx)
          </motion.button>
          <motion.button whileTap={{ scale: 0.98, y: 2 }} type="button" onClick={handleText} className="btn-emboss">
            Download as Text Report (.txt)
          </motion.button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="paper-preview overflow-auto rounded-2xl border border-parchment-border p-4">
          <pre className="whitespace-pre-wrap font-body text-sm leading-6 text-sepia-900">{preview}</pre>
        </div>
        <div className="rounded-2xl border border-parchment-border bg-parchment-surface p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-sepia-500">Export notes</p>
          <ul className="space-y-3 text-sm leading-6 text-sepia-700">
            <li>Excel export contains a summary sheet and a session log sheet.</li>
            <li>The text report mirrors a printed DTR form with ruled separators.</li>
            <li>The preview updates immediately whenever your stored sessions change.</li>
          </ul>
        </div>
      </div>
    </section>
  );
};