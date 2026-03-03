import { create } from 'zustand';
import api from '../lib/axios';

export interface Category {
  id: number;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  sort: number;
  is_default: boolean;
}

interface CreateCategoryInput {
  name: string;
  type: 'expense' | 'income';
  icon: string;
}

interface CategoryState {
  categories: Category[];
  loading: boolean;

  fetchCategories: () => Promise<void>;
  addCategory: (data: CreateCategoryInput) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  getCategoriesByType: (type: 'expense' | 'income') => Category[];
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,

  fetchCategories: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/categories');
      set({ categories: res.data.data.items });
    } finally {
      set({ loading: false });
    }
  },

  addCategory: async (data) => {
    const res = await api.post('/categories', data);
    const newCategory: Category = res.data.data;
    set((state) => ({
      categories: [...state.categories, newCategory],
    }));
  },

  deleteCategory: async (id) => {
    await api.delete(`/categories/${id}`);
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));
  },

  getCategoriesByType: (type) => {
    return get().categories.filter((c) => c.type === type);
  },
}));
