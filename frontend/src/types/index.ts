// Mbamager TypeScript Schema and Domain Model Type Definitions

export interface User {
  id: number;
  username: string;
  phone_number?: string | null;
  email?: string | null;
  created_at: string;
  updated_at: string;
}

export type AccountType = 'MOBILE_MONEY' | 'BANK' | 'CASH' | 'NJANGI' | 'OTHER';
export type AccountProvider = 
  | 'MTN' 
  | 'ORANGE' 
  | 'SOCIETE_GENERALE' 
  | 'BICEC' 
  | 'UBA' 
  | 'COMMUNITY_NJANGI' 
  | 'OTHER' 
  | 'MTN_MOMO' 
  | 'ORANGE_MONEY' 
  | 'CASH' 
  | 'BANK';

export interface Account {
  id: number;
  user_id: number;
  name: string;
  type?: AccountType;
  account_type?: AccountType;
  provider: AccountProvider;
  balance: number;
  currency: string; // E.g., 'XAF'
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type TransactionDirection = 'CREDIT' | 'DEBIT';
export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED';

export interface Transaction {
  id: number;
  account_id: number;
  user_id?: number;
  amount: number;
  fee?: number;
  direction: TransactionDirection;
  category: string;
  narrative?: string;
  status?: TransactionStatus;
  external_id?: string; // E.g. Mobile Money TxID
  tx_id_external?: string;
  timestamp?: string;
  ai_confidence?: number;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: number;
  user_id: number;
  category: string;
  limit_amount: number;
  current_spent: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface BudgetProgress {
  budget_id: number;
  category: string;
  limit_amount: number;
  current_spent: number;
  percentage_spent: number;
  remaining_amount: number;
  is_over_budget: boolean;
}

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface SavingsGoal {
  id: number;
  user_id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export type RecurringFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurringTransaction {
  id: number;
  user_id: number;
  account_id: number;
  amount: number;
  category: string;
  direction: TransactionDirection;
  frequency: RecurringFrequency;
  start_date: string;
  end_date?: string;
  narrative?: string;
  active: boolean;
  last_processed?: string;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'LOW_BALANCE' | 'BUDGET_WARNING' | 'GOAL_REACHED' | 'UNUSUAL_SPENDING' | 'RECURRING_PAYMENT' | 'SMS_IMPORT_FAILED';
  is_read: boolean;
  created_at: string;
}

export interface SMS {
  id: number;
  user_id: number;
  sender: string; // E.g., 'MTNMOMO', 'OrangeMoney'
  message_text: string;
  received_at: string;
  is_parsed: boolean;
  parsed_transaction_id?: number;
  created_at: string;
}

export interface AIInsights {
  id: number;
  user_id: number;
  prompt_type: string;
  raw_response: string;
  extracted_insights: Record<string, any>;
  created_at: string;
}

export interface DashboardSummary {
  total_net_worth: number;
  total_income: number;
  total_expenses: number;
  account_balances: Record<number, number>;
  active_budgets: BudgetProgress[];
  savings_goals: SavingsGoal[];
  upcoming_payments: RecurringTransaction[];
  unread_notifications: Notification[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
