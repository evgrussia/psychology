import React from 'react';

export function SectionPlaceholder({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
      <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        Раздел будет расширен в следующих релизах. Сейчас доступен базовый shell и навигация.
      </div>
    </div>
  );
}
