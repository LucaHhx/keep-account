import type { Transaction } from '../stores/transactionList';
import { getCategoryIcon } from '../lib/categoryIcons';
import { MoreHorizontal } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
  onClick: (t: Transaction) => void;
  selected?: boolean;
}

function formatAmount(t: Transaction): { text: string; className: string } {
  const yuan = (t.amount / 100).toFixed(2);
  if (t.type === 'income') {
    return { text: `+${yuan}`, className: 'text-green-600 dark:text-green-400' };
  }
  if (t.type === 'transfer') {
    return { text: yuan, className: 'text-gray-500' };
  }
  return { text: `-${yuan}`, className: 'text-red-500' };
}

function formatTime(isoStr: string): string {
  const d = new Date(isoStr);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function getIconStyle(type: Transaction['type']) {
  if (type === 'income') {
    return { bg: 'bg-green-50 dark:bg-green-900/30', stroke: '#16A34A' };
  }
  if (type === 'transfer') {
    return { bg: 'bg-gray-50 dark:bg-gray-700', stroke: '#6B7280' };
  }
  return { bg: 'bg-red-50 dark:bg-red-900/30', stroke: '#EF4444' };
}

export default function TransactionItem({ transaction, onClick, selected }: TransactionItemProps) {
  const Icon = transaction.category_icon
    ? getCategoryIcon(transaction.category_icon)
    : MoreHorizontal;
  const iconStyle = getIconStyle(transaction.type);
  const { text, className } = formatAmount(transaction);

  return (
    <div
      onClick={() => onClick(transaction)}
      className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 ${
        selected
          ? 'lg:bg-blue-50/50 lg:dark:bg-blue-900/20 lg:border-l-2 lg:border-l-blue-500'
          : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 md:w-10 md:h-10 ${iconStyle.bg} rounded-full flex items-center justify-center shrink-0`}
        >
          <Icon width={18} height={18} stroke={iconStyle.stroke} />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
            {transaction.category_name || transaction.type}
          </div>
          {transaction.note && (
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {transaction.note}
            </div>
          )}
        </div>
      </div>
      <div className="text-right">
        <div className={`text-sm font-medium ${className}`}>{text}</div>
        <div className="text-xs text-gray-400 dark:text-gray-500">
          {formatTime(transaction.occurred_at)}
        </div>
      </div>
    </div>
  );
}
