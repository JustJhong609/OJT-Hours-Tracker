import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { TrackerTab } from '../types';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  activeTab: TrackerTab;
  onTabChange: (tab: TrackerTab) => void;
  clockedIn: boolean;
  onClockToggle: () => void;
  children: ReactNode;
}

const navItems: Array<{ id: TrackerTab; label: string; icon: string }> = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'log', label: 'Logs', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { id: 'manual', label: 'Manual', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'export', label: 'Export', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

export const Layout = ({
  activeTab,
  onTabChange,
  clockedIn,
  onClockToggle,
  children,
}: LayoutProps) => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-200">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col md:flex-row">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:flex">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="font-heading text-xl font-extrabold leading-tight text-[var(--color-accent)]">OJT</h1>
              <p className="text-xs font-semibold text-[var(--color-text)]">Hours Tracker</p>
              <p className="text-[10px] text-[var(--color-muted)] font-semibold truncate max-w-[150px] mt-0.5">
                👤 {currentUser?.name || currentUser?.username}
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all touch-target ${
                    active
                      ? 'bg-[var(--color-accent)] text-white shadow-glow'
                      : 'text-[var(--color-muted)] hover:bg-[var(--color-surface2)] hover:text-[var(--color-text)]'
                  }`}
                >
                  <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface2)] px-4 py-2.5 text-xs font-bold text-rose-500 transition hover:bg-rose-500/10"
            >
              🚪 Log Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col pb-24 md:pb-8">
          {/* Top Bar for Mobile & Tablet */}
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 px-5 py-3.5 backdrop-blur-md">
            <div className="flex items-center gap-2 md:hidden">
              <span className="font-heading text-lg font-extrabold text-[var(--color-accent)]">OJT</span>
              <div className="border-l border-[var(--color-border)] pl-2">
                <span className="font-heading text-xs font-bold block leading-tight">Logbook</span>
                <span className="block text-[10px] text-[var(--color-muted)]">👤 {currentUser?.name}</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest text-[var(--color-muted)] font-semibold">Status</span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${clockedIn ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]' : 'bg-[var(--color-muted)]/15 text-[var(--color-muted)]'}`}>
                <span className={`h-2 w-2 rounded-full ${clockedIn ? 'bg-[var(--color-success)] animate-ping' : 'bg-gray-400'}`} />
                {clockedIn ? 'Shift Active' : 'Off Clock'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1 text-xs font-bold text-rose-500 md:hidden border border-[var(--color-border)] rounded-xl px-3 py-1.5"
              >
                Logout
              </button>
            </div>
          </header>

          <main className="flex-1 px-4 pt-5 md:px-8">{children}</main>
        </div>
      </div>

      {/* Floating Action Button (FAB) on Mobile */}
      <div className="fixed bottom-20 right-4 z-40 md:hidden">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={onClockToggle}
          className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all ${
            clockedIn ? 'bg-rose-500 shadow-rose-500/40' : 'bg-emerald-500 shadow-emerald-500/40'
          }`}
          aria-label={clockedIn ? 'Clock Out' : 'Clock In'}
        >
          <svg className="h-7 w-7 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            {clockedIn ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
        </motion.button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-surface)]/90 px-2 py-2 backdrop-blur-lg md:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs font-semibold transition-all touch-target ${
                  active ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'
                }`}
              >
                <div className={`flex h-8 w-12 items-center justify-center rounded-xl transition ${active ? 'bg-[var(--color-accent)]/15' : ''}`}>
                  <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};