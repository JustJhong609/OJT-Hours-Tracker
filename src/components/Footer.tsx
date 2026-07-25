export const Footer = () => {
  return (
    <footer className="border-t border-[var(--color-border)] py-8 px-4 text-center space-y-4 text-xs text-[var(--color-muted)]">
      <div className="flex flex-wrap items-center justify-center gap-3 font-semibold">
        <span>
          Created by{' '}
          <a
            href="https://github.com/JustJhong609"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[var(--color-accent)] underline hover:opacity-80"
          >
            JustJhong609
          </a>
        </span>
        <span>•</span>
        <a
          href="https://buymeacoffee.com/justjhong609"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 transition hover:scale-105"
        >
          ☕ Buy me a coffee (Support me)
        </a>
      </div>

      <p className="max-w-xl mx-auto text-[11px] leading-relaxed text-[var(--color-muted)]">
        🔒 <strong>100% Offline & Private:</strong> No data is stored or collected online. 
        All session logs, passwords, and trainee profiles are saved strictly on your local device using Dexie IndexedDB.
      </p>

      <p className="text-[10px] text-[var(--color-muted)]/70">
        OJT Hours Tracker • Powered by Dexie.js & Capacitor
      </p>
    </footer>
  );
};
