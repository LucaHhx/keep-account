import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title = '确认操作',
  message,
  confirmText = '删除',
  cancelText = '取消',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-[280px] mx-4 overflow-hidden">
        <div className="flex flex-col items-center pt-6 pb-4 px-6">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50 mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {message}
          </p>
        </div>

        <div className="flex border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
          >
            {cancelText}
          </button>
          <div className="w-px bg-gray-200 dark:bg-gray-700" />
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 text-sm font-medium text-red-500 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
