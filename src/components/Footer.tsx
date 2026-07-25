export const Footer = () => {
  return (
    <footer className="border-t border-[var(--color-border)] py-8 px-4 text-center space-y-4 text-xs text-[var(--color-muted)]">
      <div className="flex items-center justify-center font-semibold">
        <span>
          Created by{' '}
          <a
            href="https://www.jhongdev.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[var(--color-accent)] hover:underline"
          >
            Jhong
          </a>
        </span>
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
