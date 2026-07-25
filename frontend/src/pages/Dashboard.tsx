import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  TrendingUp, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Target, 
  Clock, 
  Sparkles,
  PieChart,
  RefreshCcw,
  Calendar,
  AlertTriangle,
  Info,
  ChevronRight,
  ShieldAlert,
  Bell,
  CheckCircle2,
  ListFilter,
  Coins,
  Utensils,
  Lightbulb,
  Heart,
  GraduationCap,
  Fuel,
  Users,
  Sprout
} from 'lucide-react';

import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/common/ErrorState';
import { Skeleton, StatCardSkeleton } from '../components/ui/SkeletonLoader';
import { useAuthStore } from '../store/authStore';
import { formatXAF, formatDate } from '../utils/format';
import { dashboardService } from '../services/dashboard';
import { accountsService } from '../services/accounts';

// Helper to match transaction categories to Lucide icons
const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('food') || cat.includes('grocery')) return Utensils;
  if (cat.includes('electricity') || cat.includes('water') || cat.includes('internet') || cat.includes('utilit')) return Lightbulb;
  if (cat.includes('medical') || cat.includes('health')) return Heart;
  if (cat.includes('school') || cat.includes('education') || cat.includes('fee')) return GraduationCap;
  if (cat.includes('taxi') || cat.includes('moto') || cat.includes('transport') || cat.includes('commute')) return Fuel;
  if (cat.includes('fee') || cat.includes('cashout') || cat.includes('commission')) return CreditCard;
  if (cat.includes('njangi') || cat.includes('savings') || cat.includes('club')) return Users;
  if (cat.includes('agri') || cat.includes('growth') || cat.includes('invest')) return Sprout;
  if (cat.includes('salary') || cat.includes('wage')) return Coins;
  if (cat.includes('business') || cat.includes('trade')) return TrendingUp;
  return Coins;
};

// Helper to fetch provider styling metadata
const getProviderDetails = (provider: string) => {
  const prov = provider.toUpperCase();
  if (prov.includes('MTN')) {
    return {
      fullName: 'MTN Mobile Money',
      gradientClass: 'from-amber-500/10 via-yellow-500/5 to-transparent border-yellow-500/20 hover:border-yellow-500/40',
      tagClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      logoColor: 'text-yellow-400'
    };
  }
  if (prov.includes('ORANGE')) {
    return {
      fullName: 'Orange Money',
      gradientClass: 'from-orange-500/10 via-orange-500/5 to-transparent border-orange-500/20 hover:border-orange-500/40',
      tagClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      logoColor: 'text-orange-400'
    };
  }
  if (prov.includes('EU') || prov.includes('EXPRESS')) {
    return {
      fullName: 'Express Union Mobile',
      gradientClass: 'from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20 hover:border-emerald-500/40',
      tagClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      logoColor: 'text-emerald-400'
    };
  }
  if (prov.includes('SARA')) {
    return {
      fullName: 'Sara Money',
      gradientClass: 'from-teal-500/10 via-teal-500/5 to-transparent border-teal-500/20 hover:border-teal-500/40',
      tagClass: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      logoColor: 'text-teal-400'
    };
  }
  return {
    fullName: provider || 'Local Wallet',
    gradientClass: 'from-slate-500/10 via-slate-500/5 to-transparent border-slate-700/30 hover:border-slate-600/40',
    tagClass: 'bg-slate-800/40 text-slate-400 border-slate-700/40',
    logoColor: 'text-slate-400'
  };
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Default dates: First day of current month until today
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const formatDateToISO = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [startDate, setStartDate] = React.useState<string>(formatDateToISO(firstDayOfMonth));
  const [endDate, setEndDate] = React.useState<string>(formatDateToISO(today));

  // 1. Fetch comprehensive dashboard summary
  const { 
    data: summary, 
    isLoading: isSummaryLoading, 
    isError: isSummaryError,
    refetch: refetchSummary 
  } = useQuery({
    queryKey: ['dashboardSummary', startDate, endDate],
    queryFn: () => dashboardService.getSummary(startDate, endDate)
  });

  // 2. Fetch AI-powered insights
  const {
    data: insights,
    isLoading: isInsightsLoading,
    isError: isInsightsError,
    refetch: refetchInsights
  } = useQuery({
    queryKey: ['dashboardInsights'],
    queryFn: () => dashboardService.getInsights(),
    retry: false
  });

  // 3. Fetch detailed accounts
  const {
    data: accounts,
    isLoading: isAccountsLoading,
    isError: isAccountsError,
    refetch: refetchAccounts
  } = useQuery({
    queryKey: ['dashboardAccounts'],
    queryFn: () => accountsService.getAll()
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchSummary(),
        refetchInsights(),
        refetchAccounts()
      ]);
    } catch (err) {
      console.error('Failed to reload dashboard components:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleQuickRange = (range: 'this-month' | 'last-30' | 'this-year') => {
    const end = new Date();
    let start = new Date();
    
    if (range === 'this-month') {
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    } else if (range === 'last-30') {
      start.setDate(end.getDate() - 30);
    } else if (range === 'this-year') {
      start = new Date(end.getFullYear(), 0, 1);
    }
    
    setStartDate(formatDateToISO(start));
    setEndDate(formatDateToISO(end));
  };

  // Check if primary items are loading
  const isGlobalLoading = isSummaryLoading || isAccountsLoading;
  const isGlobalError = isSummaryError || isAccountsError;

  if (isGlobalError) {
    return (
      <div className="py-12 max-w-xl mx-auto">
        <ErrorState 
          title="Data Ingestion Interrupted" 
          message="We were unable to establish a secure link with your Mbamager local API. Ensure your backend server is online." 
          onRetry={handleRefresh}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Greeter and operating controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1 border-b border-slate-900/60 pb-5">
        <div>
          <span className="text-[10px] font-mono text-gold font-bold tracking-widest uppercase">
            OPERATIONAL HUD
          </span>
          <h1 className="text-xl font-black tracking-tight text-slate-100 mt-0.5">
            Welcome, {user?.username || 'Operator'}
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {formatDate(today)} • Cameroon local time
          </p>
        </div>

        {/* Filters and Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick-interval triggers */}
          <div className="flex bg-slate-900/40 border border-slate-800 rounded-xl p-1 shrink-0">
            <button
              onClick={() => handleQuickRange('this-month')}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                startDate === formatDateToISO(firstDayOfMonth) && endDate === formatDateToISO(today)
                  ? 'bg-gold text-white shadow-md shadow-gold-500/10'
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              MTD
            </button>
            <button
              onClick={() => handleQuickRange('last-30')}
              className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              30D
            </button>
            <button
              onClick={() => handleQuickRange('this-year')}
              className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              YTD
            </button>
          </div>

          {/* Precision date inputs */}
          <div className="flex items-center gap-1.5 bg-slate-900/40 border border-slate-900 rounded-xl px-2.5 py-1 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none text-[10px] font-mono font-bold text-slate-300 focus:outline-none focus:ring-0 max-w-[95px] p-0"
              title="Start Date"
            />
            <span className="text-slate-600 text-xs font-bold font-mono">—</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none text-[10px] font-mono font-bold text-slate-300 focus:outline-none focus:ring-0 max-w-[95px] p-0"
              title="End Date"
            />
          </div>

          {/* Refresh Action */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isGlobalLoading || isRefreshing}
            className="gap-2 text-xs shrink-0"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${isGlobalLoading || isRefreshing ? 'animate-spin text-gold' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Primary Financial Indicators Row */}
      {isGlobalLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            title="AGGREGATED NET WORTH"
            value={formatXAF(summary?.total_net_worth ?? 0)}
            description="Dynamic consolidated cash balance"
            icon={TrendingUp}
          />
          <StatCard
            title="INTERVAL TOTAL INCOME"
            value={formatXAF(summary?.total_income ?? 0)}
            description="Inflow transactions during period"
            icon={ArrowUpRight}
            trend={{ value: 0, isPositive: true }} // Just a decoration or placeholder
          />
          <StatCard
            title="INTERVAL TOTAL EXPENSES"
            value={formatXAF(summary?.total_expenses ?? 0)}
            description="Outflow ledger transactions & fees"
            icon={ArrowDownRight}
          />
        </div>
      )}

      {/* ACCOUNT SECTION: WALLETS GRID */}
      <div>
        <div className="flex items-center justify-between mb-4.5">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gold" />
            <h2 className="text-sm font-black text-slate-200 tracking-tight uppercase font-mono">
              Registered Accounts & MoMo Wallets
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {accounts?.length || 0} Registered
          </span>
        </div>

        {isGlobalLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        ) : !accounts || accounts.length === 0 ? (
          <div className="bg-slate-900/10 border border-slate-900 border-dashed rounded-2xl p-7 text-center">
            <Info className="w-5 h-5 text-slate-500 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-slate-300">No Mobile Wallets Synced</h3>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Once you configure active MTN, Orange, or bank connections in the Accounts panel, your real-time ledger records will show here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
            {accounts.map((account) => {
              const details = getProviderDetails(account.provider);
              const dynamicBalance = summary?.account_balances?.[account.id] ?? account.balance;

              return (
                <Card 
                  key={account.id} 
                  hoverEffect 
                  className={`bg-gradient-to-br ${details.gradientClass} relative overflow-hidden flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div>
                        <span className={`text-[9px] font-bold font-mono px-2 py-0.5 border rounded-full uppercase tracking-wider ${details.tagClass}`}>
                          {details.fullName}
                        </span>
                        <h3 className="text-xs font-bold text-slate-100 mt-1.5 tracking-tight truncate max-w-[160px]">
                          {account.name}
                        </h3>
                      </div>

                      {/* Network indicator */}
                      <span className="flex items-center gap-1 text-[9px] font-mono font-bold uppercase text-slate-400 shrink-0">
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${account.is_active ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        {account.is_active ? 'Active' : 'Offline'}
                      </span>
                    </div>

                    <div className="text-lg font-black text-slate-100 tracking-tight font-mono">
                      {formatXAF(dynamicBalance)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-900/40 text-[9px] text-slate-500 font-mono">
                    <span>ID: #{account.id}</span>
                    <span className="font-bold">{account.currency || 'XAF'}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* BENTO HUB: SPENDING, BUDGETS AND INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT TWO-COLUMNS BENTO: SPENDING & BUDGETS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* BUDGET PROGRESS */}
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-tight font-mono">
                  <Target className="w-4 h-4 text-gold" />
                  Active Budget Thresholds
                </CardTitle>
                <CardDescription>
                  Real-time budget limits and warning states for active periods.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {isGlobalLoading ? (
                <div className="space-y-4 pt-1">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
              ) : !summary?.budget_progress || summary.budget_progress.length === 0 ? (
                <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-2xl text-center">
                  <Clock className="w-5 h-5 text-slate-500 mx-auto mb-2" />
                  <p className="text-[11px] text-slate-400 font-medium">
                    No active category thresholds logged for this month.
                  </p>
                </div>
              ) : (
                <div className="space-y-4.5 pt-1">
                  {summary.budget_progress.map((progress) => {
                    const pct = Number(progress.percentage_used);
                    const isNearing = pct >= 80 && pct < 100;
                    const isExceeded = pct >= 100;
                    
                    let progressColor = 'bg-gradient-to-r from-gold to-gold-300';
                    let bgBorderColor = 'border-slate-800 bg-slate-900/40';
                    if (isNearing) {
                      progressColor = 'bg-gradient-to-r from-amber-500 to-orange-400';
                    } else if (isExceeded) {
                      progressColor = 'bg-rose-500';
                      bgBorderColor = 'border-rose-950/50 bg-rose-950/5';
                    }

                    const CategoryIcon = getCategoryIcon(progress.category);

                    return (
                      <div 
                        key={progress.budget_id} 
                        className={`p-4 bg-slate-950/50 border ${bgBorderColor} rounded-2xl flex flex-col gap-2.5 transition-all duration-300`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-slate-900 rounded-lg text-slate-400 border border-slate-800">
                              <CategoryIcon className="w-3.5 h-3.5" />
                            </span>
                            <div>
                              <span className="text-xs font-bold text-slate-200">
                                {progress.category}
                              </span>
                              <div className="text-[9px] font-mono text-slate-500 mt-0.5 uppercase">
                                Range: {formatDate(progress.start_date)} - {formatDate(progress.end_date)}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-black text-slate-100 font-mono">
                              {formatXAF(Number(progress.spent_amount))}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium"> / {formatXAF(Number(progress.limit_amount))}</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-900/80 rounded-full h-2 overflow-hidden border border-slate-950">
                          <div 
                            className={`${progressColor} h-2 rounded-full transition-all duration-500`} 
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className={`font-semibold ${isExceeded ? 'text-rose-400' : isNearing ? 'text-amber-400' : 'text-slate-400'}`}>
                            {pct.toFixed(0)}% used
                          </span>
                          
                          {isExceeded ? (
                            <span className="flex items-center gap-1 text-rose-400 font-bold">
                              <ShieldAlert className="w-3 h-3" />
                              Cap Overdraft ({formatXAF(Math.abs(Number(progress.remaining_amount)))})
                            </span>
                          ) : (
                            <span className="text-slate-500 font-medium">
                              {formatXAF(Number(progress.remaining_amount))} remaining
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SPENDING BY CATEGORY */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-tight font-mono">
                <PieChart className="w-4 h-4 text-gold" />
                Expenditure Distribution
              </CardTitle>
              <CardDescription>
                Consolidated outgoing cash categorised during the selected date interval.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGlobalLoading ? (
                <div className="space-y-4 pt-1">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
              ) : !insights?.top_spending_categories || insights.top_spending_categories.length === 0 ? (
                <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-2xl text-center">
                  <Info className="w-5 h-5 text-slate-500 mx-auto mb-2" />
                  <p className="text-[11px] text-slate-400 font-medium">
                    No debit entries registered within this range.
                  </p>
                </div>
              ) : (
                <div className="space-y-4.5 pt-1">
                  {insights.top_spending_categories.map((item, index) => {
                    const CategoryIcon = getCategoryIcon(item.category);
                    const percentage = item.percentage ?? 0;

                    return (
                      <div key={item.category} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-slate-950/80 border border-slate-900 rounded-lg text-slate-400">
                              <CategoryIcon className="w-3.5 h-3.5" />
                            </span>
                            <span className="font-bold text-slate-200">{item.category}</span>
                          </div>
                          <div className="text-right font-mono">
                            <span className="font-black text-slate-100">{formatXAF(Number(item.amount))}</span>
                            <span className="text-[10px] text-slate-500 font-bold ml-1.5">({percentage.toFixed(1)}%)</span>
                          </div>
                        </div>

                        {/* Staggered loading gradients */}
                        <div className="w-full bg-slate-950/40 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-gold to-gold-300 h-1.5 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDEBAR BENTO: AI ADVISOR, GOALS & NOTIFICATIONS */}
        <div className="space-y-6">
          
          {/* AI SMART ADVISOR INSIGHTS */}
          <Card className="border border-slate-800 bg-slate-900/20 shadow-xl overflow-hidden flex flex-col justify-between">
            <div>
              <CardHeader className="bg-gradient-to-r from-gold-50/30 to-gold-100/10 dark:from-gold-500/10 dark:to-transparent border-b border-slate-800/60 py-4.5 px-6">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-tight font-mono text-gold">
                    <Sparkles className="w-4 h-4" />
                    AI Smart Advisor
                  </CardTitle>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-black">
                    Gemini Live
                  </span>
                </div>
                <CardDescription className="text-slate-400 mt-1">
                  Active neural financial diagnostics parsed from your Mobile Money history.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-5 space-y-4">
                {isInsightsLoading ? (
                  <div className="space-y-3 pt-1">
                    <Skeleton className="h-14" />
                    <Skeleton className="h-14" />
                  </div>
                ) : isInsightsError || !insights ? (
                  <div className="text-center p-4 bg-slate-950/40 border border-slate-900 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-slate-600 mx-auto mb-1.5" />
                    <p className="text-[11px] text-slate-500 italic">
                      Advisor metrics could not be established. Generate transaction logs to trigger AI insights.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Income trajectory highlight */}
                    {insights.income_trend && (
                      <div className="p-3.5 bg-gold-50/40 border border-gold-200/40 dark:bg-gold-500/5 dark:border-gold-500/10 rounded-2xl">
                        <div className="flex items-center gap-2 mb-1.5 text-[10px] font-bold text-gold font-mono uppercase tracking-wider">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Inflow Trajectory
                        </div>
                        <p className="text-[11px] text-slate-300 font-medium leading-relaxed italic">
                          "{insights.income_trend}"
                        </p>
                      </div>
                    )}

                    {/* Largest expense diagnostic */}
                    {insights.largest_expense && insights.largest_expense.amount > 0 && (
                      <div className="p-3.5 bg-slate-950/50 border border-slate-900 rounded-2xl flex justify-between items-center gap-3">
                        <div>
                          <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                            Peak Expenditure Event
                          </div>
                          <p className="text-xs font-bold text-slate-200 mt-0.5 truncate max-w-[140px]">
                            {insights.largest_expense.narrative || 'Unspecified Narrative'}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-rose-400 font-mono">
                            {formatXAF(Number(insights.largest_expense.amount))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Savings/Budget recommendation feed */}
                    {(insights.savings_suggestions?.length > 0 || insights.budget_recommendations?.length > 0) && (
                      <div className="space-y-2.5">
                        <div className="text-[10px] font-mono text-slate-400 font-black uppercase tracking-wider">
                          Recommendations & Tips
                        </div>
                        
                        <div className="space-y-2">
                          {[
                            ...(insights.savings_suggestions || []),
                            ...(insights.budget_recommendations || [])
                          ].slice(0, 3).map((tip, i) => (
                             <div key={i} className="flex gap-2 text-[11px] text-slate-300 font-medium leading-relaxed">
                              <span className="text-gold shrink-0 select-none mt-0.5">▪</span>
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Anomalies and Warnings Alert */}
                    {(insights.budget_warnings?.length > 0 || insights.unusual_spending_alerts?.length > 0) && (
                      <div className="p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-2xl space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 font-mono uppercase tracking-wider">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Risk Indicators
                        </div>
                        
                        <div className="space-y-1.5">
                          {[
                            ...(insights.budget_warnings || []),
                            ...(insights.unusual_spending_alerts || [])
                          ].slice(0, 2).map((alert, idx) => (
                            <div key={idx} className="text-[10px] text-rose-300 font-medium leading-relaxed">
                              • {alert}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </div>
          </Card>

          {/* ACTIVE SAVINGS PRIORITIES (IF RETURNED) */}
          {summary?.savings_goals && (
            <Card className="shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-tight font-mono">
                  <Target className="w-4 h-4 text-gold" />
                  Savings Priorities
                </CardTitle>
                <CardDescription>
                  Tracking goal cycles and Njangi contributions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                {isGlobalLoading ? (
                  <Skeleton className="h-10" />
                ) : summary.savings_goals.length === 0 ? (
                  <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl text-center text-[11px] text-slate-500 italic">
                    No active targets registered.
                  </div>
                ) : (
                  summary.savings_goals.slice(0, 2).map((goal) => {
                    const current = Number(goal.current_amount);
                    const target = Number(goal.target_amount);
                    const pct = target > 0 ? (current / target) * 100 : 0;

                    return (
                      <div key={goal.id} className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-200">{goal.name}</span>
                          <span className="font-mono text-slate-400 font-bold">
                            {formatXAF(current)} / {formatXAF(target)}
                          </span>
                        </div>
                        
                        <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-gold to-gold-300 h-1 rounded-full" 
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          )}

          {/* UNREAD NOTIFICATIONS (IF RETURNED) */}
          {summary?.unread_notifications && (
            <Card className="shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-tight font-mono">
                  <Bell className="w-4 h-4 text-gold" />
                  Alert Stream
                </CardTitle>
                <CardDescription>
                  Unread operating reminders and ledger event highlights.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isGlobalLoading ? (
                  <Skeleton className="h-10" />
                ) : summary.unread_notifications.length === 0 ? (
                  <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl text-center text-[11px] text-slate-500">
                    No unread system notifications.
                  </div>
                ) : (
                  summary.unread_notifications.slice(0, 3).map((notif) => (
                    <div 
                      key={notif.id} 
                      className="p-3 bg-slate-950/40 border border-slate-900 hover:border-slate-800 rounded-xl flex items-start gap-2 text-left transition-colors duration-200"
                    >
                      <span className="p-1.5 bg-slate-900 rounded-lg text-gold border border-slate-800 shrink-0 mt-0.5">
                        <Bell className="w-3 h-3" />
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{notif.title}</div>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
