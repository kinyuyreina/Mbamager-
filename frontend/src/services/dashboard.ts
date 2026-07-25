import { api } from '../lib/api';
import { 
  SavingsGoal, 
  RecurringTransaction, 
  Notification,
  Account
} from '../types';

export interface BudgetProgress {
  budget_id: number;
  category: string;
  limit_amount: number;
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
  start_date: string;
  end_date: string;
}

export interface BackendBudget {
  id: number;
  category: string;
  limit_amount: number;
  current_spent: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface DashboardSummary {
  total_net_worth: number;
  total_income: number;
  total_expenses: number;
  account_balances: Record<number, number>;
  active_budgets: BackendBudget[];
  budget_progress: BudgetProgress[];
  savings_goals: SavingsGoal[];
  upcoming_payments: RecurringTransaction[];
  unread_notifications: Notification[];
}

export interface NetWorthResponse {
  net_worth: number;
}

export interface IncomeSummaryResponse {
  total_income: number;
}

export interface ExpenseSummaryResponse {
  total_expenses: number;
}

export interface AccountBalanceResponse {
  account_id: number;
  account_name: string;
  balance: number;
}

export interface CategorySpendingResponse {
  category: string;
  amount: number;
}

export interface TopSpendingCategoryItem {
  category: string;
  amount: number;
  percentage: number | null;
}

export interface LargestExpenseItem {
  narrative: string;
  amount: number;
}

export interface DashboardInsightsResponse {
  top_spending_categories: TopSpendingCategoryItem[];
  largest_expense: LargestExpenseItem;
  income_trend: string;
  budget_warnings: string[];
  unusual_spending_alerts: string[];
  savings_suggestions: string[];
  budget_recommendations: string[];
}

export const dashboardService = {
  /**
   * Fetch comprehensive dashboard metrics summary.
   */
  async getSummary(startDate?: string, endDate?: string): Promise<DashboardSummary> {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await api.get<DashboardSummary>('/dashboard/summary', { params });
    return response.data;
  },

  /**
   * Fetch net worth across all accounts.
   */
  async getNetWorth(): Promise<NetWorthResponse> {
    const response = await api.get<NetWorthResponse>('/dashboard/net-worth');
    return response.data;
  },

  /**
   * Fetch individual account balances.
   */
  async getAccountBalances(): Promise<AccountBalanceResponse[]> {
    const response = await api.get<AccountBalanceResponse[]>('/dashboard/account-balances');
    return response.data;
  },

  /**
   * Fetch income summary.
   */
  async getIncome(startDate?: string, endDate?: string): Promise<IncomeSummaryResponse> {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await api.get<IncomeSummaryResponse>('/dashboard/income', { params });
    return response.data;
  },

  /**
   * Fetch expense summary.
   */
  async getExpenses(startDate?: string, endDate?: string): Promise<ExpenseSummaryResponse> {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await api.get<ExpenseSummaryResponse>('/dashboard/expenses', { params });
    return response.data;
  },

  /**
   * Fetch spending grouped by category.
   */
  async getSpendingByCategory(startDate?: string, endDate?: string): Promise<CategorySpendingResponse[]> {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await api.get<CategorySpendingResponse[]>('/dashboard/spending-by-category', { params });
    return response.data;
  },

  /**
   * Fetch progress metrics for all active budgets.
   */
  async getBudgets(): Promise<BudgetProgress[]> {
    const response = await api.get<BudgetProgress[]>('/dashboard/budgets');
    return response.data;
  },

  /**
   * Fetch AI-powered dashboard insights and budget recommendations.
   */
  async getInsights(): Promise<DashboardInsightsResponse> {
    const response = await api.get<DashboardInsightsResponse>('/dashboard/insights');
    return response.data;
  },
};
