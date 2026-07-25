import { api } from '../lib/api';
import { Transaction, TransactionDirection } from '../types';
import { accountsService } from './accounts';

export interface CreateTransactionPayload {
  account_id: number;
  amount: number;
  fee?: number;
  direction: TransactionDirection;
  category: string;
  narrative?: string;
  tx_id_external?: string;
  timestamp?: string;
}

export interface UpdateTransactionPayload {
  amount?: number;
  fee?: number;
  direction?: TransactionDirection;
  category?: string;
  narrative?: string;
  tx_id_external?: string;
  timestamp?: string;
}

export interface TransactionFilters {
  account_id?: number;
  category?: string;
  direction?: TransactionDirection;
  search?: string;
}

export interface AlternativeCategory {
  category: string;
  confidence: number;
  reason: string;
}

export interface TransactionExplainResponse {
  assigned_category: string;
  confidence: number;
  explanation: string;
  alternatives: AlternativeCategory[];
}

export interface TransactionReclassifyResponse {
  predicted_category: string;
  confidence: number;
}

export interface SmsImportResult {
  success: boolean;
  transaction?: Transaction;
  message?: string;
  details?: {
    provider: string;
    amount: number;
    fee: number;
    external_tx_id: string;
  };
}

export const transactionsService = {
  /**
   * Get all transactions, optionally filtered.
   * If account_id is not specified, it will first fetch all accounts,
   * then fetch all transactions for each account in parallel to build the global ledger.
   */
  async getAll(filters: TransactionFilters = {}): Promise<Transaction[]> {
    let allTransactions: Transaction[] = [];

    if (filters.account_id) {
      const response = await api.get<Transaction[]>(`/transactions/account/${filters.account_id}`);
      allTransactions = response.data || [];
    } else {
      // Fetch all accounts
      const accounts = await accountsService.getAll();
      if (accounts && accounts.length > 0) {
        const promises = accounts.map(async (account) => {
          try {
            const response = await api.get<Transaction[]>(`/transactions/account/${account.id}`);
            return response.data || [];
          } catch (e) {
            console.error(`Error fetching transactions for account ${account.id}`, e);
            return [];
          }
        });
        const results = await Promise.all(promises);
        allTransactions = results.flat();
      }
    }

    return allTransactions;
  },

  /**
   * Fetch specific transaction details by ID
   */
  async getById(id: number): Promise<Transaction> {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  /**
   * Log a standard transaction manually
   */
  async create(payload: CreateTransactionPayload): Promise<Transaction> {
    const response = await api.post<Transaction>('/transactions/', payload);
    return response.data;
  },

  /**
   * Update an existing transaction
   */
  async update(id: number, payload: UpdateTransactionPayload): Promise<Transaction> {
    const response = await api.put<Transaction>(`/transactions/${id}`, payload);
    return response.data;
  },

  /**
   * Delete an existing transaction
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },

  /**
   * Get AI-generated explanation of the transaction's category classification
   */
  async explain(id: number): Promise<TransactionExplainResponse> {
    const response = await api.get<TransactionExplainResponse>(`/transactions/${id}/explain`);
    return response.data;
  },

  /**
   * Trigger manual AI re-evaluation of the transaction categorization
   */
  async reclassify(id: number): Promise<TransactionReclassifyResponse> {
    const response = await api.post<TransactionReclassifyResponse>(`/transactions/${id}/reclassify`);
    return response.data;
  },

  /**
   * Parse a raw SMS text block to automatically log a transaction (Stage 1/2 processing)
   */
  async importSms(smsText: string): Promise<SmsImportResult> {
    const response = await api.post<SmsImportResult>('/sms/parse', { text: smsText });
    return response.data;
  },
};
