import { create } from 'zustand';
import api from '../lib/axios';

type TransactionType = 'expense' | 'income' | 'transfer';

export interface RecentRecord {
  id: number;
  type: TransactionType;
  amount: number;
  category_id: number | null;
  category_name: string;
  note: string;
  occurred_at: string;
  created_at: string;
}

interface TransactionState {
  draftType: TransactionType;
  draftAmount: string;
  draftCategoryId: number | null;
  draftNote: string;
  draftDate: Date;
  submitting: boolean;
  recentRecords: RecentRecord[];

  setDraftType: (type: TransactionType) => void;
  setDraftAmount: (amount: string) => void;
  setDraftCategoryId: (id: number | null) => void;
  setDraftNote: (note: string) => void;
  setDraftDate: (date: Date) => void;
  resetDraft: () => void;
  submitTransaction: () => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  draftType: 'expense',
  draftAmount: '',
  draftCategoryId: null,
  draftNote: '',
  draftDate: new Date(),
  submitting: false,
  recentRecords: [],

  setDraftType: (type) => {
    set({ draftType: type, draftCategoryId: null });
  },

  setDraftAmount: (amount) => {
    set({ draftAmount: amount });
  },

  setDraftCategoryId: (id) => {
    set({ draftCategoryId: id });
  },

  setDraftNote: (note) => {
    set({ draftNote: note });
  },

  setDraftDate: (date) => {
    set({ draftDate: date });
  },

  resetDraft: () => {
    const currentType = get().draftType;
    set({
      draftType: currentType,
      draftAmount: '',
      draftCategoryId: null,
      draftNote: '',
      draftDate: new Date(),
    });
  },

  submitTransaction: async () => {
    const { draftType, draftAmount, draftCategoryId, draftNote, draftDate } =
      get();

    const amountNum = parseFloat(draftAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new Error('请输入有效金额');
    }

    if (draftType !== 'transfer' && !draftCategoryId) {
      throw new Error('请选择分类');
    }

    const amountInCents = Math.round(amountNum * 100);

    const payload: Record<string, unknown> = {
      type: draftType,
      amount: amountInCents,
      occurred_at: draftDate.toISOString(),
    };

    if (draftType !== 'transfer') {
      payload.category_id = draftCategoryId;
    }

    if (draftNote.trim()) {
      payload.note = draftNote.trim();
    }

    set({ submitting: true });
    try {
      const res = await api.post('/transactions', payload);
      const record: RecentRecord = res.data.data;
      set((state) => ({
        recentRecords: [record, ...state.recentRecords].slice(0, 20),
      }));
    } finally {
      set({ submitting: false });
    }
  },
}));
