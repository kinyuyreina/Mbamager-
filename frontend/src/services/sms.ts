import { api } from '../lib/api';

export interface SMSMessage {
  id: number;
  user_id: number;
  sender: string;
  message_body: string;
  received_at: string;
  processed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SMSImportRequest {
  sender: string;
  message_body: string;
  received_at: string;
}

export interface ParsedSms {
  amount: number;
  fee: number;
  ref: string;
  direction: 'CREDIT' | 'DEBIT';
  provider: 'MTN_MOMO' | 'ORANGE_MONEY' | 'CASH' | 'BANK';
  category: string;
  narrative: string;
}

/**
 * Deterministic regex-based parsing engine mirroring Python backend service logic.
 */
export function parseSmsClient(text: string, sender: string): ParsedSms | null {
  const cleanText = text.trim();
  const senderUpper = sender.toUpperCase();
  const textUpper = cleanText.toUpperCase();

  const isMtn = senderUpper.includes('MTN') || textUpper.includes('MTN');
  const isOrange = senderUpper.includes('ORANGE') || textUpper.includes('ORANGE');

  // 1. MTN Mobile Money Debit
  if (isMtn && (textUpper.includes('TRANSFER') || textUpper.includes('SENT') || textUpper.includes('TRANSFERRED') || textUpper.includes('PAY') || textUpper.includes('PAID'))) {
    const m = cleanText.match(/(?:transfer|sent|transferred|pay|paid).*?(\d+(?:\.\d+)?)\s*(?:XAF|FCFA).*?fee:\s*(\d+(?:\.\d+)?).*?(?:ref|reference|txid|id):\s*(\w+)/i);
    if (m) {
      return {
        amount: parseFloat(m[1]),
        fee: parseFloat(m[2]),
        ref: m[3],
        direction: 'DEBIT',
        provider: 'MTN_MOMO',
        category: 'EXPENSE_UTILITIES',
        narrative: `MTN MoMo Debit - Ref: ${m[3]}`,
      };
    }
  }

  // 2. MTN Mobile Money Credit
  if (isMtn && (textUpper.includes('RECEIVED') || textUpper.includes('DEPOSIT') || textUpper.includes('CREDITED'))) {
    const m = cleanText.match(/(?:received|deposit|credited).*?(\d+(?:\.\d+)?)\s*(?:XAF|FCFA).*?fee:\s*(\d+(?:\.\d+)?).*?(?:ref|reference|txid|id):\s*(\w+)/i);
    if (m) {
      return {
        amount: parseFloat(m[1]),
        fee: parseFloat(m[2]),
        ref: m[3],
        direction: 'CREDIT',
        provider: 'MTN_MOMO',
        category: 'INCOME_REMITTANCE',
        narrative: `MTN MoMo Credit - Ref: ${m[3]}`,
      };
    }
  }

  // 3. Orange Money Debit
  if (isOrange && (textUpper.includes('TRANSFER') || textUpper.includes('SENT') || textUpper.includes('TRANSFERRED') || textUpper.includes('PAY') || textUpper.includes('PAID'))) {
    const m = cleanText.match(/(?:transfer|sent|transferred|pay|paid).*?(\d+(?:\.\d+)?)\s*(?:XAF|FCFA).*?fee:\s*(\d+(?:\.\d+)?).*?(?:ref|reference|txid|id):\s*(\w+)/i);
    if (m) {
      return {
        amount: parseFloat(m[1]),
        fee: parseFloat(m[2]),
        ref: m[3],
        direction: 'DEBIT',
        provider: 'ORANGE_MONEY',
        category: 'EXPENSE_UTILITIES',
        narrative: `Orange Money Debit - Ref: ${m[3]}`,
      };
    }
  }

  // 4. Orange Money Credit
  if (isOrange && (textUpper.includes('RECEIVED') || textUpper.includes('DEPOSIT') || textUpper.includes('CREDITED'))) {
    const m = cleanText.match(/(?:received|deposit|credited).*?(\d+(?:\.\d+)?)\s*(?:XAF|FCFA).*?fee:\s*(\d+(?:\.\d+)?).*?(?:ref|reference|txid|id):\s*(\w+)/i);
    if (m) {
      return {
        amount: parseFloat(m[1]),
        fee: parseFloat(m[2]),
        ref: m[3],
        direction: 'CREDIT',
        provider: 'ORANGE_MONEY',
        category: 'INCOME_REMITTANCE',
        narrative: `Orange Money Credit - Ref: ${m[3]}`,
      };
    }
  }

  // 5. Cash Deposit
  if (textUpper.includes('CASH DEPOSIT')) {
    const m = cleanText.match(/Cash Deposit of (\d+(?:\.\d+)?)\s*(?:XAF|FCFA).*?fee:\s*(\d+(?:\.\d+)?).*?(?:ref|reference|txid|id):\s*(\w+)/i);
    if (m) {
      return {
        amount: parseFloat(m[1]),
        fee: parseFloat(m[2]),
        ref: m[3],
        direction: 'CREDIT',
        provider: 'CASH',
        category: 'INCOME_REMITTANCE',
        narrative: `Cash Deposit - Ref: ${m[3]}`,
      };
    }
  }

  // 6. Cash Withdrawal
  if (textUpper.includes('CASH WITHDRAWAL')) {
    const m = cleanText.match(/Cash Withdrawal of (\d+(?:\.\d+)?)\s*(?:XAF|FCFA).*?fee:\s*(\d+(?:\.\d+)?).*?(?:ref|reference|txid|id):\s*(\w+)/i);
    if (m) {
      return {
        amount: parseFloat(m[1]),
        fee: parseFloat(m[2]),
        ref: m[3],
        direction: 'DEBIT',
        provider: 'CASH',
        category: 'EXPENSE_UTILITIES',
        narrative: `Cash Withdrawal - Ref: ${m[3]}`,
      };
    }
  }

  // 7. Bank Credit
  if (textUpper.includes('BANK CREDIT')) {
    const m = cleanText.match(/Bank Credit of (\d+(?:\.\d+)?)\s*(?:XAF|FCFA).*?fee:\s*(\d+(?:\.\d+)?).*?(?:ref|reference|txid|id):\s*(\w+)/i);
    if (m) {
      return {
        amount: parseFloat(m[1]),
        fee: parseFloat(m[2]),
        ref: m[3],
        direction: 'CREDIT',
        provider: 'BANK',
        category: 'INCOME_REMITTANCE',
        narrative: `Bank Credit - Ref: ${m[3]}`,
      };
    }
  }

  // 8. Bank Debit
  if (textUpper.includes('BANK DEBIT')) {
    const m = cleanText.match(/Bank Debit of (\d+(?:\.\d+)?)\s*(?:XAF|FCFA).*?fee:\s*(\d+(?:\.\d+)?).*?(?:ref|reference|txid|id):\s*(\w+)/i);
    if (m) {
      return {
        amount: parseFloat(m[1]),
        fee: parseFloat(m[2]),
        ref: m[3],
        direction: 'DEBIT',
        provider: 'BANK',
        category: 'EXPENSE_UTILITIES',
        narrative: `Bank Debit - Ref: ${m[3]}`,
      };
    }
  }

  return null;
}

export const smsService = {
  /**
   * Import a single SMS message
   */
  async importSingle(payload: SMSImportRequest): Promise<SMSMessage> {
    const response = await api.post<SMSMessage>('/sms/import', payload);
    return response.data;
  },

  /**
   * Import a batch of SMS messages
   */
  async importBatch(payload: SMSImportRequest[]): Promise<SMSMessage[]> {
    const response = await api.post<SMSMessage[]>('/sms/import/batch', payload);
    return response.data;
  },

  /**
   * Fetch all unprocessed SMS messages
   */
  async getUnprocessed(): Promise<SMSMessage[]> {
    const response = await api.get<SMSMessage[]>('/sms/unprocessed');
    return response.data;
  },

  /**
   * Trigger manual reprocessing of a specific stored SMS by its ID
   */
  async processStored(id: number): Promise<SMSMessage> {
    const response = await api.post<SMSMessage>(`/sms/${id}/process`);
    return response.data;
  },
};
