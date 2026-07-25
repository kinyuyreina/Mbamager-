import { api } from '../lib/api';
import { Notification } from '../types';

export const notificationsService = {
  /**
   * Get all notifications for the current user
   */
  async getNotifications(): Promise<Notification[]> {
    const response = await api.get<Notification[]>('/notifications');
    return response.data;
  },

  /**
   * Get only unread notifications for the current user
   */
  async getUnreadNotifications(): Promise<Notification[]> {
    const response = await api.get<Notification[]>('/notifications/unread');
    return response.data;
  },

  /**
   * Mark a specific notification as read
   */
  async markAsRead(id: number): Promise<Notification> {
    const response = await api.put<Notification>(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>('/notifications/read-all');
    return response.data;
  },

  /**
   * Delete a specific notification
   */
  async deleteNotification(id: number): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};
