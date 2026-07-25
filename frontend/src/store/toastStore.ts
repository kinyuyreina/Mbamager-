import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  success: (message, duration) => {
    set((state) => {
      const id = Math.random().toString(36).substring(2, 9);
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, duration || 4000);
      return { toasts: [...state.toasts, { id, message, type: 'success', duration }] };
    });
  },
  error: (message, duration) => {
    set((state) => {
      const id = Math.random().toString(36).substring(2, 9);
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, duration || 4500);
      return { toasts: [...state.toasts, { id, message, type: 'error', duration }] };
    });
  },
  warning: (message, duration) => {
    set((state) => {
      const id = Math.random().toString(36).substring(2, 9);
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, duration || 4000);
      return { toasts: [...state.toasts, { id, message, type: 'warning', duration }] };
    });
  },
  info: (message, duration) => {
    set((state) => {
      const id = Math.random().toString(36).substring(2, 9);
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, duration || 4000);
      return { toasts: [...state.toasts, { id, message, type: 'info', duration }] };
    });
  },
}));
