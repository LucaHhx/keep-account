import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import NetworkBanner from './NetworkBanner';
import {
  Clock,
  List,
  PieChart,
  User,
} from 'lucide-react';

const navItems = [
  { key: '/', icon: Clock, label: '记账', title: '快速记账', subtitle: '记录每一笔收支' },
  { key: '/transactions', icon: List, label: '流水', title: '流水记录', subtitle: '查看和管理所有收支记录' },
  { key: '/reports', icon: PieChart, label: '报表', title: '报表', subtitle: '收支统计分析' },
  { key: '/profile', icon: User, label: '我的', title: '我的', subtitle: '个人设置' },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const activePath = location.pathname;
  const activeNav = navItems.find((item) => item.key === activePath) || navItems[0];

  return (
    // App Shell: CSS Grid three-row layout (topbar / main / bottombar)
    // Uses 100dvh to fill the full dynamic viewport height
    // Safe area padding for iOS notch/home indicator
    <div className="h-dvh grid grid-rows-[auto_1fr_auto] lg:grid-rows-[auto_1fr] overflow-hidden bg-gray-50 dark:bg-gray-900">

      {/* === Topbar === */}
      <div>
        {/* Mobile: safe area spacer + drag region (iOS: safe-area wins; macOS compact: 2.5rem for traffic lights) */}
        <div data-tauri-drag-region className="lg:hidden h-[max(2.5rem,var(--safe-top))]" />

        {/* Desktop: header with title */}
        <header data-tauri-drag-region className="hidden lg:flex items-center justify-between px-8 pt-9 pb-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
              {activeNav.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {activeNav.subtitle}
            </p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short',
            })}
          </div>
        </header>
      </div>

      {/* === Main area: sidebar (desktop) + content (scrollable) === */}
      <div className="min-h-0 grid grid-cols-1 lg:grid-cols-[14rem_1fr]">
        {/* Desktop sidebar */}
        <nav className="hidden lg:flex flex-col min-h-0 overflow-hidden bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 pt-6 pb-6 px-3">
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-50 text-sm">
                记账本
              </div>
              <div className="text-xs text-gray-400">Keep Account</div>
            </div>
          </div>

          {/* Nav Items */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = activePath === item.key;
              return (
                <a
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-150 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>{item.label}</span>
                </a>
              );
            })}
          </div>

          {/* Bottom User Info */}
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 mx-3">
            <div className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                  {user?.username || '用户'}
                </div>
                <div className="text-xs text-gray-400 truncate">已登录</div>
              </div>
            </div>
          </div>
        </nav>

        {/* Content area — the ONLY scrollable region */}
        <div className="min-h-0 overflow-auto">
          <NetworkBanner />
          <Outlet />
        </div>
      </div>

      {/* === Bottombar: mobile tab nav (NOT inside content, stays at grid row 3) === */}
      <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 relative z-50 min-h-14 pb-[var(--safe-bottom)]">
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = activePath === item.key;
            return (
              <div
                key={item.key}
                onClick={() => navigate(item.key)}
                className="flex flex-col items-center gap-0.5 cursor-pointer min-w-[64px]"
              >
                <item.icon
                  className="w-6 h-6"
                  stroke={isActive ? '#2563EB' : '#9ca3af'}
                />
                <span
                  className={`text-xs ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
