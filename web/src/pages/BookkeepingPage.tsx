import { useEffect } from 'react';
import { Edit3 } from 'lucide-react';
import { useCategoryStore } from '../stores/category';
import { useTransactionStore } from '../stores/transaction';
import { useToastStore } from '../stores/toast';
import TabSwitcher from '../components/TabSwitcher';
import AmountInput from '../components/AmountInput';
import CategoryGrid from '../components/CategoryGrid';
import DatePicker from '../components/DatePicker';
import Button from '../components/Button';
import RecentRecords from '../components/RecentRecords';

const typeTabs = [
  { key: 'expense', label: '支出' },
  { key: 'income', label: '收入' },
  { key: 'transfer', label: '转账' },
];

const amountLabels: Record<string, string> = {
  expense: '支出金额',
  income: '收入金额',
  transfer: '转账金额',
};

const amountColors: Record<string, string> = {
  expense: 'text-gray-900 dark:text-gray-50',
  income: 'text-green-600 dark:text-green-400',
  transfer: 'text-gray-700 dark:text-gray-400',
};

const buttonColors: Record<string, string> = {
  expense:
    'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 focus:ring-blue-500',
  income:
    'bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-400 focus:ring-green-500',
  transfer:
    'bg-gray-600 dark:bg-gray-500 hover:bg-gray-700 dark:hover:bg-gray-400 focus:ring-gray-500',
};

export default function BookkeepingPage() {
  const {
    draftType,
    draftAmount,
    draftCategoryId,
    draftNote,
    draftDate,
    submitting,
    setDraftType,
    setDraftAmount,
    setDraftCategoryId,
    setDraftNote,
    setDraftDate,
    resetDraft,
    submitTransaction,
  } = useTransactionStore();

  const { categories, fetchCategories } = useCategoryStore();
  const toast = useToastStore((s) => s.show);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = categories.filter((c) => c.type === draftType);

  const canSave =
    draftAmount !== '' &&
    parseFloat(draftAmount) > 0 &&
    (draftType === 'transfer' || draftCategoryId !== null);

  const handleSave = async () => {
    try {
      await submitTransaction();
      toast('记账成功');
      resetDraft();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '保存失败，请重试';
      toast(message, 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row lg:gap-6 lg:p-8">
      <div className="flex-1 flex flex-col lg:max-w-xl">
        <div className="flex-1 flex flex-col lg:bg-white lg:dark:bg-gray-800 lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-200 lg:dark:border-gray-700 lg:overflow-hidden">
          {/* Type Tabs */}
          <div className="px-4 pt-4 md:px-6 md:pt-6">
            <TabSwitcher
              tabs={typeTabs}
              activeKey={draftType}
              onChange={(key) => setDraftType(key as 'expense' | 'income' | 'transfer')}
            />
          </div>

          {/* Amount Input */}
          <AmountInput
            value={draftAmount}
            onChange={setDraftAmount}
            label={amountLabels[draftType]}
            colorClass={amountColors[draftType]}
          />

          {/* Category Grid (hidden for transfer) */}
          {draftType !== 'transfer' && (
            <CategoryGrid
              categories={filteredCategories}
              selectedId={draftCategoryId}
              onSelect={setDraftCategoryId}
              accentColor={draftType === 'income' ? 'green' : 'blue'}
            />
          )}

          {/* Note & Date */}
          <div className="px-4 md:px-6 pb-3 flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-white dark:bg-gray-800 lg:bg-gray-50 lg:dark:bg-gray-700 rounded-lg px-3 py-2.5 border border-gray-200 dark:border-gray-700">
              <Edit3 className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="添加备注"
                value={draftNote}
                onChange={(e) => setDraftNote(e.target.value)}
                className="flex-1 text-sm text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 outline-none bg-transparent"
              />
            </div>
            <DatePicker value={draftDate} onChange={setDraftDate} />
          </div>

          {/* Save Button */}
          <div className="mt-auto px-4 md:px-6 pb-4 md:pb-6 lg:pt-2">
            <Button
              variant="custom"
              onClick={handleSave}
              loading={submitting}
              disabled={!canSave}
              className={`${buttonColors[draftType]} text-white`}
            >
              保存
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop: Recent Records Panel */}
      <RecentRecords />
    </div>
  );
}
