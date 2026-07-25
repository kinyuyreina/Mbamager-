import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bell, 
  Check, 
  Trash2, 
  Search, 
  Filter, 
  AlertTriangle, 
  Activity, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  X,
  MailOpen,
  Info
} from 'lucide-react';

import { PageHeader } from '../components/common/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { Skeleton } from '../components/ui/SkeletonLoader';
import { formatDate } from '../utils/format';
import { notificationsService } from '../services/notifications';
import { Notification } from '../types';

export default function Notifications() {
  const queryClient = useQueryClient();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [readFilter, setReadFilter] = React.useState<'ALL' | 'UNREAD' | 'READ'>('ALL');

  // 1. Fetch Notifications
  const { 
    data: notifications, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getNotifications()
  });

  // Mutations
  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: any) => {
      alert(err?.message || 'Failed to update notification status.');
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: any) => {
      alert(err?.message || 'Failed to clear all unread notification badges.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => notificationsService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: any) => {
      alert(err?.message || 'Failed to dismiss notification.');
    }
  });

  // Relative time computation
  const formatRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return formatDate(dateStr, true);
  };

  // Notification type visual configurations
  const getNotificationTypeMeta = (type: string) => {
    switch (type) {
      case 'LOW_BALANCE':
        return {
          icon: AlertTriangle,
          colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
          priority: 'CRITICAL',
          priorityClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
        };
      case 'BUDGET_WARNING':
        return {
          icon: AlertTriangle,
          colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          priority: 'WARNING',
          priorityClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
        };
      case 'UNUSUAL_SPENDING':
        return {
          icon: Activity,
          colorClass: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
          priority: 'WARNING',
          priorityClass: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
        };
      case 'SMS_IMPORT_FAILED':
        return {
          icon: MessageSquare,
          colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
          priority: 'CRITICAL',
          priorityClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
        };
      case 'GOAL_REACHED':
        return {
          icon: CheckCircle2,
          colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          priority: 'INFO',
          priorityClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
        };
      case 'RECURRING_PAYMENT':
        return {
          icon: Clock,
          colorClass: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
          priority: 'INFO',
          priorityClass: 'text-sky-400 bg-sky-500/10 border-sky-500/20'
        };
      default:
        return {
          icon: Bell,
          colorClass: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
          priority: 'INFO',
          priorityClass: 'text-slate-400 bg-slate-500/10 border-slate-500/20'
        };
    }
  };

  // Filter & Search computation
  const filteredNotifications = React.useMemo(() => {
    if (!notifications) return [];
    return notifications.filter((n) => {
      const matchesSearch = 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        readFilter === 'ALL' || 
        (readFilter === 'UNREAD' && !n.is_read) ||
        (readFilter === 'READ' && n.is_read);
      
      return matchesSearch && matchesStatus;
    });
  }, [notifications, searchQuery, readFilter]);

  // Calculations
  const unreadCount = React.useMemo(() => {
    if (!notifications) return 0;
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts & Security Center"
        description="Verify automated notifications regarding low wallet balances, budget warnings, and savings landmarks."
        action={
          unreadCount > 0 ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-xs"
              onClick={() => markAllReadMutation.mutate()}
              isLoading={markAllReadMutation.isPending}
            >
              <Check className="w-3.5 h-3.5" />
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {/* Filter / Search Bar */}
      <Card className="bg-slate-900/20 border-slate-800/60">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto self-end sm:self-auto justify-end">
            <Filter className="w-3.5 h-3.5 text-slate-500 mr-1" />
            <Button
              variant={readFilter === 'ALL' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setReadFilter('ALL')}
              className="text-[11px] px-3 py-1"
            >
              All
            </Button>
            <Button
              variant={readFilter === 'UNREAD' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setReadFilter('UNREAD')}
              className="text-[11px] px-3 py-1 relative"
            >
              Unread
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-[9px] font-bold text-white w-4 h-4 rounded-full flex items-center justify-center scale-90 border border-slate-950">
                  {unreadCount}
                </span>
              )}
            </Button>
            <Button
              variant={readFilter === 'READ' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setReadFilter('READ')}
              className="text-[11px] px-3 py-1"
            >
              Read
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      ) : isError ? (
        <ErrorState 
          title="Failed to Sync Notifications" 
          message="A network error occurred while establishing links to your system alert logs." 
          onRetry={refetch} 
        />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={unreadCount === 0 && readFilter === 'UNREAD' ? MailOpen : Bell}
          title={searchQuery ? "No notifications match search" : "No notifications yet"}
          description={searchQuery ? "Try searching for other terms or resetting your status filters." : "Automatic notifications regarding critical budget warnings, savings completions, or cash balances will display here."}
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => {
            const meta = getNotificationTypeMeta(n.type);
            const TypeIcon = meta.icon;

            return (
              <Card 
                key={n.id} 
                className={`group border transition-all duration-200 overflow-hidden ${
                  n.is_read 
                    ? 'bg-slate-950/20 border-slate-900/60 opacity-70 hover:opacity-100 hover:border-slate-800' 
                    : 'bg-slate-900/30 border-slate-800/80 hover:border-slate-700 shadow-md shadow-slate-950/20'
                }`}
              >
                <CardContent className="p-4 flex gap-4 items-start relative">
                  {/* Read State Indicator Circle */}
                  {!n.is_read && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-sky-400" />
                  )}

                  {/* Icon Circle */}
                  <div className={`p-2.5 rounded-xl border shrink-0 ${meta.colorClass}`}>
                    <TypeIcon className="w-5 h-5" />
                  </div>

                  {/* Body Content */}
                  <div className="space-y-1 w-full min-w-0 pr-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className={`text-xs font-bold text-slate-100 tracking-tight ${!n.is_read ? 'font-extrabold' : ''}`}>
                          {n.title}
                        </h4>
                        <span className={`text-[8px] uppercase font-bold tracking-widest border px-1.5 py-0.5 rounded ${meta.priorityClass}`}>
                          {meta.priority}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium shrink-0">
                        {formatRelativeTime(n.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      {n.message}
                    </p>
                  </div>

                  {/* Hover Controls */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
                    {!n.is_read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => markReadMutation.mutate(n.id)}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/5 rounded-lg"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteMutation.mutate(n.id)}
                      className="h-7 w-7 p-0 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg"
                      title="Dismiss"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

