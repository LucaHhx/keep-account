import { ChevronRight } from 'lucide-react';
import type { CategoryBreakdownItem } from '../stores/report';
import { COLORS } from './DonutChart';

interface CategoryBreakdownListProps {
  items: CategoryBreakdownItem[];
  onItemClick: (item: CategoryBreakdownItem) => void;
}

function formatYuan(cents: number): string {
  const yuan = cents / 100;
  return `\u00a5${yuan.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function CategoryBreakdownList({ items, onItemClick }: CategoryBreakdownListProps) {
  const limited = items.slice(0, 7);

  return (
    <div className="space-y-2">
      {limited.map((item, index) => (
        <div
          key={item.category_id}
          onClick={() => onItemClick(item)}
          className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg px-2 py-1.5 -mx-2 transition-colors duration-150"
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[index] || COLORS[6] }}
            />
            <span className="text-sm text-gray-900 dark:text-gray-50">{item.category_name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-900 dark:text-gray-50">{formatYuan(item.amount)}</span>
            <span className="text-xs text-gray-400 w-10 text-right">{item.percentage}%</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </div>
        </div>
      ))}
    </div>
  );
}
