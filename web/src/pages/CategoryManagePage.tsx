import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, X } from 'lucide-react';
import { useCategoryStore, type Category } from '../stores/category';
import { useToastStore } from '../stores/toast';
import TabSwitcher from '../components/TabSwitcher';
import Button from '../components/Button';
import { allIcons, getCategoryIcon } from '../lib/categoryIcons';

const typeTabs = [
  { key: 'expense', label: '支出' },
  { key: 'income', label: '收入' },
];

export default function CategoryManagePage() {
  const navigate = useNavigate();
  const { categories, fetchCategories, addCategory, deleteCategory } =
    useCategoryStore();
  const toast = useToastStore((s) => s.show);

  const [activeType, setActiveType] = useState<'expense' | 'income'>('expense');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('other');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filtered = categories.filter((c) => c.type === activeType);

  const handleDelete = async (cat: Category) => {
    try {
      await deleteCategory(cat.id);
      toast('删除成功');
    } catch {
      toast('删除失败', 'error');
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast('请输入分类名称', 'error');
      return;
    }
    setAdding(true);
    try {
      await addCategory({
        name: newName.trim(),
        type: activeType,
        icon: newIcon,
      });
      toast('添加成功');
      setNewName('');
      setNewIcon('other');
      setShowAdd(false);
    } catch {
      toast('添加失败', 'error');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:max-w-xl">
      <div className="flex-1 flex flex-col lg:bg-white lg:dark:bg-gray-800 lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-200 lg:dark:border-gray-700 lg:overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 md:px-6 md:py-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            分类管理
          </h1>
        </div>

        {/* Type Tabs */}
        <div className="px-4 pt-4 md:px-6">
          <TabSwitcher
            tabs={typeTabs}
            activeKey={activeType}
            onChange={(key) => setActiveType(key as 'expense' | 'income')}
          />
        </div>

        {/* Category List */}
        <div className="flex-1 px-4 md:px-6 py-4 space-y-1 overflow-auto">
          {filtered.map((cat) => {
            const Icon = getCategoryIcon(cat.icon);
            return (
              <div
                key={cat.id}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-gray-500" />
                </div>
                <span className="flex-1 text-sm text-gray-900 dark:text-gray-50">
                  {cat.name}
                </span>
                {cat.is_default ? (
                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    预设
                  </span>
                ) : (
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Button */}
        <div className="px-4 md:px-6 pb-4 md:pb-6">
          <button
            onClick={() => setShowAdd(true)}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">添加自定义分类</span>
          </button>
        </div>
      </div>

      {/* Add Category Bottom Sheet */}
      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
          onClick={() => setShowAdd(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Sheet */}
          <div
            className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-2xl lg:rounded-2xl p-6 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag indicator (mobile) */}
            <div className="lg:hidden w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />

            {/* Close button */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                添加分类
              </h2>
              <button
                onClick={() => setShowAdd(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Name input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                分类名称
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="输入分类名称"
                maxLength={32}
                className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                分类类型
              </label>
              <TabSwitcher
                tabs={typeTabs}
                activeKey={activeType}
                onChange={(key) => setActiveType(key as 'expense' | 'income')}
              />
            </div>

            {/* Icon selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                选择图标
              </label>
              <div className="grid grid-cols-6 gap-2">
                {allIcons.map((item) => {
                  const isSelected = newIcon === item.key;
                  return (
                    <div
                      key={item.key}
                      onClick={() => setNewIcon(item.key)}
                      className={`flex flex-col items-center py-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-transparent'
                      }`}
                    >
                      <item.icon
                        className="w-5 h-5 mb-0.5"
                        stroke={isSelected ? '#2563EB' : '#6b7280'}
                      />
                      <span
                        className={`text-xs ${
                          isSelected
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-gray-500'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <Button onClick={handleAdd} loading={adding}>
              添加分类
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
