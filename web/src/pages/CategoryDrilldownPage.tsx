import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import api from '../lib/axios';
import type { Transaction } from '../stores/transactionList';
import DayGroup from '../components/DayGroup';

function groupByDay(transactions: Transaction[]): { label: string; items: Transaction[] }[] {
  const map = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const dateStr = t.occurred_at.slice(0, 10);
    const existing = map.get(dateStr);
    if (existing) {
      existing.push(t);
    } else {
      map.set(dateStr, [t]);
    }
  }

  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, items]) => {
      const d = new Date(date);
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const label = `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
      return { label, items };
    });
}

export default function CategoryDrilldownPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const month = searchParams.get('month') || '';
  const categoryName = searchParams.get('name') || '分类详情';

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!month || !categoryId) return;
    setLoading(true);
    try {
      const [y, m] = month.split('-').map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      const startDate = `${month}-01`;
      const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;

      const res = await api.get('/transactions', {
        params: {
          category_id: categoryId,
          start_date: startDate,
          end_date: endDate,
          type: 'expense',
          page: 1,
          page_size: 200,
        },
      });
      setTransactions(res.data.data.items || []);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [month, categoryId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const groups = groupByDay(transactions);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 md:pt-6 pb-2 md:px-8 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
            {categoryName}
          </h1>
        </div>
      </div>

      {/* Desktop back link */}
      <div className="hidden lg:flex items-center gap-2 px-8 pt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          返回报表
        </button>
        <span className="text-sm text-gray-400">/ {categoryName}</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-8 py-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">该分类暂无流水记录</p>
          </div>
        ) : (
          groups.map((group) => (
            <DayGroup
              key={group.label}
              label={group.label}
              transactions={group.items}
              onItemClick={() => {}}
            />
          ))
        )}
      </div>
    </div>
  );
}
