import { AnimatePresence, motion } from 'framer-motion';
import type { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage | null;
}

export const Toast = ({ toast }: ToastProps) => {
  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full border border-parchment-border bg-parchment-card px-5 py-3 text-sm font-bold text-sepia-900 shadow-paper"
        >
          {toast.message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};