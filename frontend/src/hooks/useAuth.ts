import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/api/auth';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { ApiError, RegisterRequest, LoginRequest } from '@/types/api';

export function useAuth() {
  const router = useRouter();
  const { user, setAuth, clearAuth, isAuthenticated } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      setAuth(response.user);
      toast.success('Вход выполнен успешно');
      router.push('/cabinet');
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error?.response?.data?.error?.message || 'Ошибка при входе');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response) => {
      setAuth(response.user);
      toast.success('Регистрация выполнена успешно');
      router.push('/cabinet');
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error?.response?.data?.error?.message || 'Ошибка при регистрации');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth();
      router.push('/');
      toast.success('Выход выполнен');
    },
    onError: () => {
      // Даже если запрос не удался, очищаем локальное состояние
      clearAuth();
      router.push('/');
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isAuthenticated: isAuthenticated(),
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoading: loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
  };
}
