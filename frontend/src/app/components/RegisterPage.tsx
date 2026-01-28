import { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/api/client';

interface RegisterPageProps {
  onNavigateToLogin?: () => void;
  onNavigateToCabinet?: () => void;
  onNavigateToHome?: () => void;
}

export default function RegisterPage({ onNavigateToLogin, onNavigateToCabinet, onNavigateToHome }: RegisterPageProps) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Password validation
  const passwordRequirements = [
    { label: 'Минимум 8 символов', valid: password.length >= 8 },
    { label: 'Содержит заглавную букву', valid: /[A-Z]/.test(password) },
    { label: 'Содержит цифру', valid: /[0-9]/.test(password) },
    { label: 'Пароли совпадают', valid: password === confirmPassword && confirmPassword !== '' }
  ];

  const isPasswordValid = passwordRequirements.every(req => req.valid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Пожалуйста, введите ваше имя');
      return;
    }

    if (!isPasswordValid) {
      setError('Пожалуйста, проверьте требования к паролю');
      return;
    }

    if (!agreeToTerms) {
      setError('Необходимо согласие на обработку персональных данных');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email,
        password,
        display_name: name.trim() || undefined,
        consents: agreeToTerms ? { terms: true, privacy: true } : undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        onNavigateToCabinet?.();
      }, 1500);
    } catch (err) {
      const message =
        err instanceof ApiError && (err.status === 409)
          ? 'Email уже зарегистрирован'
          : err instanceof ApiError
            ? err.message
            : 'Ошибка регистрации. Попробуйте снова.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#7FD99A]/5 via-white to-[#C8F5E8]/5 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7FD99A] to-[#C8F5E8] flex items-center justify-center mx-auto mb-6 shadow-[0_12px_32px_-4px_rgba(127,217,154,0.5)]">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-3">
            Регистрация успешна!
          </h2>
          <p className="text-base text-[#718096] mb-6">
            Добро пожаловать в Эмоциональный баланс
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-[#718096]">
            <Loader2 className="w-4 h-4 animate-spin text-[#7FD99A]" />
            <span>Переход в личный кабинет...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#7FD99A]/5 via-white to-[#C8F5E8]/5 flex flex-col">
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
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-[0_8px_32px_-4px_rgba(127,217,154,0.15)]">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7FD99A] to-[#C8F5E8] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_-4px_rgba(127,217,154,0.4)]">
              <User className="w-8 h-8 text-white" />
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-2">
                Создать аккаунт
              </h1>
              <p className="text-base text-[#718096]">
                Начните путь к эмоциональному балансу
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
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#2D3748] mb-2">
                  Имя
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <User className="w-5 h-5 text-[#718096]" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ваше имя"
                    required
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#7FD99A] focus:outline-none text-[#2D3748] placeholder:text-[#718096] transition-colors"
                  />
                </div>
              </div>

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
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#7FD99A] focus:outline-none text-[#2D3748] placeholder:text-[#718096] transition-colors"
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
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#7FD99A] focus:outline-none text-[#2D3748] placeholder:text-[#718096] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#7FD99A] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#2D3748] mb-2">
                  Подтверждение пароля
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Lock className="w-5 h-5 text-[#718096]" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#7FD99A] focus:outline-none text-[#2D3748] placeholder:text-[#718096] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#7FD99A] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-[#2D3748] mb-3">
                    Требования к паролю:
                  </p>
                  <div className="space-y-2">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {req.valid ? (
                          <CheckCircle2 className="w-4 h-4 text-[#7FD99A] flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                        )}
                        <span className={`text-xs ${req.valid ? 'text-[#7FD99A]' : 'text-[#718096]'}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded border-2 border-gray-300 text-[#7FD99A] focus:ring-2 focus:ring-[#7FD99A]/20 focus:ring-offset-0 transition-colors cursor-pointer flex-shrink-0"
                  />
                  <span className="text-sm text-[#718096] group-hover:text-[#2D3748] transition-colors leading-relaxed">
                    Я согласен(а) на обработку{' '}
                    <button type="button" className="text-[#7FD99A] hover:underline">
                      персональных данных
                    </button>{' '}
                    и принимаю{' '}
                    <button type="button" className="text-[#7FD99A] hover:underline">
                      условия использования
                    </button>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !agreeToTerms}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#7FD99A] to-[#C8F5E8] text-white font-medium shadow-[0_8px_24px_-4px_rgba(127,217,154,0.4)] hover:shadow-[0_12px_32px_-4px_rgba(127,217,154,0.5)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Регистрация...</span>
                  </>
                ) : (
                  <>
                    <span>Зарегистрироваться</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-[#718096]">
                Уже есть аккаунт?{' '}
                <button
                  onClick={onNavigateToLogin}
                  className="font-medium text-[#7FD99A] hover:underline"
                >
                  Войти
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
