import { api } from '../lib/api';
import { Account, AccountType, AccountProvider } from '../types';

export interface CreateAccountPayload {
  name: string;
  account_type: AccountType;
  provider: AccountProvider;
  currency: string;
  is_active: boolean;
  user_id: number;
}

export interface UpdateAccountPayload {
  name?: string;
  account_type?: AccountType;
  provider?: AccountProvider;
  currency?: string;
  is_active?: boolean;
}

// Helper to map backend properties to frontend-style types to prevent UI issues
const mapAccount = (acc: any): Account => {
  return {
    ...acc,
    type: acc.account_type || acc.type,
    account_type: acc.account_type || acc.type,
    balance: acc.balance ?? 0,
  };
};

export const accountsService = {
  /**
   * Get all accounts for current user
   */
  async getAll(): Promise<Account[]> {
    const response = await api.get<any[]>('/accounts/');
    return (response.data || []).map(mapAccount);
  },

  /**
   * Get only active accounts
   */
  async getActive(): Promise<Account[]> {
    const response = await api.get<any[]>('/accounts/active');
    return (response.data || []).map(mapAccount);
  },

  /**
   * Get specific account details
   */
  async getById(id: number): Promise<Account> {
    const response = await api.get<any>(`/accounts/${id}`);
    return mapAccount(response.data);
  },

  /**
   * Create a new mobile money or bank account
   */
  async create(payload: CreateAccountPayload): Promise<Account> {
    const response = await api.post<any>('/accounts/', payload);
    return mapAccount(response.data);
  },

  /**
   * Update an existing account
   */
  async update(id: number, payload: UpdateAccountPayload): Promise<Account> {
    const response = await api.put<any>(`/accounts/${id}`, payload);
    return mapAccount(response.data);
  },

  /**
   * Delete an account
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/accounts/${id}`);
  },
};
