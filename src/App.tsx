import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { ExportPage } from './components/ExportPage';
import { Layout } from './components/Layout';
import { SessionLog } from './components/SessionLog';
import { ManualEntry } from './components/ManualEntry';
import { SettingsPage } from './components/SettingsPage';
import { Toast } from './components/Toast';
import { useTracker } from './hooks/useTracker';
import type { ToastMessage, TrackerTab } from './types';

const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const MainAppContent = () => {
  const { currentUser } = useAuth();
  const tracker = useTracker();
  const [activeTab, setActiveTab] = useState<TrackerTab>('dashboard');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Auth Modal State for Landing Page
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('register');

  const showToast = (message: string) => {
    const id = crypto.randomUUID();
    setToast({ id, message });
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 2500);
  };

  const handleClockToggle = () => {
    if (tracker.clockedIn) {
      tracker.clockOut();
      showToast('Shift clocked out!');
    } else {
      tracker.clockIn();
      showToast('Shift clocked in!');
    }
  };

  // Unauthenticated State: Show Landing Page & Auth Modal
  if (!currentUser) {
    return (
      <>
        <LandingPage
          onOpenAuth={(tab) => {
            setAuthTab(tab);
            setAuthModalOpen(true);
          }}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialTab={authTab}
          onToast={showToast}
        />
        <Toast toast={toast} />
      </>
    );
  }

  // Authenticated State: Show 5-Tab OJT Logbook App
  const page = (() => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            sessions={tracker.sessions}
            meta={tracker.meta}
            clockedIn={tracker.clockedIn}
            clockInTime={tracker.clockInTime}
            onClockIn={() => {
              tracker.clockIn();
              showToast('Clocked in successfully!');
            }}
            onClockOut={() => {
              tracker.clockOut();
              showToast('Clocked out successfully!');
            }}
            onSaveMeta={tracker.saveMeta}
          />
        );
      case 'log':
        return (
          <SessionLog
            sessions={tracker.sessions}
            onUpdateRemarks={tracker.updateRemarks}
            onDeleteSession={(id) => {
              tracker.deleteSession(id);
              showToast('Session deleted from Dexie DB!');
            }}
          />
        );
      case 'manual':
        return (
          <ManualEntry
            onAddSession={async (values) => {
              const res = await tracker.addManualSession(values);
              if (res.success) {
                setActiveTab('log');
              }
              return res;
            }}
            onToast={showToast}
          />
        );
      case 'export':
        return <ExportPage sessions={tracker.sessions} meta={tracker.meta} onToast={showToast} />;
      case 'settings':
        return (
          <SettingsPage
            meta={tracker.meta}
            onSave={tracker.saveMeta}
            onImportState={tracker.importState}
            onClearAll={tracker.clearAllData}
            onToast={showToast}
            allSessions={tracker.sessions}
          />
        );
      default:
        return null;
    }
  })();

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      clockedIn={tracker.clockedIn}
      onClockToggle={handleClockToggle}
    >
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} {...pageTransition} transition={{ duration: 0.2 }}>
          {page}
        </motion.div>
      </AnimatePresence>
      <Toast toast={toast} />
    </Layout>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};

export default App;