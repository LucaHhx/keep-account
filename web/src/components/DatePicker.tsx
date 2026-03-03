import { Calendar } from 'lucide-react';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

function formatLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = today.getTime() - target.getTime();
  const dayMs = 86400000;

  if (diff === 0) return '今天';
  if (diff === dayMs) return '昨天';

  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      // Parse YYYY-MM-DD and preserve time
      const [y, m, d] = val.split('-').map(Number);
      const newDate = new Date(value);
      newDate.setFullYear(y, m - 1, d);
      onChange(newDate);
    }
  };

  const dateStr = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;

  return (
    <label className="relative flex items-center gap-1.5 bg-white dark:bg-gray-800 lg:bg-gray-50 lg:dark:bg-gray-700 rounded-lg px-3 py-2.5 border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
      <Calendar className="w-4 h-4 text-gray-400" />
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {formatLabel(value)}
      </span>
      <input
        type="date"
        value={dateStr}
        onChange={handleChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
    </label>
  );
}
