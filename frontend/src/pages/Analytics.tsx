import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
  Target,
  Activity,
  Sparkles,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  Download,
  Wallet,
  Clock,
  Briefcase
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/common/StatCard';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { Skeleton } from '../components/ui/SkeletonLoader';
import { dashboardService } from '../services/dashboard';
import { transactionsService } from '../services/transactions';
import { formatXAF, formatDate } from '../utils/format';

const PALETTE = [
  '#D4AF37', // Signature Gold
  '#0F8A5F', // Emerald Green
  '#E0B84B', // Warm Honey Gold
  '#2E8B57', // Sea Green / Mint Emerald
  '#C9A227', // Bronze / Deep Gold
  '#0B6E4F', // Forest Emerald
  '#AA8F39', // Brass Gold
  '#1B4D3E', // Brunswick Emerald
  '#F59E0B', // Amber
  '#9B7E30'  // Dark Gold
];

export default function Analytics() {
  // Date filter types
  const [filterType, setFilterType] = React.useState<'this-month' | 'last-30' | 'ytd' | 'custom'>('this-month');
  const [customStartDate, setCustomStartDate] = React.useState('');
  const [customEndDate, setCustomEndDate] = React.useState('');

  // Calculate start/end date strings based on selection
  const { startDate, endDate } = React.useMemo(() => {
    // Reference date set to 2026-07-19 based on local environment metadata
    const now = new Date(2026, 6, 19); // Months are 0-indexed in JS (6 = July)
    let start = '';
    let end = '';

    if (filterType === 'this-month') {
      const y = now.getFullYear();
      const m = now.getMonth();
      start = `${y}-${String(m + 1).padStart(2, '0')}-01`;
      // End date is today (19th) or end of the month
      end = `${y}-${String(m + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    } else if (filterType === 'last-30') {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      start = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`;
      end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    } else if (filterType === 'ytd') {
      start = `${now.getFullYear()}-01-01`;
      end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    } else {
      start = customStartDate;
      end = customEndDate;
    }

    return { startDate: start, endDate: end };
  }, [filterType, customStartDate, customEndDate]);

  // Queries using TanStack Query
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary
  } = useQuery({
    queryKey: ['analyticsSummary', startDate, endDate],
    queryFn: () => dashboardService.getSummary(startDate, endDate)
  });

  const {
    data: netWorthData,
    isLoading: isNetWorthLoading,
    isError: isNetWorthError,
    refetch: refetchNetWorth
  } = useQuery({
    queryKey: ['analyticsNetWorth'],
    queryFn: () => dashboardService.getNetWorth()
  });

  const {
    data: accountBalances,
    isLoading: isBalancesLoading,
    isError: isBalancesError,
    refetch: refetchBalances
  } = useQuery({
    queryKey: ['analyticsAccountBalances'],
    queryFn: () => dashboardService.getAccountBalances()
  });

  const {
    data: incomeData,
    isLoading: isIncomeLoading,
    isError: isIncomeError,
    refetch: refetchIncome
  } = useQuery({
    queryKey: ['analyticsIncome', startDate, endDate],
    queryFn: () => dashboardService.getIncome(startDate, endDate)
  });

  const {
    data: expensesData,
    isLoading: isExpensesLoading,
    isError: isExpensesError,
    refetch: refetchExpenses
  } = useQuery({
    queryKey: ['analyticsExpenses', startDate, endDate],
    queryFn: () => dashboardService.getExpenses(startDate, endDate)
  });

  const {
    data: spendingByCategory,
    isLoading: isSpendingLoading,
    isError: isSpendingError,
    refetch: refetchSpending
  } = useQuery({
    queryKey: ['analyticsSpendingByCategory', startDate, endDate],
    queryFn: () => dashboardService.getSpendingByCategory(startDate, endDate)
  });

  const {
    data: budgets,
    isLoading: isBudgetsLoading,
    isError: isBudgetsError,
    refetch: refetchBudgets
  } = useQuery({
    queryKey: ['analyticsBudgets'],
    queryFn: () => dashboardService.getBudgets()
  });

  const {
    data: insights,
    isLoading: isInsightsLoading,
    isError: isInsightsError,
    refetch: refetchInsights
  } = useQuery({
    queryKey: ['analyticsInsights'],
    queryFn: () => dashboardService.getInsights()
  });

  // Fetch transactions to compute the timeline line chart
  const {
    data: transactions,
    isLoading: isTxLoading,
    isError: isTxError,
    refetch: refetchTransactions
  } = useQuery({
    queryKey: ['analyticsTransactions'],
    queryFn: () => transactionsService.getAll()
  });

  const handleRefreshAll = () => {
    refetchSummary();
    refetchNetWorth();
    refetchBalances();
    refetchIncome();
    refetchExpenses();
    refetchSpending();
    refetchBudgets();
    refetchInsights();
    refetchTransactions();
  };

  const isAnyLoading =
    isSummaryLoading ||
    isNetWorthLoading ||
    isBalancesLoading ||
    isIncomeLoading ||
    isExpensesLoading ||
    isSpendingLoading ||
    isBudgetsLoading ||
    isInsightsLoading ||
    isTxLoading;

  const isAnyError =
    isSummaryError ||
    isNetWorthError ||
    isBalancesError ||
    isIncomeError ||
    isExpensesError ||
    isSpendingError ||
    isBudgetsError ||
    isInsightsError ||
    isTxError;

  // Formatting helper for category keys to friendly names
  const formatCategoryName = (category: string) => {
    return category
      .replace('EXPENSE_', '')
      .replace('INCOME_', '')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  // Recharts custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 border border-slate-900 rounded-xl p-3 shadow-2xl backdrop-blur-md">
          {label && (
            <p className="text-[10px] font-mono font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              {label}
            </p>
          )}
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 text-xs font-semibold py-0.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
              <span className="text-slate-400">{item.name}:</span>
              <span className="text-slate-100 font-mono">{formatXAF(item.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // 1. Process data for Income vs Expenses Bar Chart
  const barChartData = React.useMemo(() => {
    const inc = incomeData?.total_income ?? summary?.total_income ?? 0;
    const exp = expensesData?.total_expenses ?? summary?.total_expenses ?? 0;
    return [
      {
        name: 'Period Flow',
        Income: inc,
        Expenses: exp
      }
    ];
  }, [incomeData, expensesData, summary]);

  // 2. Process data for Spending by Category Donut Chart
  const pieChartData = React.useMemo(() => {
    const data = spendingByCategory || [];
    return data
      .map(item => ({
        name: formatCategoryName(item.category),
        value: item.amount,
        rawCategory: item.category
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [spendingByCategory]);

  const totalPieSpending = React.useMemo(() => {
    return pieChartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [pieChartData]);

  // 3. Process data for Account Balances Horizontal Bar
  const horizontalBarData = React.useMemo(() => {
    const data = accountBalances || [];
    return data.map(item => ({
      name: item.account_name,
      Balance: item.balance
    })).sort((a, b) => b.Balance - a.Balance);
  }, [accountBalances]);

  // 4. Budget progress computation
  const budgetProgressList = React.useMemo(() => {
    return budgets || summary?.budget_progress || [];
  }, [budgets, summary]);

  const totalBudgetLimit = React.useMemo(() => {
    return budgetProgressList.reduce((acc, curr) => acc + curr.limit_amount, 0);
  }, [budgetProgressList]);

  const totalBudgetSpent = React.useMemo(() => {
    return budgetProgressList.reduce((acc, curr) => acc + curr.spent_amount, 0);
  }, [budgetProgressList]);

  const overallBudgetPercentage = React.useMemo(() => {
    if (totalBudgetLimit === 0) return 0;
    return Math.min(100, Math.round((totalBudgetSpent / totalBudgetLimit) * 100));
  }, [totalBudgetSpent, totalBudgetLimit]);

  // 5. Cash Flow Timeline Line Chart
  const lineChartData = React.useMemo(() => {
    if (!transactions) return [];

    // Filter transactions by date range
    const filtered = transactions.filter(tx => {
      const txDate = tx.timestamp || tx.created_at;
      if (!txDate) return false;
      const dateStr = txDate.split('T')[0];
      if (startDate && dateStr < startDate) return false;
      if (endDate && dateStr > endDate) return false;
      return true;
    });

    // Group by date
    const groups: Record<string, { date: string; Income: number; Expenses: number }> = {};
    filtered.forEach(tx => {
      const dateStr = (tx.timestamp || tx.created_at).split('T')[0];
      if (!groups[dateStr]) {
        groups[dateStr] = { date: dateStr, Income: 0, Expenses: 0 };
      }
      if (tx.direction === 'CREDIT') {
        groups[dateStr].Income += tx.amount;
      } else {
        groups[dateStr].Expenses += tx.amount;
      }
    });

    // Sort chronologically
    return Object.values(groups)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(item => ({
        ...item,
        FormattedDate: formatDate(item.date)
      }));
  }, [transactions, startDate, endDate]);

  // Verify if there is ANY financial activity inside the selected date range
  const hasSelectedPeriodData = React.useMemo(() => {
    const inc = incomeData?.total_income ?? summary?.total_income ?? 0;
    const exp = expensesData?.total_expenses ?? summary?.total_expenses ?? 0;
    const spendingLength = spendingByCategory?.length ?? 0;
    return inc > 0 || exp > 0 || spendingLength > 0 || lineChartData.length > 0;
  }, [incomeData, expensesData, summary, spendingByCategory, lineChartData]);

  // Calculated savings
  const totalIncomeVal = incomeData?.total_income ?? summary?.total_income ?? 0;
  const totalExpensesVal = expensesData?.total_expenses ?? summary?.total_expenses ?? 0;
  const netSavingsVal = totalIncomeVal - totalExpensesVal;

  return (
    <div className="space-y-6 pb-12">
      {/* PAGE HEADER */}
      <PageHeader
        title="Visual Ledger & Financial Analytics"
        description="Monitor multi-dimensional financial metrics, category distributions, budget variances, and automated advisory patterns."
        action={
          <Button variant="outline" size="sm" className="gap-2 shrink-0 opacity-60 cursor-not-allowed" disabled>
            <Download className="w-3.5 h-3.5" />
            Coming Soon
          </Button>
        }
      />

      {/* FILTER CONTROL PANEL */}
      <Card className="border border-slate-900 bg-slate-950/40">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          {/* Quick Date Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider mr-2">
              Timeframe:
            </span>
            <div className="flex bg-slate-950 border border-slate-900 rounded-xl p-1">
              <button
                id="filterThisMonth"
                onClick={() => setFilterType('this-month')}
                className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                  filterType === 'this-month'
                    ? 'bg-slate-850 text-white border border-slate-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                This Month
              </button>
              <button
                id="filterLast30"
                onClick={() => setFilterType('last-30')}
                className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                  filterType === 'last-30'
                    ? 'bg-slate-850 text-white border border-slate-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Last 30 Days
              </button>
              <button
                id="filterYtd"
                onClick={() => setFilterType('ytd')}
                className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                  filterType === 'ytd'
                    ? 'bg-slate-850 text-white border border-slate-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Year to Date
              </button>
              <button
                id="filterCustom"
                onClick={() => setFilterType('custom')}
                className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                  filterType === 'custom'
                    ? 'bg-slate-850 text-white border border-slate-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Custom Range
              </button>
            </div>
          </div>

          {/* Custom Date Inputs */}
          {filterType === 'custom' && (
            <div className="flex items-center gap-2.5 bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-xl animate-fade-in">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="date"
                id="customStartDate"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-200 font-mono outline-none focus:ring-0 max-w-[110px]"
              />
              <span className="text-slate-600 text-xs">—</span>
              <input
                type="date"
                id="customEndDate"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-200 font-mono outline-none focus:ring-0 max-w-[110px]"
              />
            </div>
          )}

          {/* Refresh Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            className="shrink-0 h-9 px-3 hover:border-slate-800/80"
          >
            <RefreshCcw className={`w-3.5 h-3.5 mr-2 ${isAnyLoading ? 'animate-spin text-emerald-400' : ''}`} />
            Refresh Analytics
          </Button>
        </CardContent>
      </Card>

      {/* ERROR CARDS PANEL */}
      {isAnyError && (
        <ErrorState
          title="Data Synchronization Failure"
          message="We encountered connection anomalies while gathering historical metrics from some dashboard endpoints. Check networking and retry."
          onRetry={handleRefreshAll}
        />
      )}

      {/* SKELETON LOADERS */}
      {isAnyLoading ? (
        <div className="space-y-6">
          {/* Skeletons for Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="animate-pulse bg-slate-900/40 border border-slate-900 rounded-2xl p-5 h-28 flex flex-col justify-between" />
            <div className="animate-pulse bg-slate-900/40 border border-slate-900 rounded-2xl p-5 h-28 flex flex-col justify-between" />
            <div className="animate-pulse bg-slate-900/40 border border-slate-900 rounded-2xl p-5 h-28 flex flex-col justify-between" />
            <div className="animate-pulse bg-slate-900/40 border border-slate-900 rounded-2xl p-5 h-28 flex flex-col justify-between" />
            <div className="animate-pulse bg-slate-900/40 border border-slate-900 rounded-2xl p-5 h-28 flex flex-col justify-between" />
          </div>

          {/* Skeletons for Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="h-[360px] animate-pulse" />
            <Card className="h-[360px] animate-pulse" />
            <Card className="h-[360px] animate-pulse" />
            <Card className="h-[360px] animate-pulse" />
          </div>
        </div>
      ) : !hasSelectedPeriodData ? (
        /* EMPTY STATE PATTERN */
        <EmptyState
          icon={Activity}
          title="No financial data available"
          description="There are no transaction flows or category totals computed for this specific timeframe. Try shifting the Date Range filters or logging manual entries."
          actionText="Log Transaction"
          onAction={handleRefreshAll} // Safe action
        />
      ) : (
        /* CORE VISUALIZATION CONTENT */
        <div className="space-y-6">
          {/* TOP SUMMARY STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Net Worth"
              value={formatXAF(netWorthData?.net_worth ?? summary?.total_net_worth ?? 0)}
              description="Consolidated wallet ledger balance"
              icon={Wallet}
            />
            <StatCard
              title="Total Income"
              value={formatXAF(totalIncomeVal)}
              description="Aggregated inflow streams"
              icon={TrendingUp}
              trend={totalIncomeVal > 0 ? { value: 100, isPositive: true } : undefined}
            />
            <StatCard
              title="Total Expenses"
              value={formatXAF(totalExpensesVal)}
              description="Aggregated outflow ledger"
              icon={TrendingDown}
              trend={totalExpensesVal > 0 ? { value: 100, isPositive: false } : undefined}
            />
            <StatCard
              title="Net Savings"
              value={formatXAF(netSavingsVal)}
              description="Period net margin surplus"
              icon={Target}
              trend={netSavingsVal >= 0 ? { value: 100, isPositive: true } : { value: 100, isPositive: false }}
            />
            <StatCard
              title="Budget Usage"
              value={`${overallBudgetPercentage}%`}
              description={`${formatXAF(totalBudgetSpent)} of ${formatXAF(totalBudgetLimit)}`}
              icon={PieIcon}
            />
          </div>

          {/* MAIN CHARTS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Income vs Expenses (Bar Chart) */}
            <Card className="border border-slate-900 bg-slate-950/40">
              <CardHeader className="pb-4">
                <CardTitle className="text-xs font-mono font-black text-slate-400 tracking-wider flex items-center gap-2 uppercase">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  Inflow vs Outflow Cash Flow
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-500">
                  Side-by-side scale comparison of income deposits and expense transactions during the active timeframe.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[280px] pb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b/30" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontStyle="italic" />
                    <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v / 1000}k`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(30, 41, 59, 0.2)' }} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                    <Bar dataKey="Income" fill="#0F8A5F" radius={[8, 8, 0, 0]} maxBarSize={45} />
                    <Bar dataKey="Expenses" fill="#dc2626" radius={[8, 8, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Chart 2: Spending by Category (Donut / Pie) */}
            <Card className="border border-slate-900 bg-slate-950/40">
              <CardHeader className="pb-4">
                <CardTitle className="text-xs font-mono font-black text-slate-400 tracking-wider flex items-center gap-2 uppercase">
                  <PieIcon className="w-4 h-4 text-gold" />
                  Category Spending Allocation
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-500">
                  Percentage breakdown distribution of outflows grouped by standard backend-classified categories.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-center gap-6 pb-6">
                {pieChartData.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-xs h-[200px]">
                    <AlertTriangle className="w-5 h-5 mb-2 opacity-50" />
                    No categorized expenditures to display.
                  </div>
                ) : (
                  <>
                    {/* Donut representation */}
                    <div className="w-[180px] h-[180px] shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Donut Legend Table list */}
                    <div className="flex-1 w-full max-h-[220px] overflow-y-auto pr-1">
                      <table className="w-full text-[11px] text-left">
                        <thead>
                          <tr className="text-slate-500 font-mono border-b border-slate-900/40 pb-1 uppercase">
                            <th className="font-semibold pb-1.5">Category</th>
                            <th className="font-semibold text-right pb-1.5">Amount</th>
                            <th className="font-semibold text-right pb-1.5">%</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900/30 text-slate-300 font-medium">
                          {pieChartData.map((item, idx) => {
                            const percent = totalPieSpending > 0 ? Math.round((item.value / totalPieSpending) * 100) : 0;
                            return (
                              <tr key={idx} className="hover:bg-slate-900/20">
                                <td className="py-1.5 flex items-center gap-2 truncate max-w-[120px]">
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
                                  />
                                  <span>{item.name}</span>
                                </td>
                                <td className="py-1.5 text-right font-mono text-slate-400">
                                  {formatXAF(item.value)}
                                </td>
                                <td className="py-1.5 text-right font-mono text-gold font-bold">
                                  {percent}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Chart 3: Cash Flow Timeline (Line Chart) */}
            <Card className="border border-slate-900 bg-slate-950/40">
              <CardHeader className="pb-4">
                <CardTitle className="text-xs font-mono font-black text-slate-400 tracking-wider flex items-center gap-2 uppercase">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Chronological Cash Flow Timeline
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-500">
                  Daily timeline charts representing the velocity of incoming (credit) and outgoing (debit) transactions.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[280px] pb-6">
                {lineChartData.length === 0 ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 text-xs">
                    <Clock className="w-5 h-5 mb-2 opacity-50" />
                    Insufficient transaction timestamps in selected range.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b/30" vertical={false} />
                      <XAxis dataKey="FormattedDate" stroke="#64748b" fontSize={9} />
                      <YAxis stroke="#64748b" fontSize={9} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconSize={10} wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                      <Line
                        type="monotone"
                        dataKey="Income"
                        stroke="#0F8A5F"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Expenses"
                        stroke="#dc2626"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Chart 4: Account Balances (Horizontal Bar Chart) */}
            <Card className="border border-slate-900 bg-slate-950/40">
              <CardHeader className="pb-4">
                <CardTitle className="text-xs font-mono font-black text-slate-400 tracking-wider flex items-center gap-2 uppercase">
                  <Briefcase className="w-4 h-4 text-gold" />
                  Ledger Wallet Distributions
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-500">
                  Horizontal representation comparing liquid balance distribution across synchronized Mobile Money and bank accounts.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[280px] pb-6">
                {horizontalBarData.length === 0 ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 text-xs">
                    <Wallet className="w-5 h-5 mb-2 opacity-50" />
                    No connected ledger wallets found.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={horizontalBarData}
                      margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b/30" horizontal={false} />
                      <XAxis type="number" stroke="#64748b" fontSize={9} tickFormatter={(v) => `${v / 1000}k`} />
                      <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} width={80} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(30, 41, 59, 0.2)' }} />
                      <Bar dataKey="Balance" fill="#D4AF37" radius={[0, 6, 6, 0]} maxBarSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* SECTION: BUDGET PERFORMANCE & VARIANCE CORES */}
          <Card className="border border-slate-900 bg-slate-950/40">
            <CardHeader className="pb-4 border-b border-slate-900/40">
              <CardTitle className="text-xs font-mono font-black text-slate-400 tracking-wider flex items-center gap-2 uppercase">
                <Target className="w-4 h-4 text-gold" />
                Ledger Budget Allocations & Variance progress
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Performance indices measuring spent margins relative to authorized limits defined across active categories.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 pb-6">
              {budgetProgressList.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <AlertTriangle className="w-5 h-5 mx-auto mb-2 opacity-50" />
                  No budget progress metrics registered. Create a budget in the Budgets section first.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5">
                  {budgetProgressList.map((prog, idx) => {
                    const usage = prog.percentage_used;
                    let barColor = 'bg-emerald-500';
                    if (usage >= 100) barColor = 'bg-rose-500';
                    else if (usage >= 80) barColor = 'bg-amber-500';

                    return (
                      <div key={idx} className="space-y-2 bg-slate-950 border border-slate-900 p-4 rounded-2xl">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                          <span className="truncate max-w-[150px]">{formatCategoryName(prog.category)}</span>
                          <span className="font-mono text-slate-400">{usage}% used</span>
                        </div>
                        {/* Progress Bar Container */}
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${barColor} rounded-full transition-all duration-500`}
                            style={{ width: `${Math.min(100, usage)}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-semibold font-mono text-slate-500 pt-0.5">
                          <span>Spent: {formatXAF(prog.spent_amount)}</span>
                          <span>Limit: {formatXAF(prog.limit_amount)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION: AI PROACTIVE INSIGHTS & ADVISORIES */}
          <Card className="border border-purple-950/20 bg-slate-950/40 relative overflow-hidden">
            {/* Soft decorative ambient glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full filter blur-3xl pointer-events-none" />

            <CardHeader className="pb-4 border-b border-slate-900/40 relative z-10">
              <CardTitle className="text-xs font-mono font-black text-purple-400 tracking-wider flex items-center gap-2 uppercase">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Automated Advisor Insights & Anomalies
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Proactive rules, spending anomaly alerts, budget thresholds, and savings guidelines analyzed by our advisory ledger.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-6 relative z-10 space-y-6">
              {/* General income trend overview */}
              {insights?.income_trend && (
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl flex items-start gap-3">
                  <span className="p-2 bg-purple-950/30 border border-purple-900/40 text-purple-400 rounded-xl">
                    <Activity className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Velocity & Income Trend
                    </h4>
                    <p className="text-xs text-slate-200 font-medium">{insights.income_trend}</p>
                  </div>
                </div>
              )}

              {/* Largest single expense info */}
              {insights?.largest_expense && (insights.largest_expense.amount > 0) && (
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl flex items-start gap-3">
                  <span className="p-2 bg-rose-950/30 border border-rose-900/40 text-rose-400 rounded-xl">
                    <TrendingDown className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Largest Single Outflow Index
                    </h4>
                    <p className="text-xs text-slate-200 font-semibold mb-1">
                      {insights.largest_expense.narrative || 'No description provided'}
                    </p>
                    <span className="font-mono text-xs text-rose-400 font-black">
                      {formatXAF(insights.largest_expense.amount)}
                    </span>
                  </div>
                </div>
              )}

              {/* Warnings and anomalies subgrid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5">
                {/* Unusual Spending / Anomalies */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    Anomalous spend alerts
                  </h4>
                  {insights?.unusual_spending_alerts && insights.unusual_spending_alerts.length > 0 ? (
                    <ul className="space-y-2">
                      {insights.unusual_spending_alerts.map((alert, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-slate-300 font-medium bg-rose-500/5 border border-rose-950/30 p-3.5 rounded-xl flex items-start gap-2.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                          <span>{alert}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-600 font-mono italic">No critical billing anomalies detected.</p>
                  )}
                </div>

                {/* Budget warning markers */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Limit & Budget warnings
                  </h4>
                  {insights?.budget_warnings && insights.budget_warnings.length > 0 ? (
                    <ul className="space-y-2">
                      {insights.budget_warnings.map((warn, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-slate-300 font-medium bg-amber-500/5 border border-amber-950/30 p-3.5 rounded-xl flex items-start gap-2.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                          <span>{warn}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-600 font-mono italic">All ledger budgets operating within healthy margins.</p>
                  )}
                </div>
              </div>

              {/* Savings suggestions list */}
              <div className="pt-2">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-3">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  Savings Optimization suggestions
                </h4>
                {insights?.savings_suggestions && insights.savings_suggestions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {insights.savings_suggestions.map((sugg, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-slate-300 font-medium bg-slate-950 border border-slate-900 p-4 rounded-xl flex items-start gap-3"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                        <span>{sugg}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 font-mono italic">No additional optimization pathways recommended currently.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
