import type { Transaction } from '../stores/transactionList';
import TransactionItem from './TransactionItem';

interface DayGroupProps {
  label: string;
  transactions: Transaction[];
  onItemClick: (t: Transaction) => void;
  selectedId?: number | null;
}

function formatDaySummary(transactions: Transaction[]): string {
  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const parts: string[] = [];
  if (expense > 0) {
    parts.push(`支出 \u00a5${(expense / 100).toFixed(2)}`);
  }
  if (income > 0) {
    parts.push(`收入 \u00a5${(income / 100).toFixed(2)}`);
  }
  return parts.join(' / ');
}

export default function DayGroup({ label, transactions, onItemClick, selectedId }: DayGroupProps) {
  const summary = formatDaySummary(transactions);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
          {label}
        </span>
        {summary && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {summary}
          </span>
        )}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/60 dark:border-gray-700 overflow-hidden">
        {transactions.map((t, idx) => (
          <div key={t.id}>
            {idx > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-700 mx-4" />
            )}
            <TransactionItem
              transaction={t}
              onClick={onItemClick}
              selected={selectedId === t.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
