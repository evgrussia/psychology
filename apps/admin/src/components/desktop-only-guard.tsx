"use client";

import React, { useEffect, useState } from 'react';

export function DesktopOnlyGuard({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (!isDesktop) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <h1 className="text-xl font-semibold">Админка доступна только на десктопе</h1>
        <p className="text-sm text-muted-foreground">
          Откройте админ-панель на экране шириной 768px и больше.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
