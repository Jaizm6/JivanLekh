import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 bg-[#1F2937] text-white text-sm rounded-xl shadow-xl border border-gray-700/50"
        >
          <span>{toast.message}</span>
          {toast.actionLabel && toast.onAction && (
            <button
              onClick={() => {
                toast.onAction?.();
                onClose();
              }}
              className="px-2 py-0.5 bg-blue-500 hover:bg-blue-600 text-white font-medium text-xs rounded transition-colors"
            >
              {toast.actionLabel}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
