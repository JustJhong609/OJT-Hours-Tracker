import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import type { Session, TrackerMeta } from '../types';
import type { FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { themes, type ThemeKey } from '../styles/themes';

interface SettingsPageProps {
  meta: TrackerMeta;
  onSave: (meta: Partial<TrackerMeta>) => void;
  onImportState: (importedData: { sessions?: Session[]; meta?: Partial<TrackerMeta> }) => Promise<{ success: boolean; message: string }>;
  onClearAll: () => void;
  onToast: (message: string) => void;
  allSessions: Session[];
}

const themeKeys: ThemeKey[] = ['sleekDark', 'sunAndSoil', 'deepOcean', 'roseQuartzLight', 'accessibleLight'];

export const SettingsPage = ({
  meta,
  onSave,
  onImportState,
  onClearAll,
  onToast,
  allSessions,
}: SettingsPageProps) => {
  const { currentUser, logout, currentTheme, setTheme } = useAuth();
  const [form, setForm] = useState(meta);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(meta);
  }, [meta]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({
      ...form,
      requiredHours: Number(form.requiredHours) || 486,
    });
    onToast('Settings saved successfully!');
  };

  const handleExportBackup = () => {
    const backupData = {
      version: 2,
      exportedAt: new Date().toISOString(),
      user: currentUser?.username,
      meta: form,
      sessions: allSessions,
      theme: currentTheme,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ojt-backup-${currentUser?.username || 'user'}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onToast('Backup JSON downloaded!');
  };

  const handleImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const result = await onImportState(parsed);
        onToast(result.message);
      } catch {
        onToast('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    const confirmed = window.confirm('Clear all tracker data for this account? This will remove all your session logs.');
    if (!confirmed) return;
    onClearAll();
    onToast('All session data cleared for your account!');
  };

  return (
    <section className="space-y-6">
      <div className="modern-card p-6 md:p-8 space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">Account Settings</span>
          <h2 className="font-heading text-2xl font-extrabold text-[var(--color-text)]">
            Trainee Profile ({currentUser?.username})
          </h2>
          <p className="mt-1 text-xs text-[var(--color-muted)]">Manage your OJT credentials, target hours, 5-theme selection, and Dexie backups.</p>
        </div>

        {/* 5-Theme Switcher Swatches */}
        <div className="border-t border-[var(--color-border)] pt-5 space-y-3">
          <h3 className="font-heading font-bold text-sm text-[var(--color-text)]">Theme Palette Selector</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {themeKeys.map((key) => {
              const active = currentTheme === key;
              const t = themes[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTheme(key)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition ${
                    active
                      ? 'border-[var(--color-accent)] bg-[var(--color-surface2)] text-[var(--color-text)] font-bold shadow-md'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:border-[var(--color-accent)]'
                  }`}
                >
                  <span className="h-5 w-5 rounded-full border border-black/20" style={{ backgroundColor: t.colors.accent }} />
                  <span className="text-xs">{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4 border-t border-[var(--color-border)] pt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-xs font-bold text-[var(--color-muted)] uppercase">
              <span>Full Name</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((curr) => ({ ...curr, name: e.target.value }))}
                placeholder="e.g. Juan Cruz"
                className="modern-input"
              />
            </label>

            <label className="space-y-1.5 text-xs font-bold text-[var(--color-muted)] uppercase">
              <span>School / University</span>
              <input
                type="text"
                value={form.school}
                onChange={(e) => setForm((curr) => ({ ...curr, school: e.target.value }))}
                placeholder="e.g. State University"
                className="modern-input"
              />
            </label>

            <label className="space-y-1.5 text-xs font-bold text-[var(--color-muted)] uppercase">
              <span>Company / Organization</span>
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm((curr) => ({ ...curr, company: e.target.value }))}
                placeholder="e.g. Acme Tech Corp"
                className="modern-input"
              />
            </label>

            <label className="space-y-1.5 text-xs font-bold text-[var(--color-muted)] uppercase">
              <span>Supervisor Name</span>
              <input
                type="text"
                value={form.supervisor ?? ''}
                onChange={(e) => setForm((curr) => ({ ...curr, supervisor: e.target.value }))}
                placeholder="e.g. Jane Doe, Tech Lead"
                className="modern-input"
              />
            </label>

            <label className="space-y-1.5 text-xs font-bold text-[var(--color-muted)] uppercase sm:col-span-2">
              <span>Required OJT Hours</span>
              <input
                type="number"
                min="1"
                step="1"
                value={form.requiredHours}
                onChange={(e) => setForm((curr) => ({ ...curr, requiredHours: Number(e.target.value) }))}
                className="modern-input"
              />
            </label>
          </div>

          <div className="pt-2">
            <motion.button whileTap={{ scale: 0.97 }} type="submit" className="btn-primary text-sm font-bold shadow-glow">
              Save Profile Settings
            </motion.button>
          </div>
        </form>

        {/* Data Backup & Migration Section */}
        <div className="border-t border-[var(--color-border)] pt-6 space-y-4">
          <h3 className="font-heading font-bold text-base text-[var(--color-text)]">Dexie DB Backup & Sync</h3>
          <p className="text-xs text-[var(--color-muted)]">Export your logbook to a JSON file or import a backup to transfer your data across devices.</p>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleExportBackup} className="btn-secondary text-xs py-2.5">
              📥 Export JSON Backup
            </button>

            <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary text-xs py-2.5">
              📤 Import JSON Backup
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border-t border-[var(--color-danger)]/20 pt-6 space-y-3">
          <h3 className="font-heading font-bold text-base text-[var(--color-danger)]">Danger Zone</h3>
          <p className="text-xs text-[var(--color-muted)]">Permanently erase session logs for account <strong>{currentUser?.username}</strong> or log out.</p>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleClear} className="btn-danger text-xs py-2.5">
              🗑️ Clear Account Data
            </button>
            <button type="button" onClick={logout} className="btn-secondary text-xs py-2.5 text-rose-500 border-rose-500/30">
              🚪 Log Out Account
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};