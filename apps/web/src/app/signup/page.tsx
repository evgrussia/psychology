'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, Input, Label, Container, Section } from '@psychology/design-system';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordConfirm, setPasswordConfirm] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError('Пароли не совпадают.');
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
      const res = await fetch(`${apiUrl}/auth/client/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (res.status === 409) {
        throw new Error('Аккаунт уже существует. Войдите, чтобы продолжить.');
      }

      if (!res.ok) {
        throw new Error('Не удалось зарегистрироваться. Попробуйте ещё раз.');
      }

      router.replace('/cabinet');
    } catch (err: any) {
      setError(err.message || 'Не удалось зарегистрироваться. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section>
      <Container className="max-w-md">
        <Card className="p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-semibold text-foreground">Создание аккаунта</h1>
            <p className="text-muted-foreground">
              Укажите email и пароль — подтверждение по почте не требуется.
            </p>
          </div>

          {error && (
            <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Минимум 8 символов"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Повторите пароль</Label>
              <Input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                placeholder="Повторите пароль"
                required
                minLength={8}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Войти
            </Link>
          </div>
        </Card>
      </Container>
    </Section>
  );
}
