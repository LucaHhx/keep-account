import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '../stores/theme';

const options = [
  { value: 'light' as const, icon: Sun, label: '浅色' },
  { value: 'dark' as const, icon: Moon, label: '深色' },
  { value: 'system' as const, icon: Monitor, label: '系统' },
];

export default function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
      {options.map((opt) => {
        const isActive = theme === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors duration-150 ${
              isActive
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-50 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <opt.icon className="w-4 h-4" />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
