import { create } from 'zustand';
import { Notification } from '../types';
import { storage } from '../utils/format';

interface AppSettings {
  preferredCurrency: string;
  sidebarCollapsed: boolean;
  momoSmsAutoImport: boolean;
}

interface AppState {
  settings: AppSettings;
  notifications: Notification[];
  
  // Actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'is_read' | 'created_at'>) => void;
  markNotificationAsRead: (id: number) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: number) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  preferredCurrency: 'XAF',
  sidebarCollapsed: false,
  momoSmsAutoImport: true,
};

export const useAppStore = create<AppState>((set, get) => ({
  settings: storage.get<AppSettings>('mb_settings', DEFAULT_SETTINGS),
  notifications: [],

  updateSettings: (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    storage.set('mb_settings', updated);
    set({ settings: updated });
  },

  setNotifications: (notifications) => {
    set({ notifications });
  },

  addNotification: (notif) => {
    const newNotif: Notification = {
      ...notif,
      id: Date.now(),
      is_read: false,
      created_at: new Date().toISOString(),
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications],
    }));
  },

  markNotificationAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
    }));
  },

  markAllNotificationsAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
    }));
  },

  clearNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));
