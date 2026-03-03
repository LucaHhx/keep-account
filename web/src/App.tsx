import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/auth';
import { useThemeStore } from './stores/theme';
import { useNetworkStore } from './stores/network';
import AuthGuard from './components/AuthGuard';
import GuestGuard from './components/GuestGuard';
import Toast from './components/Toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AppLayout from './components/AppLayout';
import BookkeepingPage from './pages/BookkeepingPage';
import CategoryManagePage from './pages/CategoryManagePage';
import TransactionListPage from './pages/TransactionListPage';
import ReportPage from './pages/ReportPage';
import CategoryDrilldownPage from './pages/CategoryDrilldownPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);
  const initTheme = useThemeStore((s) => s.initTheme);
  const initNetwork = useNetworkStore((s) => s.initNetwork);

  useEffect(() => {
    loadFromStorage();
    initTheme();
    initNetwork();
  }, [loadFromStorage, initTheme, initNetwork]);

  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        {/* Guest routes */}
        <Route element={<GuestGuard />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<AuthGuard />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<BookkeepingPage />} />
            <Route path="/transactions" element={<TransactionListPage />} />
            <Route path="/reports" element={<ReportPage />} />
            <Route path="/reports/category/:categoryId" element={<CategoryDrilldownPage />} />
            <Route path="/categories" element={<CategoryManagePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
