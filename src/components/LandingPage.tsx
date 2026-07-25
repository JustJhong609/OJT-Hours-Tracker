import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { themes, type ThemeKey } from '../styles/themes';
import { Footer } from './Footer';

interface LandingPageProps {
  onOpenAuth: (tab: 'login' | 'register') => void;
}

export const LandingPage = ({ onOpenAuth }: LandingPageProps) => {
  const { currentTheme, setTheme } = useAuth();

  const themeKeys: ThemeKey[] = ['sleekDark', 'sunAndSoil', 'deepOcean', 'roseQuartzLight', 'accessibleLight'];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-200 flex flex-col justify-between">
      {/* Main Hero Section */}
      <main className="mx-auto max-w-6xl px-4 py-12 sm:py-20 space-y-16 flex-1">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface2)] px-4 py-1.5 text-xs font-bold text-[var(--color-accent)] shadow-sm">
              🛡️ 100% Offline • Zero Cloud Servers • Dexie IndexedDB
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--color-text)] leading-tight">
            Track Your OJT Training Hours Effortlessly
          </h1>

          <p className="text-base sm:text-lg text-[var(--color-muted)] leading-relaxed">
            A modern, mobile-first Daily Time Record (DTR) logbook designed for trainees and interns. 
            Track live shifts, calculate completion dates, auto-deduct lunch breaks, and export official Excel reports.
          </p>

          {/* Primary Auth CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => onOpenAuth('register')}
              className="btn-primary text-base font-bold px-8 py-4 text-white shadow-glow"
            >
              Get Started / Register →
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => onOpenAuth('login')}
              className="btn-secondary text-base font-bold px-8 py-4"
            >
              Log In to Account
            </motion.button>
          </div>
        </div>

        {/* 5 Theme Live Selector Showcase */}
        <div className="modern-card p-6 sm:p-8 space-y-4 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">Customize Your Experience</span>
          <h2 className="font-heading text-2xl font-extrabold text-[var(--color-text)]">Choose From 5 Beautiful Themes</h2>
          <p className="text-xs text-[var(--color-muted)] max-w-xl mx-auto">
            Switch themes instantly anytime. All color palettes are tuned for high readability and aesthetics.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {themeKeys.map((key) => {
              const active = currentTheme === key;
              const t = themes[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTheme(key)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition ${
                    active
                      ? 'border-[var(--color-accent)] bg-[var(--color-surface2)] text-[var(--color-text)] shadow-md scale-105'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:border-[var(--color-accent)]'
                  }`}
                >
                  <span className="h-3.5 w-3.5 rounded-full border border-black/20" style={{ backgroundColor: t.colors.accent }} />
                  <span>{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="modern-card p-6 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 font-extrabold text-xl">
              ⏱️
            </div>
            <h3 className="font-heading text-lg font-bold text-[var(--color-text)]">Live Shift & Progress Ring</h3>
            <p className="text-xs text-[var(--color-muted)] leading-relaxed">
              Clock in/out with 1-tap. Displays SVG target progress rings, elapsed shift counters, and estimated finish dates.
            </p>
          </div>

          <div className="modern-card p-6 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 font-extrabold text-xl">
              📊
            </div>
            <h3 className="font-heading text-lg font-bold text-[var(--color-text)]">1-Tap DTR Export</h3>
            <p className="text-xs text-[var(--color-muted)] leading-relaxed">
              Download structured Excel (.xlsx) files or print formatted DTR reports directly for university/company approval.
            </p>
          </div>

          <div className="modern-card p-6 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 font-extrabold text-xl">
              ⚡
            </div>
            <h3 className="font-heading text-lg font-bold text-[var(--color-text)]">Auto Break & Presets</h3>
            <p className="text-xs text-[var(--color-muted)] leading-relaxed">
              Automatically subtracts 1-hour lunch breaks on 5+ hour shifts. Features 1-click full-shift presets for fast manual backfilling.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
