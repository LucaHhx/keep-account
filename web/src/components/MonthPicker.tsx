import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthPickerProps {
  month: string; // YYYY-MM
  onPrev: () => void;
  onNext: () => void;
}

function formatMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return `${y}年${m}月`;
}

export default function MonthPicker({ month, onPrev, onNext }: MonthPickerProps) {
  return (
    <div className="flex items-center justify-center gap-6 py-3 lg:py-4 lg:px-8 lg:justify-start">
      <button
        type="button"
        onClick={onPrev}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150"
      >
        <ChevronLeft className="w-5 h-5 text-gray-500" />
      </button>
      <span className="text-base font-medium text-gray-900 dark:text-gray-50">
        {formatMonth(month)}
      </span>
      <button
        type="button"
        onClick={onNext}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150"
      >
        <ChevronRight className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  );
}
