import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Transaction } from '../stores/transactionList';
import { getCategoryIcon } from '../lib/categoryIcons';
import { MoreHorizontal } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

interface TransactionDetailProps {
  transaction: Transaction;
  onClose: () => void;
  onUpdate: (id: number, data: Partial<Pick<Transaction, 'amount' | 'category_id' | 'note' | 'occurred_at'>>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const typeLabels: Record<string, string> = {
  expense: '支出',
  income: '收入',
  transfer: '转账',
};

function formatDateTime(isoStr: string): string {
  const d = new Date(isoStr);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const h = d.getHours().toString().padStart(2, '0');
  const min = d.getMinutes().toString().padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}`;
}

function formatAmountDisplay(t: Transaction): { text: string; className: string } {
  const yuan = (t.amount / 100).toFixed(2);
  if (t.type === 'income') {
    return { text: `+${yuan}`, className: 'text-green-600 dark:text-green-400' };
  }
  if (t.type === 'transfer') {
    return { text: yuan, className: 'text-gray-500' };
  }
  return { text: `-${yuan}`, className: 'text-red-500' };
}

function toLocalDatetimeValue(isoStr: string): string {
  const d = new Date(isoStr);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const h = d.getHours().toString().padStart(2, '0');
  const min = d.getMinutes().toString().padStart(2, '0');
  return `${y}-${m}-${day}T${h}:${min}`;
}

export default function TransactionDetail({
  transaction,
  onClose,
  onUpdate,
  onDelete,
}: TransactionDetailProps) {
  const [editing, setEditing] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editDate, setEditDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const Icon = transaction.category_icon
    ? getCategoryIcon(transaction.category_icon)
    : MoreHorizontal;
  const iconStyle = transaction.type === 'income'
    ? { bg: 'bg-green-50 dark:bg-green-900/30', stroke: '#16A34A' }
    : transaction.type === 'transfer'
      ? { bg: 'bg-gray-50 dark:bg-gray-700', stroke: '#6B7280' }
      : { bg: 'bg-red-50 dark:bg-red-900/30', stroke: '#EF4444' };
  const { text: amountText, className: amountClass } = formatAmountDisplay(transaction);

  const startEdit = () => {
    setEditAmount((transaction.amount / 100).toFixed(2));
    setEditNote(transaction.note || '');
    setEditDate(toLocalDatetimeValue(transaction.occurred_at));
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data: Record<string, unknown> = {};

      const newAmountCents = Math.round(parseFloat(editAmount) * 100);
      if (newAmountCents !== transaction.amount) {
        data.amount = newAmountCents;
      }
      if (editNote !== (transaction.note || '')) {
        data.note = editNote;
      }
      const newDate = new Date(editDate).toISOString();
      if (newDate !== transaction.occurred_at) {
        data.occurred_at = newDate;
      }

      if (Object.keys(data).length > 0) {
        await onUpdate(transaction.id, data);
      }
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(transaction.id);
      setShowDeleteConfirm(false);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  const headerButtons = editing ? (
    <>
      <button
        type="button"
        onClick={cancelEdit}
        className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150"
      >
        取消
      </button>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="px-3 py-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-150 disabled:opacity-50"
      >
        {saving ? '保存中...' : '保存'}
      </button>
    </>
  ) : (
    <>
      <button
        type="button"
        onClick={startEdit}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150"
      >
        <Pencil className="w-4 h-4 text-gray-500" />
      </button>
      <button
        type="button"
        onClick={() => setShowDeleteConfirm(true)}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors duration-150"
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </button>
    </>
  );

  const detailContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
          流水详情
        </h2>
        <div className="flex items-center gap-1">
          {headerButtons}
        </div>
      </div>

      {/* Amount */}
      <div className="text-center py-8 border-b border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {typeLabels[transaction.type]}
        </div>
        {editing ? (
          <input
            type="number"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            className="text-4xl font-semibold text-center w-full outline-none bg-transparent text-gray-900 dark:text-gray-50"
            step="0.01"
            min="0.01"
          />
        ) : (
          <div className={`text-4xl font-semibold ${amountClass}`}>
            {amountText}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">分类</span>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 ${iconStyle.bg} rounded-full flex items-center justify-center`}>
              <Icon width={14} height={14} stroke={iconStyle.stroke} />
            </div>
            <span className="text-sm text-gray-900 dark:text-gray-50">
              {transaction.category_name || '-'}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700" />

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">时间</span>
          {editing ? (
            <input
              type="datetime-local"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="text-sm text-gray-900 dark:text-gray-50 bg-transparent outline-none border border-gray-200 dark:border-gray-600 rounded px-2 py-1"
            />
          ) : (
            <span className="text-sm text-gray-900 dark:text-gray-50">
              {formatDateTime(transaction.occurred_at)}
            </span>
          )}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700" />

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">备注</span>
          {editing ? (
            <input
              type="text"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder="添加备注"
              className="text-sm text-gray-900 dark:text-gray-50 bg-transparent outline-none border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-right w-40"
            />
          ) : (
            <span className="text-sm text-gray-900 dark:text-gray-50">
              {transaction.note || '-'}
            </span>
          )}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700" />

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">创建时间</span>
          <span className="text-sm text-gray-900 dark:text-gray-50">
            {formatDateTime(transaction.created_at)}
          </span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile: Bottom Sheet */}
      <div className="lg:hidden fixed inset-0 z-40">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-xl max-h-[85vh] overflow-auto">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>
          {detailContent}
        </div>
      </div>

      {/* Desktop: Side Panel */}
      <div className="hidden lg:block w-80 xl:w-96 shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-8">
          {detailContent}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="确认删除"
        message="删除后将无法恢复，确定要删除这笔流水吗？"
        confirmText={deleting ? '删除中...' : '删除'}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
