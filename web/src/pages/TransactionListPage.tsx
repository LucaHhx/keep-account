import { useEffect, useState, useCallback, useRef } from 'react';
import { useTransactionListStore, type Transaction } from '../stores/transactionList';
import { useToastStore } from '../stores/toast';
import FilterBar from '../components/FilterBar';
import DayGroup from '../components/DayGroup';
import EmptyState from '../components/EmptyState';
import TransactionDetail from '../components/TransactionDetail';
import { Loader2 } from 'lucide-react';

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function groupTransactionsByDay(transactions: Transaction[]): { label: string; transactions: Transaction[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayMs = 86400000;

  const groups = new Map<string, Transaction[]>();
  const groupOrder: string[] = [];

  for (const t of transactions) {
    const d = new Date(t.occurred_at);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diff = today - dayStart;

    let label: string;
    if (diff === 0) {
      label = '今天';
    } else if (diff === dayMs) {
      label = '昨天';
    } else {
      label = `${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAYS[d.getDay()]}`;
    }

    if (!groups.has(label)) {
      groups.set(label, []);
      groupOrder.push(label);
    }
    groups.get(label)!.push(t);
  }

  return groupOrder.map((label) => ({
    label,
    transactions: groups.get(label)!,
  }));
}

export default function TransactionListPage() {
  const {
    transactions,
    loading,
    hasMore,
    filterType,
    filterStartDate,
    filterEndDate,
    fetchTransactions,
    loadMore,
    setFilterType,
    setFilterDateRange,
    updateTransaction,
    deleteTransaction,
  } = useTransactionListStore();

  const toast = useToastStore((s) => s.show);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTransactions(true);
  }, [fetchTransactions]);

  // Update selected transaction when the list updates (after edit)
  useEffect(() => {
    if (selectedTransaction) {
      const updated = transactions.find((t) => t.id === selectedTransaction.id);
      if (updated) {
        setSelectedTransaction(updated);
      }
    }
  }, [transactions, selectedTransaction]);

  // Scroll-based load more
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || loading || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loadMore();
    }
  }, [loading, hasMore, loadMore]);

  const handleItemClick = (t: Transaction) => {
    setSelectedTransaction(t);
  };

  const handleCloseDetail = () => {
    setSelectedTransaction(null);
  };

  const handleUpdate = async (id: number, data: Record<string, unknown>) => {
    try {
      await updateTransaction(id, data);
      toast('更新成功');
    } catch {
      toast('更新失败，请重试', 'error');
      throw new Error('update failed');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTransaction(id);
      toast('删除成功');
    } catch {
      toast('删除失败，请重试', 'error');
      throw new Error('delete failed');
    }
  };

  const dayGroups = groupTransactionsByDay(transactions);

  return (
    <>
      {/* Header - mobile/tablet */}
      <div className="lg:hidden px-4 pt-4 md:pt-6 pb-2 md:px-8">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">流水</h1>
      </div>

      {/* Filter Bar */}
      <FilterBar
        activeType={filterType}
        onTypeChange={setFilterType}
        startDate={filterStartDate}
        endDate={filterEndDate}
        onDateRangeChange={setFilterDateRange}
      />

      {/* Content area: list + detail panel */}
      <div className="flex-1 flex lg:gap-6 lg:px-8 lg:pb-8 overflow-hidden">
        {/* Transaction list */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-0 lg:max-w-2xl"
        >
          {!loading && transactions.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {dayGroups.map((group) => (
                <DayGroup
                  key={group.label}
                  label={group.label}
                  transactions={group.transactions}
                  onItemClick={handleItemClick}
                  selectedId={selectedTransaction?.id}
                />
              ))}

              {/* Loading indicator */}
              {loading && (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                </div>
              )}

              {/* End of list */}
              {!loading && !hasMore && transactions.length > 0 && (
                <div className="text-center py-6 text-xs text-gray-400 dark:text-gray-500">
                  没有更多了
                </div>
              )}
            </>
          )}
        </div>

        {/* Desktop detail panel */}
        {selectedTransaction && (
          <TransactionDetail
            key={selectedTransaction.id}
            transaction={selectedTransaction}
            onClose={handleCloseDetail}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
      </div>
    </>
  );
}
