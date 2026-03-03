import { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';

type FilterType = 'all' | 'expense' | 'income' | 'transfer';

interface FilterBarProps {
  activeType: FilterType;
  onTypeChange: (type: FilterType) => void;
  startDate: string | null;
  endDate: string | null;
  onDateRangeChange: (start: string | null, end: string | null) => void;
}

const typeOptions: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'expense', label: '支出' },
  { key: 'income', label: '收入' },
  { key: 'transfer', label: '转账' },
];

interface DatePreset {
  label: string;
  getRange: () => { start: string; end: string };
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getDatePresets(): DatePreset[] {
  const now = new Date();
  return [
    {
      label: '本月',
      getRange: () => {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: toDateStr(start), end: toDateStr(now) };
      },
    },
    {
      label: '上月',
      getRange: () => {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return { start: toDateStr(start), end: toDateStr(end) };
      },
    },
    {
      label: '近三月',
      getRange: () => {
        const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        return { start: toDateStr(start), end: toDateStr(now) };
      },
    },
  ];
}

function getDateLabel(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) return '全部时间';
  const presets = getDatePresets();
  for (const p of presets) {
    const range = p.getRange();
    if (range.start === startDate && range.end === endDate) {
      return p.label;
    }
  }
  if (startDate && endDate) {
    return `${startDate.slice(5)} ~ ${endDate.slice(5)}`;
  }
  return '全部时间';
}

export default function FilterBar({
  activeType,
  onTypeChange,
  startDate,
  endDate,
  onDateRangeChange,
}: FilterBarProps) {
  const [showDateMenu, setShowDateMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowDateMenu(false);
      }
    }
    if (showDateMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDateMenu]);

  const presets = getDatePresets();
  const dateLabel = getDateLabel(startDate, endDate);

  return (
    <div className="px-4 md:px-8 pb-3 lg:px-8 lg:pt-5">
      <div className="flex items-center gap-2 md:gap-3">
        {/* Type filter tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 flex-1 max-w-xs">
          {typeOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => onTypeChange(opt.key)}
              className={`flex-1 py-1.5 md:py-2 text-xs md:text-sm font-medium rounded-md cursor-pointer transition-colors duration-150 ${
                activeType === opt.key
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-50'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Date range selector */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowDateMenu(!showDateMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 md:py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
          >
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
              {dateLabel}
            </span>
          </button>

          {showDateMenu && (
            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 py-1">
              <button
                type="button"
                onClick={() => {
                  onDateRangeChange(null, null);
                  setShowDateMenu(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm cursor-pointer transition-colors duration-150 ${
                  !startDate && !endDate
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                全部时间
              </button>
              {presets.map((preset) => {
                const range = preset.getRange();
                const isActive = range.start === startDate && range.end === endDate;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      onDateRangeChange(range.start, range.end);
                      setShowDateMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm cursor-pointer transition-colors duration-150 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
