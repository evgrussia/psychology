import { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/api/client';

interface LoginPageProps {
  onNavigateToRegister?: () => void;
  onNavigateToCabinet?: () => void;
  onNavigateToHome?: () => void;
}

export default function LoginPage({ onNavigateToRegister, onNavigateToCabinet, onNavigateToHome }: LoginPageProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login({ email, password });
      onNavigateToCabinet?.();
    } catch (err) {
      const message =
        err instanceof ApiError && (err.status === 401 || err.code === 'UNAUTHORIZED')
          ? 'Неверный email или пароль'
          : err instanceof ApiError
            ? err.message
            : 'Ошибка входа. Попробуйте снова.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#A8B5FF]/5 via-white to-[#C8F5E8]/5 flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <button
          onClick={onNavigateToHome}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A8B5FF] via-[#FFD4B5] to-[#C8F5E8] flex items-center justify-center shadow-[0_4px_12px_-2px_rgba(168,181,255,0.4)]">
            <Heart className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="text-base sm:text-lg font-semibold text-[#2D3748]">
            Эмоциональный баланс
          </span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-[0_8px_32px_-4px_rgba(168,181,255,0.15)]">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#A8B5FF] to-[#C8F5E8] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_-4px_rgba(168,181,255,0.4)]">
              <Lock className="w-8 h-8 text-white" />
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-2">
                Вход в кабинет
              </h1>
              <p className="text-base text-[#718096]">
                Рады видеть вас снова
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Ошибка входа
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    {error}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#2D3748] mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Mail className="w-5 h-5 text-[#718096]" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#A8B5FF] focus:outline-none text-[#2D3748] placeholder:text-[#718096] transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#2D3748] mb-2">
                  Пароль
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Lock className="w-5 h-5 text-[#718096]" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#A8B5FF] focus:outline-none text-[#2D3748] placeholder:text-[#718096] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#A8B5FF] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-[#A8B5FF] focus:ring-2 focus:ring-[#A8B5FF]/20 focus:ring-offset-0 transition-colors cursor-pointer"
                  />
                  <span className="text-sm text-[#718096] group-hover:text-[#2D3748] transition-colors">
                    Запомнить меня
                  </span>
                </label>

                <button
                  type="button"
                  className="text-sm font-medium text-[#A8B5FF] hover:underline"
                >
                  Забыли пароль?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white font-medium shadow-[0_8px_24px_-4px_rgba(168,181,255,0.4)] hover:shadow-[0_12px_32px_-4px_rgba(168,181,255,0.5)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Вход...</span>
                  </>
                ) : (
                  <>
                    <span>Войти</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-[#718096]">или</span>
              </div>
            </div>

            {/* Social Login (Optional) */}
            <button
              type="button"
              className="w-full px-6 py-3.5 rounded-xl border-2 border-gray-200 text-[#2D3748] font-medium hover:border-[#A8B5FF]/30 hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Войти через Google</span>
            </button>

            {/* Register Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-[#718096]">
                Нет аккаунта?{' '}
                <button
                  onClick={onNavigateToRegister}
                  className="font-medium text-[#A8B5FF] hover:underline"
                >
                  Зарегистрироваться
                </button>
              </p>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-[#718096]">
              Входя в систему, вы соглашаетесь с нашими{' '}
              <button className="text-[#A8B5FF] hover:underline">
                Условиями использования
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
