import { useNavigate } from 'react-router-dom';
import { User, Grid, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../stores/auth';
import { serverEndpoint } from '../lib/axios';
import ThemeToggle from '../components/ThemeToggle';

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="max-w-md mx-auto space-y-4">
        {/* Mobile title */}
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50 lg:hidden">
          我的
        </h1>

        {/* User info card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm dark:border dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <div className="text-base font-medium text-gray-900 dark:text-gray-50 truncate">
                {user?.username || '用户'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">已登录</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{serverEndpoint}</div>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:border dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
          <button
            onClick={() => navigate('/categories')}
            className="flex items-center justify-between w-full px-4 py-3.5 text-left"
          >
            <div className="flex items-center gap-3">
              <Grid className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-900 dark:text-gray-50">分类管理</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Theme section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm dark:border dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">外观</div>
          <ThemeToggle />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm dark:border dark:border-gray-700 text-red-500 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
        >
          <LogOut className="w-4 h-4" />
          <span>退出登录</span>
        </button>
      </div>
    </div>
  );
}
