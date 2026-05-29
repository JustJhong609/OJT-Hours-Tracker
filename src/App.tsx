import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { ExportPage } from './components/ExportPage';
import { Layout } from './components/Layout';
import { SessionLog } from './components/SessionLog';
import { SettingsPage } from './components/SettingsPage';
import { Toast } from './components/Toast';
import { useTracker } from './hooks/useTracker';
import type { ToastMessage, TrackerTab } from './types';

const pageTransition = {
  initial: { opacity: 0, y: 14, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -14, filter: 'blur(4px)' },
};

export const App = () => {
  const tracker = useTracker();
  const [activeTab, setActiveTab] = useState<TrackerTab>('dashboard');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string) => {
    const id = crypto.randomUUID();
    setToast({ id, message });
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 2200);
  };

  const page = (() => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            sessions={tracker.sessions}
            meta={tracker.meta}
            clockedIn={tracker.clockedIn}
            clockInTime={tracker.clockInTime}
            onClockIn={tracker.clockIn}
            onClockOut={tracker.clockOut}
          />
        );
      case 'log':
        return (
          <div className="space-y-6">
            <SessionLog
              sessions={tracker.sessions}
              onUpdateRemarks={tracker.updateRemarks}
              onDeleteSession={tracker.deleteSession}
              onAddSession={tracker.addManualSession}
              onToast={showToast}
            />
          </div>
        );
      case 'export':
        return <ExportPage sessions={tracker.sessions} meta={tracker.meta} onToast={showToast} />;
      case 'settings':
        return (
          <SettingsPage
            meta={tracker.meta}
            onSave={tracker.saveMeta}
            onClearAll={tracker.clearAllData}
            onToast={showToast}
          />
        );
      default:
        return null;
    }
  })();

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} {...pageTransition} transition={{ duration: 0.24, ease: 'easeOut' }}>
          {page}
        </motion.div>
      </AnimatePresence>
      <Toast toast={toast} />
    </Layout>
  );
};

export default App;