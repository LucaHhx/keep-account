import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import axios from 'axios';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const register = useAuthStore((s) => s.register);
  const toast = useToastStore((s) => s.show);
  const navigate = useNavigate();

  const validate = () => {
    const errs: typeof errors = {};
    const trimmed = username.trim();
    if (!trimmed) {
      errs.username = '请输入用户名';
    } else if (trimmed.length < 3 || trimmed.length > 32) {
      errs.username = '用户名需要 3-32 个字符';
    }
    if (!password) {
      errs.password = '请输入密码';
    } else if (password.length < 6 || password.length > 32) {
      errs.password = '密码需要 6-32 个字符';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = '两次密码不一致';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register(username.trim(), password);
      toast('注册成功');
      navigate('/', { replace: true });
    } catch (err) {
      const msg =
        (axios.isAxiosError(err) && err.response?.data?.message) ||
        '注册失败，请重试';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-tauri-drag-region className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center transition-colors duration-300 overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] lg:pt-10">
      <div className="w-full max-w-sm md:max-w-md mx-auto px-6 py-8 md:bg-white md:dark:bg-gray-800 md:rounded-xl md:shadow-sm md:dark:border md:dark:border-gray-700 md:px-8 md:py-10">
        {/* Back */}
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-8"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          返回登录
        </Link>

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">创建账号</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">开始记录你的每一笔</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            id="username"
            label="账号"
            type="text"
            placeholder="请输入用户名 (3-32个字符)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
          />
          <FormInput
            id="password"
            label="密码"
            type="password"
            placeholder="请输入密码 (6-32个字符)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <FormInput
            id="confirmPassword"
            label="确认密码"
            type="password"
            placeholder="请再次输入密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
          />
          <Button type="submit" loading={loading} className="mt-6">
            注册
          </Button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          已有账号？
          <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  );
}
