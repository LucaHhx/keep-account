import { useTransactionStore, type RecentRecord } from '../stores/transaction';
import { useCategoryStore } from '../stores/category';
import { getCategoryIcon } from '../lib/categoryIcons';
import { MoreHorizontal } from 'lucide-react';

function formatAmount(record: RecentRecord): { text: string; className: string } {
  const yuan = (record.amount / 100).toFixed(2);
  if (record.type === 'income') {
    return { text: `+${yuan}`, className: 'text-green-600 dark:text-green-400' };
  }
  return { text: `-${yuan}`, className: 'text-red-500' };
}

function groupByDate(records: RecentRecord[]): { label: string; records: RecentRecord[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayMs = 86400000;

  const groups = new Map<string, RecentRecord[]>();

  for (const r of records) {
    const d = new Date(r.occurred_at);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diff = today - dayStart;

    let label: string;
    if (diff === 0) label = '今天';
    else if (diff === dayMs) label = '昨天';
    else label = `${d.getMonth() + 1}月${d.getDate()}日`;

    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(r);
  }

  return Array.from(groups.entries()).map(([label, records]) => ({ label, records }));
}

export default function RecentRecords() {
  const recentRecords = useTransactionStore((s) => s.recentRecords);
  const categories = useCategoryStore((s) => s.categories);

  const todayRecords = recentRecords.filter((r) => {
    const d = new Date(r.occurred_at);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  });

  const todayExpense = todayRecords
    .filter((r) => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);
  const todayIncome = todayRecords
    .filter((r) => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  const groups = groupByDate(recentRecords);

  const getIcon = (record: RecentRecord) => {
    const cat = categories.find((c) => c.id === record.category_id);
    if (cat) return getCategoryIcon(cat.icon);
    return MoreHorizontal;
  };

  const getIconStyle = (record: RecentRecord) => {
    if (record.type === 'income') {
      return {
        bg: 'bg-green-50 dark:bg-green-900/30',
        stroke: '#16A34A',
      };
    }
    // For the first record of the same category, use blue accent
    const cat = categories.find((c) => c.id === record.category_id);
    if (cat && cat.is_default && ['food', 'salary'].includes(cat.icon)) {
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/30',
        stroke: '#2563EB',
      };
    }
    return {
      bg: 'bg-gray-100 dark:bg-gray-700',
      stroke: '#6b7280',
    };
  };

  return (
    <div className="hidden lg:block w-80 xl:w-96 shrink-0">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-full flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            最近记录
          </h2>
          <a className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
            查看全部
          </a>
        </div>

        {/* Records */}
        <div className="flex-1 overflow-auto">
          {recentRecords.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
              暂无记录，开始记账吧
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="px-5 pt-4">
                <div className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                  {group.label}
                </div>
                {group.records.map((record, idx) => {
                  const Icon = getIcon(record);
                  const iconStyle = getIconStyle(record);
                  const { text, className } = formatAmount(record);
                  const isLast = idx === group.records.length - 1;

                  return (
                    <div
                      key={record.id}
                      className={`flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-5 px-5 transition-colors duration-150 ${
                        isLast ? '' : 'border-b border-gray-100 dark:border-gray-700'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 ${iconStyle.bg} rounded-full flex items-center justify-center shrink-0`}
                      >
                        <Icon
                          width={18}
                          height={18}
                          stroke={iconStyle.stroke}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900 dark:text-gray-50">
                          {record.category_name || record.type}
                        </div>
                        {record.note && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                            {record.note}
                          </div>
                        )}
                      </div>
                      <div className={`text-sm font-medium ${className}`}>
                        {text}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Daily Summary */}
        {recentRecords.length > 0 && (
          <div className="px-5 py-4 mt-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">今日支出</span>
              <span className="font-medium text-gray-900 dark:text-gray-50">
                -{(todayExpense / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-500 dark:text-gray-400">今日收入</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                +{(todayIncome / 100).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
