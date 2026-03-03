import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        暂无流水记录
      </p>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="text-sm text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline"
      >
        去记一笔
      </button>
    </div>
  );
}
