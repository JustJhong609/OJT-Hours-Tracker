import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  onToast: (msg: string) => void;
}

export const AuthModal = ({ isOpen, onClose, initialTab = 'register', onToast }: AuthModalProps) => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (tab === 'register' && !agreeTerms) {
      setError('You must agree to the Terms & Conditions to register.');
      return;
    }

    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await login(username, password);
        if (res.success) {
          onToast(res.message);
          onClose();
        } else {
          setError(res.message);
        }
      } else {
        const res = await register(username, password, name);
        if (res.success) {
          setShowSuccessPopup(true);
        } else {
          setError(res.message);
        }
      }
    } catch {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToLogin = () => {
    setShowSuccessPopup(false);
    setTab('login');
    setPassword('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="modern-card w-full max-w-md p-6 sm:p-8 space-y-6 relative overflow-hidden"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[var(--color-muted)] hover:text-[var(--color-text)] text-lg"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="text-center space-y-1">
          <h2 className="font-heading text-2xl font-extrabold text-[var(--color-text)]">
            {tab === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-[var(--color-muted)]">
            100% Offline Local Account • Stored safely via Dexie IndexedDB
          </p>
        </div>

        {/* Auth Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-[var(--color-surface2)] p-1 border border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              tab === 'register' ? 'bg-[var(--color-accent)] text-white shadow-sm' : 'text-[var(--color-muted)]'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              tab === 'login' ? 'bg-[var(--color-accent)] text-white shadow-sm' : 'text-[var(--color-muted)]'
            }`}
          >
            Log In
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <label className="block space-y-1 text-xs font-bold uppercase text-[var(--color-muted)]">
              <span>Full Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Juan Dela Cruz"
                className="modern-input text-xs"
                required
              />
            </label>
          )}

          <label className="block space-y-1 text-xs font-bold uppercase text-[var(--color-muted)]">
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. juancruz"
              className="modern-input text-xs"
              required
            />
          </label>

          <label className="block space-y-1 text-xs font-bold uppercase text-[var(--color-muted)]">
            <span>Password</span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="modern-input text-xs pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-text)]"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          {/* Terms & Conditions Checkbox (Sign Up Only) */}
          {tab === 'register' && (
            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="termsCheck"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[var(--color-border)] text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="termsCheck" className="text-xs text-[var(--color-muted)] leading-tight cursor-pointer">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-[var(--color-accent)] underline font-semibold"
                >
                  Terms & Conditions
                </button>{' '}
                and understand that my data is saved locally on this device.
              </label>
            </div>
          )}

          {error && <p className="text-xs font-semibold text-[var(--color-danger)] text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-xs font-bold py-3 shadow-glow"
          >
            {loading ? 'Processing...' : tab === 'login' ? 'Log In to Account' : 'Create Free Account'}
          </button>
        </form>
      </motion.div>

      {/* Registration Successful Popup Notification */}
      <AnimatePresence>
        {showSuccessPopup && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="modern-card w-full max-w-sm p-6 text-center space-y-4"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 text-2xl font-bold">
                ✓
              </div>
              <h3 className="font-heading text-xl font-extrabold text-[var(--color-text)]">
                Account Created Successfully!
              </h3>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                Your Dexie local account <strong>{username}</strong> has been registered. Press Proceed to log into your account.
              </p>
              <button
                type="button"
                onClick={handleProceedToLogin}
                className="btn-primary w-full text-xs font-bold py-3 shadow-glow"
              >
                OK / Proceed to Log In
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Terms & Conditions Modal Overlay */}
      <AnimatePresence>
        {showTermsModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="modern-card w-full max-w-lg p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <h3 className="font-heading text-xl font-extrabold text-[var(--color-text)]">
                Terms & Conditions
              </h3>
              <div className="space-y-3 text-xs text-[var(--color-muted)] leading-relaxed">
                <p><strong>1. Local Offline Database:</strong> All session records, passwords, and trainee profiles created in OJT Hours Tracker are saved 100% locally in your browser database using IndexedDB via Dexie.js. No server transfers or cloud tracking take place.</p>
                <p><strong>2. User Responsibility:</strong> You are responsible for backing up your data using the built-in JSON export feature prior to clearing browser cache or changing devices.</p>
                <p><strong>3. Accuracy:</strong> This app acts as your personal digital logbook. Ensure your logged training hours reflect your actual on-the-job training shifts.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAgreeTerms(true);
                  setShowTermsModal(false);
                }}
                className="btn-primary w-full text-xs font-bold py-2.5"
              >
                I Agree & Accept Terms
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
