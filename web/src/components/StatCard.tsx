interface StatCardProps {
  label: string;
  amount: number; // in cents
  colorClass: string; // e.g. 'text-green-600 dark:text-green-400'
  loading?: boolean;
  active?: boolean;
  onClick?: () => void;
}

function formatYuan(cents: number): string {
  const yuan = cents / 100;
  return yuan.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function StatCard({ label, amount, colorClass, loading, active, onClick }: StatCardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl p-3 md:p-5 shadow-sm border text-center transition-all duration-150 ${
        active
          ? 'border-blue-500 dark:border-blue-400 ring-1 ring-blue-500/30'
          : 'border-gray-200/60 dark:border-gray-700'
      } ${onClick ? 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-500' : ''}`}
      onClick={onClick}
    >
      <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</div>
      {loading ? (
        <div className="h-7 md:h-8 flex items-center justify-center">
          <div className="w-16 h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      ) : (
        <div className={`text-lg md:text-2xl font-semibold ${amount === 0 ? 'text-gray-400' : colorClass}`}>
          {formatYuan(amount)}
        </div>
      )}
    </div>
  );
}
