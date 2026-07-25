import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Target, 
  Check, 
  X, 
  Calendar, 
  TrendingUp, 
  Coins, 
  AlertTriangle, 
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Hourglass
} from 'lucide-react';

import { PageHeader } from '../components/common/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { Skeleton } from '../components/ui/SkeletonLoader';
import { formatXAF, formatDate } from '../utils/format';
import { financeService, CreateGoalPayload, UpdateGoalPayload } from '../services/finance';
import { SavingsGoal, GoalStatus } from '../types';

export default function Goals() {
  const queryClient = useQueryClient();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  // Modal control states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedGoal, setSelectedGoal] = React.useState<SavingsGoal | null>(null);

  // Form field states
  const [formName, setFormName] = React.useState('');
  const [formTargetAmount, setFormTargetAmount] = React.useState<number>(0);
  const [formCurrentAmount, setFormCurrentAmount] = React.useState<number>(0);
  const [formTargetDate, setFormTargetDate] = React.useState('');
  const [formStatus, setFormStatus] = React.useState<GoalStatus>('ACTIVE');
  const [formError, setFormError] = React.useState<string | null>(null);

  // 1. Fetch Savings Goals
  const { 
    data: goals, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['savingsGoals'],
    queryFn: () => financeService.getGoals()
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateGoalPayload) => financeService.createGoal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err?.message || 'Failed to establish new savings goal.');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateGoalPayload }) => 
      financeService.updateGoal(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
      setIsEditOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err?.message || 'Failed to update savings goal.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => financeService.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
      setIsDeleteOpen(false);
      setSelectedGoal(null);
    },
    onError: (err: any) => {
      alert(err?.message || 'Failed to delete savings goal.');
    }
  });

  const resetForm = () => {
    setFormName('');
    setFormTargetAmount(0);
    setFormCurrentAmount(0);
    setFormTargetDate('');
    setFormStatus('ACTIVE');
    setFormError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (goal: SavingsGoal) => {
    setFormName(goal.name);
    setFormTargetAmount(Number(goal.target_amount));
    setFormCurrentAmount(Number(goal.current_amount));
    setFormTargetDate(goal.target_date);
    setFormStatus(goal.status);
    setFormError(null);
    setSelectedGoal(goal);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Goal name is required');
      return;
    }
    if (formTargetAmount <= 0) {
      setFormError('Target amount must be greater than 0');
      return;
    }
    if (!formTargetDate) {
      setFormError('Target date is required');
      return;
    }

    createMutation.mutate({
      name: formName,
      target_amount: formTargetAmount,
      current_amount: formCurrentAmount,
      target_date: formTargetDate,
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    if (!formName.trim()) {
      setFormError('Goal name is required');
      return;
    }
    if (formTargetAmount <= 0) {
      setFormError('Target amount must be greater than 0');
      return;
    }
    if (!formTargetDate) {
      setFormError('Target date is required');
      return;
    }

    updateMutation.mutate({
      id: selectedGoal.id,
      payload: {
        name: formName,
        target_amount: formTargetAmount,
        current_amount: formCurrentAmount,
        target_date: formTargetDate,
        status: formStatus,
      },
    });
  };

  const handleDeleteConfirm = () => {
    if (!selectedGoal) return;
    deleteMutation.mutate(selectedGoal.id);
  };

  // Filter & Search computation
  const filteredGoals = React.useMemo(() => {
    if (!goals) return [];
    return goals.filter((g) => {
      const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = 
        statusFilter === 'ALL' || 
        (statusFilter === 'ACTIVE' && g.status === 'ACTIVE') ||
        (statusFilter === 'COMPLETED' && g.status === 'COMPLETED');
      return matchesSearch && matchesStatus;
    });
  }, [goals, searchQuery, statusFilter]);

  // Calculations for StatCards
  const stats = React.useMemo(() => {
    if (!goals || goals.length === 0) {
      return { totalTarget: 0, totalSaved: 0, activeCount: 0, completedCount: 0 };
    }
    const totalTarget = goals.reduce((acc, g) => acc + Number(g.target_amount), 0);
    const totalSaved = goals.reduce((acc, g) => acc + Number(g.current_amount), 0);
    const activeCount = goals.filter(g => g.status === 'ACTIVE').length;
    const completedCount = goals.filter(g => g.status === 'COMPLETED').length;
    return { totalTarget, totalSaved, activeCount, completedCount };
  }, [goals]);

  // Compute recommended monthly deposit
  const computeMonthlyRecommended = (targetAmt: number, currentAmt: number, targetDateStr: string) => {
    const remaining = Math.max(0, targetAmt - currentAmt);
    if (remaining === 0) return 0;
    
    const targetDate = new Date(targetDateStr);
    const today = new Date();
    
    // Difference in months
    const yearDiff = targetDate.getFullYear() - today.getFullYear();
    const monthDiff = targetDate.getMonth() - today.getMonth();
    const totalMonths = yearDiff * 12 + monthDiff;
    
    const monthsRemaining = Math.max(1, totalMonths);
    return remaining / monthsRemaining;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Savings Goals Hub"
        description="Establish dedicated savings targets, track cycle progress, and compute optimal monthly deposit rates."
        action={
          <Button variant="primary" size="sm" className="gap-2" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4" />
            Establish Goal
          </Button>
        }
      />

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/40 border-slate-800/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Total Savings Target</span>
              <p className="text-lg font-bold text-slate-200">{formatXAF(stats.totalTarget)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400">
              <Target className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Total Saved Amount</span>
              <p className="text-lg font-bold text-gold">{formatXAF(stats.totalSaved)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-gold">
              <Coins className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Active Goals</span>
              <p className="text-lg font-bold text-amber-500">{stats.activeCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-amber-500">
              <Hourglass className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Completed Goals</span>
              <p className="text-lg font-bold text-sky-400">{stats.completedCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sky-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar / Search & Filters */}
      <Card className="bg-slate-900/20 border-slate-800/60">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search savings goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto self-end sm:self-auto justify-end">
            <Filter className="w-3.5 h-3.5 text-slate-500 mr-1" />
            <Button
              variant={statusFilter === 'ALL' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('ALL')}
              className="text-[11px] px-3 py-1"
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'ACTIVE' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('ACTIVE')}
              className="text-[11px] px-3 py-1"
            >
              Active
            </Button>
            <Button
              variant={statusFilter === 'COMPLETED' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('COMPLETED')}
              className="text-[11px] px-3 py-1"
            >
              Completed
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      ) : isError ? (
        <ErrorState 
          title="Failed to Load Savings Goals" 
          message="A network exception occurred while fetching your active goals portfolio." 
          onRetry={refetch} 
        />
      ) : filteredGoals.length === 0 ? (
        <EmptyState
          icon={Target}
          title={searchQuery ? "No savings goals match search" : "No savings goals yet"}
          description={searchQuery ? "Try checking for spelling issues or adjusting your active/completed status filters." : "Establish savings limits for dedicated targets like Njangi groups, electronics, or security buffers."}
          actionText={searchQuery ? undefined : "Establish Your First Goal"}
          onAction={searchQuery ? undefined : handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => {
            const progressPct = Math.min(100, Math.max(0, (Number(goal.current_amount) / Number(goal.target_amount)) * 100));
            const remaining = Math.max(0, Number(goal.target_amount) - Number(goal.current_amount));
            const monthlyRecommended = computeMonthlyRecommended(Number(goal.target_amount), Number(goal.current_amount), goal.target_date);

            return (
              <Card key={goal.id} className="relative overflow-hidden bg-slate-900/30 border-slate-800 hover:border-slate-700 transition-all">
                {/* Header info */}
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-100 tracking-tight">{goal.name}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Deadline: {formatDate(goal.target_date)}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                      goal.status === 'COMPLETED' 
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' 
                        : goal.status === 'CANCELLED'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {goal.status}
                    </span>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end text-xs">
                      <span className="text-[10px] font-semibold text-slate-400">Progress: {progressPct.toFixed(0)}%</span>
                      <span className="text-[11px] font-bold text-slate-200">
                        {formatXAF(goal.current_amount)} <span className="text-slate-500 font-normal">/ {formatXAF(goal.target_amount)}</span>
                      </span>
                    </div>

                    <div className="w-full bg-slate-950/60 border border-slate-800/40 rounded-full h-2 overflow-hidden shadow-inner">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          progressPct >= 100 
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' 
                            : 'bg-gradient-to-r from-gold to-gold-300'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Detail metrics */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">Remaining Need</span>
                      <p className="text-xs font-bold text-slate-300">{formatXAF(remaining)}</p>
                    </div>

                    {goal.status === 'ACTIVE' && remaining > 0 && (
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">Recommended Rate</span>
                        <p className="text-xs font-bold text-gold">{formatXAF(monthlyRecommended)} <span className="text-[10px] text-slate-500 font-normal">/ mo</span></p>
                      </div>
                    )}

                    {goal.status === 'COMPLETED' && (
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">Goal Status</span>
                        <p className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Fully Saved!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-5 py-2.5 bg-slate-950/30 border-t border-slate-800/40 flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleOpenEdit(goal)}
                    className="h-7 gap-1.5 text-slate-400 hover:text-slate-100"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleOpenDelete(goal)}
                    className="h-7 gap-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE GOAL MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Establish New Goal">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Goal Name</label>
            <Input
              placeholder="e.g. Community Njangi Security Buffer"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="h-10 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Target Amount (FCFA)</label>
              <Input
                type="number"
                placeholder="e.g. 500000"
                value={formTargetAmount || ''}
                onChange={(e) => setFormTargetAmount(Number(e.target.value))}
                className="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Saved (FCFA)</label>
              <Input
                type="number"
                placeholder="e.g. 50000"
                value={formCurrentAmount || '0'}
                onChange={(e) => setFormCurrentAmount(Number(e.target.value))}
                className="h-10 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Target Completion Date</label>
            <Input
              type="date"
              value={formTargetDate}
              onChange={(e) => setFormTargetDate(e.target.value)}
              className="h-10 text-xs text-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={createMutation.isPending}>
              Create Goal
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT GOAL MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Savings Goal">
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Goal Name</label>
            <Input
              placeholder="e.g. Community Njangi Security Buffer"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="h-10 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Target Amount (FCFA)</label>
              <Input
                type="number"
                placeholder="e.g. 500000"
                value={formTargetAmount || ''}
                onChange={(e) => setFormTargetAmount(Number(e.target.value))}
                className="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Saved (FCFA)</label>
              <Input
                type="number"
                placeholder="e.g. 50000"
                value={formCurrentAmount || '0'}
                onChange={(e) => setFormCurrentAmount(Number(e.target.value))}
                className="h-10 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Target Date</label>
              <Input
                type="date"
                value={formTargetDate}
                onChange={(e) => setFormTargetDate(e.target.value)}
                className="h-10 text-xs text-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Goal Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as GoalStatus)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl h-10 px-3 text-xs outline-none focus:border-slate-700"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={updateMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Savings Goal"
        description={`Are you completely sure you want to drop your goal "${selectedGoal?.name}"? All associated cycle progress figures will be permanently deleted. This operation is non-reversible.`}
        confirmText="Permanently Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

