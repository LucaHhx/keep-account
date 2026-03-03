import { create } from 'zustand';
import api from '../lib/axios';

type TransactionType = 'expense' | 'income' | 'transfer';

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number; // in cents
  category_id: number | null;
  category_name: string;
  category_icon: string;
  note: string;
  occurred_at: string;
  created_at: string;
  updated_at?: string;
}

type FilterType = 'all' | TransactionType;

interface TransactionListState {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  loading: boolean;

  filterType: FilterType;
  filterStartDate: string | null;
  filterEndDate: string | null;

  fetchTransactions: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  setFilterType: (type: FilterType) => void;
  setFilterDateRange: (start: string | null, end: string | null) => void;
  clearFilters: () => void;
  updateTransaction: (id: number, data: Partial<Pick<Transaction, 'amount' | 'category_id' | 'note' | 'occurred_at'>>) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
}

export const useTransactionListStore = create<TransactionListState>((set, get) => ({
  transactions: [],
  total: 0,
  page: 1,
  pageSize: 20,
  hasMore: true,
  loading: false,

  filterType: 'all',
  filterStartDate: null,
  filterEndDate: null,

  fetchTransactions: async (reset = true) => {
    const state = get();
    if (state.loading) return;

    const page = reset ? 1 : state.page;
    set({ loading: true });

    try {
      const params: Record<string, string | number> = {
        page,
        page_size: state.pageSize,
      };

      if (state.filterType !== 'all') {
        params.type = state.filterType;
      }
      if (state.filterStartDate) {
        params.start_date = state.filterStartDate;
      }
      if (state.filterEndDate) {
        params.end_date = state.filterEndDate;
      }

      const res = await api.get('/transactions', { params });
      const { items, total } = res.data.data;
      const fetched: Transaction[] = items || [];

      if (reset) {
        set({
          transactions: fetched,
          total,
          page: 1,
          hasMore: fetched.length < total,
        });
      } else {
        set((s) => ({
          transactions: [...s.transactions, ...fetched],
          total,
          hasMore: s.transactions.length + fetched.length < total,
        }));
      }
    } finally {
      set({ loading: false });
    }
  },

  loadMore: async () => {
    const state = get();
    if (state.loading || !state.hasMore) return;
    set({ page: state.page + 1 });
    await get().fetchTransactions(false);
  },

  setFilterType: (type) => {
    set({ filterType: type, page: 1 });
    get().fetchTransactions(true);
  },

  setFilterDateRange: (start, end) => {
    set({ filterStartDate: start, filterEndDate: end, page: 1 });
    get().fetchTransactions(true);
  },

  clearFilters: () => {
    set({
      filterType: 'all',
      filterStartDate: null,
      filterEndDate: null,
      page: 1,
    });
    get().fetchTransactions(true);
  },

  updateTransaction: async (id, data) => {
    const payload: Record<string, unknown> = {};
    if (data.amount !== undefined) payload.amount = data.amount;
    if (data.category_id !== undefined) payload.category_id = data.category_id;
    if (data.note !== undefined) payload.note = data.note;
    if (data.occurred_at !== undefined) payload.occurred_at = data.occurred_at;

    const res = await api.put(`/transactions/${id}`, payload);
    const updated: Transaction = res.data.data;

    set((s) => ({
      transactions: s.transactions.map((t) => (t.id === id ? updated : t)),
    }));
  },

  deleteTransaction: async (id) => {
    await api.delete(`/transactions/${id}`);
    set((s) => ({
      transactions: s.transactions.filter((t) => t.id !== id),
      total: s.total - 1,
    }));
  },
}));
