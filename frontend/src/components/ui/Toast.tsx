import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore, Toast as ToastType } from '../../store/toastStore';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastItemProps {
  toast: ToastType;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/20 bg-slate-950/90 shadow-emerald-950/10 text-emerald-50',
    error: 'border-rose-500/20 bg-slate-950/90 shadow-rose-950/10 text-rose-50',
    warning: 'border-amber-500/20 bg-slate-950/90 shadow-amber-950/10 text-amber-50',
    info: 'border-sky-500/20 bg-slate-950/90 shadow-sky-950/10 text-sky-50',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-lg ${borders[toast.type]}`}
      id={`toast-${toast.id}`}
      role="alert"
    >
      {icons[toast.type]}
      <div className="flex-1 text-xs font-medium leading-relaxed">
        {toast.message}
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-200 cursor-pointer p-0.5 rounded-lg hover:bg-slate-900 transition-colors shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
