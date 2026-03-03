import { create } from 'zustand';
import api from '../lib/axios';

export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryBreakdownItem {
  category_id: number;
  category_name: string;
  category_icon: string;
  amount: number;
  percentage: number;
}

export interface CategoryBreakdown {
  month: string;
  type: string;
  total: number;
  items: CategoryBreakdownItem[];
}

export interface TrendItem {
  date: string;
  income: number;
  expense: number;
}

export interface TrendData {
  granularity: string;
  items: TrendItem[];
}

export type ReportType = 'expense' | 'income';

interface ReportState {
  currentMonth: string; // YYYY-MM
  selectedType: ReportType;

  summary: MonthlySummary | null;
  summaryLoading: boolean;

  breakdown: CategoryBreakdown | null;
  breakdownLoading: boolean;

  trend: TrendData | null;
  trendLoading: boolean;

  setMonth: (month: string) => void;
  setSelectedType: (type: ReportType) => void;
  prevMonth: () => void;
  nextMonth: () => void;
  fetchSummary: () => Promise<void>;
  fetchBreakdown: () => Promise<void>;
  fetchTrend: () => Promise<void>;
  fetchAll: () => Promise<void>;
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthDateRange(month: string): { start: string; end: string } {
  const [y, m] = month.split('-').map(Number);
  const start = `${y}-${String(m).padStart(2, '0')}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
}

export const useReportStore = create<ReportState>((set, get) => ({
  currentMonth: getCurrentMonth(),
  selectedType: 'expense' as ReportType,

  summary: null,
  summaryLoading: false,

  breakdown: null,
  breakdownLoading: false,

  trend: null,
  trendLoading: false,

  setMonth: (month) => {
    set({ currentMonth: month });
  },

  setSelectedType: (type) => {
    set({ selectedType: type });
    get().fetchBreakdown();
  },

  prevMonth: () => {
    const next = shiftMonth(get().currentMonth, -1);
    set({ currentMonth: next });
  },

  nextMonth: () => {
    const next = shiftMonth(get().currentMonth, 1);
    set({ currentMonth: next });
  },

  fetchSummary: async () => {
    const { currentMonth } = get();
    set({ summaryLoading: true });
    try {
      const res = await api.get('/reports/monthly-summary', {
        params: { month: currentMonth },
      });
      set({ summary: res.data.data });
    } catch {
      set({ summary: null });
    } finally {
      set({ summaryLoading: false });
    }
  },

  fetchBreakdown: async () => {
    const { currentMonth, selectedType } = get();
    set({ breakdownLoading: true });
    try {
      const res = await api.get('/reports/category-breakdown', {
        params: { month: currentMonth, type: selectedType },
      });
      set({ breakdown: res.data.data });
    } catch {
      set({ breakdown: null });
    } finally {
      set({ breakdownLoading: false });
    }
  },

  fetchTrend: async () => {
    const { currentMonth } = get();
    const { start, end } = getMonthDateRange(currentMonth);
    set({ trendLoading: true });
    try {
      const res = await api.get('/reports/trend', {
        params: { start_date: start, end_date: end, granularity: 'day' },
      });
      set({ trend: res.data.data });
    } catch {
      set({ trend: null });
    } finally {
      set({ trendLoading: false });
    }
  },

  fetchAll: async () => {
    const { fetchSummary, fetchBreakdown, fetchTrend } = get();
    await Promise.all([fetchSummary(), fetchBreakdown(), fetchTrend()]);
  },
}));
