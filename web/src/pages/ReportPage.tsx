import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReportStore } from '../stores/report';
import type { CategoryBreakdownItem, ReportType } from '../stores/report';
import MonthPicker from '../components/MonthPicker';
import StatCard from '../components/StatCard';
import DonutChart from '../components/DonutChart';
import CategoryBreakdownList from '../components/CategoryBreakdownList';
import BarChart from '../components/BarChart';

function formatYuan(cents: number): string {
  const yuan = cents / 100;
  return `\u00a5${yuan.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function ReportPage() {
  const navigate = useNavigate();
  const {
    currentMonth,
    selectedType,
    summary,
    summaryLoading,
    breakdown,
    breakdownLoading,
    trend,
    trendLoading,
    prevMonth,
    nextMonth,
    setSelectedType,
    fetchAll,
  } = useReportStore();

  const typeLabel: Record<ReportType, string> = { expense: '支出', income: '收入' };

  useEffect(() => {
    fetchAll();
  }, [currentMonth, fetchAll]);

  const handleCategoryClick = (item: CategoryBreakdownItem) => {
    navigate(`/reports/category/${item.category_id}?month=${currentMonth}&name=${encodeURIComponent(item.category_name)}`);
  };

  const hasData =
    (summary && (summary.income > 0 || summary.expense > 0)) ||
    (breakdown && breakdown.items.length > 0);

  return (
    <div className="flex-1 flex flex-col">
      {/* Mobile title */}
      <div className="lg:hidden px-4 pt-4 md:pt-6 pb-2 md:px-8">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">报表</h1>
      </div>

      {/* Month Picker */}
      <MonthPicker month={currentMonth} onPrev={prevMonth} onNext={nextMonth} />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-8 pb-4">
        {!hasData && !summaryLoading && !breakdownLoading && !trendLoading ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2">
                <path d="M21.21 15.89A10 10 0 118 2.83" />
                <path d="M22 12A10 10 0 0012 2v10z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              本月暂无收支数据
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline"
            >
              去记一笔
            </button>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 mb-5 lg:mb-6">
              <StatCard
                label="收入"
                amount={summary?.income ?? 0}
                colorClass="text-green-600 dark:text-green-400"
                loading={summaryLoading}
                active={selectedType === 'income'}
                onClick={() => setSelectedType('income')}
              />
              <StatCard
                label="支出"
                amount={summary?.expense ?? 0}
                colorClass="text-red-500 dark:text-red-400"
                loading={summaryLoading}
                active={selectedType === 'expense'}
                onClick={() => setSelectedType('expense')}
              />
              <StatCard
                label="结余"
                amount={summary?.balance ?? 0}
                colorClass="text-blue-600 dark:text-blue-400"
                loading={summaryLoading}
              />
            </div>

            {/* Charts area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
              {/* Category breakdown (donut + list) */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/60 dark:border-gray-700 p-4 md:p-6">
                <h2 className="text-sm md:text-base font-medium text-gray-900 dark:text-gray-50 mb-4">
                  {typeLabel[selectedType]}分类
                </h2>
                {breakdownLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-[180px] h-[180px] rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
                  </div>
                ) : breakdown && breakdown.items.length > 0 ? (
                  <>
                    <DonutChart
                      items={breakdown.items}
                      centerLabel={`总${typeLabel[selectedType]}`}
                      centerValue={formatYuan(breakdown.total)}
                    />
                    <CategoryBreakdownList
                      items={breakdown.items}
                      onItemClick={handleCategoryClick}
                    />
                  </>
                ) : (
                  <div className="text-center py-12 text-sm text-gray-400">暂无{typeLabel[selectedType]}数据</div>
                )}
              </div>

              {/* Trend bar chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/60 dark:border-gray-700 p-4 md:p-6 flex flex-col">
                <h2 className="text-sm md:text-base font-medium text-gray-900 dark:text-gray-50 mb-4">
                  {typeLabel[selectedType]}趋势 (最近7天)
                </h2>
                {trendLoading ? (
                  <div className="flex-1 min-h-[120px] bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                ) : trend && trend.items.length > 0 ? (
                  <div className="flex-1 min-h-0">
                    <BarChart items={trend.items.slice(-7)} dataKey={selectedType} />
                  </div>
                ) : (
                  <div className="text-center py-12 text-sm text-gray-400">暂无趋势数据</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
