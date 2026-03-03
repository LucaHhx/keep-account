import { type Category } from '../stores/category';
import { getCategoryIcon } from '../lib/categoryIcons';

interface CategoryGridProps {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  accentColor?: 'blue' | 'green';
}

export default function CategoryGrid({
  categories,
  selectedId,
  onSelect,
  accentColor = 'blue',
}: CategoryGridProps) {
  const colors = {
    blue: {
      selectedBg: 'bg-blue-50 dark:bg-blue-900/30',
      selectedBorder: 'border-blue-500',
      selectedIconBg: 'bg-blue-100 dark:bg-blue-800/50',
      selectedIconStroke: '#2563EB',
      selectedText: 'text-blue-700 dark:text-blue-300',
    },
    green: {
      selectedBg: 'bg-green-50 dark:bg-green-900/30',
      selectedBorder: 'border-green-500',
      selectedIconBg: 'bg-green-100 dark:bg-green-800/50',
      selectedIconStroke: '#16A34A',
      selectedText: 'text-green-700 dark:text-green-300',
    },
  };

  const accent = colors[accentColor];

  return (
    <div className="px-4 md:px-6 pb-3">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-1">
        选择分类
      </div>
      <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-5 gap-2 md:gap-3">
        {categories.map((cat) => {
          const isSelected = cat.id === selectedId;
          const Icon = getCategoryIcon(cat.icon);

          return (
            <div
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`flex flex-col items-center py-2 md:py-3 rounded-xl cursor-pointer transition-colors duration-150 ${
                isSelected
                  ? `${accent.selectedBg} border-2 ${accent.selectedBorder}`
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-transparent'
              }`}
            >
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-1 ${
                  isSelected
                    ? accent.selectedIconBg
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <Icon
                  className="w-5 h-5 md:w-6 md:h-6"
                  stroke={isSelected ? accent.selectedIconStroke : '#6b7280'}
                />
              </div>
              <span
                className={`text-xs font-medium ${
                  isSelected
                    ? accent.selectedText
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {cat.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
