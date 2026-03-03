import { useToastStore } from '../stores/toast';
import { CheckCircle, XCircle } from 'lucide-react';

export default function Toast() {
  const { message, type, visible } = useToastStore();

  return (
    <div
      className={`fixed top-[calc(12px+var(--safe-top))] left-1/2 -translate-x-1/2 z-[9999] max-w-[320px] w-full px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 ${
        visible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-4 opacity-0 pointer-events-none'
      } ${
        type === 'success'
          ? 'bg-green-600 text-white'
          : 'bg-red-500 text-white'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5 shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 shrink-0" />
      )}
      {message}
    </div>
  );
}
