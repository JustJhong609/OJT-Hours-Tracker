import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { TrackerTab } from '../types';

interface LayoutProps {
  activeTab: TrackerTab;
  onTabChange: (tab: TrackerTab) => void;
  children: ReactNode;
}

const tabs: Array<{ id: TrackerTab; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'log', label: 'Log' },
  { id: 'export', label: 'Export' },
  { id: 'settings', label: 'Settings' },
];

export const Layout = ({ activeTab, onTabChange, children }: LayoutProps) => {
  return (
    <div className="min-h-screen text-sepia-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-28 pt-4 md:px-6 md:pb-8">
        <header className="paper-panel mb-4 flex flex-col gap-4 p-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.4em] text-sepia-500">Antique parchment tracker</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-heading text-4xl text-sepia-900 md:text-5xl">OJT Logbook</h1>
              <span className="ink-stamp">{new Date().getFullYear()}</span>
            </div>
          </div>
          <p className="max-w-xl text-sm leading-6 text-sepia-700">
            Keep every training hour, remark, and export inside a single local logbook.
          </p>
        </header>

        <nav className="nav-shell fixed inset-x-4 bottom-4 z-30 md:static md:inset-auto md:mb-4 md:flex md:justify-center">
          <div className="grid grid-cols-4 gap-2 rounded-2xl border border-parchment-border bg-parchment-card p-2 shadow-paper backdrop-blur md:min-w-[42rem]">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  whileTap={{ scale: 0.98, y: 2 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                  className={`tab-chip ${active ? 'tab-chip-active' : ''}`}
                >
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </nav>

        <main className="flex-1 pb-2">{children}</main>
      </div>
    </div>
  );
};