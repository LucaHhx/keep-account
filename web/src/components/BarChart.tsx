import type { TrendItem } from '../stores/report';
import type { ReportType } from '../stores/report';

interface BarChartProps {
  items: TrendItem[];
  dataKey?: ReportType;
}

const BAR_COLORS = {
  expense: {
    base: 'bg-blue-200 dark:bg-blue-800',
    levels: [
      { threshold: 75, color: 'bg-blue-600 dark:bg-blue-400' },
      { threshold: 50, color: 'bg-blue-500 dark:bg-blue-500' },
      { threshold: 30, color: 'bg-blue-400 dark:bg-blue-600' },
      { threshold: 15, color: 'bg-blue-300 dark:bg-blue-700' },
    ],
    legend: 'bg-blue-500',
    label: '每日支出',
  },
  income: {
    base: 'bg-green-200 dark:bg-green-800',
    levels: [
      { threshold: 75, color: 'bg-green-600 dark:bg-green-400' },
      { threshold: 50, color: 'bg-green-500 dark:bg-green-500' },
      { threshold: 30, color: 'bg-green-400 dark:bg-green-600' },
      { threshold: 15, color: 'bg-green-300 dark:bg-green-700' },
    ],
    legend: 'bg-green-500',
    label: '每日收入',
  },
};

export default function BarChart({ items, dataKey = 'expense' }: BarChartProps) {
  const colors = BAR_COLORS[dataKey];
  const maxVal = Math.max(...items.map((d) => d[dataKey]), 1);

  return (
    <div className="flex flex-col h-full">
      {/* Bars area — flex-1 fills available height */}
      <div className="flex-1 flex gap-2 min-h-[120px]">
        {items.map((item) => {
          const pct = (item[dataKey] / maxVal) * 100;

          let barColor = colors.base;
          for (const level of colors.levels) {
            if (pct > level.threshold) {
              barColor = level.color;
              break;
            }
          }

          return (
            <div key={item.date} className="flex-1 flex flex-col justify-end">
              <div
                className={`w-full ${barColor} rounded-t transition-all duration-300`}
                style={{ height: `${Math.max(pct, 2)}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* X-axis labels — separated from bars */}
      <div className="flex gap-2 mt-1.5">
        {items.map((item) => {
          const day = parseInt(item.date.split('-')[2], 10);
          return (
            <div key={item.date} className="flex-1 text-center">
              <span className="text-[10px] text-gray-400">{day}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded ${colors.legend}`} />
          <span className="text-xs text-gray-500 dark:text-gray-400">{colors.label}</span>
        </div>
      </div>
    </div>
  );
}
